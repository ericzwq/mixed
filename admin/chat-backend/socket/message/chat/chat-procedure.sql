drop procedure if exists selectNewSgMsgs;
delimiter $$
# 获取id大于cNext的消息，最大maxCount条
create procedure selectNewSgMsgs(in cNext int, in maxCount int)
begin
    declare messages json default json_array();
    declare message json;
    declare ids json default json_array();
    declare i int default 0;
    declare len int default 0;
    _while:
    while true
        do
            set cNext = (select next from single_chat where id = cNext);
            if cNext is null then leave _while; end if;
            set ids = json_array_append(ids, '$', cNext);
        end while;
    set len = json_length(ids);
    set i = len - maxCount - 1;
    while i > -1
        do
            set ids = json_remove(ids, concat('$[', i, ']'));
            set i = i - 1;
        end while;
    set len = json_length(ids);
    set i = 0;
    while i < len
        do
            set cNext = json_extract(ids, concat('$[', i, ']'));
            set message = (select json_object('id', id,
                                              'fakeId', fakeId, 'next', next, 'pre', pre, 'from', `from`, 'to', `to`, 'content', content, 'type', type, 'status', status,
                                              'createdAt', date_format(createdAt, '%Y-%m-%d %h:%i:%s'))
                           from single_chat
                           where id = cNext);
            set i = i + 1;
            set messages = json_array_append(messages, '$', message);
        end while;
    select messages;
end$$
delimiter ;
call selectNewSgMsgs(1, 2);

drop procedure if exists selectHisSgMsgs;
delimiter $$
# 获取id小于maxId的消息，最大maxCount条，或直到等于minId, maxCount和minId两者其一为空
create procedure selectHisSgMsgs(in maxId int, in maxCount int, in minId int)
begin
    declare messages json default json_array();
    declare message json;
    declare ids json default json_array();
    declare i int default 0;
    if minId is null then
        while i < maxCount
            do
                set maxId = (select pre from single_chat where id = maxId);
                set ids = json_array_append(ids, '$', maxId);
                set i = i + 1;
            end while;
    else
        _while:
        while true
            do
                set maxId = (select pre from single_chat where id = maxId);
                set ids = json_array_append(ids, '$', maxId);
                if maxId = minId then leave _while; end if;
            end while;
    end if;
    set i = json_length(ids) - 1;
    while i > -1
        do
            set minId = json_extract(ids, concat('$[', i, ']'));
            set message = (select json_object('id', id,
                                              'fakeId', fakeId, 'next', next, 'pre', pre, 'from', `from`, 'to', `to`, 'content', content, 'type', type, 'status', status,
                                              'createdAt', date_format(createdAt, '%Y-%m-%d %h:%i:%s'))
                           from single_chat
                           where id = minId);
            set i = i - 1;
            set messages = json_array_append(messages, '$', message);
        end while;
    select messages;
end$$
delimiter ;
call selectHisSgMsgs(4, 2, null);
call selectHisSgMsgs(4, null, 2);

use
    chat;

drop procedure if exists selectNewGpMsgs;
delimiter
$$
# 获取id大于preId的消息，最大count条
create procedure selectNewGpMsgs(in preId int, in count int)
begin
    declare
        messages json default json_array();
    declare
        message json;
    declare
        ids json default json_array();
    declare
        i int default 0;
    declare
        len int default 0;
    set
        preId = (select next from group_chat where id = preId);
    while
        preId is not null
        do
            set ids = json_array_append(ids, '$', preId);
            set
                preId = (select next from group_chat where id = preId);
        end while;
    set
        len = json_length(ids);
    set
        i = len - count - 1;
    while
        i > -1
        do
            set ids = json_remove(ids, concat('$[', i, ']'));
            set
                i = i - 1;
        end while;
    set
        len = json_length(ids);
    set
        i = 0;
    while
        i < len
        do
            set preId = json_extract(ids, concat('$[', i, ']'));
            set
                message = (select json_object('id', id,
                                              'fakeId', fakeId, 'next', next, 'pre', pre, 'from', `from`, 'to', `to`, 'content', content, 'type', type, 'status', status,
                                              'createdAt', date_format(createdAt, '%Y-%m-%d %h:%i:%s'), 'readCount', readCount)
                           from group_chat
                           where id = preId);
            set
                i = i + 1;
            set
                messages = json_array_append(messages, '$', message);
        end while;
    select messages;
end$$
delimiter ;
call selectNewGpMsgs(16, 20);

drop procedure if exists selectHisGpMsgs;
delimiter $$
# 获取id小于maxId的消息，最大count条，或直到大于minId, count和minId两者其一为空
create procedure selectHisGpMsgs(in maxId int, in count int, in minId int)
begin
    declare messages json default json_array();
    declare message json;
    declare ids json default json_array();
    declare i int default 0;
    set maxId = (select pre from group_chat where id = maxId);
    if minId is null then
        while maxId and i < count
            do
                set ids = json_array_append(ids, '$', maxId);
                set maxId = (select pre from group_chat where id = maxId);
                set i = i + 1;
            end while;
    else
        while maxId and maxId > minId
            do
                set ids = json_array_append(ids, '$', maxId);
                set maxId = (select pre from group_chat where id = maxId);
            end while;
    end if;
    set i = json_length(ids) - 1;
    while i > -1
        do
            set minId = json_extract(ids, concat('$[', i, ']'));
            set message = (select json_object('id', id,
                                              'fakeId', fakeId, 'next', next, 'pre', pre, 'from', `from`, 'to', `to`, 'content', content, 'type', type, 'status', status,
                                              'createdAt', date_format(createdAt, '%Y-%m-%d %h:%i:%s'), 'readCount', readCount)
                           from group_chat
                           where id = minId);
            set i = i - 1;
            set messages = json_array_append(messages, '$', message);
        end while;
    select messages;
end$$
delimiter ;
call selectHisGpMsgs(4, 1, null);
call selectHisGpMsgs(4, null, -1);
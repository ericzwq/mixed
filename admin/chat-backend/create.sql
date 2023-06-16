/*数据库*/
drop
    database if exists chat;
create
    database chat;
use
    chat;

set global time_zone = '+8:00';

/*用户表*/
drop table if exists users;
create table users
(
    username           varchar(20) primary key not null,
    password           varchar(20)             not null,
    avatar             varchar(50)             not null,
    nickname           varchar(20)             not null,
    email              varchar(20)             not null,
    `groups`           varchar(16000),
    last_friend_apl_id bigint comment '与用户有关的最后一条好友申请表id',
    last_group_apl_id  bigint comment '与用户有关的最后一条群聊申请表id',
    createdAt          timestamp               not null default current_timestamp comment '创建时间',
    updatedAt          timestamp               not null default current_timestamp on update current_timestamp comment '修改时间'
);

insert users(username, password, avatar, email, nickname)
values ('eric', '111111', '/avatar/th(1).jpg', '1234@163.com', '淡定');

insert users(username, password, avatar, email, nickname)
values ('eric2', '111111', '/avatar/th(2).jpg', '12345@163.com', '等等');

insert users(username, password, avatar, email, nickname)
values ('eric3', '111111', '/avatar/th.jpg', '12346@163.com', '布露妮娅');

insert users(username, password, avatar, email, nickname)
values ('eric4', '111111', '/avatar/th.jpg', '12346@163.com', '布露妮娅4');
#修改列

# alter table users
#     modify id bigint;
# #
# alter table users
#     CHANGE COLUMN id id INT(8) NOT NULL AUTO_INCREMENT;

# alter table users
#     modify COLUMN createdBy varchar(10) not null,
#     modify COLUMN updatedBy varchar(10) not null default '--';
# #删除列

# alter table users
#     drop username,
#     drop c2;

/*好友表*/
drop table if exists contacts;
create table contacts
(
    id        bigint auto_increment primary key not null,
    master    varchar(20)                       not null,
    sub       varchar(20)                       not null,
    remark    varchar(200)                      not null,
    status    tinyint                           not null comment '0正常， 1删除， 2拉黑， 3删除且拉黑',
    createdAt timestamp                         not null default current_timestamp comment '创建时间',
    updatedAt timestamp                         not null default current_timestamp on update current_timestamp comment '修改时间'
);

insert contacts(master, sub, status, remark)
values ('eric', 'eric2', 0, '等等');

insert contacts(master, sub, status, remark)
values ('eric', 'eric3', 0, '布露妮娅');

insert contacts(master, sub, status, remark)
values ('eric2', 'eric3', 0, '布露妮娅');

/*单聊表*/
drop table if exists single_chat;
create table single_chat
(
    id        bigint auto_increment primary key not null,
    fakeId    varchar(60)                       not null,
    pre       bigint,
    next      bigint,
    `from`    varchar(20)                       not null,
    `to`      varchar(20)                       not null,
    content   varchar(500)                      not null,
    type      tinyint                           not null comment '0系统消息 1文本 2图片 3音频 4视频',
    status    tinyint                           not null comment '0正常 1撤回',
    `read`    tinyint                           not null default 0 comment '0未读 1已读',
    createdAt timestamp                         not null default current_timestamp comment '创建时间'
);
create index fakeId_index on single_chat (fakeId);
create index next_index on single_chat (next);

insert single_chat(fakeId, pre, next, `from`, `to`, content, type, status)
values ('asf', null, null, 'eric', 'eric', '你们已是好友，可以一起尬聊了', 1, 0);

insert single_chat(fakeId, pre, next, `from`, `to`, content, type, status)
values ('asf', null, null, 'eric2', 'eric2', '你们已是好友，可以一起尬聊了', 1, 0);

insert single_chat(fakeId, pre, next, `from`, `to`, content, type, status)
values ('asf', null, null, 'eric3', 'eric3', '你们已是好友，可以一起尬聊了', 1, 0);

insert single_chat(fakeId, pre, next, `from`, `to`, content, type, status)
values ('asf', null, null, 'eric', 'eric2', '你们已是好友，可以一起尬聊了', 1, 0);

insert single_chat(fakeId, pre, next, `from`, `to`, content, type, status)
values ('asf2', null, null, 'eric', 'eric3', '你们已是好友，可以一起尬聊了', 1, 0);

insert single_chat(fakeId, pre, next, `from`, `to`, content, type, status)
values ('asf3', null, null, 'eric2', 'eric3', '你们已是好友，可以一起尬聊了', 1, 0);

/*群表*/
drop table if exists `groups`;
create table `groups`
(
    id        bigint auto_increment primary key not null,
    name      varchar(20)                       not null,
    avatar    varchar(100)                      not null,
    leader    varchar(20)                       not null,
    manager   varchar(400),
    member    text,
    createdAt timestamp                         not null default current_timestamp comment '创建时间',
    updatedAt timestamp                         not null default current_timestamp on update current_timestamp comment '修改时间',
    updatedBy varchar(20) comment '修改人'
);
# insert `groups`(name, avatar, leader, manager, member)
# values ('群聊1', '/avatar/th.jpg', 'eric', 'eric2', 'eric3');

/*群聊表*/
drop table if exists group_chat;
create table group_chat
(
    id        bigint auto_increment primary key not null,
    fakeId    varchar(60)                       not null,
    pre       bigint,
    next      bigint,
    `from`    varchar(20)                       not null,
    `to`      bigint                            not null,
    content   varchar(500)                      not null,
    type      tinyint                           not null comment '0系统消息 1文本 2图片 3音频 4视频',
    status    tinyint                           not null comment '0正常 1撤回',
    `reads`   text                              not null comment '已读的用户',
    readCount int                               not null default 0 comment '已读的用户数',
    createdAt timestamp                         not null default current_timestamp comment '创建时间'
);
create index fakeId_index on group_chat (fakeId);

/*好友申请表*/
drop table if exists friend_applications;
create table friend_applications
(
    id        bigint auto_increment primary key not null,
    contactId bigint                            not null,
    reason    varchar(50)                       not null,
    status    tinyint                           not null comment '0待确认 1同意 2拒绝',
    createdAt timestamp                         not null default current_timestamp comment '创建时间',
    updatedAt timestamp comment '修改时间'
);
create index contactId_index on friend_applications (contactId);

/*群申请表*/
drop table if exists group_applications;
create table group_applications
(
    id        bigint auto_increment primary key not null,
    groupId   bigint                            not null,
    `from`    varchar(20)                       not null comment 'type = 1：申请人；type = 2：邀请人',
    invitee   varchar(20) comment '被邀请的人，type为2时不为空',
    type      tinyint                           not null comment '1加群申请 2邀请申请',
    reason    varchar(50) comment 'type为1时不为空',
    status    tinyint                           not null comment '0待确认 1同意 2拒绝',
    createdAt timestamp                         not null default current_timestamp comment '创建时间',
    updatedAt timestamp comment '修改时间'
);

/*群成员信息表*/
drop table if exists group_member;
create table group_member
(
    id          bigint auto_increment primary key not null,
    groupId     bigint                            not null,
    username    varchar(20)                       not null,
    prohibition int                               not null comment '禁言时长 0则未禁言',
    joinAt      timestamp                         not null default current_timestamp comment '加入时间',
    origin      tinyint                           not null comment '加入来源：0创建者 1被邀请 2主动申请',
    inviter     varchar(20) comment '邀请人，origin为1时不为空',
    checker     varchar(20) comment '审核人，origin为2时不为空'
);

/*帖子表*/
drop table if exists posts;
create table posts
(
    id          bigint auto_increment primary key not null,
    userId      bigint                            not null,
    content     longtext,
    contentType varchar(20)                       not null,
    images      varchar(500),
    videos      varchar(500),
    likes       int                               not null default 0,
    comments    int                               not null default 0,
    deleted     int                               not null default 0,
    createdAt   timestamp                         not null default current_timestamp comment '创建时间',
    updatedAt   timestamp                         not null default current_timestamp on update current_timestamp comment '修改时间'
);
insert posts(userId, content, images, videos, contentType)
values (8, 'hello', '', '', 'quill-json');

/*帖子点赞表*/
drop table if exists post_likes;
create table post_likes
(
    id        bigint auto_increment primary key not null,
    userId    bigint                            not null,
    postId    bigint                            not null,
    createdAt timestamp                         not null default current_timestamp comment '创建时间',
    updatedAt timestamp                         not null default current_timestamp on update current_timestamp comment '修改时间'
);
insert post_likes(userId, postId)
values (1, 1);

/*帖子评论表*/
drop table if exists post_comments;
create table post_comments
(
    id        bigint auto_increment primary key not null,
    userId    bigint                            not null,
    postId    bigint                            not null,
    content   varchar(500)                      not null,
    parentId  bigint,
    createdAt timestamp                         not null default current_timestamp comment '创建时间',
    updatedAt timestamp                         not null default current_timestamp on update current_timestamp comment '修改时间'
);
insert post_comments(userId, postId, content)
values (1, 1, 'good');

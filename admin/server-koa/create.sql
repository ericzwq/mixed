/*数据库*/
drop
    database if exists courseselection;
create
    database courseSelection;
use
    courseselection;

#修改列
#
alter table users
    modify id bigint;
#
ALTER TABLE users
    CHANGE COLUMN id id INT(8) NOT NULL AUTO_INCREMENT;
#
ALTER TABLE users
    modify COLUMN createdBy varchar(10) not null,
    modify COLUMN updatedBy varchar(10) not null default '--';
#删除列
#
alter table users
    drop username,
    drop c2;

/*用户表*/
drop table if exists users;
create table users
(
    id        bigint auto_increment primary key not null,
    username  varchar(20)                       not null,
    password  varchar(20)                       not null,
    email     varchar(20)                       not null,
    createdAt timestamp                         not null default current_timestamp comment '创建时间',
    updatedAt timestamp                         not null default current_timestamp on update current_timestamp comment '修改时间'
);
create
    index idx_name on users (username);

set global time_zone = '+8:00';

insert users(username, password, email)
values ('张三', '123456', '1234@163.com');

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

/*数据库*/
drop
database if exists courseselection;
create
database courseSelection;
use
courseselection;

#
修改列
#
alter table students modify id bigint;
#
ALTER TABLE students CHANGE COLUMN id id INT (8) NOT NULL AUTO_INCREMENT;
#
ALTER TABLE materials modify COLUMN createdBy varchar (10) not null,modify COLUMN updatedBy varchar (10) not null default '--';
#
删除列
#
alter table students drop username,drop c2;

/*用户表*/
drop table if exists users;
create table users
(
    id        bigint auto_increment primary key not null,
    username  varchar(20) not null,
    password  varchar(20) not null,
    email     varchar(20) not null,
    createdAt timestamp   not null default current_timestamp comment '创建时间',
    updatedAt timestamp   not null default current_timestamp on update current_timestamp comment '修改时间'
);
create
    index idx_name on user (username);

set
time_zone = '+8:00';

insert
users(usernmae, password, email)
values ('张三', '123456', '1234@163.com');



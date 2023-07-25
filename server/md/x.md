# node 本地服务器

node+express

# 数据库说明

启动服务的命令: net start mysql
连接数据库：mysql -u root -p
查看所有数据库 select database();
查看数据库：SHOW DATABASES;
查看表：SHOW TABLES;
使用 dxg 数据库 use dxg;
创建数据库 CREATE DATABASE dxg;

本地数据库
user: 'root', //用户名
password: 'root', //
database: 'dxg', // 目标数据库名
重启脚本 schtasks /create /sc daily /tn "RestartServe" /tr "C:\Users\Administrator\Desktop\node\run.bat"
GRANT ALL PRIVILEGES ON dxg.* TO 'username'@'%';

# 数据库导出文件

MySQL 命令行导出数据库：
1，进入 MySQL 目录下的 bin 文件夹：cd MySQL 中到 bin 文件夹的目录
如我输入的命令行：cd C:\Program Files\MySQL\MySQL Server 4.1\bin
(或者直接将 windows 的环境变量 path 中添加该目录)

2，导出数据库：mysqldump -u 用户名 -p 数据库名 > 导出的文件名
如我输入的命令行:mysqldump -u root -p dxg > dxg.sql (输入后会让你输入进入 MySQL 的密码)（如果导出单张表的话在数据库名后面输入表名即可）

3 mysql> source /home/abc/abc.sql # 导入备份数据库

# 数据库表

alter table role_menu modify id integer auto_increment;

权限管理模块：用户表（user） 菜单表（menu） 角色表（role_table） 用户角色关联表（role_users） 菜单角色关联表（）

# 命令行方式修改数据库超时断连

show variables like '%timeout%'; 查看配置时长
show global VARIABLES like '%timeout%' ; 全局

使用以下命令可以修改 MySQL 的超时时间为 600 秒
SET GLOBAL wait_timeout=86400;
SET GLOBAL interactive_timeout=86400;

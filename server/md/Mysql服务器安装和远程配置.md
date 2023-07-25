# 前言

关于一个前端开始对服务器和 mysql 数据库的学习记录，介绍一下如何在服务器部署一个 Mysql,并且能够实现远程访问。

由于是首次尝试这里还是选择熟悉的 windows 系统服务器来操作，这里用的是 **Windows-2022-Datacenter-cn** 版本 。
Mysql 选择的是 **mysql-8.0.33-winx64.zip** 版本。（[选择合适系统对应版本下载](https://dev.mysql.com/downloads/mysql/)）

# 安装 Mysql

下载好 mysql 后进行解压，可按照自己设置的文件路径进行解压，也可默认路径直接安装。这里我是直接安装 C 盘下面了。安装好后可以看到一个文件夹如下这样

![ea0af1ec2624a3be691b4cd8ed0f131.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/19b2d797e8a543f6ade8e293c216889c~tplv-k3u1fbpfcp-watermark.image?)

## 环境变量

首先配置一下环境变量，右键此电脑打开属性，在高级中找到环境变量

![09cfe8e9adee31122a51000a6a9b3a8.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3a4ba2ff9e5b4adf8707f86f2c68a103~tplv-k3u1fbpfcp-watermark.image?)

然后点击开打找到 Path

![6d5044a00588223d5f3cddd446d92b3.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/49c9621a6d344cbebd5b429a1ef44965~tplv-k3u1fbpfcp-watermark.image?)
点进去然后新建一条环境变量

![32731d858a91237ab9877671fddc64b.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9893a9705f9e4cbb835f37b1b057b713~tplv-k3u1fbpfcp-watermark.image?)

这个路径就是上面我们安装好 mysql 的文件路径，注意是要带到 bin 文件的路径

![87b5dd21cf52be6fc2052d8163294d4.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e05ffe311ee94ee2881171808367d1e7~tplv-k3u1fbpfcp-watermark.image?)

## 配置文件

在 windows 系统中是需要加一个.ini 配置文件的，大致里面写上常用配置如下

```js
[mysqld]
; 设置3306端口
port=3306
; 设置mysql的安装目录
basedir=C:\\mysql-8.0.33-winx64
; 设置mysql数据库的数据的存放目录
datadir=C:\\mysql-8.0.33-winx64\\data
; 允许最大连接数
max_connections=200
; 允许连接失败的次数。这是为了防止有人从该主机试图攻击数据库系统
max_connect_errors=10
; 服务端使用的字符集默认为UTF8
character-set-server=UTF8
; 创建新表时将使用的默认存储引擎
default-storage-engine=INNODB
; 默认使用“mysql_native_password”插件认证
default_authentication_plugin=mysql_native_password
[mysql]
; 设置mysql客户端默认字符集
default-character-set=UTF8
[client]
; 设置mysql客户端连接服务端时默认使用的端口
port=3306
default-character-set=UTF8
```

注意：

- 配置文件中的 basedir 和 datadir 分别是自己电脑的 mysql 安装路径和数据库数据的存放目录，这个数据库存放目录初始化的时候会自动生成，指定好路径即可
- 服务端使用的字符集默认为 UTF8，但是执行时可能会发现如下警告

```js
'utf8' is currently an alias for the character set UTF8MB3, but will be an alias for UTF8MB4 in a future release. Please consider using UTF8MB4 in order to be unambiguous.
```

'utf8'当前是字符集 UTF8MB3 的别名，但在将来的版本中将是 UTF8MB4 的别名。为了明确起见，请考虑使用 UTF8MB4。直接把配置文件中的 utf-8 都换成 UTF8MB3 即可

- 运行启动时候遇到有缺 VCRUNTIME140_1.dll 的情况，可以去安装补丁，直接下载程序缺少文件，我这里是直接去下载了补丁

  64 位的电脑把“VCRUNTIME140_1.dll”文件放到“C:\Windows\System32”文件夹里即可

  32 位的电脑把“VCRUNTIME140_1.dll”文件放到“C:\Windows\SysWOW64”文件夹里即可

## 初始化

首先初始化数据库 以管理员身份 运行 cmd，切换至安装目录的 bin 目录下，输入如下命令：

```js
mysqld --initialize --console 服务名
```

服务名：当有多个 Mysql 服务时可以自定义多个服务名，如果就一个可以不用服务名，默认名字就是 mysql

![1.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9f905fead2984fbe8ed4edce5a35f1ca~tplv-k3u1fbpfcp-watermark.image?)
这里就是生成的默认数据库密码，先保存下来，后面可以重置密码。

接下来在当前命令窗口中继续依次输入一下命令

```js
mysqld -install 安装服务
net start mysql 启动服务
mysql -u root -p 登录数据库
```

![2.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6df0425a4dba41298269629fcb721479~tplv-k3u1fbpfcp-watermark.image?)
然后输入上面保存的初始密码，出现如下提示说明登录成功了

![3.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a46e43b7b0084a67ba932309b8ebe246~tplv-k3u1fbpfcp-watermark.image?)

## 重置密码

如果每次输入上面繁琐的密码很容易忘记可以在第一次登录上 root 账号时就修改密码

```js
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '12345689';
```

然后退出重新使用新密码登录 root 账号，发现可以登录成功了。

![4.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ec62d2cec6554413a20b8c199741ddee~tplv-k3u1fbpfcp-watermark.image?)

# 远程配置

基础配置是完成了，本地输入账号密码就可以正常访问使用了，但是服务器上面想让外网访问，就比如在公司或者在家想访问这个服务器上的 mysql 数据库该如何处理呢?
想让数据库实现外网访问大致总结了有四个点，下面依次说明。一般解决这几个问题就可以正常访问了。

## 远程服务器 mysql 是否启动

这个比较简单就是确定服务器上 mysql 确定已经运行，在资源管理器中可以看到。

## Mysql 用户权限问题

这个是关于数据库用户和访问权限的一些问题，我们可以先登录 root 账号，然后输入 SHOW DATABASES;命令来查看当前账号 root 下存在的一些数据库

```JS
 SHOW DATABASES;
```

![5.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cb7fbe345fae4c99991eefe7ab76cec3~tplv-k3u1fbpfcp-watermark.image?)

然后依次输入以下命令

```JS
 use mysql; 选中mysql表
 select host, user from user; 查看权限
```

![6.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1ea242f4eea74321aa9567948394dbdf~tplv-k3u1fbpfcp-watermark.image?)

可以看到这里面的 host 都是 localhost 仅限本地访问，所以我们这里选择新建一个用户然后给他加上外网可以访问的权限,当然也可以直接选择更改 root 用户的权限

### 更改用户权限

```js
update user set Host='%' where User='root';  % 指的是所有地址。
FLUSH PRIVILEGES; 刷新权限
```

这样就暴露了 root 账号的所有访问权限，造成数据库的不安全，所以我们选择新建一个用户

```js
create user 'username'@'%' identified by '123456';
username就是自定的账号名
 % 指的是所有地址
 123456就是密码
```

![7.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5554d03d13da499e904fadbbef5c99d1~tplv-k3u1fbpfcp-watermark.image?)

可以发现我们新加的用户和对应访问权限已经出现了。然后我们切换这个新加的账号

**mysql -uusername -p** 登录一下 查看数据库

![8.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/244c40f30a014ee1a8d8e0eba04d8bf1~tplv-k3u1fbpfcp-watermark.image?)

可以正常登录 但是查看到的表和 root 账号是不一样的 这就是用户权限的不同，如果我们想让某用户拥有访问某个数据库权限，那么就需要 root 授予这个账号相对应的权限才行。

### 用户授权

首先登录 root 账号，查看当前数据库，这里可以看到我们事先导入了一个自定义的业务数据库 dxg，这个在 username 这个账号下是没有的库

![9.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3d9f6b15f37f4ee192b6717c6a31f127~tplv-k3u1fbpfcp-watermark.image?)

想让 username 这个用户可以访问这个库，就需要授权，可以给到具体的数据库和具体表的访问权限

```js
-- 授予连接访问权限
GRANT ALL PRIVILEGES ON [数据库名].[表名] TO '[用户名]'@'[连接地址]' WITH GRANT OPTION;
-- 授予操作增删改
GRANT SELECT, UPDATE, DELETE, INSERT ON dxg .* TO 'username'@'%' WITH GRANT OPTION;
-- 刷新权限
FLUSH PRIVILEGES;
```

然后切换回到 username 账号，发现可以查到 dxg 这个表了,用户分配权限完成。我们就可以在外网登录这个被分配的账号或者给其他人使用这个账号来进行数据库操作了。

![10.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9b13555511a544028d78b221617dd84c~tplv-k3u1fbpfcp-watermark.image?)

## mysql 对应端口是否开放外网访问权

如果确定 mysql 已经运行且服务器可以对外访问的情况下，还是无法连接 Mysql 数据库的话，那么就要考虑一下端口是否开放的问题了，最危险也是最简单的就是关闭防火墙，当然不建议这样做，这无异于裸奔。
所以还是用比较稳重的方式吧，开放防火墙的默认 mysql 的端口 3306 这个确定当前系统中 Mysql 占用的端口，然后开放即可，具体操作网上很多
https://jingyan.baidu.com/article/91f5db1b78235b1c7e05e351.html

以上便是一次简单的 mysql 安装和访问权限设置的过程了。

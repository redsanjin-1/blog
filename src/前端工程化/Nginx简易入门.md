# 1. 什么是Nginx

Nginx 是一个免费的，开源的，高性能的 **HTTP 服务器和反向代理**，以及 IMAP / POP3 代理服务器。**Nginx 以其高性能，稳定性，丰富的功能，简单的配置和低资源消耗而闻名。**

# 2. Nginx架构

Nginx 里有一个 master 进程和多个 worker 进程。master 进程并不处理网络请求，主要负责调度工作进程：加载配置、启动工作进程及非停升级。worker 进程负责处理网络请求与响应。基础架构设计，如下图所示：

![image.png](https://ik.imagekit.io/redsanjin/blog/a6385af8d96c.png)

Master负责管理worker进程，worker进程负责处理网络事件。**整个框架被设计为一种依赖事件驱动、异步、非阻塞的模式**。

如此设计的优点有：

- 可以充分利用多核机器，增强并发处理能力。

- 多worker间可以实现负载均衡。

- Master监控并统一管理worker行为。在worker异常后，可以主动拉起worker进程，从而提升了系统的可靠性。并且由Master进程控制服务运行中的程序升级、配置项修改等操作，从而增强了整体的动态可扩展与热更的能力。

# 3. 安装Nginx

- windows 从官网[下载](https://nginx.org/en/download.html)

- linux参考[这里](https://blog.csdn.net/shallow72/article/details/123878716)，推荐docker安装

- mac 通过 homebrew 安装，也推荐docker安装

- 编译nginx的第三方版本，[Tengine](https://www.w3schools.cn/nginx/nginx_install_tengine.html)或者[OpenResty](https://www.w3schools.cn/nginx/nginx_install_openresty.html)

# 4. 常见命令

```Shell
nginx -s reopen #重启Nginx
nginx -s reload #重新加载Nginx配置文件，然后以优雅的方式重启Nginx
nginx -s stop #强制停止Nginx服务
nginx -s quit #优雅地停止Nginx服务（即处理完所有请求后再停止服务）
nginx -?,-h #打开帮助信息
nginx -v #显示版本信息并退出
nginx -V #显示版本和配置选项信息，然后退出
nginx -t #检测配置文件是否有语法错误，然后退出
nginx -T #检测配置文件是否有语法错误，转储并退出
nginx -q #在检测配置文件期间屏蔽非错误信息
nginx -p prefix #设置前缀路径(默认是:/usr/share/nginx/)nginx -c filename #设置配置文件(默认是:/etc/nginx/nginx.conf)
nginx -g directives #设置配置文件外的全局指令
killall nginx #杀死所有nginx进程

systemctl enable nginx                            # 将Nginx服务注册为系统启动后自动启动
systemctl start nginx                               # 启动Nginx服务命令
systemctl reload nginx                            # reload Nginx服务命令
systemctl stop nginx                               # stop Nginx服务命令
systemctl status nginx                            # 查看Nginx服务运行状态命令
```

# 5. Nginx配置

## 5.1 典型配置

Nginx 的常见配置指令域如下表所示

| 域名称   | 域类型 | 域说明                                                                                                              |
| -------- | ------ | ------------------------------------------------------------------------------------------------------------------- |
| main     | 全局域 | Nginx 的根级别指令区域。该区域的配置指令是全局有效的，该指令名为隐性显示，nginx.conf 的整个文件内容都写在该指令域中 |
| events   | 指令域 | Nginx 事件驱动相关的配置指令域                                                                                      |
| http     | 指令域 | Nginx HTTP 核心配置指令域，包含客户端完整 HTTP 请求过程中每个过程的处理方法的配置指令                               |
| upstream | 指令域 | 用于定义被代理服务器组的指令区域，也称"上游服务器"                                                                  |
| server   | 指令域 | Nginx 用来定义服务 IP、绑定端口及服务相关的指令区域                                                                 |
| location | 指令域 | 对用户 URI 进行访问路由处理的指令区域                                                                               |
| stream   | 指令域 | Nginx 对 TCP 协议实现代理的配置指令域                                                                               |
| types    | 指令域 | 定义被请求文件扩展名与 MIME 类型映射表的指令区域                                                                    |
| if       | 指令域 | 按照选择条件判断为真时使用的配置指令域                                                                              |

典型配置如下：

```Nginx
daemon on;                                              # 以守护进程的方式运行Nginx
pid  logs/nginx.pid;                                    # 主进程ID记录在logs/nginx.pid中
user nobody nobody;                                     # 工作进程运行用户为nobody
load_module "modules/ngx_http_xslt_filter_module.so";   # 加载动态模块ngx_http_xslt_
                                                        # filter_module.so
error_log  logs/error.log debug;                        # 错误日志输出级别为debug
pcre_jit on;                                            # 启用pcre_jit技术
thread_pool default threads=32 max_queue=65536;         # 线程池的线程数为32，等待队列中的最大
                                                        # 任务数为65536
timer_resolution 100ms;                                 # 定时器周期为100毫秒
worker_priority -5;                                     # 工作进程系统优先级为-5
worker_processes auto;                                  # 工作进程数由Nginx自动调整
worker_cpu_affinity auto;                               # 工作进程的CPU绑定由Nginx自动调整
worker_rlimit_nofile 65535;                             # 所有工作进程的最大连接数是65535
worker_shutdown_timeout 10s;                            # 工作进程关闭等待时间是10秒
lock_file logs/nginx.lock;                              # 互斥锁文件的位置是logs/nginx.lock

working_directory logs                                  # 工作进程工作目录是logs
debug_points stop;                                      # 调试点模式为stop
worker_rlimit_core 800m;                                # 崩溃文件大小为800MB

events {
    worker_connections 65535;                           # 每个工作进程的最大连接数是65535
    use epoll;                                          # 指定事件模型为epoll
    accept_mutex on;                                    # 启用互斥锁模式的进程调度
    accept_mutex_delay 300ms;                           # 互斥锁模式下进程等待时间为300毫秒
    multi_accept on;                                    # 启用支持多连接
    worker_aio_requests 128;                            # 完成异步操作最大数为128
    debug_connection 192.0.2.0/24;                      # 调试指定连接的IP地址和端口是192.0.2.0/24
}

http {   # 配置使用最频繁的部分，代理、缓存、日志定义等绝大多数功能和第三方模块的配置都在这里设置
    # 设置日志模式
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;   # Nginx访问日志存放位置

    sendfile            on;   # 开启高效传输模式
    tcp_nopush          on;   # 减少网络报文段的数量
    tcp_nodelay         on;
    keepalive_timeout   65;   # 保持连接的时间，也叫超时时间，单位秒
    types_hash_max_size 2048;

    include             /etc/nginx/mime.types;      # 文件扩展名与类型映射表
    default_type        application/octet-stream;   # 默认文件类型

    include /etc/nginx/conf.d/*.conf;   # 加载子配置项
    
    server {
    	listen       80;       # 配置监听的端口
    	server_name  localhost;    # 配置的域名
    	
    	location / {
    		root   /usr/share/nginx/html;  # 网站根目录
    		index  index.html index.htm;   # 默认首页文件
    		deny 172.168.22.11;   # 禁止访问的ip地址，可以为all
    		allow 172.168.33.44； # 允许访问的ip地址，可以为all
    	}
        
        # [=|~*|^~|@]部分称为 location 修饰语（Modifier），
        # 修饰语定义了与 URI 的匹配方式。pattern 为匹配项，可以是字符串或正则表达式
        # location [ = | ~ | ~* | ^~ | @] uri {
        #    ...
        # }

    	
    	error_page 500 502 503 504 /50x.html;  # 默认50x对应的访问页面
    	error_page 400 404 error.html;   # 同上
    }
    
    # 配置多个server
    # server {
    #   listen 8080;
    #   server_name www.nginxtest.org;
    #   root /opt/nginx-web/www;
    #   location /img {
    #      alias /opt/nginx-web/img/;  # 将匹配的访问路径重新指定为新定义的文件路径
    #   }
    #}
}
```

## 5.2 配置反向代理

运用到了 [ngx_http_proxy_module](http://nginx.org/en/docs/http/ngx_http_proxy_module.html), 常见配置如下( 推荐用 [switchhost](https://github.com/oldj/SwitchHosts/releases) 改hosts )

```Nginx
server {
  listen 9001;
  server_name fe.resanjin.com;
  
  # 将 127.0.0.1:9001/auth-services 的请求转发到 127.0.0.1:8080 的后端服务中
  location ^~/auth-services/ {
    rewrite ^/auth-services/(.*)$ /$1 break;
    proxy_pass be.resanjin.com;
  }
  
  location ~ /user-services/ {
    proxy_pass http://127.0.0.1:8081;
  }
}

```

## 5.3 配置gzip

运用到了 [ngx_http_gzip_module](http://nginx.org/en/docs/http/ngx_http_gzip_module.html), 可配置在http目录，server目录，location目录

```Nginx
gzip on; # 默认off，是否启用动态gzip压缩功能
gzip_min_length 1k; # 文件资源大小超过最小值，才开启压缩
gzip_types text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript;

# 上面两个开启基本就能跑起了，下面的愿意折腾就了解一下
gzip_static on;
gzip_proxied any;
gzip_vary on; 
gzip_comp_level 6;
gzip_buffers 16 8k;
gzip_http_version 1.1;
```

稍微解释一下：

1. **gzip_types**：要采用 gzip 压缩的 MIME 文件类型，其中 text/html 被系统强制启用；

2. **gzip_static**：默认 off，该模块启用后，Nginx 首先检查是否存在请求静态文件的 gz 结尾的文件，如果有则直接返回该 `.gz` 文件内容；

3. **gzip_proxied**：默认 off，nginx做为反向代理时启用，用于设置启用或禁用从代理服务器上收到相应内容 gzip 压缩；

4. **gzip_vary**：用于在响应消息头中添加 `Vary：Accept-Encoding`，使代理服务器根据请求头中的 `Accept-Encoding` 识别是否启用 gzip 压缩；

5. **gzip_comp_level**：gzip 压缩比，压缩级别是 1-9，1 压缩级别最低，9 最高，级别越高压缩率越大，压缩时间越长，建议 4-6；

6. **gzip_buffers**：获取多少内存用于缓存压缩结果，16 8k 表示以 8k*16 为单位获得；

7. **gzip_min_length**：允许压缩的页面最小字节数，页面字节数从header头中的 `Content-Length` 中进行获取。默认值是 0，不管页面多大都压缩。建议设置成大于 1k 的字节数，小于 1k 可能会越压越大；

8. **gzip_http_version**：默认 1.1，启用 gzip 所需的 HTTP 最低版本；

> `webpack` 中可添加 [compression-webpack-plugin](https://github.com/webpack-contrib/compression-webpack-plugin) 进行压缩，会`build`出`.gz`格式文件，可以减轻`nginx`服务压力，同时`vite`也有对应插件 [vite-plugin-compress](https://github.com/alloc/vite-plugin-compress)。

> 更进一步，我们可以下载 `google`的开源模块 [brotli](https://github.com/google/brotli)（必须开启https, 同时对服务器计算能力要求更高），性能比`gzip`提高 17-25%。

## 5.4 配置负载均衡

主要思想就是把负载均匀合理地分发到多个服务器上，实现压力分流的目的。

主要配置如下：

```Nginx
http {
  upstream myserver {
  	# ip_hash;  # ip_hash 方式
    # fair;   # fair 方式
    # 30s内检查心跳发送两次包，未回复就代表该机器宕机，请求分发权重比为1:2
    server 192.168.0.000:8080 weight=100 max_fails=2 fail_timeout=30s;
    server 192.168.0.000:8090 weight=200 max_fails=2 fail_timeout=30s;
  }
 
  server {
    listen 80;
    server_name fe.redsanjin.com;
    
    location / {
        root html;
        index index.html index.htm;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        # 请求交给名为myserver的upstream上
        proxy_pass http://myserver;
    }
  }
}
```

Nginx 提供了好几种分配方式，默认为**轮询**，就是轮流来。有以下几种分配方式：

1. **轮询**，默认方式，每个请求按时间顺序逐一分配到不同的后端服务器，如果后端服务挂了，能自动剔除；

2. **weight**，权重分配，指定轮询几率，权重越高，在被访问的概率越大，用于后端服务器性能不均的情况；

3. **ip_hash**，每个请求按访问 IP 的 hash 结果分配，这样每个访客固定访问一个后端服务器，可以解决动态网页 session 共享问题。负载均衡每次请求都会重新定位到服务器集群中的某一个，那么已经登录某一个服务器的用户再重新定位到另一个服务器，其登录信息将会丢失，这样显然是不妥的；

4. **fair**（第三方），按后端服务器的响应时间分配，响应时间短的优先分配，依赖第三方插件 nginx-upstream-fair，需要先安装；

## 5.5 配置HTTPS

```Nginx
server {
  listen 443 ssl http2 default_server;   # SSL 访问端口号为 443
  server_name fe.resanjin.com;         # 填写绑定证书的域名

  ssl_certificate /etc/nginx/https/fe.redsanjin.crt;   # 证书文件地址
  ssl_certificate_key /etc/nginx/https/fe.redsanjin.key;      # 私钥文件地址
  ssl_session_timeout 10m;

  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;      #请按照以下协议配置
  ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE; 
  ssl_prefer_server_ciphers on;
  
  location / {
    root         /usr/share/nginx/html;
    index        index.html index.htm;
  }
}
```

## 5.6 图片防盗链

referer 请求头控制模块可以通过设置请求头中的属性字段 Referer 的值控制访问的拒绝与允许。Referer 字段用来表示当前请求的跳转来源，由于该字段可能会涉及隐私权问题，部分浏览器允许用户不发送该属性字段，因此也会存在浏览器正常的请求头中无 Referer 字段的情况。

另外，有些代理服务器或防火墙也会把 Referer 字段过滤掉。通常情况下，伪造 Referer 字段的内容是很容易的，因此该模块主要用于浏览器正常发送请求中 Referer 值的过滤。虽然通过 Referer 字段进行来源控制并不十分可靠，但用在防盗链的场景中还是基本可以满足需求的。



核心功能运用到了 [ngx_http_referer_module](http://nginx.org/en/docs/http/ngx_http_referer_module.html)，常见配置如下

```Nginx
server {
  listen       80;        
  server_name  fe.redsanjin.com;
  
  # 图片防盗链
  location ~* \.(gif|jpg|jpeg|png|bmp|swf)$ {
    valid_referers none blocked server_names ~\.google\. ~\.baidu\.;  # 只允许referer为空，非法值，本地域名或者从谷歌百度搜索外联引用
    if ($invalid_referer){
      # 可以配置成返回一张禁止盗取的图片
      # rewrite   ^/ http://xx.xx.com/NO.jpg;
      # 也可直接返回403
      return 403;
    }
    
    root /soft/nginx/static_rrsources;
    expires 7d;
  }
}

```

## 5.7 单页面项目 history 路由配置

```Nginx
server {
  listen       80;
  server_name  fe.redsanjin.com;
  
  location / {
    root       /usr/share/nginx/html/dist;  # vue 打包后的文件夹
    index      index.html index.htm;
    try_files  $uri $uri/ /index.html @rewrites;  
    
    expires -1;                          # 首页一般没有强制缓存
    add_header Cache-Control no-cache;
  }
  
  # 接口转发，如果需要的话
  #location ~ ^/api {
  #  proxy_pass http://be.sherlocked93.club;
  #}
  
  location @rewrites {
    rewrite ^(.+)$ /index.html break;
  }
}
```

## 5.8 HTTP请求转发到HTTPS

```Nginx
server {
    listen      80;
    server_name fe.redsanjin.com;

    # 单域名重定向
    if ($host = 'fe.redsanjin.com'){
        return 301 https://www.sherlocked93.club$request_uri;
    }
    # 全局非 https 协议时重定向
    if ($scheme != 'https') {
        return 301 https://$server_name$request_uri;
    }

    # 或者全部重定向
    return 301 https://$server_name$request_uri;

    # 以上配置选择自己需要的即可，不用全部加
}

```

## 5.9 日志切割

- 先确定nginx日志路径和pid路径

```Shell
# 查看access.log,error.log，nginx.pid的路径
nginx -V
```

- 脚本编写

```Shell
#!/bin/bash
#0 0 * * *  /bin/bash /data/nginx/sh/cut_nginx_logs.sh
logs_path="/data/log/nginx/"  
today=$(date "+%Y%m%d")  
cd $logs_path  
for i in *.log  
do  
    mv $i ${today}-$i
    /data/nginx-1.22.0/sbin/nginx -s reopen
    tar zcf ${today}-${i}.tar.gz ${today}-$i && rm -f ${today}-$i
done

if [ -d $logs_path ];then  
    find $logs_path -name "*.tar.gz" -mtime +15 -exec rm -f {} \;
fi

# kill -USR1 `cat  /data/nginx/tmp/nginx.pid`
```

- 授权执行权限

```Shell
chmod + /data/nginx/sh/cut_nginx_logs.sh
```

- 编写定时任务

```Shell
# 命令行输入
crontab -e
0 0 * * *  /bin/bash /data/nginx/sh/cut_nginx_logs.sh
```

## 5.10 配置缓存

相关`HTTP`缓存，可以查看之前的文章

[一文读懂HTTP缓存](https://flowus.cn/1708c4c1-153e-4e63-b476-c6be1f0525cd)

### 5.10.1 强缓存

- Cache-Control字段： HTTP1.2产物

| 值              | 描述                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------ |
| no-store        | 禁止缓存(强缓存和协商缓存),客户端不存储任何值                                              |
| no-cache        | 禁止强缓存，需要重写验证(可以理解为 禁止强缓存，启用协商缓存)                              |
| private         | 私有缓存，禁止中间人(比如CDN等代理缓存)                                                    |
| public          | 共享缓存，允许中间人缓存                                                                   |
| max-age         | 资源可以被缓存的最大时间，单位：秒，是一个相对时间，优先级高于 Expires                     |
| s-maxage        | 用于共享缓存，单位：秒，如果在其有效期内，不去访问CDN等。s-maxage会覆盖 max-age 和 Expires |
| must-revalidate | 缓存使用陈旧资源时，必需先验证状态                                                         |

```Nginx
location /test {
  add_header Cache-Control "private, max-age=25920000";#开启私有缓存 缓存1个月
}
```

- Expires字段：HTTP1.0产物

它是 服务器返回的一个绝对时间，优先级低于 **Cache-Control**

```Nginx
location /test {
  add_header Expires "10d";#缓存10天
}
```

### 5.10.2 协商缓存

我们知道，Nginx 默认是开启了协商缓存的，这里我们说一下如何**关闭协商缓存**

协商缓存这里主要分两种：

- Etag 强校验器，根据文件内容和最后修改的时间生成的一段 hash字符串

- Last Modified 弱校验器，它的值是 资源最后修改的时间，单位：秒

```Nginx
location /test {
  etag off; # 关闭Etag
  
  # 关闭 Last_Modified
  add_header Last-Modified '';
  if_modified_since off;
}
```

### 5.10.3 Pargma

http1.0 产物； 优先级高于 Cache-Control/Expires; 它的存在目的是向后兼容

```Nginx
add_header Pargma 'no-cache'; #禁止缓存
```

### 5.10.4 实践场景

在实际开发中，需要考虑一个常见的问题 那就是如何做到，**在更新版本的时候，尽可能命中缓存的同时，让客户端本地的缓存失效**

> 可行的方案是

    - HTML 使用协商缓存

    - css、js、图片等资源，使用强缓存。配合webpack的文件指纹策略，打包的时候文件 名带上hash值，这样有改动，hash值就会发生变化，达到让客户端缓存失效的目的

```Nginx
location /test {
  index index.html index.htm;
  # js、css、字体、图片等资源启用强缓存
  if ($request_uri ~* .*[.](js|css|map|jpg|png|svg|ico)$) {
    add_header Cache-Control "public, max-age=25920000";#非html缓存1个月
    add_header Expires "30d";
  }
  # HTML 启用协商缓存
  if ($request_filename ~* ^.*[.](html|htm)$) {
    add_header Cache-Control "public, no-cache";
  }
}

```

# 6. 参考

- [Nginx官网](http://nginx.org/en/docs/)

- [万字总结，体系化带你全面认识 Nginx ！](https://juejin.cn/post/6942607113118023710)

- [Nginx 从入门到实践，万字详解！](https://juejin.cn/post/6844904144235413512?searchId=20230803102735437223DE2B756228DFB8)

- [w3schools的nginx教程](https://www.w3schools.cn/nginx/nginx_http_referer.asp)

- [Nginx一网打尽](https://juejin.cn/post/7112826654291918855)




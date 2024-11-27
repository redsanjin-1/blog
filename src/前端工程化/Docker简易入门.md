# 1. 术语

docker的架构如下

![b3651859ef1f.png](https://ik.imagekit.io/redsanjin/blog/b3651859ef1f.png)

从图中可以看出几个组成部分

- docker client: 即 docker 命令行工具

- docker host: 宿主机，docker daemon 的运行环境服务器

- docker daemon: docker 的守护进程，docker client 通过命令行与 docker daemon 交互

- container: 最小型的一个操作系统环境，可以对各种服务以及应用容器化

- image: 镜像，可以理解为一个容器的模板配置，通过一个镜像可以启动多个容器

- registry: 镜像仓库，存储大量镜像，可以从镜像仓库拉取和推送镜像

# 2. 下载docker

- 到 [docker官网](https://www.docker.com/) 下载安装包

- mac 使用 brew 安装

```Shell
# 安装 brew
bin/zsh -c "$(curl -fsSL https://gitee.com/cunkai/HomebrewCN/raw/master/Homebrew.sh)"

# 安装 docker
brew install docker

# 查看 docker
docker --version
```

> mac 推荐下载[orbstack](https://orbstack.dev/download)进行调试  
> mac 也可以下载[VMware Fusion Pro](https://blogs.vmware.com/teamfusion/2024/05/fusion-pro-now-available-free-for-personal-use.html)进行调试

- centos 使用yum安装

```Shell
# 安装依赖
yum install -y yum-utils device-mapper-persistent-data lvm2

# 安装 docker 官方的镜像源
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 如果在国内，安装阿里云的镜像
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

# 安装 docker
yum install -y docker-ce
```

# 3. 设置国内镜像源

- 使用 docker-destop编辑

![097baf81f5a9.png](https://ik.imagekit.io/redsanjin/blog/097baf81f5a9.png)

- 编辑配置文件daemon.json，添加源地址

```JSON
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://registry.docker-cn.com",
    "http://hub-mirror.c.163.com",
    "https://mirror.ccs.tencentyun.com"
  ]
}
```

# 4. 查看配置

```Shell
docker info

# 出现一下字段代表配置成功
# Registry Mirrors:
#  https://docker.mirrors.ustc.edu.cn/
#  https://registry.docker-cn.com/
#  http://hub-mirror.c.163.com/
#  https://mirror.ccs.tencentyun.com/
```

# 5. 常见命令

## 5.1. [Dockerfile命令](https://docs.docker.com/reference/dockerfile)

建议阅读官方的 [dockerfile-best-practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

### [FROM](https://docs.docker.com/reference/dockerfile/#from)

基于一个就有的镜像，格式如下

```Dockerfile
FROM <image> [AS <name>]

# 在多阶段构建时会用到
FROM <image>[:<tag>] [AS <name>]
```

### [WORKDIR](https://docs.docker.com/reference/dockerfile/#workdir)

设置为工作目录

```Dockerfile
WORKDIR <path>
```

### [ADD](https://docs.docker.com/reference/dockerfile/#add), [COPY](https://docs.docker.com/reference/dockerfile/#copy)

两者都可以把目录，或者 url 地址文件加入到镜像的文件系统中(ADD 从远程下载文件，也可以解压 tar.gz 文件，COPY原封不动复制过去，官方推荐使用COPY，因为语义更简单)

```Dockerfile
ADD [--chown=<user>:<group>] <src>... <dest>
```

### [RUN](https://docs.docker.com/reference/dockerfile/#run)

执行命令，由于 ufs 的文件系统，它会在当前镜像的顶层新增一层

```Dockerfile
RUN <command>
```

### [CMD](https://docs.docker.com/reference/dockerfile/#cmd)

指定容器如何启动

**一个 Dockerfile 中只允许有一个 CMD**

```Dockerfile
# exec form, this is the preferred form
CMD ["executable","param1","param2"] 

# as default parameters to ENTRYPOINT
CMD ["param1","param2"]

# shell form
CMD command param1 param2
```

### ARG，ENV

`ARG` 和 `ENV` 的效果一样，都是设置**环境变量**。不同的是，`ARG` 所设置是`构建时`的环境变量，在将来容器`运行时`是不会存在这些环境变量的。

> ⚠️ 注意，尽量不要在 `ARG` 放置敏感信息，因为 `docker history` 可以看到构建的过程

```Dockerfile
ARG NGINX_VERSION=1.22.1

ADD nginx-${NGINX_VERSION}.tar.gz /

ENV PORT 3000
```

## 5.2 Docker CLI命令

```bash
# 开启docker服务
service docker start
# 启动 docker 后台服务
systemctl start docker
# 重启docker守护进程
systemctl daemon-reload
# 重启docker服务
systemctl restart docker

# 搜素镜像, 可以到 hub.docker.com 查看更多
docker search nginx
# docker拉取镜像
docker pull 镜像别名:版本号
# 生成镜像, --node-cache 不使用缓存
docker build --rm --no-cache=true  -t node-server .
# 删除镜像
docker rmi 镜像id
# 删除镜像 例：docker rmi button-api/v2
docker rmi REPOSITORY/TAR
# 查看镜像列表
docker images

# 查看容器列表,不加-a查看正在运行的，加上-a查看所有容器
docker ps -a
# 删除容器
docker rm 容器ID/容器别名 
# 启动容器 https://docs.docker.com/reference/cli/docker/container/run/
#（-d 后台运行, --restart always 启动时服务启动 --name 容器别名, -p 宿主机端口:容器端口, 最后是镜像名称:镜像版本）
docker run -d  --restart always --name sanjin-server -p 3006:3006 node-server:1.0.0
# 关闭一个已启动容器 
docker stop 容器ID/容器别名
# 启动一个关闭的容器 
docker start 容器ID/容器别名
# 查看一个容器的详情 
docker inspect 容器ID/容器别名
# 进入容器内部
docker exec -it 容器ID/容器别名 /bin/bash

# 容器运行后，数据都在容器内部，如果容器删除，下线会导致数据丢失，因此需要将关键数据挂载到宿主机的目录持久化数据
# 查看卷
docker volume ls
# 创建卷
docker volume create ngconf
# 检查卷，其中的Mountpoint 就是宿主机挂载的位置，可以对其进行修改
docker volume inspect ngconf
# 目录挂载, 宿主机需要有对应文件(-v /vue-repo/dist:/usr/share/nginx/html)
docker run -d --name mynginx -v /vue-repo/dist:/usr/share/nginx/html -p 80:80 nginx:latest
# 卷映射，会双向映射文件 (-v ngconf:/etc/nginx)
docker run -d --name mynginx -v ngconf:/etc/nginx -p 80:80 nginx:latest

# 创建一个桥接模式的网络，local-net为网络别名
docker network create -d bridge local-net
# 查看网络配置详情
docker network inspect local-net

# 登录远程仓库
docker login 192.168.1.98
# 配置镜像tag 仓库地址/镜像名称:版本号
docker tag vue-bpmn-image:1.0.0 192.168.1.98/redsanjin/vue-bpmn-image:1.0.0
# 推荐也打上latest的tag, 这样其他人不加版本号，默认拉取 latest
docker tag vue-bpmn-image:1.0.0 192.168.1.98/redsanjin/vue-bpmn-image:latest
# 发布镜像到远程服务器(需要先打tag)
docker push 192.168.1.98/redsanjin/vue-bpmn-image:1.0.0
docker push 192.168.1.98/redsanjin/vue-bpmn-image:latest
```

# 6. 优化镜像大小

## 6.1 选择镜基础镜像

在Node.js中，有许多变体镜像发行版，相比官方镜像，体积更加精简。这些标签包括：

- Bullseye：提供 Debian发行版，以减少镜像需要安装的软件包数量，从而减小自定义镜像的整体大小。

- Alpine：任何 Node.js Alpine 变迁均源自 Alpine Linux，可提供约 5MB 的较小基础镜像发行版。

- Slim：Slim 标签值包括运行 Node.js 应用程序所需的基本软件包，通过消除不必要的软件包有效减小镜像的大小

```Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4000
CMD npm start
```

## 6.2 使用.dockerignore 来最小化和精简Docker镜像

在创建上述镜像时， COPY. . 命令会复制项目目录的所有文件和文件夹。但是 RUN npm install 生成的 node_modules文件夹，以及RUN npm run build 生成的构建文件夹是没有必要复制到镜像。

可以在项目根目录创建 .dockerignore 文件过滤这些文件夹

```Plain Text
node_modules
Dockerfile
build
dist
```

## 6.3 减少Docker镜像层

Dockerfile 中的每一条指令都会逐步创建一个新层，层数越多相对体积便会越大。

比如下面的示例：

```Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm install
RUN npm run build
RUN rm -rf node_modules
RUN npm install --production
EXPOSE 4000
CMD npm start
```

可以将多个 RUN 合并在一起，这样只会创建一个图层：

```Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm install && \
    npm run build && \
    rm -rf node_modules && \
    npm install --production
EXPOSE 4000
CMD npm start
```

## 6.4 多阶段构建

Docker 允许将多个构建步骤整合在一个 Dockerfile 文件中，这个构建步骤之间可以存在依赖关系，也可以进行文件传递，还可以更好地利用缓存。

```Dockerfile
# 🔴 阶段 1，安装依赖
FROM node:16-alpine AS base
WORKDIR /app
 
# 单独分离 package.json，是为了安装依赖可最大限度利用缓存
# 每次 docker build 的时候，只会从变化的层开始重新构建，没变的层会直接复用。
COPY package.json pnpm-lock.yaml /app/
RUN pnpm install
 
COPY . /app
# 🔴 阶段 2，构建
FROM base as build
RUN pnpm run build
 
# 🔴 阶段 3，部署nginx
# 选择更小体积的基础镜像
FROM nginx:alpine as deply
# 通过 --from 从构建阶段复制文件（from后面也可以写官方镜像的名称，比如可以拷贝nginx:latest官方镜像到自己的镜像）
COPY --from=build /app/dist /usr/share/nginx/html
```

方案1 还是有很多缺陷，比如 package.json 只要变动一个字节，都会导致 pnpm 重新安装。能不能在运行 build 的时候挂载缓存目录进去？把 `node_modules` 或者 `pnpm store` 缓存下来？

Docker build 确实支持[挂载](https://link.juejin.cn?target=https%3A%2F%2Fdocs.docker.com%2Fbuild%2Fguide%2Fmounts%2F)([BuildKit](https://link.juejin.cn?target=https%3A%2F%2Fyeasy.gitbook.io%2Fdocker_practice%2Fbuildx%2Fbuildkit), 需要 Docker 18.09+)。以下是缓存 pnpm 的示例(来自官方[文档](https://link.juejin.cn?target=https%3A%2F%2Fpnpm.io%2Fzh%2Fdocker))：

```Dockerfile
# 🔴 阶段 1，安装依赖构建
FROM node:16-alpine AS builder
WORKDIR /app

# 拷贝依赖声明
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
COPY package.json pnpm-lock.yaml /app/
# 挂载缓存
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

COPY . /app
# 🔴 阶段 2，构建
FROM base as build
RUN pnpm run build
 
# 🔴 阶段 2，部署nginx
# 选择更小体积的基础镜像
FROM nginx:alpine as deply
# 通过 --from 从构建阶段复制文件（from后面也可以写官方镜像的名称，比如可以拷贝nginx:latest官方镜像到自己的镜像）
COPY --from=build app/dist /usr/share/nginx/html
```

> 💡你也可以通过设置 `DOCKER_BUILDKIT=1` 环境变量来启用 `BuildKit`

`RUN —mount` 参数可以指定要挂载的目录，对应的缓存会存储在`宿主机器`中。这样就解决了 Docker 构建过程的外部缓存问题。

同理其他的缓存，比如 vite、Webpack，也是通过 `—mount` 挂载。一个 `RUN` 支持指定多个 `—mount`

> ⚠️ 因为采用挂载形式，这种跨设备会导致 `pnpm` 回退到拷贝模式(pnpm store → node_modules)，而不是链接模式，所以安装性能会有所损耗。

> 如果是 npm 通常需要缓存 `~/.npm` 目录

## 6.5 使用工具缩小镜像大小

- DockerSlim 可以删除不必要的文件和依赖项，并创建值包括必要组件的镜像；

- Dive可以分析你的镜像层元数据。然后识别未使用的依赖项、重复文件和其他你可以删除的低效内容；

- Docker-squash可以将多个镜像层压缩成单个层。

# 7. 容器编排工具

当容器数量很多后，可以通过一下三种常用的编排工具进行管理

## 7.1. [Docker Compose](https://docs.docker.com/compose/)
### 7.1.1. 核心概念：

1. Compose 文件（compose file）：这是一个 YAML 格式的文件，通常命名为 docker-compose.yml，它定义了多容器应用程序中的服务、网络和卷。在这个文件中，你可以指定每个容器的镜像、环境变量、卷挂载点等。

2. 服务（Service）：服务是你定义在 Compose 文件中的应用程序组件。一个服务可以由多个相同的容器实例组成，这些容器实例是无状态的，并且可以独立扩展。

3. 容器（Container）：服务中的每个实例都是一个容器。容器是 Docker 的基本运行单位，它们运行应用程序代码及其依赖。

4. 镜像（Image）：镜像是一个只读的模板，用于创建容器。在 Compose 文件中，你指定服务使用的镜像，可以是预构建的镜像，也可以是构建自 Dockerfile 的镜像。

5. 环境变量（Environment Variables）：你可以在 Compose 文件中设置环境变量，这些变量将被传递给服务中的容器。

6. 依赖（Dependencies）：在 Compose 文件中，你可以定义服务之间的依赖关系，确保在启动服务时，依赖的服务先于依赖它的服务启动。

7. 网络（Networks）：Docker Compose 允许你定义网络，这些网络可以连接多个容器，使它们能够相互通信。你可以创建自定义网络，也可以使用默认的网络。

8. 卷（Volumes）：卷是一种数据持久化机制，它允许你将数据保存在容器之外。在 Compose 文件中，你可以定义卷，并将其挂载到一个或多个服务的容器中。

9. 构建上下文（Build Context）：如果你使用自定义镜像，你需要提供一个构建上下文，这是一个包含 Dockerfile 和其他构建依赖的目录。

10. 扩展（Scaling）：Docker Compose 允许你轻松地扩展服务，通过简单的命令增加或减少服务中的容器实例数量。

11. 命令（Commands）：在 Compose 文件中，你可以指定服务启动时执行的命令，这可以覆盖容器镜像中默认的启动命令。

12. 配置（Configs）：配置允许你将敏感数据（如配置文件或密钥）传递给容器，而无需将它们直接嵌入镜像或暴露在 Compose 文件中。

### 7.1.2. yaml文件
```yaml
# 定义一个名为myblog的Docker Compose项目
name: myblog
# 定义两个服务：mysql和wordpress
services:
  # 定义mysql服务
  mysql:
    # 容器名称为mysql
    container_name: mysql
    # 使用mysql:8.0镜像
    image: mysql:8.0
    # 将主机的3306端口映射到容器的3306端口
    ports:
      - "3306:3306"
    # 设置环境变量
    environment:
      # 设置root用户的密码为123456
      - MYSQL_ROOT_PASSWORD=123456
      # 设置要创建的数据库名为wordpress
      - MYSQL_DATABASE=wordpress
    # 挂载卷
    volumes:
      # 将mysql-data卷挂载到容器的/var/lib/mysql目录
      - mysql-data:/var/lib/mysql
      # 将主机的/myconf目录挂载到容器的/etc/mysql/conf.d目录
      - /app/myconf:/etc/mysql/conf.d
    # 设置容器总是重新启动
    restart: always
    # 将容器加入到blog网络中
    networks:
      - blog

  # 定义wordpress服务
  wordpress:
    # 使用wordpress镜像
    image: wordpress
    # 将主机的8080端口映射到容器的80端口
    ports:
      - "8080:80"
    # 设置环境变量
    environment:
      # 设置数据库主机为mysql
      WORDPRESS_DB_HOST: mysql
      # 设置数据库用户为root
      WORDPRESS_DB_USER: root
      # 设置数据库密码为123456
      WORDPRESS_DB_PASSWORD: 123456
      # 设置要连接的数据库名为wordpress
      WORDPRESS_DB_NAME: wordpress
    # 挂载卷
    volumes:
      # 将wordpress卷挂载到容器的/var/www/html目录
      - wordpress:/var/www/html
    # 设置容器总是重新启动
    restart: always
    # 将容器加入到blog网络中
    networks:
      - blog
    # 设置wordpress服务依赖于mysql服务
    depends_on:
      - mysql

# 定义两个卷：mysql-data和wordpress
volumes:
  mysql-data:
  wordpress:

# 定义一个名为blog的网络
networks:
  blog:
```

### 7.1.3. 常用命令
```bash
# 启动所有服务
docker-compose up -d
# 停止并删除所有服务
docker-compose down
# 查看所有服务的日志
docker-compose logs
# 查看所有服务的状态
docker-compose ps
# 进入某个服务的容器
docker-compose exec [service_name] bash
# 构建所有服务
docker-compose build
# 拉取所有服务的镜像
docker-compose pull
# 推送所有服务的镜像
docker-compose push
# 停止所有服务
docker-compose stop
# 启动所有服务
docker-compose start
# 重启所有服务
docker-compose restart
# 查看所有服务的进程
docker-compose top
# 查看docker-compose.yml文件的配置
docker-compose config
```

## 7.2. [Docker Swarm](https://docs.docker.com/engine/swarm/)

## 7.3. [Kubernetes](https://kubernetes.io/zh-cn/)

# 8. 参考

- [官网文档](https://docs.docker.com/reference/)

- [docker_practice](https://github.com/yeasy/docker_practice)

- [使用 Docker 实现前端应用的标准化构建、部署和运行](https://juejin.cn/post/7269668219488354361)

- [掌握这 5 个技巧，让你的 Dockerfile 像个大师！](https://juejin.cn/post/7248145094600900669)

- [Docker化一个前端基础开发环境：简洁高效的选择](https://juejin.cn/post/7264403008163201081)




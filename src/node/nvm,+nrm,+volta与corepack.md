## 1、nvm 设置下载源

**nvm install** 可能由于网络问题报错，可以直接配置 **nvm install** 的源地址。

- 使用 **shell** 命令

```Shell
nvm node_mirror https://npmmirror.com/mirrors/node/
nvm npm_mirror https://npmmirror.com/mirrors/npm/
```

- 修改 **settings.txt** 文件

```Plain Text
node_mirror: https://npmmirror.com/mirrors/node/
npm_mirror: https://npmmirror.com/mirrors/npm/
```

mac 配置nvm的问题

- 安装过程可能遇到 [https://raw.githubusercontent.com](https://raw.githubusercontent.com) 无法访问的问题，下载 [switchhosts](https://github.com/oldj/SwitchHosts/releases) 订阅 [https://raw.hellogithub.com/hosts](https://raw.hellogithub.com/hosts) 修改本地hosts可以解决。

- 如果使用苹果的m1芯片，同时需要安装14以下的版本，需要进入Rosetta shell 环境

```Shell
arch -x86_64 zsh
```

同时可以选用 [n](https://github.com/tj/n) 进行版本管理。

nvm和n最大的区别是，nvm是多版本隔离，n是共享一个版本；n 每一次切换版本时，需要反复读写硬盘，伤寿命；n 无法在本地同时开启多个不同版本的项目；所以 jenkins等构建工具只支持 nvm；

## 2、nrm管理register源

由于记住上述的淘宝镜像url比较麻烦，可以下载nrm进行管理，可以方便的切换不同的register。

```Shell
npm i -g nrm
nrm ls
nrm use taobao
```

## 3、volta锁定项目node版本

nvm需要用户手动切换node版本（或者编写`.nvmrc`），无法与具体项目关联，( 如果 node 版本不统一，带来的问题可能就是整个项目无法运行；而如果包管理器不统一，带来的则可能是 `package-lock.json`、`yarn.lock`、`pnpm-lock.yaml` 在每个成员电脑上都不一致的灾难 )，[volta](https://volta.sh/) 会在 package.json 中添加 volta 字段，启动项目即可顺利进行版本切换。

示例

```Shell
// 下载, windows请到官网下载
curl https://get.volta.sh | bash

// 安装node版本
volta install node@16

// 查看已安装版本
volta list all

// 移到项目根目录配置volta
volta pin node@16
```

之后，你就会发现项目的 package.json 中被添加上一段：

```JSON
"volta": {
	"node": "18.16.1"
}
```

之后当用户进入到当前项目中时，volta 就会检测到 package.json 中声明的 node 版本，并且切换至该 node 版本。

## 4、corepack-管理包管理器的管理器

Corepack是一个实验性工具，在 Node.js v16.13 版本中引入，它可以指定项目使用的包管理器以及版本, 简单来说，Corepack 会成为 Node.js 官方的内置 CLI，用来管理『包管理工具（~~npm~~、yarn、pnpm、~~cnpm~~）』，用户无需手动安装，即『包管理器的管理器』。

主要作用：

- 不再需要专门全局安装 yarn pnpm 等工具。

- 可以强制团队项目中使用他特定的包管理器版本，而无需他们在每次需要进行更新时手动同步它，如果不符合配置将在控制台进行错误提示。

### corepack 用法

由于corepack 是一个实验性工具，所以默认是没有启动的，需要显式启用，需要运行指令 corepack enable 进行启动；在项目package.json 文件中新增属性 "packageManager"，比如

```JSON
"packageManager": "yarn@1.22.15"
```

代表当前项目只允许使用yarn 包管理器并指定1.22.15版本

```Shell
// 当前应用激活
corepack enable

// 如果您使用 Homebrew 安装 Node.js，则需要单独安装 corepack
brew install corepack

// 定义包管理器
packageManager": "yarn@1.22.15"

// 声明的包管理器，会自动下载对应的 yarn，然后执行
yarn install

// 用非声明的包管理器，会自动拦截报错
pnpm install
Usage Error: This project is configured to use yarn
```

因为在试验阶段，目前还有些问题待解决：

- 目前仅支持 pnpm 和 yarn，cnpm 也是不支持的

- 兼容性还有些问题，npm 还无法拦截也就是说 即便配置了 packageManager 使用 yarn，但是依然可以调用全局 npm 安装

## 5、参考

- [nvm-windows](https://github.com/coreybutler/nvm-windows)

- [nvm](https://github.com/nvm-sh/nvm)

- [nrm](https://github.com/Pana/nrm)

- [你应该知道的Node Corepack](https://juejin.cn/post/7218804130184282169)

- [使用 volta 与 corepack 规范团队在不同项目中使用的 node 版本与 npm 包管理器](https://juejin.cn/post/7252684645978898469)


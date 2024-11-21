## [nvm](https://github.com/nvm-sh/nvm)使用

```Shell
# 安装 nvm（Node 版本管理器）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

# 下载并安装 Node.js（可能需要重新启动终端）
nvm install 20.16.0

# 验证环境中是否存在正确的 Node.js 版本
node -v # 应打印 `v20.16.0`

# 验证环境中是否存在正确的 npm 版本
npm -v # 应打印 `10.8.1`

# 切换node版本
nvm use 18.20.4

# 查看当前node版本
nvm list

# 卸载node版本
nvm uninstall 16.3.0

# 设置别名
nvm alias default 20.16.0
```

> 可以在项目根目录新建 `.nvmrc`文件，保持运行环境统一

```Plain Text
# 当前项目node版本，运行nvm install 或者 nvm use时自动安装/切换到对应node版本
20.16.0
```

## 多项目切换 node

### 问题

`nvm`会将第一次安装的`node`版本设置为`default`版本，后续新建`shell`会定位回`default`版本，而不是上一次`nvm use`的版本，多项目切换不太方便

### 解决方案

```Shell
# 如果你想持续一段时间使用 18.7.0，可以使用 alias 命令它为默认版本
nvm alias default 18.7.0
```




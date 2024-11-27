# 前言

安装官网的[教程](https://www.reactnative.cn/docs/environment-setup)，在初始化项目的过程中，`Installing Ruby Gems`花费很长时间，仍然无法成功安装，搜索了一下才发现是以下几个原因导致的

![image.png](https://ik.imagekit.io/redsanjin/blog/9554997e4a0a.png)

# Ruby

在 React Native iOS 应用的依赖管理中会使用到它。Mac 电脑上默认集成了 Ruby，但却和 React Native 所依赖的 Ruby 版本有些不一致。因此，你需要通过 rbenv 对 Ruby 进行版本管理，就像使用 NVM 工具用于管理 Node 的版本一样。首先，你可以运行如下命令查看当前的 Ruby 版本。

```Shell
ruby --version
```

系统自带的 Ruby 是 2.6.10 版本，而 React Native 0.71 所依赖的 Ruby 版本是 2.7.6。因此，我们需要使用 rbenv 将 Ruby 版本切换到 2.7.6。接着，你可以使用 Homebrew 安装 rbenv，安装命令如下：

```Shell
brew install rbenv ruby-build 
```

安装完后，运行init命令。运行完成后，它会提示你需要在 .zshrc 文件中执行 rbenv init 命令，因此你需要根据提示，使用 echo 将 init 命令添加到 Terminal 启动前。以保障 Terminal 启动时，rbenv 会生效。相关命令如下：

```shell
rbenv init

# 每人的提示信息不一定相同，根据提示信息进行相关操作
echo 'eval "$(rbenv init - zsh)"' >> ~/.zshrc
```

命令执行完成后，重启 Terminal，安装并切换到 React Native 所依赖的 Ruby 版本。

```shell
# 下载
rbenv install 2.7.6
# 设置
rbenv global 2.7.6

# 查看当前版本
ruby --version
```

> 如果 `rbenv install 2.76` 很缓慢，可以点击下面[链接](https://cache.ruby-china.com/pub/ruby/2.7/ruby-2.7.6.tar.bz2)，下载 `ruby-2.7.6.tar.bz2` 安装包，再把安装包拷贝到 `~/.rbenv/cache/` 目录

```shell
# 如果没有cache目录，新建一个
mkdir cache

# 移动安装包
mv ruby-2.7.6.tar.bz2 ~/.rbenv/cache/
```

这样再运行 `rbenv install 2.7.6` 就会跳过下载直接安装

# CocoaPods

由于使用gem安装一直失败（即使换了源），后面使用homebrew没问题

```shell
# 替换ruby源
gem sources --add https://gems.ruby-china.com/ --remove https://rubygems.org/
# 查看是否替换成功
gem sources -l

# 安装cocoapods
sudo gem install cocoapods
# 或者使用homebrew安装
brew install cocoapods
# 配置 pod
pod setup
# 查看版本
pod --version
```

# 新建项目

```shell
npx react-native init AwesomeProject
```

经常出现的错误：

![image.png](https://ik.imagekit.io/redsanjin/blog/1c745adc0703.png)

这是由于没有切换 CocoaPods 的镜像源导致的。解决方案是，切换到清华大学开源软件镜像站的镜像，切换方式如下：

```shell
cd ~/.cocoapods/repos 
pod repo remove master
git clone https://mirrors.tuna.tsinghua.edu.cn/git/CocoaPods/Specs.git master
```

执行完上述命令后，进入 AwesomeProject/ios 目录，找到 Podfile 文件，在文件第一行添加：

```shell
source 'https://mirrors.tuna.tsinghua.edu.cn/git/CocoaPods/Specs.git'
```

这时，再在 AwesomeProject/ios 目录下，运行 CocoaPods 安装命令即可。

```shell
bundle exec pod install
```




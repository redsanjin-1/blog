# 1. oh-my-zsh

- 下载

```Shell
sh -c "$(curl -fsSL https://gitee.com/mirrors/oh-my-zsh/raw/master/tools/install.sh)"
```

- 设置主题

```Plain Text
open ~/.zshrc

# 找到 ZSH_THEME
# robbyrussell 是默认的主题
ZSH_THEME="robbyrussell"
```

- 代码补全

```Shell
brew install zsh-autosuggestions
echo "source /opt/homebrew/Cellar/zsh-autosuggestions/0.7.0/share/zsh-autosuggestions/zsh-autosuggestions.zsh" >>~/.zshrc
```

- 代码高亮

```Shell
brew install zsh-syntax-highlighting
echo "source /opt/homebrew/Cellar/zsh-syntax-highlighting/0.7.1/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh" >>~/.zshrc
```

# 2. iTerm2

- [官网下载](https://iterm2.com/)

- 更多配置参考[这里](https://zhuanlan.zhihu.com/p/550022490)

# 3. 其他

## 3.1 终端中用vscode打开文件

平常都用open xxx 打开文件/文件夹，可以通过配置shell command，在终端使用vscode打开，具体步骤为：**打开vscode → command+shift+p → 输入 shell command → 点击提示Shell Command:Instanll 'code' command in Path运行**

## 3.2 tree命令查看目录树

```Shell
# 安装 tree
brew install tree
# 查看是否安装成功
brew list

# 执行命令
tree
# 指定层级
tree -L 2
# 显示目录名称而非内容
tree -d "src"
# 不显示文件或目录名称
tree -I "node_modules|tests"
```

![image.png](https://ik.imagekit.io/redsanjin/blog/b56a743cc95f.png)

## 3.3 从终端进入Finder & 从 Finder进入终端

### 3.3.1 从终端进入Finder

```Shell
# 进入到目标文件路径
cd Downloads
# 使用 open 命令
open .
```

### 3.3.2 从Finder进入终端

- 方法一

右键文件/文件夹 —> 服务 —> 新建位于文件夹位置的终端窗口

- 方法二

同时打开Finder，终端 —> 把文件/文件夹拖入终端可得到目录地址（pwd） —> cd 上一步得到的地址 

## 3.4 查找进程pid和关闭pid

```Shell
# 查看端口占用情况
# sudo lsof -i :<port_number>
sudo lsof -i 3000

# 终止端口占用
# sudo kill :<process_id>
sudo kill 3000
```


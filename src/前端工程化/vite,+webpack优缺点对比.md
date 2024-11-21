## 1.webpack原理

webpack bundle everything

是的，这就是webpack慢的原因，由于webpack对于所有运行资源进行了提前编译处理，对依赖模块进行了语法分析转义（转化成AST抽象语法树），最终的结果就是模块被打包到内存中。

## 2. vite原理

vite Bundleless esbuild esmodule

在vite中就出现相反的情况了，遵循着打包少、预处理的方式，让vite只有在运行第一次的时候进行依赖的打包处理（package.json不变）。并且在运行中由于依赖着esmodule可以将文件采用import方式直接引入，这样就不用把文件打包到一起，而且采用esbuild对于语法的解析转换（如：ts、jsx等）这样就不用进行js解析ast语法树后再重新构建，这样第一可以节省大量的cpu以及内存空间、第二可以减少语法解析的大量时间，基本上可以达到时效性不用提前进行语法解析。

## 3. 优缺点对比

### 3.1构建编译速度

- webpack需要分析依赖，构建AST树，导致启动速度缓慢

- vite不进行打包，把模块区分为依赖和源码两类，依赖使用 esbuild（Go编写，比nodejs快10-100倍） 预构建(一方面将零散的文件打到一起，减少网络请求，另一方面全面转换为 ESM 模块语法，以适配浏览器内置的 ESM 支持)，源码使用 ESM （支持tree shaking等）按需加载

### 3.2 热更新速度

- webpackwebpack以当前修改的文件为入口重新build打包，所有涉及到的依赖都会被重新加载一次。因此更新速度会随着应用体积增长而直线下降。

- viteVite采用立即编译当前修改文件的办法，同时使用缓存机制(http缓存—>Vite内置缓存)，加载更新后的文件内容。

## 4.参考

- [Home | Vite 官方中文文档 (vitejs.dev)](https://cn.vitejs.dev/)

- [webpack 中文文档(docschina.org)](https://webpack.docschina.org/)

- [「 不懂就问 」 为什么 esbuild 这么快 ？](https://juejin.cn/post/6967336090302840862)


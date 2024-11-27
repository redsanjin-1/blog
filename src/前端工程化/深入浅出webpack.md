![webpack.docschina.org_.png](https://ik.imagekit.io/redsanjin/blog/36821301ec15.png)

# 前言

近年来 Web 应用变得更加复杂与庞大， Web 前端技术的应用范围也更加广泛。从复杂、庞大的管理后台，到对性能要求苛刻的移动网页，再到类似于 ReactNative 的原生应用开发方案， Web 前端工程师在面临更多机遇的同时也面临更大的挑战 通过直接编写 JavaScript css HTML 开发 Web 应用的方式己经无法应对当前 Web 应用的发展

# 模块化

模块化是指将多个复杂的系统分解为多个模块以方便编码

很久以前，开发网页要通过命名空间的方式来组织代码，例如 jQuery 库将它的 API在了 window .$下，在加载完 jQuey 后，其他模块再通过 window .$去使用 jQuery 。这样做有很多问题，其中包括：

- 命名空间冲突，两个库可能会使用同一个名称，例如 Zepto ( http: // zeptojs.com ）也被放在 window.$ 下;

- 无法合理地管理项目的依赖和版本;

- 无法方便地控制依赖的加载顺序。

当项目变大时 ，这种方式将变得难以维护，需要用模块化的思想来组织代码。

## CommonJS

[CommonJS](http://www.commonjs.org) 是一种被广泛使用的 JavaScript 模块化规范，其核心思想是通过 require 方法来同步加载依赖的其他模块，通过 module.exports 出需要暴露的接口。 CommonJS 规范的流行得益于 Node.js 采用了这种方式，后来这种方式被引入到了网页开发中。

采用 CommonJS 导入及导出的代码如下：

```JavaScript
／／ 导入
const moduleA = require ( ’. / moduleA ’); 
／／ 导出
module .exports = moduleA.someFunc;
```

CommonJS 的优点在于：

- 代码可复用于 Node.js 环境下井运行，例如做同构应用：

- 通过 Npm 发布的很多第三方模块都采用了 CommonJS 范。

CommonJS 的缺点在于，这样的代码无法直接运行在浏览器环境下，必须通过工具转换成标准 ES5

CommonJS 还可以细分为 CommonJSl 和 CommonJS2 ，区别在于 CommonJSl 只能通过exports.XX = XX 的方式导出，而 CommonJS2 CommonJSl 基础上加入了 module.exports = XX 的导出方式。 CommonJS 通常指 CommonJS2。

## AMD

[AMD](https://en.wikipedia.org/wiki/Asynchronous_module_definition) 也是 JavaScript模块化规范，与 CommonJS 最大的不同在于，它采用了异步的方式去加载依赖的模块。 AMD规范主要用于解决针对浏览器环境的模块化问题，最具代表性的实现是 [requirejs](http://requirejs.org)。

采用 AMD 导入及导出的代码如下：

```JavaScript
／／ 定义 个模块
define (’module ’,[’dep ’] , function (dep) { 
return exports; 
}); 
／／导入和使用
require ( [’module ’] , function (module) { 
});
```

AMD 的优点在于：

- 可在不转换代码的情况下直接在浏览器中运行；

- 可异步加载依赖：

- 可并行加载多个依赖：

- 代码可运行在浏览器环境和 node.js 环境下。

AMD 的缺点在于 JavaScript 运行环境没有原生支持，需要先导入实现了 AMD 的库后才能正常使用。

## ES6 模块化

ES6 模块化是国际标准化组织 ECMA 提出的 JavaScript 模块化规范，它在语言层面上实现了模块化。浏览器厂商和 Node.js 都原生支持该规范。它将逐渐取代 CommonJS 和 AMD 规范，成为浏览器和服务器通用的模块解决方案

采用 ES6 模块化导入及导出的代码如下：

```JavaScript
／／导
import { readFile } from ’ fs ’; 
import React from ’ react ’ ; 
／／导出
export function hello {) { } ; 
export default { 
//...
};
```

之后，出现了许多打包构建工具，如 Grunt, Gulp, Fis3等，本次不做介绍，重点关注webpack。

# 打包原理

## 基本概念

在了解 Webpac 原理前 需要掌握以下几个核心概念，以方便后面的理解。

- `Entry` 入口，webpack 执行构建的第一步将从 Entry 开始，可抽象成输入

- `Module` 模块，在 webpack 里一切皆模块，一个模块对应一个文件。Webpack 从配置的 entry 开始，递归找出所有依赖的模块，形成依赖树

- `Chunk` 代码块 Chunk 由多个模块组合而成，用于代码合并与分割

- `Loader` 模块转换器，用于将模块的原内容按照需求转换成新内容

- `Plugin` 扩展插件，在 Webpack 构建流程中的特定时机会广播对应的事件，插件可以监听这些事件的发生，在特定的时机做对应的事情

- `Output` ：输出结果，在 Webpack 经过 系列处理并得出最终想要的代码后输出 结果。

## 打包流程

首先我们应该简单了解一下`webpack`的整个打包流程：

1、读取`webpack`的配置参数；

2、启动`webpack`，创建`Compiler`对象并开始解析项目；

3、从入口文件（`entry`）开始解析，并且找到其导入的依赖模块，递归遍历分析，形成`AST`语法树；

4、对不同文件类型的依赖模块文件使用对应的`Loader`进行编译，最终转为`Javascript`文件；5、整个过程中`webpack`会通过发布订阅模式，向外抛出一些`hooks`，而`webpack`的插件即可通过监听这些关键的事件节点，执行插件任务进而达到干预输出结果的目的。

其中文件的解析与构建是一个比较复杂的过程，在`webpack`源码中主要依赖于`compiler`和`compilation`两个核心对象实现。

`compiler`对象是一个全局单例，他负责把控整个`webpack`打包的构建流程。 `compilation`对象是每一次构建的上下文对象，它包含了当次构建所需要的所有信息，每次热更新和重新构建，`compiler`都会重新生成一个新的`compilation`对象，负责此次更新的构建过程。

而每个模块间的依赖关系，则依赖于`AST`语法树。每个模块文件在通过`Loader`解析完成之后，会通过`acorn`库生成模块代码的`AST`语法树，通过语法树就可以分析这个模块是否还有依赖的模块，进而继续循环执行下一个模块的编译解析。

最终`Webpack`打包出来的`bundle`文件是一个`IIFE`的执行函数。

```JavaScript
// webpack 5 打包的bundle文件内容

(() => { // webpackBootstrap
    var __webpack_modules__ = ({
        'file-A-path': ((modules) => { // ... })
        'index-file-path': ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => { // ... })
    })
    
    // The module cache
    var __webpack_module_cache__ = {};
    
    // The require function
    function __webpack_require__(moduleId) {
        // Check if module is in cache
        var cachedModule = __webpack_module_cache__[moduleId];
        if (cachedModule !== undefined) {
                return cachedModule.exports;
        }
        // Create a new module (and put it into the cache)
        var module = __webpack_module_cache__[moduleId] = {
                // no module.id needed
                // no module.loaded needed
                exports: {}
        };

        // Execute the module function
        __webpack_modules__[moduleId](module, module.exports, __webpack_require__);

        // Return the exports of the module
        return module.exports;
    }
    
    // startup
    // Load entry module and return exports
    // This entry module can't be inlined because the eval devtool is used.
    var __webpack_exports__ = __webpack_require__("./src/index.js");
})
```

`webpack4`相比，`webpack5`打包出来的bundle做了相当的精简。在上面的打包`demo`中，整个立即执行函数里边只有三个变量和一个函数方法，`__webpack_modules__`存放了编译后的各个文件模块的JS内容，`__webpack_module_cache__` 用来做模块缓存，`__webpack_require__`是`Webpack`内部实现的一套依赖引入函数。最后一句则是代码运行的起点，从入口文件开始，启动整个项目。

其中值得一提的是`__webpack_require__`模块引入函数，我们在模块化开发的时候，通常会使用`ES Module`或者`CommonJS`规范导出/引入依赖模块，`webpack`打包编译的时候，会统一替换成自己的`__webpack_require__`来实现模块的引入和导出，从而实现模块缓存机制，以及抹平不同模块规范之间的一些差异性。

## Loader

从上面的打包代码我们其实可以知道，`Webpack`最后打包出来的成果是一份`Javascript`代码，实际上在`Webpack`内部默认也只能够处理`JS`模块代码，在打包过程中，会默认把所有遇到的文件都当作 `JavaScript`代码进行解析，因此当项目存在非`JS`类型文件时，我们需要先对其进行必要的转换，才能继续执行打包任务，这也是`Loader`机制存在的意义。

`Loader`的配置使用我们应该已经非常的熟悉：

```JavaScript
// webpack.config.js
module.exports = {
  // ...other config
  module: {
    rules: [
      {
        test: /^your-regExp$/,
        use: [
          {
             loader: 'loader-name-A',
          }, 
          {
             loader: 'loader-name-B',
          }
        ]
      },
    ]
  }
}
```

过配置可以看出，针对每个文件类型，`loader`是支持以数组的形式配置多个的，因此当`Webpack`在转换该文件类型的时候，会按顺序链式调用每一个`loader`，前一个`loader`返回的内容会作为下一个`loader`的入参。因此`loader`的开发需要遵循一些规范，比如返回值必须是标准的`JS`代码字符串，以保证下一个`loader`能够正常工作，同时在开发上需要严格遵循“单一职责”，只关心`loader`的输出以及对应的输出。

更详细的开发文档可以直接查看官网的 [Loader API](https://link.juejin.cn/?target=https%3A%2F%2Fwww.webpackjs.com%2Fapi%2Floaders%2F)。

## Plugin

如果说`Loader`负责文件转换，那么`Plugin`便是负责功能扩展。`Loader`和`Plugin`作为`Webpack`的两个重要组成部分，承担着两部分不同的职责。

上文已经说过，`webpack`基于发布订阅模式，在运行的生命周期中会广播出许多事件，插件通过监听这些事件，就可以在特定的阶段执行自己的插件任务，从而实现自己想要的功能。

既然基于发布订阅模式，那么知道`Webpack`到底提供了哪些事件钩子供插件开发者使用是非常重要的，上文提到过`compiler`和`compilation`是`Webpack`两个非常核心的对象，其中`compiler`暴露了和 `Webpack`整个生命周期相关的钩子（[compiler-hooks](https://link.juejin.cn?target=https%3A%2F%2Fwebpack.js.org%2Fapi%2Fcompiler-hooks%2F)），而`compilation`则暴露了与模块和依赖有关的粒度更小的事件钩子（[Compilation Hooks](https://link.juejin.cn?target=https%3A%2F%2Fwebpack.js.org%2Fapi%2Fcompilation-hooks%2F)）。

`Webpack`的事件机制基于`webpack`自己实现的一套`Tapable`事件流方案（[github](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fwebpack%2Ftapable)）

```JavaScript
// Tapable的简单使用
const { SyncHook } = require("tapable");

class Car {
    constructor() {
        // 在this.hooks中定义所有的钩子事件
        this.hooks = {
            accelerate: new SyncHook(["newSpeed"]),
            brake: new SyncHook(),
            calculateRoutes: new AsyncParallelHook(["source", "target", "routesList"])
        };
    }

    /* ... */
}


const myCar = new Car();
// 通过调用tap方法即可增加一个消费者，订阅对应的钩子事件了
myCar.hooks.brake.tap("WarningLampPlugin", () => warningLamp.on());
```

`Plugin`的开发和开发`Loader`一样，需要遵循一些开发上的规范和原则：

- 插件必须是一个函数或者是一个包含 `apply` 方法的对象，这样才能访问`compiler`实例；

- 传给每个插件的 `compiler` 和 `compilation` 对象都是同一个引用，若在一个插件中修改了它们身上的属性，会影响后面的插件;

- 异步的事件需要在插件处理完任务时调用回调函数通知 `Webpack` 进入下一个流程，不然会卡住;

了解了以上这些内容，想要开发一个 `Webpack Plugin`，其实也并不困难。

```JavaScript
class MyPlugin {
  apply (compiler) {
    // 找到合适的事件钩子，实现自己的插件功能
    compiler.hooks.emit.tap('MyPlugin', compilation => {
        // compilation: 当前打包构建流程的上下文
        console.log(compilation);
        
        // do something...
    })
  }
}
```

## Tapabel

[Tapabel](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fwebpack%2Ftapable)是一个类似于 Node.js 的 EventEmitter 的库，主要是控制钩子函数的发布与订阅，是Webpack插件系统的大管家。

Tapable库为插件提供了很多 Hook以便挂载。

```JavaScript
const {
    SyncHook,                   // 同步钩子
    SyncBailHook,               // 同步熔断钩子
    SyncWaterfallHook,          // 同步流水钩子
    SyncLoopHook,               // 同步循环钩子
    AsyncParalleHook,           // 异步并发钩子
    AsyncParallelBailHook,      // 异步并发熔断钩子
    AsyncSeriesHook,            // 异步串行钩子
    AsyncSeriesBailHook,        // 异步串行熔断钩子
    AsyncSeriesWaterfallHook     // 异步串行流水钩子
} = require("tapable");
```

Tabpack 提供了`同步&异步`绑定钩子的方法，方法如下所示：

| Async                         | Sync       |
| ----------------------------- | ---------- |
| 绑定：tapAsync/tapPromise/tap | 绑定：tap  |
| 执行：callAsync/promise       | 执行：call |

Tabpack简单示例

```JavaScript
const demohook = new SyncHook(["arg1", "arg2", "arg3"]);
// 绑定事件到webpack事件流
demohook.tap("hook1",(arg1, arg2, arg3) => console.log(arg1, arg2, arg3)) // 1 2 3
// 执行绑定的事件
demohook.call(1,2,3)
```

# 热更新原理

![07e7ba6e1d98.png](https://ik.imagekit.io/redsanjin/blog/07e7ba6e1d98.png)

`Webpack` 的热更新又称热替换（`Hot Module Replacement`），缩写为 `HMR`。 这个机制可以做到不用刷新浏览器而将新变更的模块替换掉旧的模块。

HMR的核心就是客户端从服务端拉去更新后的文件，准确的说是 chunk diff (chunk 需要更新的部分)，实际上 WDS 与浏览器之间维护了一个 `Websocket`，当本地资源发生变化时，WDS 会向浏览器推送更新，并带上构建时的 hash，让客户端与上一次资源进行对比。客户端对比出差异后会向 WDS 发起 `Ajax` 请求来获取更改内容(文件列表、hash)，这样客户端就可以再借助这些信息继续向 WDS 发起 `jsonp` 请求获取该chunk的增量更新。

后续的部分(拿到增量更新之后如何处理？哪些状态该保留？哪些又需要更新？)由 `HotModulePlugin` 来完成，提供了相关 API 以供开发者针对自身场景进行处理，像`react-hot-loader` 和 `vue-loader` 都是借助这些 API 实现 HMR。

细节请参考[Webpack HMR 原理解析](https://link.juejin.cn?target=https%3A%2F%2Fzhuanlan.zhihu.com%2Fp%2F30669007)

# Tree-Shaking原理

`Tree-Shaking` 是一种基于 `ES Module` 规范的 `Dead Code Elimination` 技术，它会在运行过程中静态分析模块之间的导入导出，确定 ESM 模块中哪些导出值未曾其它模块使用，并将其删除，以此实现打包产物的优化。

Tree Shaking 较早前由 Rich Harris 在 `Rollup` 中率先实现，Webpack 自 2.0 版本开始接入，至今已经成为一种应用广泛的性能优化手段。

在 Webpack 中，启动 Tree Shaking 功能必须同时满足三个条件：

- 使用 `ESM` 规范编写模块代码( 因为导入导出语句必须在模块顶层，所以模块间的依赖关系是确定的，给编译工具进行静态分析提供了可能 )

- 配置 `optimization.usedExports` 为 `true`，启动标记功能

- 启动代码优化功能，可以通过如下方式实现：

    - 配置 `mode = production`

    - 配置 `optimization.minimize = true`

    - 提供 `optimization.minimizer` 数组

例如：

```JavaScript
// webpack.config.js
module.exports = {
  entry: "./src/index",
  mode: "production",
  devtool: false,
  optimization: {
    usedExports: true,
  },
};
```

细节请参考[这里](https://juejin.cn/post/7019104818568364069)。

# 性能优化配置

具体可参考[这里](https://juejin.cn/post/7023242274876162084#heading-23)。

# 参考

- [webpack官网](https://www.webpackjs.com/)

- 🔥[【万字】透过分析 webpack 面试题，构建 webpack5.x 知识体系](https://juejin.cn/post/7023242274876162084)

- [[万字总结] 一文吃透 Webpack 核心原理](https://juejin.cn/post/6949040393165996040)

- [当面试官问Webpack的时候他想知道什么](https://juejin.cn/post/6943468761575849992)

- [「搞点硬货」从源码窥探Webpack4.x原理](https://juejin.cn/post/6844904046294204429)




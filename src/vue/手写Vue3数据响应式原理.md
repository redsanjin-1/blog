## 一. 什么是响应式

> 当数据改变时，引用数据的函数会**自动**重新执行。

所谓数据响应式有两个参与者

- **触发者**：数据

- **响应者**：引用数据的函数

### 1. 手动完成响应过程

```HTML
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <div id="app"></div>
  <script>
    // 定义一个全局变量，触发者
    const obj = { name: 'sanjin' }

    // 定义一个函数，引用obj变量，响应者
    function effect() {
      // document.querySelector('#app')
      app.innerHtml = obj.name
    }

    setTimeout(() => {
      obj.name = 'hello'
      // 手动执行effect函数
      effect()
    }, 1000);
  </script>
</body>

</html>
```

### 2. 副作用函数

> 如果一个函数引用了外部的资源，这个函数会收到外部资源改变的影响。我们就说这个函数存在副作用。因此，也把该函数叫做`副作用`函数

### 3. 自定义设置过程

如果我们能感知数据改变，拦截到赋值操作，自定义设置过程

在赋值的同时调用一下数据关联的`副作用函数`，就可以自动重新执行

理论上可行，开始动手实践

#### 3.1. Proxy代理对象

[Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 相关知识这里略过，不做过多介绍

```HTML
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <div id="app">sanjin</div>
  <script>
    // 定义一个源对象
    const obj = { name: 'sanjin' }

    // 创建一个代理对象
    const proxy = new Proxy(obj, {
      get(target, key) {
        // 当访问proxy代理对象时，
        // 就会调用proxy对象的get方法
        console.log("访问代理对象", target, key);
        return target[key]
      },
      set(target, key, val) {
        // 当设置proxy代理对象时，
        // 就会调用proxy对象的set方法
        console.log("设置代理对象", target, key, val);
        target[key] = val
        return true
      }
    })
    console.log([proxy.name]);
    console.log(proxy.age);
    proxy.name = 'hello';
    console.log("源对象", obj);
    console.log("代理对象", proxy);
  </script>
</body>

</html>
```

上面例子可以发现，对代理对象的赋值操作，也同步操作了源对象

这样就确定了思路

1. 先创建代理对象

2. 再操作代理对象（给代理对象赋值）

#### 3.2. 最基本的reactive函数

```HTML
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <div id="app">sanjin</div>
  <script>
    function isObject(value) {
      return typeof value === 'object' && value !== null;
    }
    // 创建响应式对象
    function reactive(data) {
      if (!isObject(data)) return

      return new Proxy(data, {
        get(target, key) {
          return target[key]
        },
        set(target, key, value) {
          target[key] = value
          return true
        }
      })
    }

    const state = {
      name: 'sanjin'
    }
    const p = reactive(state)
    p.name = 'hello'
    console.log(p.name);
  </script>
</body>

</html>
```

### 4. 最基本的响应式

```HTML
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <div id="app">sanjin</div>
  <script>
    function isObject(value) {
      return typeof value === 'object' && value !== null;
    }
    // 创建响应式对象
    function reactive(data) {
      if (!isObject(data)) return

      return new Proxy(data, {
        get(target, key) {
          return target[key]
        },
        set(target, key, value) {
          target[key] = value
          effect() // 调用副作用函数
          return true
        }
      })
    }

    // 定义一个响应式数据：触发者
    const state = reactive({
      name: 'sanjin'
    })

    // 定义一个副作用函数：响应者
    function effect() {
      app.innerHTML = state.name
    }

    // 当state发生改变时，执行effect
    setTimeout(() => {
      state.name = 'hello'
    }, 1000);
  </script>
</body>

</html>
```

✍ 小结

1. 响应式是一个过程，存在触发者和响应者

2. 数据的改变，触发关联的副作用函数响应（重新执行）

3. 通过Proxy代理源数据

4. 在Proxy的自定义set操作中，重新执行副作用函数

## 二. 初步完善响应式系统

### 1. 实现一对多

所谓一对多：一个属性对应多个副作用函数

🤔 思考

如果一个属性存在多个与之对应的副作用函数

理论上当属性改变时，属性关联的每一个副作用函数都应该重新执行

#### 1.1. 手动方式

```HTML
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <div id="app">sanjin</div>
  <script>
    function isObject(value) {
      return typeof value === 'object' && value !== null;
    }
    // 创建响应式对象
    function reactive(data) {
      if (!isObject(data)) return

      return new Proxy(data, {
        get(target, key) {
          return target[key]
        },
        set(target, key, value) {
          target[key] = value
          effect() // 调用副作用函数
          effect1()
          return true
        }
      })
    }

    // 定义一个响应式数据：触发者
    const state = reactive({
      name: 'sanjin'
    })

    // 定义一个副作用函数：响应者
    function effect() {
      console.log("effect被执行了...");
      app.innerHTML = state.name
    }

    function effect1() {
      console.log('effect1被执行了...');
      state.name
    }

    // 当state发生改变时，执行effect
    setTimeout(() => {
      state.name = 'hello'
    }, 1000);
  </script>
</body>

</html>
```

很显然，我们可以通过手动的方式，依次执行每一个关联的副作用函数

#### 1.2. 自动方式

我们可以创建一个存储所有副作用函数的空间，这个空间叫做`副作用桶`

首先想到的是`数组`，数组的每一个元素都是一个`副作用函数`

```HTML
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <div id="app">sanjin</div>
  <script>
    // 定义一个副作用函数桶
    const bucket = [];

    function isObject(value) {
      return typeof value === 'object' && value !== null;
    }
    // 创建响应式对象
    function reactive(data) {
      if (!isObject(data)) return

      return new Proxy(data, {
        get(target, key) {
          return target[key]
        },
        set(target, key, value) {
          target[key] = value
          // 从bucket中取出副作用函数，并执行
          bucket.forEach(effect => effect())
          return true
        }
      })
    }

    // 定义一个响应式数据：触发者
    const state = reactive({
      name: 'sanjin'
    })

    // 定义一个副作用函数：响应者
    function effect() {
      console.log("effect被执行了...");
      app.innerHTML = state.name
    }
    bucket.push(effect)

    function effect1() {
      console.log('effect1被执行了...');
      state.name
    }
    bucket.push(effect1)
    // 重复添加effect1
    // bucket.push(effect1)

    // 当state发生改变时，执行effect
    setTimeout(() => {
      state.name = 'hello'
    }, 1000);
  </script>
</body>

</html>
```

以上使用数组完成桶结构，但是这样有可能添加重复的副作用函数( 第54行 )，因此要考虑采用新的桶结构—`Set`, 这种结构可以解决重复的问题

```HTML
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <div id="app">sanjin</div>
  <script>
    // 定义一个副作用函数桶
    const bucket = new Set();

    function isObject(value) {
      return typeof value === 'object' && value !== null;
    }
    // 创建响应式对象
    function reactive(data) {
      if (!isObject(data)) return

      return new Proxy(data, {
        get(target, key) {
          return target[key]
        },
        set(target, key, value) {
          target[key] = value
          // 从bucket中取出副作用函数，并执行
          bucket.forEach(effect => effect())
          return true
        }
      })
    }

    // 定义一个响应式数据：触发者
    const state = reactive({
      name: 'sanjin'
    })

    // 定义一个副作用函数：响应者
    function effect() {
      console.log("effect被执行了...");
      app.innerHTML = state.name
    }
    bucket.add(effect)

    function effect1() {
      console.log('effect1被执行了...');
      state.name
    }
    bucket.add(effect1)
    // 重复添加effect1, 不会多次触发副作用函数
    bucket.add(effect1)

    // 当state发生改变时，执行effect
    setTimeout(() => {
      state.name = 'hello'
    }, 1000);
  </script>
</body>

</html>
```

### 2. 实现依赖收集

#### 2.1. 为什么要依赖收集

前面，我们并没有`区分不同属性`对应的副作用函数，而是全部放到`副作用桶`里。

```HTML
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <div id="app">sanjin</div>
  <script>
    // 定义一个副作用函数桶
    const bucket = new Set();

    function isObject(value) {
      return typeof value === 'object' && value !== null;
    }
    // 创建响应式对象
    function reactive(data) {
      if (!isObject(data)) return

      return new Proxy(data, {
        get(target, key) {
          return target[key]
        },
        set(target, key, value) {
          target[key] = value
          // 从bucket中取出副作用函数，并执行
          bucket.forEach(effect => effect())
          return true
        }
      })
    }

    // 定义一个响应式数据：触发者
    const state = reactive({
      name: 'sanjin',
      age: 18
    })

    // 定义一个副作用函数：响应者
    function effectName() {
      console.log("effectName...", state.name);
    }
    bucket.add(effectName)

    function effectAge() {
      console.log("effectAge...", state.age);
    }
    bucket.add(effectAge)

    // 当state发生改变时，执行effect
    setTimeout(() => {
      state.name = 'hello'
    }, 1000);
  </script>
</body>

</html>
```

🤔 思考

上面的例子，我们只改变了name的值，但却同时触发了effectAge副作用函数。因此重点是如何建立属性与副作用函数的关系。

#### 2.2. 实现思路

- 将当前`副作用函数`保存到一个全局变量

- 当执行`副作用函数`时，会触发代理对象的自定义`get`操作

- 在`get`操作时，将全局变量中保存的函数添加到`副作用桶`

#### 2.3. 具体实现

```HTML
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <div id="app">sanjin</div>
  <script>
    // 定义一个副作用函数桶
    const bucket = new Set();

    // 定义一个全局变量，保存当前正在执行的副作用函数
    let activeEffect;

    function isObject(value) {
      return typeof value === 'object' && value !== null;
    }
    // 创建响应式对象
    function reactive(data) {
      if (!isObject(data)) return

      return new Proxy(data, {
        get(target, key) {
          if (activeEffect) {
            bucket.add(activeEffect)
          }
          return target[key]
        },
        set(target, key, value) {
          target[key] = value
          // 从bucket中取出副作用函数，并执行
          bucket.forEach(effect => effect())
          return true
        }
      })
    }

    // 定义一个响应式数据：触发者
    const state = reactive({
      name: 'sanjin',
      age: 18
    })

    // 定义一个副作用函数：响应者
    function effectName() {
      console.log("effectName...", state.name);
    }
    activeEffect = effectName
    effectName()
    activeEffect = null;

    function effectAge() {
      console.log("effectAge...", state.age);
    }
    activeEffect = effectAge
    effectAge();
    activeEffect = null;

    // 当state发生改变时，执行effect
    setTimeout(() => {
      state.name = 'hello'
    }, 1000);
  </script>
</body>

</html>
```

#### 2.4. 优化

接下来，我们优化以下，封装一个注册函数，方便注册副作用函数

```HTML
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <div id="app">sanjin</div>
  <script>
    // 定义一个副作用函数桶
    const bucket = new Set();

    // 定义一个全局变量，保存当前正在执行的副作用函数
    let activeEffect;

    function isObject(value) {
      return typeof value === 'object' && value !== null;
    }
    // 创建响应式对象
    function reactive(data) {
      if (!isObject(data)) return

      return new Proxy(data, {
        get(target, key) {
          if (activeEffect) {
            bucket.add(activeEffect)
          }
          return target[key]
        },
        set(target, key, value) {
          target[key] = value
          // 从bucket中取出副作用函数，并执行
          bucket.forEach(effect => effect())
          return true
        }
      })
    }

    // 注册副作用函数
    function registerEffect(fn) {
      if (typeof fn !== 'function') return

      // 保存副作用函数到全局变量中
      activeEffect = fn
      // 执行副作用函数
      fn()
      // 清空
      activeEffect = null;
    }

    // 定义一个响应式数据：触发者
    const state = reactive({
      name: 'sanjin',
      age: 18
    })

    // 定义一个副作用函数：响应者
    function effectName() {
      console.log("effectName...", state.name);
    }
    registerEffect(effectName)

    registerEffect(() => {
      console.log("effectAge...", state.age);
    })

    // 当state发生改变时，执行effect
    setTimeout(() => {
      state.name = 'hello'
    }, 1000);
  </script>
</body>

</html>
```

#### 2.5. 改进桶结构

看起来现在可以自动收集依赖，但是依然解决不了`不同的属性`对应`不同的副作用函数`集合的问题。

因此，我们需要改进桶结构

将桶该着成一个`Map映射表`，不同的属性对应不同的`Set集合`。

![image.png](/451fc5c8e28e.png)

```HTML
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <div id="app">sanjin</div>
  <script>
    // 定义一个副作用函数桶
    const bucket = new Map(); // 修改 [name: Set(fn, fn), age: Set[fn, fn]]

    // 定义一个全局变量，保存当前正在执行的副作用函数
    let activeEffect;

    function isObject(value) {
      return typeof value === 'object' && value !== null;
    }
    // 创建响应式对象
    function reactive(data) {
      if (!isObject(data)) return

      return new Proxy(data, {
        get(target, key) {
          if (activeEffect) {
            let depSet = bucket.get(target)
            if (!depSet) {
              depSet = new Set()
              bucket.set(key, depSet)
            }
            depSet.add(activeEffect)
          }
          return target[key]
        },
        set(target, key, value) {
          target[key] = value
          // 从bucket中取出副作用函数，并执行
          let depSet = bucket.get(key)
          if (depSet) {
            depSet.forEach(fn => fn())
          }
          return true
        }
      })
    }

    // 注册副作用函数
    function registerEffect(fn) {
      if (typeof fn !== 'function') return

      // 保存副作用函数到全局变量中
      activeEffect = fn
      // 执行副作用函数
      fn()
      // 重置全局变量
      activeEffect = null;
    }

    // 定义一个响应式数据：触发者
    const state = reactive({
      name: 'sanjin',
      age: 18
    })

    // 定义一个副作用函数：响应者
    function effectName() {
      console.log("effectName...", state.name);
    }
    registerEffect(effectName)

    registerEffect(() => {
      console.log("effectAge...", state.age);
    })

    // 当state发生改变时，执行effect
    setTimeout(() => {
      state.name = 'hello'
    }, 1000);
  </script>
</body>

</html>
```

我们可以把响应式的代码抽离出一个js文件中

```JavaScript
// 定义一个副作用函数桶
const bucket = new Map(); // 修改 [name: Set(fn, fn), age: Set[fn, fn]]

// 定义一个全局变量，保存当前正在执行的副作用函数
let activeEffect;

function isObject(value) {
  return typeof value === "object" && value !== null;
}

// 收集依赖
function trace(target, key) {
  if (!activeEffect) return;

  let depSet = bucket.get(target);
  if (!depSet) {
    depSet = new Set();
    bucket.set(key, depSet);
  }
  depSet.add(activeEffect);
}

// 触发副作用函数
function trigger(target, key) {
  let depSet = bucket.get(key);
  if (depSet) {
    depSet.forEach((fn) => fn());
  }
}

// 创建响应式对象
function reactive(data) {
  if (!isObject(data)) return;

  return new Proxy(data, {
    get(target, key) {
      // 收集依赖
      trace(target, key);
      return target[key];
    },
    set(target, key, value) {
      target[key] = value;
      // 触发副作用函数
      trigger(target, key);
      return true;
    },
  });
}

// 注册副作用函数
function effect(fn) {
  if (typeof fn !== "function") return;

  // 保存副作用函数到全局变量中
  activeEffect = fn;
  // 执行副作用函数
  fn();
  // 重置全局变量
  activeEffect = null;
}
```

#### 2.6. 进一步改进桶结构

🤔思考

如果不同的源对象存在同名属性，就会出现问题

比如

pState代理的源对象上存在`name`属性

pState1代理的源对象上也存在`name`属性

这样，在bucket桶里，就不能区分不同的代理对象

```HTML
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <script src="./reactive-01-实现基本的依赖收集.js"></script>
  <script>
    /// 1. 创建响应式对象
    const state = reactive({ name: 'sanjin' })
    const state2 = reactive({ name: 'hello' })

    // 2. 注册副作用函数
    effect(() => {
      console.log("e1执行...", state.name);
    })
    effect(() => {
      console.log("e2执行...", state2.name);
    })

    setTimeout(() => {
      // 只修改state的name, 但是state2中的name也触发了副作用函数
      state.name = 'xiaoming'
    }, 1000);
  </script>
</body>

</html>
```

> 解决方案

将桶结构改成[WeakMap](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)( key必须是`对象且不可枚举`，因为是弱引用所以可以`自动进行垃圾回收`，比如state对象变为null时，就会进行垃圾回收，如果用`map`这个state便不会被回收，最终可能`导致内存溢出` )，将代理对象作为key，用于区分不同的代理对象

![image.png](/2c9765c34a5e.png)

```JavaScript
// 定义一个副作用函数桶
const bucket = new WeakMap(); // 修改 [target: Map[name: Set(fn, fn), age: Set(fn, fn)]]

// 定义一个全局变量，保存当前正在执行的副作用函数
let activeEffect;

function isObject(value) {
  return typeof value === "object" && value !== null;
}

// 收集依赖
function trace(target, key) {
  if (!activeEffect) return;

  let depMap = bucket.get(target);
  if (!depMap) {
    depMap = new Map();
    bucket.set(target, depMap);
  }
  let depSet = depMap.get(key);
  if (!depSet) {
    depSet = new Set();
    depMap.set(key, depSet);
  }

  depSet.add(activeEffect);
}

// 触发副作用函数
function trigger(target, key) {
  let depMap = bucket.get(target);

  if (!depMap) return;

  let depSet = depMap.get(key);
  if (depSet) {
    depSet.forEach((effect) => effect());
  }
}

// 创建响应式对象
function reactive(data) {
  if (!isObject(data)) return;

  return new Proxy(data, {
    get(target, key) {
      // 收集依赖
      trace(target, key);
      return target[key];
    },
    set(target, key, value) {
      target[key] = value;
      // 触发副作用函数
      trigger(target, key);
      return true;
    },
  });
}

// 注册副作用函数
function effect(fn) {
  if (typeof fn !== "function") return;

  // 保存副作用函数到全局变量中
  activeEffect = fn;
  // 执行副作用函数
  fn();
  // 重置全局变量
  activeEffect = null;
}
```

至此，我们可以区分不同的代理对象下不同属性对应的副作用函数集合

### 3. 小结

小结

1. 在get时收集依赖：**收集不同代理对象不同属性所依赖的副作用函数**

2. 在set时触发依赖：**去除**当前属性所依赖的所有副作用函数，重新执行



## 三. 深入响应式系统

### 分支切换与cleanup

首先，我们需要明确分支切换的定义，如下面的代码所示：

```JavaScript
const data = { ok: true, text: "hello world" };
const obj = new Proxy(data, {
  /* ... */
});

effect(function effectFn() {
  document.body.innerText = obj.ok ? obj.text : "not";
});
```

在 effectFn 函数内部存在一个三元表达式，根据字段 obj.ok 值的不同会执行不同的代码分支。当字段 obj.ok 的值发生变化时， 代码执行的分支会跟着变化，这就是所谓的分支切换。

![image.png](/7d86d825d2d2.png)

可以看到，副作用函数 effectFn 分别被字段 data.ok 和字段 data.text 所对应的依赖集合收集。

这时 data.ok 的值为 false 时，documen.body.innerText 的值始终为 'not'。不应该受到 obj.text 的影响。但事实并非如此，如果我们尝试修改 obj.text 的值：

```JavaScript
obj.text = 'hello vue3'
```

这仍然会导致副作用函数重新执行，即使 document.body.innerText 的值不需要变化。

解决这个问题的思路很简单，每次副作用函数执行时，我们可以 先把它从所有与之关联的依赖集合中删除。

因此我们需要重新设计副作用函 数，如下面的代码所示。在 effect 内部我们定义了新的 effectFn 函数，并为其添加了 effectFn.deps 属性，该属性是一个数组，用 来存储所有包含当前副作用函数的依赖集合

```JavaScript
// 用一个全局变量存储被注册的副作用函数
let activeEffect;
function effect(fn) {
  const effectFn = () => {
    // 调用 cleanup 函数完成清除工作
    cleanup(effectFn); // 新增
    activeEffect = effectFn;
    fn();
  };
  effectFn.deps = [];
  effectFn();
}

function cleanup(effectFn) {
  // 遍历 effectFn.deps 数组
  for (let i = 0; i < effectFn.deps.length; i++) {
    // deps 是依赖集合
    const deps = effectFn.deps[i];
    // 将 effectFn 从依赖集合中移除
    deps.delete(effectFn);
  }
  // 最后需要重置 effectFn.deps 数组
  effectFn.deps.length = 0;
}

function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);

  const effectsToRun = new Set(effects); // 新增
  effectsToRun.forEach((effectFn) => effectFn()); // 新增
  // 语言规范中对此有明确的说明：在调用 forEach 遍历 Set 集合
  // 时，如果一个值已经被访问过了，但该值被删除并重新添加到集合，
  // 如果此时 forEach 遍历没有结束，那么该值会重新被访问。因此，下面的代码会无限执行。
  // effects && effects.forEach(effectFn => effectFn()) // 删除
}
```

### scheduler调度器

🤔 思考

我们对响应式变量的更改是立即触发的吗？假如for循环修改一个reactive变量100次，是否会使试图重新渲染100次

其实 vue 实现了调度器的方案，将副作用函数加到 `Set 队列`中，并且使用 `promise` 进行加入微任务队列渲染

我们可以为 effect 函数设计一个选项参数 options，允许用户指定调度器：

```JavaScript
effect(
  () => {
    console.log(obj.foo);
  },
  // options
  {
    // 调度器 scheduler 是一个函数
    scheduler(fn) {
      // ...
    },
  }
);
```

有了调度函数，我们在 trigger 函数中触发副作用函数重新执行时，就可以直接调用用户传递的调度器函数，从而把控制权交给用户：

```JavaScript
function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);

  const effectsToRun = new Set();
  effects &&
    effects.forEach((effectFn) => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn);
      }
    });
  effectsToRun.forEach((effectFn) => {
    // 如果一个副作用函数存在调度器，则调用该调度器，并将副作用函数作为参数传递
    if (effectFn.options.scheduler) {
      // 新增
      effectFn.options.scheduler(effectFn); // 新增
    } else {
      // 否则直接执行副作用函数（之前的默认行为）
      effectFn(); // 新增
    }
  });
}
```

### 计算属性 computed 与 lazy

- 通过 `lazy` 使副作用函数不立即执行

- 新增两个变量 `value` 和 `dirty`，其中 `value` 用来缓存上一次计算的值，而 `dirty` 是一个标识，代表是否需要重新计算

- 返回一个设置 `value` 属性的 `getter` 的变量，读取 `.value` 时手动收集依赖，按 `dirty` 执行副作用函数

```JavaScript
function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(effectFn);
    // 将 fn 的执行结果存储到 res 中
    const res = fn(); // 新增
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
    // 将 res 作为 effectFn 的返回值
    return res; // 新增
  };
  effectFn.options = options;
  effectFn.deps = [];
  if (!options.lazy) {
    effectFn();
  }

  return effectFn;
}

function computed(getter) {
  let value;
  let dirty = true;

  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      if (!dirty) {
        dirty = true;
        // 当计算属性依赖的响应式数据变化时，手动调用 trigger 函数触发响应
        trigger(obj, "value");
      }
    },
  });

  const obj = {
    get value() {
      if (dirty) {
        value = effectFn();
        dirty = false;
      }
      // 当读取 value 时，手动调用 track 函数进行追踪
      track(obj, "value");
      return value;
    },
  };

  return obj;
}
```

### watch的实现原理

如果副作用函数存在 scheduler 选项，当响应式数据发生变化时，会触发 scheduler 调度函数执行，而非直接触发副作用函数执行。从这个角度来看，其实 scheduler 调度函数就相当于一个回调函数，而 watch 的实现就是利用了这个特点。

示例

```JavaScript
function watch(source, cb) {
  // 定义 getter
  let getter;
  // 如果 source 是函数，说明用户传递的是 getter，所以直接把 source 赋值给 getter
  if (typeof source === "function") {
    getter = source;
  } else {
    // 否则按照原来的实现调用 traverse 递归地读取
    getter = () => traverse(source);
  }

  effect(
    // 执行 getter
    () => getter(),
    {
      scheduler() {
        cb();
      },
    }
  );
}

function traverse(value, seen = new Set()) {
  // 如果要读取的数据是原始值，或者已经被读取过了，那么什么都不做
  if (typeof value !== "object" || value === null || seen.has(value)) return;
  // 将数据添加到 seen 中，代表遍历地读取过了，避免循环引用引起的死循环
  seen.add(value);
  // 暂时不考虑数组等其他结构
  // 假设 value 就是一个对象，使用 for...in 读取对象的每一个值，并递归地调用 traverse 进行处理
  for (const k in value) {
    traverse(value[k], seen);
  }

  return value;
}
```

首先判断 source 的类型，如果是函数类型，说明用户直接传递 了 getter 函数，这时直接使用用户的 getter 函数；如果不是函数 类型，那么保留之前的做法，即调用 traverse 函数递归地读取。这 样就实现了自定义 getter 的功能，同时使得 watch 函数更加强大。 

细心的你可能已经注意到了，现在的实现还缺少一个非常重要的 能力，即在回调函数中拿不到旧值与新值。通常我们在使用 Vue.js 中 的 watch 函数时，能够在回调函数中得到变化前后的值：

```JavaScript
watch(
  () => obj.foo,
  (newValue, oldValue) => {
    console.log(newValue, oldValue); // 2, 1
  }
);

obj.foo++;
```

那么如何获得新值与旧值呢？这需要充分利用 effect 函数的 lazy 选项，如以下代码所示：

```JavaScript
function watch(source, cb) {
  let getter;
  if (typeof source === "function") {
    getter = source;
  } else {
    getter = () => traverse(source);
  }
  // 定义旧值与新值
  let oldValue, newValue;
  // 使用 effect 注册副作用函数时，开启 lazy 选项，并把返回值存储到effectFn 中以便后续手动调用
  const effectFn = effect(() => getter(), {
    lazy: true,
    scheduler() {
      // 在 scheduler 中重新执行副作用函数，得到的是新值
      newValue = effectFn();
      // 将旧值和新值作为回调函数的参数
      cb(newValue, oldValue);
      // 更新旧值，不然下一次会得到错误的旧值
      oldValue = newValue;
    },
  });
  // 手动调用副作用函数，拿到的值就是旧值
  oldValue = effectFn();
}
```

在这段代码中，最核心的改动是使用 lazy 选项创建了一个懒执 行的 effect。注意上面代码中最下面的部分，我们手动调用 effectFn 函数得到的返回值就是旧值，即第一次执行得到的值。当 变化发生并触发 scheduler 调度函数执行时，会重新调用 effectFn 函数并得到新值，这样我们就拿到了旧值与新值，接着将 它们作为参数传递给回调函数 cb 就可以了。最后一件非常重要的事情 是，不要忘记使用新值更新旧值：oldValue = newValue，否则在 下一次变更发生时会得到错误的旧值。

## 四. 参考

- [【杰哥课堂】Vue3.2源码设计与实现-响应式原理](https://www.bilibili.com/video/BV17G41157E6/)

- [源码](https://github.com/redsanjin-1/vue3-reactive)




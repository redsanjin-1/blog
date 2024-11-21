## 数据类型判断

```JavaScript
function typeOf(target) {
  return Object.prototype.toString.call(target).slice(8, -1).toLowerCase();
}

console.log(typeOf([])) // 'array'
console.log(typeOf({})) // 'object'
conosle.log(typeOf(new Date)) // 'date'
```

## 实现 instanceof

```JavaScript
function myInstanceof(left, right) {
  // 获取对象的原型
  let proto = Object.getPrototypeOf(left)
  // 获取构造函数的 prototype 对象
  let prototype = right.prototype; 
 
  // 判断构造函数的 prototype 对象是否在对象的原型链上
  while (true) {
    if (!proto) return false;
    if (proto === prototype) return true;
    // 如果没有找到，就继续从其原型上找，Object.getPrototypeOf方法用来获取指定对象的原型
    proto = Object.getPrototypeOf(proto);
  }
}
```

## 实现 Object.create

```JavaScript
function create(obj) {
  function F() {}
  F.prototype = obj;
  return new F()
}
```

## 实现 new 操作符

在调用 `new` 的过程中会发生以上四件事情：

（1）首先创建了一个新的空对象

（2）设置原型，将对象的原型设置为函数的 prototype 对象

（3）让函数的 this 指向这个对象，执行构造函数的代码（为这个新对象添加属性）

（4）判断函数的返回值类型，如果是值类型，返回创建的对象。如果是引用类型，就返回这个引用类型的对象

```JavaScript
function _new(constructor, ...args) {
    // 构造函数类型合法判断
    if(typeof constructor !== 'function') {
      throw new Error('constructor must be a function');
    }
    // 新建空对象实例, 将构造函数的原型绑定到新创的对象实例上
    const obj = Object.create(constructor.prototype);
    // 调用构造函数并判断返回值
    const res = constructor.apply(obj,  args);

    // 如果有返回值且返回值是对象类型，那么就将它作为返回值，否则就返回之前新建的对象
    return typeof res === 'object' ? res : obj;
};
```

## 防抖

函数防抖是指在事件被触发 n 秒后再执行回调，如果在这 n 秒内事件又被触发，则重新计时。这可以使用在一些点击请求的事件上，避免因为用户的多次点击向后端发送多次请求。

```JavaScript
// 函数防抖的实现
function debounce(fn, wait) {
  let timer = null;

  return function() {
    let context = this,
        args = arguments;

    // 如果此时存在定时器的话，则取消之前的定时器重新记时
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    // 设置定时器，使事件间隔指定事件后执行
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, wait);
  };
}
```

## 节流

函数节流是指规定一个单位时间，在这个单位时间内，只能有一次触发事件的回调函数执行，如果在同一个单位时间内某事件被触发多次，只有一次能生效。节流可以使用在 scroll 函数的事件监听上，通过事件节流来降低事件调用的频率。

```JavaScript
// 函数节流的实现;
function throttle(fn, delay) {
  let curTime = Date.now();

  return function() {
    let context = this,
        args = arguments,
        nowTime = Date.now();

    // 如果两次时间间隔超过了指定时间，则执行函数。
    if (nowTime - curTime >= delay) {
      curTime = Date.now();
      return fn.apply(context, args);
    }
  };
}
```

## 深拷贝

```JavaScript
const isObject = (target) => {
  const type = typeof target;
  return target !== null && type === "object";
};

const getType = (obj) => {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
};

const deepClone = (target, cache = new WeakMap()) => {
  // 原始数据类型，直接返回
  if (!isObject(target)) {
    return target;
  }
  const type = getType(target);
  let cloneTarget = new target.constructor();
  // 处理循环引用
  if (cache.has(target)) return cache.get(target);
  cache.set(target, cloneTarget);

  if (type === "array" || type === "object") {
    for (const key in target) {
      cloneTarget[key] = deepClone(target[key], cache);
    }
  } else if (type === "map") {
    for (const [key, value] of target) {
      cloneTarget.set(key, deepClone(value, cache));
    }
  } else if (type === "set") {
    for (const v of source) {
      cloneTarget.add(deepClone(v, cache));
    }
  } else if (type === "date") {
    cloneTarget = new target.constructor(target);
  } else if (type === "regexp") {
    cloneTarget = new target.constructor(target.source, target.flags);
  }

  return cloneTarget;
};
```

详见[这里](https://juejin.cn/post/6844903929705136141)

## 继承

### 原型链继承

```JavaScript
function Animal() {
    this.colors = ['black', 'white']
}
Animal.prototype.getColor = function() {
    return this.colors
}
function Dog() {}
Dog.prototype =  new Animal()

let dog1 = new Dog()
dog1.colors.push('brown')
let dog2 = new Dog()
console.log(dog2.colors)  // ['black', 'white', 'brown']
```

原型链继承存在的问题：

- 问题1：原型中包含的引用类型属性将被所有实例共享；

- 问题2：子类在实例化的时候不能给父类构造函数传参；

### 借用构造函数继承

```JavaScript
function Animal(name) {
    this.name = name
    this.getName = function() {
        return this.name
    }
}
function Dog(name) {
    Animal.call(this, name)
}
```

借用构造函数实现继承解决了原型链继承的 2 个问题：引用类型共享问题以及传参问题。但是由于方法必须定义在构造函数中，所以会导致每次创建子类实例都会创建一遍方法。

### 组合继承

组合继承结合了原型链和盗用构造函数，将两者的优点集中了起来。基本的思路是使用原型链继承原型上的属性和方法，而通过盗用构造函数继承实例属性。这样既可以把方法定义在原型上以实现重用，又可以让每个实例都有自己的属性。

```JavaScript
function Animal(name) {
    this.name = name
    this.colors = ['black', 'white']
}
Animal.prototype.getName = function() {
    return this.name
}
function Dog(name, age) {
    Animal.call(this, name)
    this.age = age
}
Dog.prototype =  new Animal()
Dog.prototype.constructor = Dog

let dog1 = new Dog('奶昔', 2)
dog1.colors.push('brown')
let dog2 = new Dog('哈赤', 1)
console.log(dog2) 
// { name: "哈赤", colors: ["black", "white"], age: 1 }
```

### 寄生氏组合继承

组合继承已经相对完善了，但还是存在问题，它的问题就是调用了 2 次父类构造函数，第一次是在 new Animal()，第二次是在 Animal.call() 这里。

所以解决方案就是不直接调用父类构造函数给子类原型赋值，而是通过创建空函数 F 获取父类原型的副本。

寄生式组合继承写法上和组合继承基本类似，区别是如下这里：

```diff
- Dog.prototype =  new Animal()
- Dog.prototype.constructor = Dog

+ function F() {}
+ F.prototype = Animal.prototype
+ let f = new F()
+ f.constructor = Dog
+ Dog.prototype = f
```

稍微封装下上面添加的代码后：

```JavaScript
function object(o) {
    function F() {}
    F.prototype = o
    return new F()
}
function inheritPrototype(child, parent) {
    let prototype = object(parent.prototype)
    prototype.constructor = child
    child.prototype = prototype
}
inheritPrototype(Dog, Animal)
```

如果你嫌弃上面的代码太多了，还可以基于组合继承的代码改成最简单的寄生式组合继承：

```diff
- Dog.prototype =  new Animal()
- Dog.prototype.constructor = Dog

+ Dog.prototype =  Object.create(Animal.prototype)
+ Dog.prototype.constructor = Dog

```

### class实现继承

```JavaScript
class Animal {
    constructor(name) {
        this.name = name
    } 
    getName() {
        return this.name
    }
}
class Dog extends Animal {
    constructor(name, age) {
        super(name)
        this.age = age
    }
}
```

更多原型与原型链，请查看[这里](https://juejin.cn/post/7129157532970385421)

## 事件总线（发布订阅模式）

```JavaScript
class EventEmitter {
    constructor() {
        this.cache = {}
    }
    on(name, fn) {
        if (this.cache[name]) {
            this.cache[name].push(fn)
        } else {
            this.cache[name] = [fn]
        }
    }
    off(name, fn) {
        let tasks = this.cache[name]
        if (tasks) {
            const index = tasks.findIndex(f => f === fn || f.callback === fn)
            if (index >= 0) {
                tasks.splice(index, 1)
            }
        }
    }
    emit(name, once = false, ...args) {
        if (this.cache[name]) {
            // 创建副本，如果回调函数内继续注册相同事件，会造成死循环
            let tasks = this.cache[name].slice()
            for (let fn of tasks) {
                fn(...args)
            }
            if (once) {
                delete this.cache[name]
            }
        }
    }
}

// 测试
let eventBus = new EventEmitter()
let fn1 = function(name, age) {
	console.log(`${name} ${age}`)
}
let fn2 = function(name, age) {
	console.log(`hello, ${name} ${age}`)
}
eventBus.on('aaa', fn1)
eventBus.on('aaa', fn2)
eventBus.emit('aaa', false, '布兰', 12)
// '布兰 12'
// 'hello, 布兰 12'
```

## 函数柯里化

什么叫函数柯里化？其实就是将使用多个参数的函数转换成一系列使用一个参数的函数的技术。

例如：

```JavaScript
function add(a, b, c) {
    return a + b + c
}
add(1, 2, 3)
let addCurry = curry(add)
addCurry(1)(2)(3)
```

现在就是要实现 curry 这个函数，使函数从一次调用传入多个参数变成多次调用每次传一个参数。

```JavaScript
function curry(fn) {
    let judge = (...args) => {
        if (args.length == fn.length) return fn(...args)
        return (...arg) => judge(...args, ...arg)
    }
    return judge
}
```

实现函数原型方法

## call

使用一个指定的 this 值和一个或多个参数来调用一个函数。

实现要点：

- this 可能传入 null；

- 传入不固定个数的参数；

- 函数可能有返回值；

```JavaScript
Function.prototype.call2 = function (context) {
    var context = context || window;
    context.fn = this;

    var args = [];
    for(var i = 1, len = arguments.length; i < len; i++) {
        args.push('arguments[' + i + ']');
    }

    var result = eval('context.fn(' + args +')');

    delete context.fn
    return result;
}
```

## apply

apply 和 call 一样，唯一的区别就是 call 是传入不固定个数的参数，而 apply 是传入一个数组。

实现要点：

- this 可能传入 null；

- 传入一个数组；

- 函数可能有返回值；

```JavaScript
Function.prototype.apply2 = function (context, arr) {
    var context = context || window;
    context.fn = this;

    var result;
    if (!arr) {
        result = context.fn();
    } else {
        var args = [];
        for (var i = 0, len = arr.length; i < len; i++) {
            args.push('arr[' + i + ']');
        }
        result = eval('context.fn(' + args + ')')
    }

    delete context.fn
    return result;
}
```

## bind

bind 方法会创建一个新的函数，在 bind() 被调用时，这个新函数的 this 被指定为 bind() 的第一个参数，而其余参数将作为新函数的参数，供调用时使用。

实现要点：

- bind() 除了 this 外，还可传入多个参数；

- bing 创建的新函数可能传入多个参数；

- 新函数可能被当做构造函数调用；

- 函数可能有返回值；

```JavaScript
Function.prototype.bind2 = function (context) {
    var self = this;
    var args = Array.prototype.slice.call(arguments, 1);

    var fNOP = function () {};

    var fBound = function () {
        var bindArgs = Array.prototype.slice.call(arguments);
        return self.apply(this instanceof fNOP ? this : context, args.concat(bindArgs));
    }

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    return fBound;
}
```

## 实现 Promise

实现 Promise 需要完全读懂 [Promise A+ 规范](https://link.juejin.cn?target=https%3A%2F%2Fpromisesaplus.com%2F)，不过从总体的实现上看，有如下几个点需要考虑到：

- then 需要支持链式调用，所以得返回一个新的 Promise；

- 处理异步问题，所以得先用 onResolvedCallbacks 和 onRejectedCallbacks 分别把成功和失败的回调存起来；

- 为了让链式调用正常进行下去，需要判断 onFulfilled 和 onRejected 的类型；

- onFulfilled 和 onRejected 需要被异步调用，这里用 setTimeout 模拟异步；

- 处理 Promise 的 resolve；

```JavaScript
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class Promise {
    constructor(executor) {
        this.status = PENDING;
        this.value = undefined;
        this.reason = undefined;
        this.onResolvedCallbacks = [];
        this.onRejectedCallbacks = [];
        
        let resolve = (value) = > {
            if (this.status === PENDING) {
                this.status = FULFILLED;
                this.value = value;
                this.onResolvedCallbacks.forEach((fn) = > fn());
            }
        };
        
        let reject = (reason) = > {
            if (this.status === PENDING) {
                this.status = REJECTED;
                this.reason = reason;
                this.onRejectedCallbacks.forEach((fn) = > fn());
            }
        };
        
        try {
            executor(resolve, reject);
        } catch (error) {
            reject(error);
        }
    }
    
    then(onFulfilled, onRejected) {
        // 解决 onFufilled，onRejected 没有传值的问题
        onFulfilled = typeof onFulfilled === "function" ? onFulfilled : (v) = > v;
        // 因为错误的值要让后面访问到，所以这里也要抛出错误，不然会在之后 then 的 resolve 中捕获
        onRejected = typeof onRejected === "function" ? onRejected : (err) = > {
            throw err;
        };
        // 每次调用 then 都返回一个新的 promise
        let promise2 = new Promise((resolve, reject) = > {
            if (this.status === FULFILLED) {
                //Promise/A+ 2.2.4 --- setTimeout
                setTimeout(() = > {
                    try {
                        let x = onFulfilled(this.value);
                        // x可能是一个proimise
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                }, 0);
            }
        
            if (this.status === REJECTED) {
                //Promise/A+ 2.2.3
                setTimeout(() = > {
                    try {
                        let x = onRejected(this.reason);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                }, 0);
            }
            
            if (this.status === PENDING) {
                this.onResolvedCallbacks.push(() = > {
                    setTimeout(() = > {
                        try {
                            let x = onFulfilled(this.value);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    }, 0);
                });
            
                this.onRejectedCallbacks.push(() = > {
                    setTimeout(() = > {
                        try {
                            let x = onRejected(this.reason);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    }, 0);
                });
            }
        });
        
        return promise2;
    }
}
const resolvePromise = (promise2, x, resolve, reject) = > {
    // 自己等待自己完成是错误的实现，用一个类型错误，结束掉 promise  Promise/A+ 2.3.1
    if (promise2 === x) {
        return reject(
            new TypeError("Chaining cycle detected for promise #<Promise>"));
    }
    // Promise/A+ 2.3.3.3.3 只能调用一次
    let called;
    // 后续的条件要严格判断 保证代码能和别的库一起使用
    if ((typeof x === "object" && x != null) || typeof x === "function") {
        try {
            // 为了判断 resolve 过的就不用再 reject 了（比如 reject 和 resolve 同时调用的时候）  Promise/A+ 2.3.3.1
            let then = x.then;
            if (typeof then === "function") {
            // 不要写成 x.then，直接 then.call 就可以了 因为 x.then 会再次取值，Object.defineProperty  Promise/A+ 2.3.3.3
                then.call(
                    x, (y) = > {
                        // 根据 promise 的状态决定是成功还是失败
                        if (called) return;
                        called = true;
                        // 递归解析的过程（因为可能 promise 中还有 promise） Promise/A+ 2.3.3.3.1
                        resolvePromise(promise2, y, resolve, reject);
                    }, (r) = > {
                        // 只要失败就失败 Promise/A+ 2.3.3.3.2
                        if (called) return;
                        called = true;
                        reject(r);
                    });
            } else {
                // 如果 x.then 是个普通值就直接返回 resolve 作为结果  Promise/A+ 2.3.3.4
                resolve(x);
            }
        } catch (e) {
            // Promise/A+ 2.3.3.2
            if (called) return;
            called = true;
            reject(e);
        }
    } else {
        // 如果 x 是个普通值就直接返回 resolve 作为结果  Promise/A+ 2.3.4
        resolve(x);
    }
};
```

参考：

- [BAT前端经典面试问题：史上最最最详细的手写Promise教程](https://juejin.cn/post/6844903625769091079)

- [100 行代码实现 Promises/A+ 规范](https://link.juejin.cn/?target=https%3A%2F%2Fmp.weixin.qq.com%2Fs%2FqdJ0Xd8zTgtetFdlJL3P1g)

### Promise.resolve

Promsie.resolve(value) 可以将任何值转成值为 value 状态是 fulfilled 的 Promise，但如果传入的值本身是 Promise 则会原样返回它。

```JavaScript
Promise.resolve = function(value) {
    // 如果是 Promsie，则直接输出它
    if(value instanceof Promise){
        return value
    }
    return new Promise(resolve => resolve(value))
}
```

### Promise.reject

和 Promise.resolve() 类似，Promise.reject() 会实例化一个 rejected 状态的 Promise。但与 Promise.resolve() 不同的是，如果给 Promise.reject() 传递一个 Promise 对象，则这个对象会成为新 Promise 的值。

```JavaScript
Promise.reject = function(reason) {
    return new Promise((resolve, reject) => reject(reason))
}
```

### Promise.all

Promise.all 的规则是这样的：

- 传入的所有 Promsie 都是 fulfilled，则返回由他们的值组成的，状态为 fulfilled 的新 Promise；

- 只要有一个 Promise 是 rejected，则返回 rejected 状态的新 Promsie，且它的值是第一个 rejected 的 Promise 的值；

- 只要有一个 Promise 是 pending，则返回一个 pending 状态的新 Promise；

```JavaScript
Promise.all = function(promiseArr) {
    let index = 0, result = []
    return new Promise((resolve, reject) => {
        promiseArr.forEach((p, i) => {
            Promise.resolve(p).then(val => {
                index++
                result[i] = val
                if (index === promiseArr.length) {
                    resolve(result)
                }
            }, err => {
                reject(err)
            })
        })
    })
}
```

### Promise.race

Promise.race 会返回一个由所有可迭代实例中第一个 fulfilled 或 rejected 的实例包装后的新实例。

```JavaScript
Promise.race = function(promiseArr) {
    return new Promise((resolve, reject) => {
        promiseArr.forEach(p => {
            Promise.resolve(p).then(val => {
                resolve(val)
            }, err => {
                rejecte(err)
            })
        })
    })
}
```

### Promise.allSettled

Promise.allSettled 的规则是这样：

- 所有 Promise 的状态都变化了，那么新返回一个状态是 fulfilled 的 Promise，且它的值是一个数组，数组的每项由所有 Promise 的值和状态组成的对象；

- 如果有一个是 pending 的 Promise，则返回一个状态是 pending 的新实例；

```JavaScript
Promise.allSettled = function(promiseArr) {
    let result = []
        
    return new Promise((resolve, reject) => {
        promiseArr.forEach((p, i) => {
            Promise.resolve(p).then(val => {
                result.push({
                    status: 'fulfilled',
                    value: val
                })
                if (result.length === promiseArr.length) {
                    resolve(result) 
                }
            }, err => {
                result.push({
                    status: 'rejected',
                    reason: err
                })
                if (result.length === promiseArr.length) {
                    resolve(result) 
                }
            })
        })  
    })   
}
```

### Promise.any

Promise.any 的规则是这样：

- 空数组或者所有 Promise 都是 rejected，则返回状态是 rejected 的新 Promsie，且值为 AggregateError 的错误；

- 只要有一个是 fulfilled 状态的，则返回第一个是 fulfilled 的新实例；

- 其他情况都会返回一个 pending 的新实例；

```JavaScript
Promise.any = function(promiseArr) {
    let index = 0
    return new Promise((resolve, reject) => {
        if (promiseArr.length === 0) return 
        promiseArr.forEach((p, i) => {
            Promise.resolve(p).then(val => {
                resolve(val)
                
            }, err => {
                index++
                if (index === promiseArr.length) {
                  reject(new AggregateError('All promises were rejected'))
                }
            })
        })
    })
}
```

### Promise并行限制

就是实现有并行限制的Promise调度器问题。

详细实现思路：[某条高频面试原题：实现有并行限制的Promise调度器](https://juejin.cn/post/6854573217013563405)

```JavaScript
class Scheduler {
  constructor() {
    this.queue = [];
    this.maxCount = 2;
    this.runCounts = 0;
  }
  add(promiseCreator) {
    this.queue.push(promiseCreator);
  }
  taskStart() {
    for (let i = 0; i < this.maxCount; i++) {
      this.request();
    }
  }
  request() {
    if (!this.queue || !this.queue.length || this.runCounts >= this.maxCount) {
      return;
    }
    this.runCounts++;

    this.queue.shift()().then(() => {
      this.runCounts--;
      this.request();
    });
  }
}
   
const timeout = time => new Promise(resolve => {
  setTimeout(resolve, time);
})
  
const scheduler = new Scheduler();
  
const addTask = (time,order) => {
  scheduler.add(() => timeout(time).then(()=>console.log(order)))
}
  
  
addTask(1000, '1');
addTask(500, '2');
addTask(300, '3');
addTask(400, '4');
scheduler.taskStart()
// 2
// 3
// 1
// 4
```

## 参考

- [死磕 36 个 JS 手写题（搞懂后，提升真的大）](https://juejin.cn/post/6946022649768181774)


![image.png](/ead326195962.png)

组件渲染会返回vdom，渲染器再把vdom同步到真实dom中，当再次渲染时，会产生新vdom，渲染器会对比两棵vdom树，对有差异的部分通过增删改的api更新真实dom。这里对比两棵 vdom树，找到有差异的部分的算法，就叫做diff算法。Diff 算法，在 Vue 里面就是叫做 `patch` ，它的核心就是参考 [Snabbdom](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fsnabbdom%2Fsnabbdom)。

# diff算法

通常两个树做diff，复杂度是O(n^3)，这个成本是相当高的，所以许多前端框架的diff约定了两种处理原则：**只做同层diff，type变了就不在对比子节点。**

这样只要遍历一遍，对比一下 type 就行了，是 O(n) 的复杂度，而且 type 变了就不再对比子节点，能省下一大片节点的遍历。另外，因为 vdom 中记录了关联的 dom 节点，执行 dom 的增删改也不需要遍历，是 O(1)的，整体的 diff 算法复杂度就是 O(n) 的复杂度。

但是这样的算法虽然复杂度低了，却还是存在问题的。

比如一组节点，假设有 5 个，类型是 ABCDE，下次渲染出来的是 EABCD，这时候逐一对比，发现 type 不一样，就会重新渲染这 5 个节点。

而且根据 type 不同就不再对比子节点的原则，如果这些节点有子节点，也会重新渲染。

dom 操作是比较慢的，这样虽然 diff 的算法复杂度是低了，重新渲染的性能也不高。

上面那个例子的 ABCDE 变为 EABCD，很明显只需要移动一下 E 就行了，根本不用创建新元素。

但是怎么对比出是同个节点发生了移动呢？

判断 type 么？ 那不行，同 type 的节点可能很多，区分不出来的。

最好每个节点都是有唯一的标识。

所以当渲染一组节点的时候，前端框架会让开发者指定 key，通过 key 来判断是不是有子节点只是发生了移动，从而直接复用。

这样，diff 算法处理一组节点的对比的时候，就要根据 key 来再做一次算法的优化。

我们会把基于 key 的两组节点的 diff 算法叫做**多节点 diff 算法**，它是整个 vdom 的 diff 算法的一部分。

接下来我们来学习一下多节点 diff 算法：

## 简单diff

假设渲染 ABCD 一组节点，再次渲染是 DCAB，这时候怎么处理呢？

**多节点 diff 算法的目的是为了尽量复用节点，通过移动节点代替创建。**

所以新 vnode 数组的每个节点我们都要找下在旧 vnode 数组中有没有对应 key 的，有的话就移动到新的位置，没有的话再创建新的。

也就是这样的：

```JavaScript
const oldChildren = n1.children
const newChildren = n2.children

let lastIndex = 0
// 遍历新的 children
for (let i = 0; i < newChildren.length; i++) {
    const newVNode = newChildren[i]
    let j = 0
    let find = false
    // 遍历旧的 children
    for (j; j < oldChildren.length; j++) {
      const oldVNode = oldChildren[j]
      // 如果找到了具有相同 key 值的两个节点，则调用 patch 函数更新
      if (newVNode.key === oldVNode.key) {
        find = true
        patch(oldVNode, newVNode, container)
        
        处理移动...
        
        break //跳出循环，处理下一个节点
      }
   }
   // 没有找到就是新增了
   if (!find) {
      const prevVNode = newChildren[i - 1]
      let anchor = null
      if (prevVNode) {
        anchor = prevVNode.el.nextSibling
      } else {
        anchor = container.firstChild
      }
      patch(null, newVNode, container, anchor)
   }
}
```

这里的 patch 函数的作用是更新节点的属性，重新设置事件监听器。如果没有对应的旧节点的话，就是插入节点，需要传入一个它之后的节点作为锚点 anchor。

我们遍历处理新的 vnode：

先从旧的 vnode 数组中查找对应的节点，如果找到了就代表可以复用，接下来只要移动就好了。

如果没找到，那就执行插入，锚点是上一个节点的 nextSibling。

![image.png](/21bb59a339ac.png)

那如果找到了可复用的节点之后，那移动到哪里呢？

其实**新的 vnode 数组中记录的顺序就是目标的顺序。所以把对应的节点按照新 vnode 数组的顺序来移动就好了。**

```JavaScript
const prevVNode = newChildren[i - 1]
if (prevVNode) {
    const anchor = prevVNode.el.nextSibling
    insert(newVNode.el, container, anchor)
}
```

要插入到 i 的位置，那就要取 i-1 位置的节点的 nextSibling 做为锚点来插入当前节点。

![image.png](/e2a40fd2bd32.png)

但是并不是所有的节点都需要移动，比如处理到第二个新的 vnode，发现它在旧的 vnode 数组中的下标为 4，说明本来就是在后面了，那就不需要移动了。反之，如果是 vnode 查找到的对应的旧的 vnode 在当前 index 之前才需要移动。

也就是这样：

```JavaScript
let j = 0
let find = false
// 遍历旧的 children
for (j; j < oldChildren.length; j++) {
    const oldVNode = oldChildren[j]
    // 如果找到了具有相同 key 值的两个节点，则调用 patch 函数更新之
    if (newVNode.key === oldVNode.key) {
        find = true
        patch(oldVNode, newVNode, container)

        if (j < lastIndex) { // 旧的 vnode 数组的下标在上一个 index 之前，需要移动
          const prevVNode = newChildren[i - 1]
          if (prevVNode) {
            const anchor = prevVNode.el.nextSibling
            insert(newVNode.el, container, anchor)
          }
        } else {// 不需要移动
          // 更新 lastIndex
          lastIndex = j
        }
        break
    }
}
```

查找新的 vnode 在旧的 vnode 数组中的下标，如果找到了的话，说明对应的 dom 就是可以复用的，先 patch 一下，然后移动。

移动的话判断下下标是否在 lastIndex 之后，如果本来就在后面，那就不用移动，更新下 lastIndex 就行。

如果下标在 lastIndex 之前，说明需要移动，移动到的位置前面分析过了，就是就是新 vnode 数组 i-1 的后面。

这样，我们就完成了 dom 节点的复用和移动。

新的 vnode 数组全部处理完后，旧的 vnode 数组可能还剩下一些不再需要的，那就删除它们：

```JavaScript
// 遍历旧的节点
for (let i = 0; i < oldChildren.length; i++) {
    const oldVNode = oldChildren[i]
    // 拿着旧 VNode 去新 children 中寻找相同的节点
    const has = newChildren.find(
      vnode => vnode.key === oldVNode.key
    )
    if (!has) {
      // 如果没有找到相同的节点，则移除
      unmount(oldVNode)
    }
}
```

这样，我们就完成了两组 vnode 的 diff 和对应 dom 的增删改。

小结一下：

**diff 算法的目的是根据 key 复用 dom 节点，通过移动节点而不是创建新节点来减少 dom 操作。**

**对于每个新的 vnode，在旧的 vnode 中根据 key 查找一下，如果没查找到，那就新增 dom 节点，如果查找到了，那就可以复用。**

**复用的话要不要移动要判断下下标，如果下标在 lastIndex 之后，就不需要移动，因为本来就在后面，反之就需要移动。**

**最后，把旧的 vnode 中在新 vnode 中没有的节点从 dom 树中删除。**

这就是一个完整的 diff 算法的实现。

![image.png](/b6c0f1e96fb9.png)

这个 diff 算法我们是从一端逐个处理的，叫做简单 diff 算法。

简单 diff 算法其实性能不是最好的，比如旧的 vnode 数组是 ABCD，新的 vnode 数组是 DABC，按照简单 diff 算法，A、B、C 都需要移动。

那怎么优化这个算法呢？

从一个方向顺序处理会有这个问题，那从两个方向同时对比呢？

这就是双端 diff 算法：

## vue2.x diff — 双端diff

下面的diff算法中会出现几个方法，在这里进行罗列，并说明其功能

- `mount(vnode, parent, [refNode])`: 通过`vnode`生成真实的`DOM`节点。`parent`为其父级的真实DOM节点，`refNode`为真实的`DOM`节点，其父级节点为`parent`。如果`refNode`不为空，`vnode`生成的`DOM`节点就会插入到`refNode`之前；如果`refNode`为空，那么`vnode`生成的`DOM`节点就作为最后一个子节点插入到`parent`中

- `patch(prevNode, nextNode, parent)`: 可以简单的理解为给当前`DOM`节点进行更新，并且调用`diff`算法对比自身的子节点;

### 1. 实现原理

我们先用四个指针指向两个列表的头尾

```JavaScript
function vue2Diff(prevChildren, nextChildren, parent) {
  let oldStartIndex = 0,
    oldEndIndex = prevChildren.length - 1
    newStartIndex = 0,
    newEndIndex = nextChildren.length - 1;
  let oldStartNode = prevChildren[oldStartIndex],
    oldEndNode = prevChildren[oldEndIndex],
    newStartNode = nextChildren[nextStartIndex],
    newEndNode = nextChildren[nextEndIndex];
}
```

我们根据四个指针找到四个节点，然后进行对比，那么如何对比呢？我们按照以下四个步骤进行对比

1. 使用**旧列表**的头一个节点`oldStartNode`与**新列表**的头一个节点`newStartNode`对比

2. 使用**旧列表**的最后一个节点`oldEndNode`与**新列表**的最后一个节点`newEndNode`对比

3. 使用**旧列表**的头一个节点`oldStartNode`与**新列表**的最后一个节点`newEndNode`对比

4. 使用**旧列表**的最后一个节点`oldEndNode`与**新列表**的头一个节点`newStartNode`对比

使用以上四步进行对比，去寻找`key`相同的可复用的节点，当在某一步中找到了则停止后面的寻找。具体对比顺序如下图

![image.png](/73c064edaf78.png)

对比顺序代码结构如下:

```JavaScript
function vue2Diff(prevChildren, nextChildren, parent) {
  let oldStartIndex = 0,
    oldEndIndex = prevChildren.length - 1
    newStartIndex = 0,
    newEndIndex = nextChildren.length - 1;
  let oldStartNode = prevChildren[oldStartIndex],
    oldEndNode = prevChildren[oldEndIndex],
    newStartNode = nextChildren[newStartIndex],
    newEndNode = nextChildren[newEndIndex];
  
  if (oldStartNode.key === newStartNode.key) {

  } else if (oldEndNode.key === newEndNode.key) {

  } else if (oldStartNode.key === newEndNode.key) {

  } else if (oldEndNode.key === newStartNode.key) {

  }
}
```

当对比时找到了可复用的节点，我们还是先`patch`给元素打补丁，然后将指针进行`前/后移`一位指针。根据对比节点的不同，我们移动的**指针**和**方向**也不同，具体规则如下：

1. 当**旧列表**的头一个节点`oldStartNode`与**新列表**的头一个节点`newStartNode`对比时`key`相同。那么**旧列表**的头指针`oldStartIndex`与**新列表**的头指针`newStartIndex`同时向**后**移动一位。

2. 当**旧列表**的最后一个节点`oldEndNode`与**新列表**的最后一个节点`newEndNode`对比时`key`相同。那么**旧列表**的尾指针`oldEndIndex`与**新列表**的尾指针`newEndIndex`同时向**前**移动一位。

3. 当**旧列表**的头一个节点`oldStartNode`与**新列表**的最后一个节点`newEndNode`对比时`key`相同。那么**旧列表**的头指针`oldStartIndex`向**后**移动一位；**新列表**的尾指针`newEndIndex`向**前**移动一位。

4. 当**旧列表**的最后一个节点`oldEndNode`与**新列表**的头一个节点`newStartNode`对比时`key`相同。那么**旧列表**的尾指针`oldEndIndex`向**前**移动一位；**新列表**的头指针`newStartIndex`向**后**移动一位。

```JavaScript
function vue2Diff(prevChildren, nextChildren, parent) {
  let oldStartIndex = 0,
    oldEndIndex = prevChildren.length - 1,
    newStartIndex = 0,
    newEndIndex = nextChildren.length - 1;
  let oldStartNode = prevChildren[oldStartIndex],
    oldEndNode = prevChildren[oldEndIndex],
    newStartNode = nextChildren[newStartIndex],
    newEndNode = nextChildren[newEndIndex];

  if (oldStartNode.key === newStartNode.key) {
    patch(oldStartNode, newStartNode, parent)

    oldStartIndex++
    newStartIndex++
    oldStartNode = prevChildren[oldStartIndex]
    newStartNode = nextChildren[newStartIndex]
  } else if (oldEndNode.key === newEndNode.key) {
    patch(oldEndNode, newEndNode, parent)

    oldEndIndex--
    newEndIndex--
    oldEndNode = prevChildren[oldEndIndex]
    newEndNode = nextChildren[newEndIndex]
  } else if (oldStartNode.key === newEndNode.key) {
    patch(oldStartNode, newEndNode, parent)

    oldStartIndex++
    newEndIndex--
    oldStartNode = prevChildren[oldStartIndex]
    newEndNode = nextChildren[newEndIndex]
  } else if (oldEndNode.key === newStartNode.key) {
    patch(oldEndNode, newStartNode, parent)

    oldEndIndex--
    nextStartIndex++
    oldEndNode = prevChildren[oldEndIndex]
    newStartNode = nextChildren[newStartIndex]
  }
}
```

在小节的开头，提到了要让指针向内靠拢，所以我们需要循环。循环停止的条件是当其中一个列表的节点全部遍历完成，代码如下

```JavaScript
function vue2Diff(prevChildren, nextChildren, parent) {
  let oldStartIndex = 0,
    oldEndIndex = prevChildren.length - 1,
    newStartIndex = 0,
    newEndIndex = nextChildren.length - 1;
  let oldStartNode = prevChildren[oldStartIndex],
    oldEndNode = prevChildren[oldEndIndex],
    newStartNode = nextChildren[newStartIndex],
    newEndNode = nextChildren[newEndIndex];
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (oldStartNode.key === newStartNode.key) {
      patch(oldStartNode, newStartNode, parent)

      oldStartIndex++
      newStartIndex++
      oldStartNode = prevChildren[oldStartIndex]
      newStartNode = nextChildren[newStartIndex]
    } else if (oldEndNode.key === newEndNode.key) {
      patch(oldEndNode, newEndNode, parent)

      oldEndIndex--
      newndIndex--
      oldEndNode = prevChildren[oldEndIndex]
      newEndNode = nextChildren[newEndIndex]
    } else if (oldStartNode.key === newEndNode.key) {
      patch(oldvStartNode, newEndNode, parent)

      oldStartIndex++
      newEndIndex--
      oldStartNode = prevChildren[oldStartIndex]
      newEndNode = nextChildren[newEndIndex]
    } else if (oldEndNode.key === newStartNode.key) {
      patch(oldEndNode, newStartNode, parent)

      oldEndIndex--
      newStartIndex++
      oldEndNode = prevChildren[oldEndIndex]
      newStartNode = nextChildren[newStartIndex]
    }
  }
}
```

至此整体的循环我们就全部完成了，下面我们需要考虑这样两个问题：

- 什么情况下`DOM`节点需要移动

- `DOM`节点如何移动

我们来解决第一个问题：**什么情况下需要移动**，我们还是以上图为例。

![image.png](/ce4d8d7b5cb9.png)

当我们在第一个循环时，在`第四步`发现**旧列表的尾节点**`oldEndNode`与**新列表的头节点**`newStartNode`的`key`相同，是可复用的`DOM`节点。通过观察我们可以发现，**原本在旧列表末尾的节点，却是新列表中的开头节点，没有人比他更靠前，因为他是第一个，所以我们只需要把当前的节点移动到原本旧列表中的第一个节点之前，让它成为第一个节点即可**。

```JavaScript
function vue2Diff(prevChildren, nextChildren, parent) {
 // ...
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (oldStartNode.key === newStartNode.key) {
       // ...
    } else if (oldEndNode.key === newEndNode.key) {
      // ...
    } else if (oldStartNode.key === newEndNode.key) {
      // ...
    } else if (oldEndNode.key === newStartNode.key) {
      patch(oldEndNode, newStartNode, parent)
      // 移动到旧列表头节点之前
      parent.insertBefore(oldEndNode.el, oldStartNode.el)
      
      oldEndIndex--
      newStartIndex++
      oldEndNode = prevChildren[oldEndIndex]
      newStartNode = nextChildren[newStartIndex]
    }
  }
}
```

![image.png](/972ecdd82ac9.png)

然后我们进入第二次循环，我们在`第二步`发现，**旧列表的尾节点**`oldEndNode`和**新列表的尾节点**`newEndNode`为复用节点。**原本在旧列表中就是尾节点，在新列表中也是尾节点，说明该节点不需要移动**，所以我们什么都不需要做。

同理，如果是**旧列表的头节点**`oldStartNode`和**新列表的头节点**`newStartNode`为复用节点，我们也什么都不需要做。

![image.png](/376f313557c1.png)

进入第三次循环，我们在`第三部`发现，**旧列表的头节点**`oldStartNode`和**新列表的尾节点**`newEndNode`为复用节点。到这一步聪明如你肯定就一眼可以看出来了，我们只要将`DOM-A`移动到`DOM-B`后面就可以了。

依照惯例我们还是解释一下，**原本旧列表中是头节点，然后在新列表中是尾节点。那么只要在旧列表中把当前的节点移动到原本尾节点的后面，就可以了**。

```JavaScript
function vue2Diff(prevChildren, nextChildren, parent) {
  // ...
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (oldStartNode.key === newStartNode.key) {
      // ...
    } else if (oldEndNode.key === newEndNode.key) {
      // ...
    } else if (oldStartNode.key === newEndNode.key) {
      patch(oldStartNode, newEndNode, parent)
      parent.insertBefore(oldStartNode.el, oldEndNode.el.nextSibling)

      oldStartIndex++
      newEndIndex--
      oldStartNode = prevChildren[oldStartIndex]
      newEndNode = nextChildren[newEndIndex]
    } else if (oldEndNode.key === newStartNode.key) {
     //...
    }
  }
}
```

![image.png](/23d086b0855d.png)

OK，进入最后一个循环。在`第一步`**旧列表**头节点`oldStartNode`与**新列表**头节点`newStartNode`位置相同，所以啥也不用做。然后结束循环，这就是`Vue2 双端比较`的原理。

### 2. 非理想情况

上一小节，我们讲了`双端比较`的原理，但是有一种特殊情况，当四次对比都**没找到**复用节点时，我们只能拿**新列表**的第一个节点去**旧列表**中找与其`key`相同的节点。

![image.png](/46d92e8ca4e4.png)

```JavaScript
function vue2Diff(prevChildren, nextChildren, parent) {
  //...
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (oldStartNode.key === newStartNode.key) {
    //...
    } else if (oldEndNode.key === newEndNode.key) {
    //...
    } else if (oldStartNode.key === newEndNode.key) {
    //...
    } else if (oldEndNode.key === newStartNode.key) {
    //...
    } else {
      // 在旧列表中找到 和新列表头节点key 相同的节点
      let newKey = newStartNode.key,
        oldIndex = prevChildren.findIndex(child => child.key === newKey);
      
    }
  }
}
```

找节点的时候其实会有两种情况：一种在**旧列表**中找到了，另一种情况是没找到。我们先以上图为例，说一下找到的情况。

![image.png](/731f9b351834.png)

当我们在旧列表中找到对应的`VNode`，我们只需要将找到的节点的`DOM`元素，移动到开头就可以了。这里的逻辑其实和`第四步`的逻辑是一样的，只不过`第四步`是移动的尾节点，这里是移动找到的节点。`DOM`移动后，由我们将**旧列表**中的节点改为`undefined`，这是**至关重要**的一步，因为我们已经做了节点的移动了所以我们不需要进行再次的对比了。最后我们将头指针`newStartIndex`向后移一位。

```JavaScript
function vue2Diff(prevChildren, nextChildren, parent) {
  //...
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (oldStartNode.key === newStartNode.key) {
    //...
    } else if (oldEndNode.key === newEndNode.key) {
    //...
    } else if (oldStartNode.key === newEndNode.key) {
    //...
    } else if (oldEndNode.key === newStartNode.key) {
    //...
    } else {
      // 在旧列表中找到 和新列表头节点key 相同的节点
      let newtKey = newStartNode.key,
        oldIndex = prevChildren.findIndex(child => child.key === newKey);
      
      if (oldIndex > -1) {
        let oldNode = prevChildren[oldIndex];
        patch(oldNode, newStartNode, parent)
        parent.insertBefore(oldNode.el, oldStartNode.el)
        prevChildren[oldIndex] = undefined
      }
      newStartNode = nextChildren[++newStartIndex]
    }
  }
}
```

如果在**旧列表**中没有找到复用节点呢？很简单，直接创建一个新的节点放到最前面就可以了，然后后移头指针`newStartIndex`。

![image.png](/80fda7dc1fc7.png)

```JavaScript

function vue2Diff(prevChildren, nextChildren, parent) {
  //...
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (oldStartNode.key === newStartNode.key) {
    //...
    } else if (oldEndNode.key === newEndNode.key) {
    //...
    } else if (oldStartNode.key === newEndNode.key) {
    //...
    } else if (oldEndNode.key === newStartNode.key) {
    //...
    } else {
      // 在旧列表中找到 和新列表头节点key 相同的节点
      let newtKey = newStartNode.key,
        oldIndex = prevChildren.findIndex(child => child.key === newKey);
      
      if (oldIndex > -1) {
        let oldNode = prevChildren[oldIndex];
        patch(oldNode, newStartNode, parent)
        parent.insertBefore(oldNode.el, oldStartNode.el)
        prevChildren[oldIndex] = undefined
      } else {
      	mount(newStartNode, parent, oldStartNode.el)
      }
      newStartNode = nextChildren[++newStartIndex]
    }
  }
}
```

最后当**旧列表**遍历到`undefind`时就跳过当前节点。

```JavaScript
function vue2Diff(prevChildren, nextChildren, parent) {
  //...
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (oldStartNode === undefind) {
    	oldStartNode = prevChildren[++oldStartIndex]
    } else if (oldEndNode === undefind) {
    	oldEndNode = prevChildren[--oldEndIndex]
    } else if (oldStartNode.key === newStartNode.key) {
    //...
    } else if (oldEndNode.key === newEndNode.key) {
    //...
    } else if (oldStartNode.key === newEndNode.key) {
    //...
    } else if (oldEndNode.key === newStartNode.key) {
    //...
    } else {
    // ...
    }
  }
}
```

### 3. 添加节点

我们先来看一个例子

![image.png](/9fdf15cb6653.png)

这个例子非常简单，几次循环都是尾节点相同，尾指针一直向前移动，直到循环结束，如下图

![image.png](/88f89eb04098.png)

此时`oldEndIndex`以及小于了`oldStartIndex`，但是**新列表**中还有剩余的节点，我们只需要将剩余的节点依次插入到`oldStartNode`的`DOM`之前就可以了。为什么是插入`oldStartNode`之前呢？原因是剩余的节点在**新列表**的位置是位于`oldStartNode`之前的，如果剩余节点是在`oldStartNode`之后，`oldStartNode`就会先行对比，这个需要思考一下，其实还是与`第四步`的思路一样。

```JavaScript
function vue2Diff(prevChildren, nextChildren, parent) {
  //...
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
  // ...
  }
  if (oldEndIndex < oldStartIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      mount(nextChildren[i], parent, prevStartNode.el)
    }
  }
}
```

### 4. 移除节点

与上一小节的情况相反，当**新列表**的`newEndIndex`小于`newStartIndex`时，我们将**旧列表**剩余的节点删除即可。这里我们需要注意，**旧列表**的`undefind`。在第二小节中我们提到过，当头尾节点都不相同时，我们会去**旧列表**中找**新列表**的第一个节点，移动完DOM节点后，将**旧列表**的那个节点改为`undefind`。所以我们在最后的删除时，需要注意这些`undefind`，遇到的话跳过当前循环即可。

```JavaScript
function vue2Diff(prevChildren, nextChildren, parent) {
  //...
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
  // ...
  }
  if (oldEndIndex < oldStartIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      mount(nextChildren[i], parent, prevStartNode.el)
    }
  } else if (newEndIndex < newStartIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      if (prevChildren[i]) {
        partent.removeChild(prevChildren[i].el)
      }
    }
  }
}
```

### 5. 小结

至此`双端比较`全部完成，以下是全部代码。

```JavaScript
function vue2diff(prevChildren, nextChildren, parent) {
  let oldStartIndex = 0,
    newStartIndex = 0,
    oldStartIndex = prevChildren.length - 1,
    newStartIndex = nextChildren.length - 1,
    oldStartNode = prevChildren[oldStartIndex],
    oldEndNode = prevChildren[oldStartIndex],
    newStartNode = nextChildren[newStartIndex],
    newEndNode = nextChildren[newStartIndex];
  while (oldStartIndex <= oldStartIndex && newStartIndex <= newStartIndex) {
    if (oldStartNode === undefined) {
      oldStartNode = prevChildren[++oldStartIndex]
    } else if (oldEndNode === undefined) {
      oldEndNode = prevChildren[--oldStartIndex]
    } else if (oldStartNode.key === newStartNode.key) {
      patch(oldStartNode, newStartNode, parent)

      oldStartIndex++
      newStartIndex++
      oldStartNode = prevChildren[oldStartIndex]
      newStartNode = nextChildren[newStartIndex]
    } else if (oldEndNode.key === newEndNode.key) {
      patch(oldEndNode, newEndNode, parent)

      oldStartIndex--
      newStartIndex--
      oldEndNode = prevChildren[oldStartIndex]
      newEndNode = nextChildren[newStartIndex]
    } else if (oldStartNode.key === newEndNode.key) {
      patch(oldStartNode, newEndNode, parent)
      parent.insertBefore(oldStartNode.el, oldEndNode.el.nextSibling)
      oldStartIndex++
      newStartIndex--
      oldStartNode = prevChildren[oldStartIndex]
      newEndNode = nextChildren[newStartIndex]
    } else if (oldEndNode.key === newStartNode.key) {
      patch(oldEndNode, newStartNode, parent)
      parent.insertBefore(oldEndNode.el, oldStartNode.el)
      oldStartIndex--
      newStartIndex++
      oldEndNode = prevChildren[oldStartIndex]
      newStartNode = nextChildren[newStartIndex]
    } else {
      let newKey = newStartNode.key,
        oldIndex = prevChildren.findIndex(child => child && (child.key === newKey));
      if (oldIndex === -1) {
        mount(newStartNode, parent, oldStartNode.el)
      } else {
        let prevNode = prevChildren[oldIndex]
        patch(prevNode, newStartNode, parent)
        parent.insertBefore(prevNode.el, oldStartNode.el)
        prevChildren[oldIndex] = undefined
      }
      newStartIndex++
      newStartNode = nextChildren[newStartIndex]
    }
  }
  if (newStartIndex > newStartIndex) {
    while (oldStartIndex <= oldStartIndex) {
      if (!prevChildren[oldStartIndex]) {
        oldStartIndex++
        continue
      }
      parent.removeChild(prevChildren[oldStartIndex++].el)
    }
  } else if (oldStartIndex > oldStartIndex) {
    while (newStartIndex <= newStartIndex) {
      mount(nextChildren[newStartIndex++], parent, oldStartNode.el)
    }
  }
}
```

## vue3 diff —  快速Diff

## 小结

快速 Diff 算法在实测中性能最优。它借鉴了文本 Diff 中的预处理 思路，先处理新旧两组子节点中相同的前置节点和相同的后置节点。 当前置节点和后置节点全部处理完毕后，如果无法简单地通过挂载新 节点或者卸载已经不存在的节点来完成更新，则需要根据节点的索引 关系，构造出一个最长递增子序列。最长递增子序列所指向的节点即 为不需要移动的节点。

## 参考

- [聊聊 Vue 的双端 diff 算法](https://juejin.cn/post/7114177684434845727)

- [Vue2.X Diff —— 双端比较](https://juejin.cn/post/6919376064833667080)

- [Vue2 diff 算法图解](https://juejin.cn/post/7211132346255638584)

- [[源码共读]史上最详细的 Vue 3 渲染过程与 diff 图解](https://juejin.cn/post/7217693476494262329)




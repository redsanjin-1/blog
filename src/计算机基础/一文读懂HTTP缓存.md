
# 前端缓存

前端缓存可分为两大类：http缓存和浏览器缓存。我们今天重点讲的是http缓存，所以关于浏览器缓存大家自行去查阅。下面这张图是前端缓存的一个大致知识点：

![86b5-beef359518b2.webp](https://ik.imagekit.io/redsanjin/blog/beef359518b2.webp)

# 一、什么是HTTP缓存 ？

http缓存指的是: 当客户端向服务器请求资源时，会先抵达浏览器缓存，如果浏览器有“要请求资源”的副本，就可以直接从浏览器缓存中提取而不是从原始服务器中提取这个资源。

常见的http缓存只能缓存get请求响应的资源，对于其他类型的响应则无能为力，所以后续说的请求缓存都是指GET请求。

http缓存都是从第二次请求开始的。第一次请求资源时，服务器返回资源，并在respone header头中回传资源的缓存参数；第二次请求时，浏览器判断这些请求参数，命中强缓存就直接200，否则就把请求参数加到request header头中传给服务器，看是否命中协商缓存，命中则返回304，否则服务器会返回新的资源。

**1、http缓存的分类：**根据是否需要重新向服务器发起请求来分类，可分为(强制缓存，协商缓存) 根据是否可以被单个或者多个用户使用来分类，可分为(私有缓存，共享缓存) 强制缓存如果生效，不需要再和服务器发生交互，而协商缓存不管是否生效，都需要与服务端发生交互。下面是强制缓存和协商缓存的一些对比：

![4f45b346b66e.webp](https://ik.imagekit.io/redsanjin/blog/4f45b346b66e.webp)

**1.1、强制缓存**强制缓存在缓存数据未失效的情况下（即Cache-Control的max-age没有过期或者Expires的缓存时间没有过期），那么就会直接使用浏览器的缓存数据，不会再向服务器发送任何请求。强制缓存生效时，http状态码为200。这种方式页面的加载速度是最快的，性能也是很好的，但是在这期间，如果服务器端的资源修改了，页面上是拿不到的，因为它不会再向服务器发请求了。这种情况就是我们在开发种经常遇到的，比如你修改了页面上的某个样式，在页面上刷新了但没有生效，因为走的是强缓存，所以Ctrl + F5一顿操作之后就好了。 跟强制缓存相关的header头属性有（Pragma/Cache-Control/Expires）

![e4fe8315395d.webp](https://ik.imagekit.io/redsanjin/blog/e4fe8315395d.webp)

这个Pragma和Cache-Control共存时的优先级问题还有点异议，我在不同的文章里发现：有的说Pragma的优先级更高，有的说Cache-Control高。为了搞清楚这个问题，我决定动手操作一波，首先我用nodejs搭建后台服务器，目的是设置缓存参数，具体代码如下：

![e114dbeae14f.webp](https://ik.imagekit.io/redsanjin/blog/e114dbeae14f.webp)

![f09574ed01d8.webp](https://ik.imagekit.io/redsanjin/blog/f09574ed01d8.webp)

第二次访问时：

![8cb73803e95c.webp](https://ik.imagekit.io/redsanjin/blog/8cb73803e95c.webp)

![7f7d3d80f023.webp](https://ik.imagekit.io/redsanjin/blog/7f7d3d80f023.webp)

最终得出结论：Pragma和Cache-control共存时，Pragma的优先级是比Cache-Control高的。

**注意：**在chrome浏览器中返回的200状态会有两种情况：1、from memory cache(从内存中获取/一般缓存更新频率较高的js、图片、字体等资源)

2、from disk cache(从磁盘中获取/一般缓存更新频率较低的js、css等资源)

这两种情况是chrome自身的一种缓存策略，这也是为什么chrome浏览器响应的快的原因。其他浏览返回的是已缓存状态，没有标识是从哪获取的缓存。

**1.2、协商缓存**当第一次请求时服务器返回的响应头中没有Cache-Control和Expires或者Cache-Control和Expires过期还或者它的属性设置为no-cache时(即不走强缓存)，那么浏览器第二次请求时就会与服务器进行协商，与服务器端对比判断资源是否进行了修改更新。如果服务器端的资源没有修改，那么就会返回304状态码，告诉浏览器可以使用缓存中的数据，这样就减少了服务器的数据传输压力。如果数据有更新就会返回200状态码，服务器就会返回更新后的资源并且将缓存信息一起返回。跟协商缓存相关的header头属性有（ETag/If-Not-Match 、Last-Modified/If-Modified-Since）请求头和响应头需要成对出现

![da2ae6b4dd29.webp](https://ik.imagekit.io/redsanjin/blog/da2ae6b4dd29.webp)

协商缓存的执行流程是这样的：当浏览器第一次向服务器发送请求时，会在响应头中返回协商缓存的头属性：ETag和Last-Modified,其中ETag返回的是一个hash值，Last-Modified返回的是GMT格式的最后修改时间。然后浏览器在第二次发送请求的时候，会在请求头中带上与ETag对应的If-Not-Match，其值就是响应头中返回的ETag的值，Last-Modified对应的If-Modified-Since。服务器在接收到这两个参数后会做比较，如果返回的是304状态码，则说明请求的资源没有修改，浏览器可以直接在缓存中取数据，否则，服务器会直接返回数据。

![6a51a2570c57.webp](https://ik.imagekit.io/redsanjin/blog/6a51a2570c57.webp)

![2251c0b31c34.webp](https://ik.imagekit.io/redsanjin/blog/2251c0b31c34.webp)

**注意：**ETag/If-Not-Match是在HTTP/1.1出现的，主要是解决以下问题：

(1)、Last-Modified标注的最后修改只能精确到秒级，如果某些文件在1秒钟以内，被修改多次的话，它将不能准确标注文件的修改时间

(2)、如果某些文件被修改了，但是内容并没有任何变化，而Last-Modified却改变了，导致文件没法使用缓存

(3)、有可能存在服务器没有准确获取文件修改时间，或者与代理服务器时间不一致等情形

**1.3、私有缓存（浏览器级缓存）**私有缓存只能用于单独的用户：Cache-Control: Private

**1.4、共享缓存（代理级缓存）**共享缓存可以被多个用户使用: Cache-Control: Public

# 二、为什么要使用HTTP缓存 ？

根据上面的学习可发现使用缓存的好处主要有以下几点：

1. 减少了冗余的数据传输，节省了网费。

2. 缓解了服务器的压力， 大大提高了网站的性能

3. 加快了客户端加载网页的速度

# 三、如何使用HTTP缓存 ？

一般需要缓存的资源有html页面和其他静态资源：1、html页面缓存的设置主要是在标签中嵌入标签，这种方式只对页面有效，对页面上的资源无效1.1、html页面禁用缓存的设置如下：

<meta http-equiv="pragma" content="no-cache">// 仅有IE浏览器才识别的标签，不一定会在请求字段加上Pragma，但的确会让当前页面每次都发新请求<meta http-equiv="cache-control" content="no-cache">// 其他主流浏览器识别的标签<meta http-equiv="expires" content="0">// 仅有IE浏览器才识别的标签，该方式仅仅作为知会IE缓存时间的标记，你并不能在请求或响应报文中找到Expires字段

1.2、html设置缓存如下：

<meta http-equiv="Cache-Control" content="max-age=7200" />// 其他主流浏览器识别的标签<meta http-equiv="Expires" content="Mon, 20 Aug 2018 23:00:00 GMT" />// 仅有IE浏览器才识别的标签

2、静态资源的缓存一般是在web服务器上配置的，常用的web服务器有：nginx、apache。具体的配置这里不做详细介绍，大家自行查阅。

3、不想使用缓存的几种方式：3.1、Ctrl + F5强制刷新，都会直接向服务器提取数据。3.2、按F5刷新或浏览器的刷新按钮，默认加上Cache-Control：max-age=0，即会走协商缓存。3.2、在IE浏览器下不想使用缓存的做法：打开IE，点击工具栏上的工具->Internet选项->常规->浏览历史记录 设置. 选择“从不”，然后保存。最后点击“删除”把Internet临时文件都删掉 （IE缓存的文件就是Internet临时文件）。3.3、还有就是上面1、2中禁用缓存的做法3.4、对于其他浏览器也都有清除缓存的办法

# 四、HTTP缓存的几个注意点

1、强缓存情况下，只要缓存还没过期，就会直接从缓存中取数据，就算服务器端有数据变化，也不会从服务器端获取了，这样就无法获取到修改后的数据。决解的办法有：在修改后的资源加上随机数,确保不会从缓存中取。

例如：[http://www.kimshare.club/kim/common.css?v=22324432](https://links.jianshu.com/go?to=http%3A%2F%2Fwww.kimshare.club%2Fkim%2Fcommon.css%3Fv%3D22324432)[http://www.kimshare.club/kim/common.2312331.css](https://links.jianshu.com/go?to=http%3A%2F%2Fwww.kimshare.club%2Fkim%2Fcommon.2312331.css)

2、尽量减少304的请求，因为我们知道，协商缓存每次都会与后台服务器进行交互，所以性能上不是很好。从性能上来看尽量多使用强缓存。

3、在Firefox浏览器下，使用Cache-Control: no-cache 是不生效的，其识别的是no-store。这样能达到其他浏览器使用Cache-Control: no-cache的效果。所以为了兼容Firefox浏览器，经常会写成Cache-Control: no-cache，no-store。

4、与缓存相关的几个header属性有：Vary、Date/Age。**Vary：**vary本身是“变化”的意思，而在http报文中更趋于是“vary from”（与。。。不同）的含义，它表示服务端会以什么基准字段来区分、筛选缓存版本。在服务端有着这么一个地址，如果是IE用户则返回针对IE开发的内容，否则返回另一个主流浏览器版本的内容。格式：Vary: User-Agent知会代理服务器需要以 User-Agent 这个请求首部字段来区别缓存版本，防止传递给客户端的缓存不正确。

**Date/Age：**响应报文中的 Date 和 Age 字段：区分其收到的资源是否命中了代理服务器的缓存。Date 理所当然是原服务器发送该资源响应报文的时间（GMT格式），如果你发现 Date 的时间与“当前时间”差别较大，或者连续F5刷新发现 Date 的值都没变化，则说明你当前请求是命中了代理服务器的缓存。Age 也是响应报文中的首部字段，它表示该文件在代理服务器中存在的时间（秒），如文件被修改或替换，Age会重新由0开始累计。

# 五、参考

[原文](https://www.jianshu.com/p/227cee9c8d15)


# JS一定要面向对象吗
[vue关于是否使用class语法的讨论](https://github.com/vuejs/vue/issues/2371#issuecomment-284052430)

 "会面向对象 JS" 表示自己 js 能力高. **但我认为不是**. 举一个真实例子, 公司曾招的一个新人, 书写了如下代码. 代码背景是: 每当页面添加某特定元素时, processElement 函数负责初始化这个元素. 页面可添加多个该元素, 也可以在页面运行期添加该元素, 新添加的元素都会由 processElement 函数初始化.

```js
/*
 * @description 初始化每个元素
 * @param {jQuery object} $ele - 需要初始化的元素
 */
function processElement($ele) {
  var ShareTip = function() {}
  ShareTip.prototype.sharetosina = function(tit, srce, kpic) {
    //...
  }
  ShareTip.prototype.sharetoqqzone = function(tit, srce, kpic) {
    //...
  }

  var tit = $ele.attr("data-tit");
  var srce = $ele.attr("data-srce");
  var kpic = $ele.attr("data-kpic");
  var share1 = new ShareTip();
  share1.sharetoqqzone(tit, srce, kpic);
  var share2 = new ShareTip();
  share2.sharetosina(tit, srce, kpic);
}
```
从效果上来说, 与下方代码相同
```js
function sharetosina(tit, srce, kpic) {
  //...
}

function sharetoqqzone(tit, srce, kpic) {
  //...
}

/*
 * @description 初始化每个元素
 * @param {jQuery object} $ele - 需要初始化的元素
 */
function processElement($ele) {
  var tit = $ele.attr("data-tit");
  var srce = $ele.attr("data-srce");
  var kpic = $ele.attr("data-kpic");
  sharetoqqzone(tit, srce, kpic);
  sharetosina(tit, srce, kpic);
}
```

是不是在硬凹. 每次 process 一个元素, 就创建一个类, 并实例化一个. **从这段代码看出的不是他会 js 面向对象, 而是他什么也不会.**

我们真的有必要使用面向对象吗? 我认为不是, 这里指的面向对象是面向对象语法. js 面向对象其实是可以使用函数来模拟的. 而面向对象, 其实是一种思考方式. 是开发者如何看待整个程序. 

我写的大多数页面并不需要使用面向对象, 使用函数即可, 对需要复用的变量放在闭包即可. 通过实践监听回调等方式将页面需要的逻辑组织起来. 通常一个 app 对象就可以了.

我遇到的认为特别合适使用面向对象的思考方式的就是游戏, 游戏实体往往数量多且相似, 但是又略有不同. 这个不同可能体现在参数上, 也可能是在功能上. 这时候使用面向对象的方式来思考问题我觉得比较舒服. 面向对象的优势在于继承的思想.

这里给出一个标准的面向对象写法:

如果仅是代码复用或是函数复用的角度, 没必要纠结在使用函数闭包还是使用面向对象的写法. 通常在面对实现特定页面逻辑时, 非游戏页面, 我的习惯是使用函数即可. 当面对的问题是写一个通用组件, 并且这个组件在页面可能存在 n 个时, 使用面向对象的思考方式也不错.

另外就是, 我们要融入现有的代码, 指的是, 作为开发者, 我们经常是在别人现有代码基础上修改. 这时候我的建议是, 如果不是重写, 原页面用面向对象, 那你就用面向对象, 反之你就用函数. 面向对象只是一种写法, 关键的是跟随原作的思路解决问题. 

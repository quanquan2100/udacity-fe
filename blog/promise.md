# promise 编程思考

随着 web 技术的发展, 网页变得越来越复杂, 表现力更强, 功能也更丰富. 

其中非常重要的功能就是, ajax. 客户端获取数据的能力. 通常我们制作的网页都是为了实现某些功能. 这个个功能可能只是展示信息, 也可能是引导用户操作, 获取用户的信息. 这些功能都离不开 ajax. 然而这带来了一个问题, 网络传输常常需要花费大量的时间, 因此引出了回调函数来解决这个问题.

回调函数解决的问题, 正是这类需要 idle 时间不确定并可能很久的操作. 这里有几个问题.

一个是当多重嵌套回调时, 多重回调函数书写的复杂性. 书写的复杂性并不难解决.

```js
// 本示例还没考虑错误回调的处理
asynFuc1(function(){
	asynFuc2(function(){
		asynFuc3(function(){
			...
		});
	});
});
```

一个是当网页复杂度增加时, 事情并不是那么简单. 有的时候需要多个异步函数的结果都返回时, 回调才执行. 甚至其中的顺序更加复杂. 我们在控制其执行时, 很容易发生错误. 或者降低其复杂度, 用连锁的方式较低的效率一个一个执行

```js
asynFuc1(callback);
asynFuc2(callback);

var condition1 = false,
  condition2 = false;
function callback(data){
	if (data == x) {
		condition1 = true;
	}
	if (data == y) {
		condition = true;
	}
	if (!condition1 || !condition2) { // 如果不是两个条件都满足, 则不执行后续代码
		return;
	}
	do something;
}

//或者牺牲性能. 将原本可以并行执行的代码变成依赖执行
asynFuc1(function(){
	asynFuc2(callback);
});
```

还有错误处理的问题. 当嵌套回调时, 我们到底在哪一层进行错误处理.

以上是针对回调函数的问题. 除了回调的方式, 我们还有一个方式来处理异步的问题. 就是事件监听. 比如图片已加载, ajax 可以发出, 获取事件成功或获取事件失败. 事件监听的性能问题我并没有研究. 但是这里有个问题, 就是你在添加事件监听时, 这个事件是不是已经发出了. 当我们监听图片已加载事件时, 图片是不是已经加载完毕了. 如果已经加载完毕, 那么这个事件无论如何是不会被监听到的. 因此, 就必须将代码写为

```
if (img.hasload) { // 图片已经加载, 则直接执行代码
	do something;
} else { // 否则则执行回调
	img.onload(function(){
	do something;
	});
}
```

如果一个函数执行后没有保存是否执行成功的结果, 那么代码漏洞将更大.


promise 的出现, 对开发者的思考方式也产生了很大影响. 正式因为传统方式必须清晰, 什么时候是异步, 什么时候需要回调. 而使用 promise 可以忘掉这一切. 按照同步的思维模式, 处理代码逻辑


使用promise执行的方法, 一定是异步执行的. 即使你的函数中并没有异步代码, 每个then也是异步执行.

## 如何使用 promise
使用 promise 不仅是学习语法, 而是转换思考方式. promise 的思考方式是代码的所有方法或者说操作都有成功和失败两个状态. 显示的思考成功和失败, 也就是一个功能函数有三个要素: 1. 功能代码; 2. 成功; 3. 失败.

```js
function xxx() {
	do something...
	if (条件) {
		resolve(); // 成功
	} else {
		reject(); // 失败
	}
}
```
函数必须以成功或者失败结束. 返回值不再以 return 的形式回传

这个思考方式具体带来了什么区别. 看上方代码可能并感受不出来. 举个例子, 需要实现一个功能函数切换元素的显示状态:

```js
function changeState($ele) {
	if ($ele.css("display") === "none") {
		$ele.css("display", block);
	} else {
		$ele.css("display", none);
	}
}
```
函数并没有问题, 这是非promise处理问题的思考方法. 而一旦使用 promise 思考方法, 我们会显示的考虑这个函数执行成功和失败. 所以代码处理


```js
function changeState($ele) {
	if ($ele.css("display") === "none") {
		$ele.css("display", block);
	} else {
		$ele.css("display", none);
	}
	success(); // 明确指出成功了, 并且这个函数并不会失败, 不是没考虑失败的处理, 而是考虑了, 没有失败的状态
}

// 使用 promise 真实语法为
function changeState($ele) {
	return new Promise(function(resolve, reject) {
		if ($ele.css("display") === "none") {
			$ele.css("display", block);
		} else {
			$ele.css("display", none);
		}
		resolve(); // 明确指出成功了, 并且这个函数并不会失败, 不是没考虑失败的处理, 而是考虑了, 没有失败的状态
	});
}
```

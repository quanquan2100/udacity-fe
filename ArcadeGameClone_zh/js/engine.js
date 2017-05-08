/* Engine.js
* 这个文件提供了游戏循环玩耍的功能（更新敌人和渲染）
 * 在屏幕上画出出事的游戏面板，然后调用玩家和敌人对象的 update / render 函数（在 app.js 中定义的）
 *
 * 一个游戏引擎的工作过程就是不停的绘制整个游戏屏幕，和小时候你们做的 flipbook 有点像。当
 * 玩家在屏幕上移动的时候，看上去就是图片在移动或者被重绘。但这都是表面现象。实际上是整个屏幕
 * 被重绘导致这样的动画产生的假象

 * 这个引擎是可以通过 Engine 变量公开访问的，而且它也让 canvas context (ctx) 对象也可以
 * 公开访问，以此使编写app.js的时候更加容易
 */

var Engine = (function(global) {
  /* 实现定义我们会在这个作用于用到的变量
   * 创建 canvas 元素，拿到对应的 2D 上下文
   * 设置 canvas 元素的高/宽 然后添加到dom中
   */
  var doc = global.document,
    win = global.window,
    canvas = doc.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    lastTime;

  canvas.width = 505;
  canvas.height = 606;
  doc.body.appendChild(canvas);

  ctx.strokeStyle = "black";
    /* 这个函数是整个游戏的主入口，负责适当的调用 update / render 函数 */
  function main() {
    /* 如果你想要更平滑的动画过度就需要获取时间间隙。因为每个人的电脑处理指令的
     * 速度是不一样的，我们需要一个对每个人都一样的常数（而不管他们的电脑有多快）
     * 就问你屌不屌！
     */
    var now = Date.now(),
      dt = (now - lastTime) / 1000.0;

    /* 调用我们的 update / render 函数， 传递事件间隙给 update 函数因为这样
     * 可以使动画更加顺畅。
     */
    game.update(dt);
    game.render(dt);

    /* 设置我们的 lastTime 变量，它会被用来决定 main 函数下次被调用的事件。 */
    lastTime = now;

    /* 在浏览准备好调用重绘下一个帧的时候，用浏览器的 requestAnimationFrame 函数
     * 来调用这个函数
     */
    win.requestAnimationFrame(main);
  }

  /* 这个函数调用一些初始化工作，特别是设置游戏必须的 lastTime 变量，这些工作只用
   * 做一次就够了
   */
  function init() {
    reset();
    lastTime = Date.now();
    main();
  }

  /* 这个函数现在没干任何事，但是这会是一个好地方让你来处理游戏重置的逻辑。可能是一个
   * 从新开始游戏的按钮，也可以是一个游戏结束的画面，或者其它类似的设计。它只会被 init()
   * 函数调用一次。
   */
  function reset() {
    // 空操作
    // 初始化 game 的原始配置
    game.state = GAME_SETROLE;
    game.level = LEVEL_EASY;
    game.role = "images/char-boy.png";
  }

  /* 紧接着我们来加载我们知道的需要来绘制我们游戏关卡的图片。然后把 init 方法设置为回调函数。
   * 那么党这些图片都已经加载完毕的时候游戏就会开始。
   */
  Resources.load([
    'images/stone-block.png',
    'images/water-block.png',
    'images/grass-block.png',
    'images/enemy-bug.png',
    'images/char-boy.png',
    'images/char-cat-girl.png',
    'images/char-pink-girl.png',
    'images/char-horn-girl.png',
    'images/char-princess-girl.png',
    'images/Selector.png',
    "sounds/anniu-kehuan1.mp3",
    "sounds/Generic-Click-Digital-12.mp3",
    "sounds/anniu-katong7.mp3",
    "sounds/anniu-shitou2.mp3",
    "sounds/success.mp3",
    "sounds/fail.mp3",
    "images/Gem-Orange.png",
    "images/Gem-Green.png",
    "images/Gem-Blue.png",
    "images/Heart.png",
    "images/Rock.png"
  ]);
  Resources.onReady(init);

  /* 把 canvas 上下文对象绑定在 global 全局变量上（在浏览器运行的时候就是 window
   * 对象。从而开发者就可以在他们的app.js文件里面更容易的使用它。
   */
  global.ctx = ctx;
})(this);
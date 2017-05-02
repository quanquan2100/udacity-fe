var COL = 101,
  ROW = 83;
var MAXX = 4 * COL,
  MAXY = 5 * ROW,
  MINX = 0,
  MINY = 0;

var game = (function() {
  var player = undefined,
    allEnemies = [];

  function creatEnemy() {
    allEnemies.push(new Enemy());
  }

  function clearEnemies() {
    for (var i = 0; i < allEnemies.length; i++) {
      if (allEnemies[i].state !== 0) {
        break;
      }
    }
    allEnemies.splice(0, i);
  }

  function loop(fuc, time) {
    if (game.state !== 1) {
      return;
    }
    var rand = Math.round(Math.random() * (time - 500)) + 500;
    setTimeout(function() {
      fuc();
      loop(fuc, time);
    }, rand);
  }
  /* 这个函数做了一些游戏的初始渲染，然后调用 renderEntities 函数。记住，这个函数
   * 在每个游戏的时间间隙都会被调用一次（或者说游戏引擎的每个循环），因为这就是游戏
   * 怎么工作的，他们就像是那种每一页上都画着不同画儿的书，快速翻动的时候就会出现是
   * 动画的幻觉，但是实际上，他们只是不停的在重绘整个屏幕。
   */
  function render() {
    /* 这个数组保存着游戏关卡的特有的行对应的图片相对路径。 */
    var rowImages = [
        'images/water-block.png', // 这一行是河。
        'images/stone-block.png', // 第一行石头
        'images/stone-block.png', // 第二行石头
        'images/stone-block.png', // 第三行石头
        'images/grass-block.png', // 第一行草地
        'images/grass-block.png' // 第二行草地
      ],
      numRows = 6,
      numCols = 5,
      row, col;

    // 补齐顶部留白部分
    ctx.beginPath();
    ctx.rect(0, 0, 505, 50);
    ctx.fillStyle = "white";
    ctx.fill();

    /* 便利我们上面定义的行和列，用 rowImages 数组，在各自的各个位置绘制正确的图片 */
    for (row = 0; row < numRows; row++) {
      for (col = 0; col < numCols; col++) {
        /* 这个 canvas 上下文的 drawImage 函数需要三个参数，第一个是需要绘制的图片
         * 第二个和第三个分别是起始点的x和y坐标。我们用我们事先写好的资源管理工具来获取
         * 我们需要的图片，这样我们可以享受缓存图片的好处，因为我们会反复的用到这些图片
         */
        ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
      }
    }

    renderEntities();
  }

  /* 这个函数会在每个时间间隙被 render 函数调用。他的目的是分别调用你在 enemy 和 player
   * 对象中定义的 render 方法。
   */
  function renderEntities() {
    /* 遍历在 allEnemies 数组中存放的作于对象然后调用你事先定义的 render 函数 */
    allEnemies.forEach(function(enemy) {
      enemy.render();
    });
    if (player) {
      player.render();
    }
  }

  /* 这个函数被 main 函数（我们的游戏主循环）调用，它本身调用所有的需要更新游戏角色
   * 数据的函数，取决于你怎样实现碰撞检测（意思是如何检测两个角色占据了同一个位置，
   * 比如你的角色死的时候），你可能需要在这里调用一个额外的函数。现在我们已经把这里
   * 注释了，你可以在这里实现，也可以在 app.js 对应的角色类里面实现。
   */
  function update(dt) {
    // 更新各个游戏实体
    updateEntities(dt);

    // 碰撞检测
    checkCollisions();
  }

  /* 这个函数被 update 函数调用，它本身调用所有的需要更新游戏角色
   * 碰撞检测函数（意思是如何检测两个角色占据了同一个位置，
   * 比如你的角色死的时候），你可能需要在这里调用一个额外的函数。现在我们已经把这里
   * 注释了，你可以在这里实现，也可以在 app.js 对应的角色类里面实现。
   */
  function checkCollisions() {
    var dx;
    // 如果玩家死亡则不进行碰撞检测
    // if (player.state === 0) {
    //   return;
    // }
    for (var i = allEnemies.length - 1; i >= 0; i--) {
      if (allEnemies[i].state === 0 || allEnemies[i].y !== player.y) {
        continue;
      }
      dx = allEnemies[i].x - player.x;
      if (dx > -65 && dx < 59) {
        player.death();
        console.log("碰撞");
      }
    }
  }

  /* 这个函数会遍历在 app.js 定义的存放所有敌人实例的数组，并且调用他们的 update()
   * 函数，然后，它会调用玩家对象的 update 方法，最后这个函数被 update 函数调用。
   * 这些更新函数应该只聚焦于更新和对象相关的数据/属性。把重绘的工作交给 render 函数。
   */
  function updateEntities(dt) {
    allEnemies.forEach(function(enemy) {
      // debugger;
      enemy.update(dt);
    });
    if (player) {
      player.update();
      
    }
  }

  return {
    state: 0,
    level: 0,
    role: "images/char-boy.png",
    getPlyer: function() {
      return player;
    },
    getAllEnemies: function() {
      return allEnemies;
    },
    begin: function() {
      // 现在实例化你的所有对象
      // 把所有敌人的对象都放进一个叫 allEnemies 的数组里面
      // 把玩家对象放进一个叫 player 的变量里面
      this.state = 1;
      player = new Player(this.role);
      allEnemies = [];
      loop(function() {
        clearEnemies();
        creatEnemy();
      }, 5000);
    },
    render: function() {
      render();
    },
    update: function(dt) {
      update(dt);
    }
  };
}());

// 这是我们的玩家要躲避的敌人 
var Enemy = function(row, col, v) {
  // 要应用到每个敌人的实例的变量写在这里
  // 我们已经提供了一个来帮助你实现更多

  // 敌人的图片或者雪碧图，用一个我们提供的工具函数来轻松的加载文件
  this.x = col ? col * COL : -1 * COL;
  this.y = row ? row * ROW : (Math.round(Math.random() * 2) + 1) * ROW;
  this.v = v || Math.round(Math.random() * 100) + 40;
  // this.v = 0;
  this.state = 1; // 1: 该 enemy 处于屏幕中; 0: 该 enemy 处于屏幕外, 可删除
  this.sprite = 'images/enemy-bug.png';
};

// 此为游戏必须的函数，用来更新敌人的位置
// 参数: dt ，表示时间间隙
Enemy.prototype.update = function(dt) {
  // 你应该给每一次的移动都乘以 dt 参数，以此来保证游戏在所有的电脑上
  // 都是以同样的速度运行的
  this.x = this.x + this.v * dt;
  // 检测该对象已经离开屏幕
  // if (this.x < -1 * COL || this.x > (MAXX + COL)) { // 单向活动暂只需要一边的边界判断即可
  if (this.x > (MAXX + COL)) {
    this.state = 0;
  }
};

// 此为游戏必须的函数，用来在屏幕上画出敌人，
Enemy.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// 现在实现你自己的玩家类
// 这个类需要一个 update() 函数， render() 函数和一个 handleInput()函数
var Player = function(role) {
  // 敌人的图片或者雪碧图，用一个我们提供的工具函数来轻松的加载文件
  this.x = 2 * COL;
  this.y = 5 * ROW;
  this.state = 1;
  this.sprite = role || "images/char-boy.png";
}

// 此为游戏必须的函数，用来更新玩家的位置
// 参数: dt ，表示时间间隙
Player.prototype.update = function(dt) {
  // 你应该给每一次的移动都乘以 dt 参数，以此来保证游戏在所有的电脑上
  // 都是以同样的速度运行的
};

// 此为游戏必须的函数，用来在屏幕上画出玩家
Player.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.death = function() {
  this.state = 0;
};

// 此为游戏必须的函数，用来控制玩家移动
Player.prototype.handleInput = function(key) {
  var newX = this.x,
    newY = this.y;
  switch (key) {
    case "left":
      newX = newX - COL;
      break;
    case "up":
      newY = newY - ROW;
      break;
    case "right":
      newX = newX + COL;
      break;
    case "down":
      newY = newY + ROW;
      break;
  }
  if (newX < 0 || newX > MAXX || newY < 0 || newY > MAXY) {
    // TODO: 超出边界声音效果
    console.log("超出边界");
  } else {
    this.x = newX;
    this.y = newY;
  }
  // TODO: 移动声音效果
};



// 这段代码监听游戏玩家的键盘点击事件并且代表将按键的关键数字送到 Play.handleInput()
// 方法里面。你不需要再更改这段代码了。
document.addEventListener('keyup', function(e) {
  var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  if (player) {
    player.handleInput(allowedKeys[e.keyCode]);
  }
});
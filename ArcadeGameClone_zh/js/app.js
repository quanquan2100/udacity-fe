var COL = 101,
  ROW = 83;
// 游戏边界值常量
var MAXX = 4 * COL,
  MAXY = 5 * ROW,
  MINX = 0,
  MINY = 0;

// 游戏状态常量
var GAME_SETTING = 0,
  GAME_READY = 1,
  GAME_WIN = 3,
  GAME_BEGIN = 2,
  GAME_FAIL = 4;

// 游戏难度常量
var LEVEL_EASY = 0,
  LEVEL_HARD = 1;

var game = (function() {
  var readyTime = null;
  var player = undefined,
    allEnemies = [];
  var role = [{
    name: "images/char-cat-girl.png",
    x: 0 * 101,
    y: 4 * 83
  }, {
    name: "images/char-pink-girl.png",
    x: 1 * 101,
    y: 4 * 83
  }, {
    name: "images/char-boy.png",
    x: 2 * 101,
    y: 4 * 83
  }, {
    name: "images/char-horn-girl.png",
    x: 3 * 101,
    y: 4 * 83
  }, {
    name: "images/char-princess-girl.png",
    x: 4 * 101,
    y: 4 * 83
  }];

  // 这个变量保存了不同难度的设置
  // TODO: 实现难度选择功能
  var level = [{
    rowImages: [ /* 这个数组保存着游戏关卡的特有的行对应的图片相对路径。 */
      'images/water-block.png', // 这一行是河。
      'images/stone-block.png', // 第一行石头
      'images/stone-block.png', // 第二行石头
      'images/stone-block.png', // 第三行石头
      'images/grass-block.png', // 第一行草地
      'images/grass-block.png' // 第二行草地
    ],
    tRow: 3, // 敌人可选行数
    numRows: 6, // 行数
    numCols: 5, // 列数
    basicV: 70, // 敌人基础速度
    tV: 200,
    basicTime: 500, // 敌人生成的基础时间
    tTime: 1000 // 敌人生成的基础时间
  }, {
    rowImages: [ /* 这个数组保存着游戏关卡的特有的行对应的图片相对路径。 */
      'images/water-block.png', // 这一行是河。
      'images/stone-block.png', // 第一行石头
      'images/stone-block.png', // 第二行石头
      'images/stone-block.png', // 第三行石头
      'images/stone-block.png', // 第四行石头
      'images/grass-block.png' // 第一行草地
    ],
    tRow: 4,
    numRows: 6, // 行数
    numCols: 5, // 列数
    basicV: 120, // 敌人基础速度
    tV: 600,
    basicTime: 300, // 敌人生成的基础时间
    tTime: 500 // 敌人生成的基础时间
  }];

  function clearEnemies() {
    for (var i = 0; i < allEnemies.length; i++) {
      if (allEnemies[i].state !== 0) {
        break;
      }
    }
    allEnemies.splice(0, i);
  }

  function loop(fuc, basicTime, tTime) {
    if (game.state !== GAME_READY && game.state !== GAME_BEGIN) {
      return;
    }
    var rand = Math.floor(Math.random() * tTime) + basicTime;
    setTimeout(function() {
      fuc();
      loop(fuc, basicTime, tTime);
    }, rand);
  }

  /* 这个函数做了一些游戏的初始渲染，然后调用 renderEntities 函数。记住，这个函数
   * 在每个游戏的时间间隙都会被调用一次（或者说游戏引擎的每个循环），因为这就是游戏
   * 怎么工作的，他们就像是那种每一页上都画着不同画儿的书，快速翻动的时候就会出现是
   * 动画的幻觉，但是实际上，他们只是不停的在重绘整个屏幕。
   */
  function render() {}

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

  /* 这个函数被 update 函数调用，它本身调用所有的需要更新游戏角色
   * 碰撞检测函数（意思是如何检测两个角色占据了同一个位置，
   * 比如你的角色死的时候），你可能需要在这里调用一个额外的函数。现在我们已经把这里
   * 注释了，你可以在这里实现，也可以在 app.js 对应的角色类里面实现。
   */
  function checkCollisions() {
    var dx;
    for (var i = allEnemies.length - 1; i >= 0; i--) {
      if (allEnemies[i].state === 0 || allEnemies[i].y !== player.y) {
        continue;
      }
      dx = allEnemies[i].x - player.x;
      if (dx > -65 && dx < 59) {
        player.death();
      }
    }
  }

  /* 这个函数会遍历在 app.js 定义的存放所有敌人实例的数组，并且调用他们的 update()
   * 函数，然后，它会调用玩家对象的 update 方法，最后这个函数被 update 函数调用。
   * 这些更新函数应该只聚焦于更新和对象相关的数据/属性。把重绘的工作交给 render 函数。
   */
  function updateEntities(dt) {
    allEnemies.forEach(function(enemy) {
      enemy.update(dt);
    });
    if (player) {
      player.update();
    }
  }

  /* 这个函数被 render 函数调用, 用于绘制界面上的大文字
   */
  function drawBigFont(text, x, y) {
    ctx.lineWidth = 3;
    ctx.fillStyle = "#f7d74c";
    ctx.font = " 70px Impact"
    ctx.fillText(text, x, y);
    ctx.strokeText(text, x, y);
  }

  // 这个函数被 render 函数调用, 用于绘制界面上的小文字
  function drawSmallFont(text, x, y) {
    ctx.lineWidth = 2;
    ctx.font = " 30px Impact"
    ctx.fillStyle = "#dadad0";
    ctx.fillText(text, x, y);
    ctx.strokeText(text, x, y);
  }

  return {
    state: GAME_SETTING,
    level: LEVEL_EASY,
    role: "images/char-boy.png",
    getPlyer: function() {
      if (player) {
        return player;
      } else {
        return false;
      }
    },
    getAllEnemies: function() {
      return allEnemies;
    },
    creatEnemy: function() {
      var row = (Math.floor(Math.random() * level[this.level].tRow) + 1) * ROW;
      var v = Math.floor(Math.random() * level[this.level].tV) + level[this.level].basicV;
      allEnemies.push(new Enemy(row, (-1 * COL), v));
    },
    start: function() {
      // 进入游戏准备阶段
      // 准备音乐, 准备期是为了让敌人有时间占据游戏画面, 此时不可操控玩家
      var self = this;
      Resources.get("sounds/Generic-Click-Digital-12.mp3").play();
      this.state = GAME_READY;
      readyTime = 3999;

      // 现在实例化所有对象
      // 所有敌人的对象都放进一个叫 allEnemies 的数组里面
      // 玩家对象放进一个叫 player 的变量里面
      player = new Player(this.role);

      allEnemies = [];
      self.creatEnemy();
      self.creatEnemy();
      self.creatEnemy();
      loop(function() {
        clearEnemies(); // 清除废旧 enemy
        self.creatEnemy(); // 创建新 enemy
      }, level[this.level].basicTime, level[this.level].tTime);
    },
    fail: function() {
      this.state = GAME_FAIL;
      Resources.get("sounds/fail.mp3").play();
    },
    win: function() {
      this.state = GAME_WIN;
      Resources.get("sounds/success.mp3").play();
    },
    setting: function() {
      player = undefined;
      game.state = GAME_SETTING;
    },
    render: function() {
      var rowImages = level[this.level].rowImages;
      var numRows = level[this.level].numRows;
      var numCols = level[this.level].numCols;
      var rol, col;

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

      // 渲染游戏对象 player enemy
      renderEntities();

      // 根据游戏状态渲染不同界面
      switch (this.state) {
        case GAME_SETTING:
          drawBigFont("CHOOSE ROLE", 252, 200);
          drawSmallFont("press LEFT & RIGHT change role", 252, 280);
          drawSmallFont("press ENTER into game", 252, 320);
          for (var i = (role.length - 1); i >= 0; i--) {
            // 标识当前选中 role
            if (this.role === role[i].name) {
              ctx.drawImage(Resources.get("images/Selector.png"), role[i].x, role[i].y - 40);
            }
            // 绘制可选人物
            ctx.drawImage(Resources.get(role[i].name), role[i].x, role[i].y);
          }
          break;
        case GAME_BEGIN:
          break;
        case GAME_WIN:
          ctx.beginPath();
          ctx.rect(0, 50, 505, 536);
          ctx.fillStyle = "rgba(255, 255, 255, 0.30)";
          ctx.fill();
          drawBigFont("YOU WIN!", 252, 280);
          drawSmallFont("press ENTER into new game", 252, 350);
          break;
        case GAME_FAIL:
          ctx.beginPath();
          ctx.rect(0, 50, 505, 536);
          ctx.fillStyle = "rgba(0, 0, 0, 0.30)";
          ctx.fill();
          drawBigFont("YOU FAIL!", 252, 280);
          drawSmallFont("press ENTER into new game", 252, 350);
          break;
        case GAME_READY:
          drawBigFont("READY", 252, 250);
          var time = Math.floor(readyTime / 1000);
          drawBigFont(time, 252, 350);
          break;
        default:
          console.log("未知的游戏状态");
      }
    },
    update: function(dt) {
      // 更新倒计时
      if (this.state === GAME_READY) {
        readyTime = readyTime - 1000 * dt;
        if (readyTime < 20) {
          this.state = GAME_BEGIN;
          readyTime = null;
        }
      }
      // 更新各个游戏实体
      updateEntities(dt);

      switch (this.state) {
        case GAME_SETTING:
          break;
        case GAME_BEGIN:
          // 碰撞检测
          checkCollisions();
          break;
        case GAME_WIN:
          break;
        case GAME_FAIL:
          break;
        case GAME_READY:
          break;
        default:
          console.log("奇怪的游戏状态");
      }
    },
    changeSet: function(opt) {
      var active;
      for (var i = (role.length - 1); i >= 0; i--) {
        if (this.role === role[i].name) {
          active = i;
        }
      }
      switch (opt) {
        case "left":
          active = (active === 0) ? 0 : (active - 1);
          this.role = role[active].name;
          Resources.get("sounds/anniu-kehuan1.mp3").play();
          break;
        case "right":
          active = (active === (role.length - 1)) ? (role.length - 1) : (active + 1);
          this.role = role[active].name;
          Resources.get("sounds/anniu-kehuan1.mp3").play();
          break;
        case "enter":
          this.start();
          break;
        default:
          ;
      }
    }
  };
}());

// 这是我们的玩家要躲避的敌人 
var Enemy = function(row, col, v) {
  // 要应用到每个敌人的实例的变量写在这里
  // 我们已经提供了一个来帮助你实现更多

  // 敌人的图片或者雪碧图，用一个我们提供的工具函数来轻松的加载文件
  this.x = col ? col : -1 * COL;
  this.y = row ? row : (Math.round(Math.random() * 2) + 1) * ROW;
  this.v = v || Math.round(Math.random() * 100) + 40;
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
};

// 此为游戏必须的函数，用来更新玩家的位置
// 参数: dt ，表示时间间隙
Player.prototype.update = function(dt) {
  // 你应该给每一次的移动都乘以 dt 参数，以此来保证游戏在所有的电脑上
  // 都是以同样的速度运行的
  if (this.state == 1 && this.y === 0) {
    this.win();
  }
};

// 此为游戏必须的函数，用来在屏幕上画出玩家
Player.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// 玩家死亡操作
Player.prototype.death = function() {
  this.state = 0;
  game.fail();
};

// 玩家胜利操作
Player.prototype.win = function() {
  this.state = 2;
  game.win();
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
    Resources.get("sounds/anniu-shitou2.mp3").play();
  } else {
    this.x = newX;
    this.y = newY;
    Resources.get("sounds/anniu-katong7.mp3").play();
  }
};


// 这段代码监听游戏玩家的键盘点击事件并且代表将按键的关键数字送到 Play.handleInput()
// 方法里面。你不需要再更改这段代码了。
document.addEventListener('keydown', function(e) {
  var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    13: 'enter',
    32: 'space'
  };

  switch (game.state) {
    case GAME_SETTING:
      game.changeSet(allowedKeys[e.keyCode]);
      break;
    case GAME_BEGIN:
      if (game.getPlyer()) {
        game.getPlyer().handleInput(allowedKeys[e.keyCode]);
      }
      break;
    case GAME_WIN:
      if (e.keyCode === 13) {
        game.setting();
      }
      break;
    case GAME_FAIL:
      if (e.keyCode === 13) {
        game.setting();
      }
      break;
    case GAME_READY:
      break;
    default:
      console.log("奇怪的游戏状态");
  }
});
var COL = 101,
  ROW = 83;
// 游戏边界值常量
var MAXX = 4 * COL,
  MAXY = 5 * ROW,
  MINX = 0,
  MINY = 0;

// 游戏状态常量
var GAME_SETROLE = 0,
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
    allEnemies = [],
    allRocks = [],
    allGems = [],
    allHearts = [],
    allPos = [];
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
    tTime: 1000, // 敌人生成的基础时间
    gameTime: 20000, // 游戏时间
    stoneNum: 1,
    gemNum: 1,
    heart: 1
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
    tTime: 500, // 敌人生成的基础时间
    gameTime: 15000, // 游戏时间
    stoneNum: 3,
    gemNum: 2,
    heart: 1
  }];

  function clearEnemies() {
    for (var i = 0; i < allEnemies.length; i++) {
      if (allEnemies[i].state !== 0) {
        break;
      }
    }
    allEnemies.splice(0, i);
  }

  function clearGems() {
    for (var i = 0; i < allGems.length; i++) {
      if (allGems[i].state !== 0) {
        break;
      }
    }
    allGems.splice(0, i);
  }

  function loop(fuc, basicTime, tTime) {
    var rand = Math.floor(Math.random() * tTime) + basicTime;
    setTimeout(function() {
      if (game.state !== GAME_READY && game.state !== GAME_BEGIN) {
        return;
      }
      fuc();
      loop(fuc, basicTime, tTime);
    }, rand);
  }

  /* 这个函数会在每个时间间隙被 render 函数调用。他的目的是分别调用你在 enemy 和 player
   * 对象中定义的 render 方法。
   */
  function renderEntities() {
    /* 遍历在 allEnemies 数组中存放的作于对象然后调用你事先定义的 render 函数 */
    allRocks.forEach(function(rock) {
      rock.render();
    });
    allGems.forEach(function(gem) {
      gem.render();
    });
    allHearts.forEach(function(heart) {
      heart.render();
    });
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
    // 检测与额外生命的碰撞
    for (var i = allHearts.length - 1; i >= 0; i--) {
      if (allHearts[i].y === player.y && allHearts[i].x === player.x && allHearts[i].state !== 0) {
        allHearts[i].gain();
      }
    }

    // 检测与宝石的碰撞
    for (var i = allGems.length - 1; i >= 0; i--) {
      if (allGems[i].y === player.y && allGems[i].x === player.x && allGems[i].state !== 0) {
        allGems[i].gain();
      }
    }

    // 检测与敌人之间的碰撞
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
    allRocks.forEach(function(rock) {
      rock.update(dt);
    });
    allGems.forEach(function(gem) {
      gem.update(dt);
    });
    allHearts.forEach(function(heart) {
      heart.update(dt);
    });
    if (player) {
      player.update();
    }
  }

  /* 这个函数被 render 函数调用, 用于绘制界面上的大文字
   */
  function drawBigFont(text, x, y) {
    ctx.strokeStyle = "black";
    ctx.textAlign = "center";
    ctx.lineWidth = 3;
    ctx.fillStyle = "#f7d74c";
    ctx.font = " 70px Impact"
    ctx.fillText(text, x, y);
    ctx.strokeText(text, x, y);
  }

  // 这个函数被 render 函数调用, 用于绘制界面上的小文字
  function drawSmallFont(text, x, y) {
    ctx.strokeStyle = "black";
    ctx.textAlign = "center";
    ctx.lineWidth = 2;
    ctx.font = " 30px Impact"
    ctx.fillStyle = "#dadad0";
    ctx.fillText(text, x, y);
    ctx.strokeText(text, x, y);
  }

  // 绘制游戏状态, 剩余时间, 剩余生命, 当前分数
  function drawGameState(score, timePct, heart) {
    // 绘制当前分数和生命值
    ctx.strokeStyle = "black";
    ctx.textAlign = "left";
    ctx.lineWidth = 2;
    ctx.fillStyle = "#f7d74c";
    ctx.font = " 20px Impact"
    ctx.fillText("score: " + score, 420, 575);
    ctx.strokeText("score: " + score, 420, 575);
    ctx.fillText("heart: " + heart, 20, 575);
    ctx.strokeText("heart: " + heart, 20, 575);

    // 绘制时间进度条
    // 绘制底色
    ctx.beginPath();
    ctx.moveTo(0, 585);
    ctx.lineTo(505, 585);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#666";
    ctx.stroke();
    // 绘制显示色
    timePct = timePct > 1 ? 1 : timePct;
    pos = 505 * (1 - timePct);
    ctx.beginPath();
    ctx.moveTo(pos, 585);
    ctx.lineTo(505, 585);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#b73a0b";
    ctx.stroke();
  }


  return {
    state: GAME_SETROLE,
    level: LEVEL_EASY,
    role: "images/char-boy.png",
    score: 0,
    timeLimit: 20000,
    // 清除所有游戏实体, 包括玩家,敌人,宝石,生命, 石头
    clearAllEntities: function() {
      player = undefined;
      allEnemies = [];
      allPos = [];
      allRocks = [];
      allHearts = [];
      allGems = [];
    },
    // TODO: 游戏难度设置
    setLevel: function(levelVal) {
      this.level = levelVal;
      this.time = level[levelVal].gameTime;
    },
    // 设置游戏角色
    setRole: function() {
      this.clearAllEntities();
      this.timeLimit = level[this.level].gameTime;
      this.score = 0;
      this.state = GAME_SETROLE;
    },
    // 获取玩家对象
    getPlyer: function() {
      if (player) {
        return player;
      } else {
        return false;
      }
    },
    // 获取敌人列表
    getAllEnemies: function() {
      return allEnemies;
    },
    // 获取石头列表
    getAllRocks: function() {
      return allRocks;
    },
    // 获取宝石列表
    getAllGems: function() {
      return allGems;
    },
    // 获取生命列表
    getAllHearts: function() {
      return allHearts;
    },
    // 宝石,石头,生命创建时会调用本函数, 本函数用于提供随机的可放置的位置
    getAvablePos: function() {
      if (allPos.length === 0) {
        return false;
      }
      var self = this;
      var index = Math.floor(Math.random() * (allPos.length - 0.01));
      var result = allPos[index];
      // 生成的位置不可以是玩家的当前位置
      if (result.x === player.x && result.y === player.y) {
        return false;
      } else {
        allPos.splice(index, 1);
        return result;
      }
    },
    // 创建敌人
    creatEnemy: function() {
      var row = (Math.floor(Math.random() * (level[this.level].tRow - 0.01)) + 1) * ROW;
      var v = Math.floor(Math.random() * level[this.level].tV) + level[this.level].basicV;
      allEnemies.push(new Enemy(row, (-1 * COL), v));
    },
    // 开始游戏, 首先会进入准备阶段, 准备阶段让敌人可先行入场
    // 生成各个游戏实例
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
      allRocks = [];
      allHearts = [];
      allGems = [];

      // 初始化可选位置列表
      allPos = [];
      for (var i = 4; i >= 0; i--) {
        for (var j = level[self.level].tRow; j > 0; j--) {
          allPos.push({
            x: i * COL,
            y: j * ROW
          });
        }
      }
      var pos;
      // 创建石头, 一次创建一个
      pos = self.getAvablePos();
      if (pos) {
        allRocks.push(new Rock(pos.x, pos.y));
      }
      loop(function() {
        var pos = self.getAvablePos();
        if (pos) {
          allRocks.push(new Rock(pos.x, pos.y));
        }
      }, 8000, 2000);

      // 创建生命, 仅创建一个
      pos = self.getAvablePos();
      if (pos) {
        allHearts.push(new Heart(pos.x, pos.y));
      }

      // 创建宝石
      pos = self.getAvablePos();
      if (pos) {
        allGems.push(new Gem(pos.x, pos.y));
        loop(function() {
          clearGems();
          var pos = self.getAvablePos();
          if (pos) {
            allGems.push(new Gem(pos.x, pos.y));
          }
        }, 5000, 2000);
      }

      // 创建敌人, 优先创建三个敌人
      self.creatEnemy();
      self.creatEnemy();
      self.creatEnemy();
      loop(function() {
        clearEnemies(); // 清除废旧 enemy
        self.creatEnemy(); // 创建新 enemy
      }, level[this.level].basicTime, level[this.level].tTime);
    },
    // 游戏失败
    fail: function() {
      this.state = GAME_FAIL;
      Resources.get("sounds/fail.mp3").play();
    },
    // 游戏胜利
    win: function() {
      this.state = GAME_WIN;
      Resources.get("sounds/success.mp3").play();
    },
    // 渲染, 每一帧会调用本函数以渲染画面
    render: function() {
      var rowImages = level[this.level].rowImages;
      var numRows = level[this.level].numRows;
      var numCols = level[this.level].numCols;
      var rol, col;

      // 补齐顶部和底部留白部分
      ctx.beginPath();
      ctx.rect(0, 0, 505, 50);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, 585);
      ctx.lineTo(505, 585);
      ctx.lineWidth = 5;
      ctx.strokeStyle = "white";
      ctx.stroke();

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
        case GAME_SETROLE:
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
          drawGameState(this.score, (this.timeLimit / level[this.level].gameTime), player.state)
          break;
        case GAME_WIN:
          ctx.beginPath();
          ctx.rect(0, 50, 505, 536);
          ctx.fillStyle = "rgba(255, 255, 255, 0.30)";
          ctx.fill();
          drawBigFont("YOU WIN!", 252, 220);
          drawBigFont("SCROE IS " + this.score + "!", 252, 330);
          drawSmallFont("press ENTER into new game", 252, 390);
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
    // 更新
    update: function(dt) {
      // 更新倒计时
      if (this.state === GAME_READY) {
        readyTime = readyTime - 1000 * dt;
        if (readyTime < 20) {
          this.state = GAME_BEGIN;
          readyTime = null;
        }
      }

      if (this.state === GAME_BEGIN) {
        this.timeLimit = this.timeLimit - 1000 * dt;
        if (this.timeLimit < 0) {
          this.fail();
        }
      }
      // 更新各个游戏实体
      updateEntities(dt);

      switch (this.state) {
        case GAME_SETROLE:
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
    // 切换角色
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

/* 此为游戏必须的函数，用来更新玩家的状态
 * 参数: dt ，表示时间间隙
 */
Player.prototype.update = function(dt) {
  // 当玩家状态为游戏进行时并且 y 为0(到河对岸)时胜利
  if (this.state > 0 && this.y === 0) {
    this.win();
  }
};

// 此为游戏必须的函数，用来在屏幕上画出玩家
Player.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/* 玩家死亡操作
 * 玩家死亡时调用游戏失败操作
 */
Player.prototype.death = function() {
  Resources.get("sounds/anniu-shitou2.mp3").play();
  this.state--;
  this.x = 2 * COL;
  this.y = 5 * ROW;
  if (this.state === 0) {
    game.fail();
  }
};

/* 玩家胜利操作
 * 玩家胜利时,调用游戏胜利函数
 */
Player.prototype.win = function() {
  this.state = -1;
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

  // 边界判断
  if (newX < 0 || newX > MAXX || newY < 0 || newY > MAXY) {
    Resources.get("sounds/anniu-shitou2.mp3").play();
    return;
  }
  //是否踩石头. 石头所在区域不可踩
  var stones = game.getAllRocks();
  for (var i = stones.length - 1; i >= 0; i--) {
    stones[i]
    if (stones[i].x === newX && stones[i].y === newY) {
      Resources.get("sounds/anniu-shitou2.mp3").play();
      return;
    }
  }
  this.x = newX;
  this.y = newY;
  Resources.get("sounds/anniu-katong7.mp3").play();
};

// 游戏中的宝石道具
var Gem = function(x, y, time) {
  this.x = x || 0;
  this.y = y || 0;
  this.timeLimit = time || 10000;
  this.sprite = "images/Gem-Orange.png";
  this.state = 1;
  this.timeSnd = this.timeLimit * 0.6; // 二级宝石蜕变时间
  this.timeTrd = this.timeLimit * 0.3; // 三级宝石蜕变时间
};

/* 此为游戏必须的函数，用来更新宝石
 * 参数: dt ，表示时间间隙
 * 宝石会随着时间减弱能力最终消失
 */
Gem.prototype.update = function(dt) {
  this.timeLimit = this.timeLimit - 1000 * dt;
  if (this.timeLimit < 0) {
    this.state = 0;
    return;
  }
  if (this.timeLimit < this.timeSnd) {
    this.sprite = "images/Gem-Green.png";
  }
  if (this.timeLimit < this.timeTrd) {
    this.sprite = "images/Gem-Blue.png";
  }
};

// 此为游戏必须的函数，用来在屏幕上画出宝石
Gem.prototype.render = function() {
  if (this.state != 0) {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
};

// 当宝石被玩家获取时执行的动作
Gem.prototype.gain = function() {
  switch (this.sprite) {
    case "images/Gem-Orange.png":
      game.score += 10;
      game.timeLimit += 5000;
      break;
    case "images/Gem-Green.png":
      game.score += 5;
      game.timeLimit += 3000;
      break;
    case "images/Gem-Blue.png":
      game.score += 1;
      game.timeLimit += 2000;
      break;
    default:
      console.error("意外的宝石类型");
  }
  Resources.get("sounds/anniu-kehuan1.mp3").play();
  this.state = 0;
};

/* 游戏中的石头道具
 * 有石头的格子不可踩
 */
var Rock = function(x, y) {
  this.x = x || 0;
  this.y = y || 0;
  this.sprite = "images/Rock.png";
};

Rock.prototype.update = function(dt) {};

// 此为游戏必须的函数，用来在屏幕上画出玩家
Rock.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/* 游戏中的生命道具
 * 获取到生命道具可多一条命
 */
var Heart = function(x, y) {
  this.x = x || 0;
  this.y = y || 0;
  this.sprite = "images/Heart.png";
};

Heart.prototype.update = function(dt) {};

// 此为游戏必须的函数，用来在屏幕上画出玩家
Heart.prototype.render = function() {
  if (this.state !== 0) {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
};

// 获取到生命道具使玩家多一条命
Heart.prototype.gain = function() {
  game.getPlyer().state += 1;
  Resources.get("sounds/anniu-kehuan1.mp3").play();
  this.state = 0;
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
    case GAME_SETROLE:
      game.changeSet(allowedKeys[e.keyCode]);
      break;
    case GAME_BEGIN:
      if (game.getPlyer()) {
        game.getPlyer().handleInput(allowedKeys[e.keyCode]);
      }
      break;
    case GAME_WIN:
      if (e.keyCode === 13) {
        game.setRole();
      }
      break;
    case GAME_FAIL:
      if (e.keyCode === 13) {
        game.setRole();
      }
      break;
    case GAME_READY:
      break;
    default:
      console.log("奇怪的游戏状态");
  }
});
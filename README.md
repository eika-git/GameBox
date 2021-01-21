# JavaScript 怀旧游戏

## 一、贪食蛇

### 1、HTML页面

1）简单的样式表，固定版心，并让画板在版心居中显示。

2）两个canvas，一个用来渲染游戏画面，一个进行数据的统计（得分和等级等）。

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<title>GameBox</title>
		<style type="text/css">
			* {
				padding: 0;
				margin: 0;
			}
			
			html {
				/* background:#F0F1F2; */
				background-color: #000000;
			}
			
			.center {
				display: flexbox;
				display: flex;
				align-items: center;
				justify-content: center;
			}
			
			/* 版心默认样式 */
			.content {
				width: 1200px;
				height: 100vh;
				margin: 0 auto;
				/* background-color: #000000; */
			}
		</style>
	</head>
	<body>
		<div class="content center">
			<canvas id="game-box" style="border: 1px solid #FFFFFF;"></canvas>
			<canvas id="score-box" style="border: 1px solid #FFFFFF;"></canvas>
		</div>
	</body>
	<script src="js/Snake.js" type="text/javascript" charset="utf-8"></script>
</html>
```

### 2、常量和变量说明

```javascript
// 游戏画布
const gamebox = document.getElementById('game-box');
// 分数画布
const scorebox = document.getElementById('score-box');
// 行,列,格子大小, 速度(ms), 最大等级
const row = 20, col = 12, size = 45, speed = 200, maxlevel = 10;
// 计时器, 暂停标记
var timer = null, pause = false;
// 最高分, 得分, 等级,
var lines = score = level = 0;
// 方向, 下一次蛇移动的方向(上: u, 下: d, 左: l, 右: r)
var direction = next = null;
// 食物位置
var food = null;
// 蛇的数据
var snake = null;
```

### 3、游戏初始化以及循环

```javascript
init();

// 游戏初始化
function init() {
    // 计算游戏渲染画布宽度
	gamebox.width = col * size;
    // 计算数据渲染画布宽度
	databox.width = parseInt(col/2, 10) * size;
    // 计算游戏和数据渲染画布高度。
	gamebox.height = databox.height = row * size;
    // 新游戏
	newGame();
}

// 新游戏
function newGame() {
    // 初始化得分、等级、和下一次蛇移动的方向
	score = 0; level = 1; next = 'r';
    // 初始化蛇的数据
	initSnake();
    // 随机生成食物的位置
	randomFood();
    // 渲染游戏
	render();
    // 渲染分数
	renderData();
    // 设定计时器，如果存在则重置
	if(timer) window.clearInterval(timer);
	timer = setInterval(run, speed/level);
}

// 循环游戏
function run() {
    // 判断是否已暂停
	if(pause) return;
    // 设置蛇移动的方向为下一次移动的方向，后面说明原因
	direction = next;
    // 移动
	move();
    // 渲染游戏
	render();
}
```

### 4、初始化蛇数据

**设计思路：**

- 节点：用于保存蛇每一节所在位置的对象的数据，包含节点的横坐标x和纵坐标y

- snake：蛇的数据，以数组的形式保存节点数据，默认长度为三节
- **为了方便遍历渲染，我选择使用数组来储存蛇的节点数据，同时也方便插入和移除节点。**

```javascript
// 初始化蛇
function initSnake() {
	var x = 1, y = parseInt(row/2, 10);
	snake = new Array();
	for(var i = 0;i < 3;i++) {
		snake.unshift({ x: x + i, y: y });
	}
}
```

### 5、随机生成食物节点

**设计思路：**

- 食物节点是一个特殊的节点，只是没有储存在snake数组里的节点，同样包含节点的横坐标x和纵坐标y
- 食物在生成时可能会和蛇所在位置重叠，且蛇越长，重叠的几率则越大，加入判断，让游戏有更好的体验
- **判断依据：如果生成的食物节点与snake数组里的节点重复**
- **判断方法：将snake数组和食物节点转为字符串，判断snake数组字符串是否包含食物节点字符串，这样可以不用遍历数组就可以进行判断**

```javascript
// 初始化和随机生产食物
function randomFood() {
    // 在画布范围内随机取x的坐标
	var x = parseInt((Math.random() * col), 10);
    // 在画布范围内随机去y的坐标
	var y = parseInt((Math.random() * row), 10);
    // 以节点的格式存储食物数据
	food = { x: x, y: y };
    // 反复检测食物节点是否和蛇重叠，如果重叠，就重新生成x和y坐标
	while(JSON.stringify(snake).match(JSON.stringify(food))) {
		x = parseInt((Math.random() * col), 10);
		y = parseInt((Math.random() * row), 10);
		food = { x: x, y: y };
	}
}
```

### 6、游戏渲染

- **渲染食物：填充矩形，食物节点的横坐标x格子大小作为矩形的横坐标，食物节点的纵坐标x格子大小作为矩形的纵坐标，宽高都为格子大小**
- **渲染蛇：遍历snake数组，渲染方法与渲染食物节点一样**

```javascript
// 渲染游戏
function render() {
    // 获取游戏渲染画布的上下文
	const context = gamebox.getContext("2d");
	context.clearRect(0, 0, gamebox.width, gamebox.height);
	// 渲染食物
	context.beginPath();
	context.fillStyle = 'ghostwhite';
	context.rect(food.x*size, food.y*size, size, size);
	context.fill();
	// 渲染蛇
	snake.forEach((b, i) => {
		context.beginPath();
		context.fillStyle = 'plum';
		context.rect(b.x*size, b.y*size, size, size);
		context.fill();
	});
	// 渲染暂停时的内容
	if(pause) {
		context.font = "2rem '微软雅黑'";
		context.fillStyle = "white";
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillText('暂停中', gamebox.width/2, gamebox.height/2);
	}
}
```

### 7、控制蛇的移动

**1）控制移动方向**

- **检测上下左右按下并松开，记录下一步移动方向，如果当前方向为左，则下一次不能为右，否则会节点会重叠而判断死亡。**
- **next的存在意义，为了避免按键输入过快，而造成节点重叠判断为死亡。**
- **有next的约束，在没移动之前，只能改变下次移动的方向而不能改变当前移动的方向。**
- **比如：蛇在往左移动的时候，我按了往上后在蛇没移动之前快速按了往右，如果没有next，蛇的移动方向就从左变成了右，蛇的节点就会重叠。**

```javascript
// 检测按键弹起
document.onkeyup = function(e) {
    // 回车和P键，控制游戏的暂停
	if(e.keyCode == '13' || e.keyCode == '80') {
		pause = !pause;
		render();
	}
	if(pause) return;
    // 上
	else if(direction != 'd' && e.keyCode == '38') next = 'u';
    // 下
	else if(direction != 'u' && e.keyCode == '40') next = 'd';
    // 左
	else if(direction != 'r' && e.keyCode == '37') next = 'l';
    // 右
	else if(direction != 'l' && e.keyCode == '39') next = 'r';
	render();
}
```

**2）蛇的移动、吃到食物和死亡判断**

- **移动思路：**
  - 获取snake数组第一个元素作为蛇的头节点，利用蛇当前移动的方向计算横纵坐标，作为新的头节点。
  - 把新的头节点加入到数组的前面，再把数组最后一个元素删除，利用定时器反复操作和渲染，蛇就有移动的效果。
- **吃到食物思路**
  - 将新的头节点和食物节点转为字符串，如果两个字符串相等，说明下次移动就能吃到食物。
  - 吃到食物后，讲食物节点作为新的头节点加入数组的前面，不删除数组最后一个元素，则数组长度增加。
  - 生成新的食物节点，分数统计，为了避免重复加入新的头节点，必须有return操作。
- **死亡判断**
  - 如果新的头节点的横坐标 x < 0，蛇撞左边界。
  - 如果新的头节点的横坐标 x > col-1，蛇撞右边界。
  - 如果新的头节点的纵坐标 y < 0，蛇撞上边界。
  - 如果新的头节点的纵坐标 y > row-1，蛇撞下边界。
  - 如果数组内包含新的头节点，蛇咬到自己。
  - 游戏结束简单粗暴的操作，重开游戏。

```javascript
// 移动
function move() {
	//.shift();删除第一个, .pop();删除最后一个
	var head = null;
	if(direction == 'u') head = { x: snake[0].x, y: snake[0].y - 1 };
	else if(direction == 'd') head = { x: snake[0].x, y: snake[0].y + 1 };
	else if(direction == 'l') head = { x: snake[0].x - 1, y: snake[0].y };
	else if(direction == 'r') head = { x: snake[0].x + 1, y: snake[0].y };
	// 吃到食物
	if(JSON.stringify(head).match(JSON.stringify(food))) {
		snake.unshift(food);
		countData();
		randomFood();
		return;
	}
	// 碰撞检测
	if((head.x < 0) || (head.x > col-1) || (head.y < 0) || (head.y > row-1) || JSON.stringify(snake).match(JSON.stringify(head))) {
		newGame();
		return;
	}
	// 移动
	snake.unshift(head);
	snake.pop();
}
```

### 8、统计和渲染游戏数据

- **统计游戏数据**
  - 没有多余的计算，吃到一个加一百。
  - 如果现在的分数大于历史最高，历史最高就等于现在的分数。
  - 统计完渲染一遍分数。
- **渲染游戏数据**
  - 将统计好的数据简单地用文本的方式渲染到数据画布上，代码如下：

```javascript
// 统计游戏数据
function countData() {
	score += 100;
	if(score > lines) lines = score;
	renderData();
}

// 渲染游戏数据
function renderData() {
	const context = databox.getContext("2d");
	context.clearRect(0, 0, databox.width, databox.height);
	context.font = "2rem '微软雅黑'";
	context.textBaseline = 'middle';
	context.fillStyle = "white";
	context.fillText('最高分：' + lines, size, 4*size);
	context.fillText('得分：' + score, size, 5*size);
	context.fillText('长度：' + snake.length, size, 6*size);
	context.fillText('等级：' + level, size, 7*size);
}
```

### 9、完整代码

```javascript
/**
 * Snake.js
 * Created by KOEika on 2020/01/21
 */

// 游戏画布
const gamebox = document.getElementById('game-box');
// 分数画布
const databox = document.getElementById('data-box');
// 行,列,格子大小, 速度(ms), 最大等级
const row = 20, col = 12, size = 45, speed = 200, maxlevel = 10;
// 计时器, 暂停标记
var timer = null, pause = false;
// 最高分, 得分, 等级,
var lines = score = level = 0;
// 方向, 下一次蛇移动的方向(上: u, 下: d, 左: l, 右: r)
var direction = next = null;
// 食物位置
var food = null;
// 蛇的数据
var snake = null;

init();

// 游戏初始化
function init() {
	gamebox.width = col * size;
	databox.width = parseInt(col/2, 10) * size;
	gamebox.height = databox.height = row * size;
	newGame();
}

// 新游戏
function newGame() {
	score = 0;
	level = 1;
	next = 'r';
	initSnake();
	randomFood();
	render();
	renderScore();
	if(timer) window.clearInterval(timer);
	timer = setInterval(run, speed/level);
}

// 循环游戏
function run() {
	if(pause) return;
	direction = next;
	move();
	render();
}

// 检测按键弹起
document.onkeyup = function(e) {
	if(e.keyCode == '13' || e.keyCode == '80') {
		pause = !pause;
		render();
	}
	if(pause) return;
	else if(direction != 'd' && e.keyCode == '38') next = 'u';
	else if(direction != 'u' && e.keyCode == '40') next = 'd';
	else if(direction != 'r' && e.keyCode == '37') next = 'l';
	else if(direction != 'l' && e.keyCode == '39') next = 'r';
	render();
}

// 移动
function move() {
	//.shift();删除第一个, .pop();删除最后一个
	var head = null;
	if(direction == 'u') head = { x: snake[0].x, y: snake[0].y - 1 };
	else if(direction == 'd') head = { x: snake[0].x, y: snake[0].y + 1 };
	else if(direction == 'l') head = { x: snake[0].x - 1, y: snake[0].y };
	else if(direction == 'r') head = { x: snake[0].x + 1, y: snake[0].y };
	// 吃到食物
	if(JSON.stringify(head).match(JSON.stringify(food))) {
		snake.unshift(food);
		countScore();
		randomFood();
		return;
	}
	// 碰撞检测
	if((head.x < 0) || (head.x > col-1) || (head.y < 0) || (head.y > row-1) || JSON.stringify(snake).match(JSON.stringify(head))) {
		newGame();
		return;
	}
	// 移动
	snake.unshift(head);
	snake.pop();
}

// 初始化蛇
function initSnake() {
	var x = 1, y = parseInt(row/2, 10);
	snake = new Array();
	for(var i = 0;i < 3;i++) {
		snake.unshift({ x: x + i, y: y });
	}
}

// 随机生产食物
function randomFood() {
	var x = parseInt((Math.random() * col), 10);
	var y = parseInt((Math.random() * row), 10);
	food = { x: x, y: y };
	while(JSON.stringify(snake).match(JSON.stringify(food))) {
		x = parseInt((Math.random() * col), 10);
		y = parseInt((Math.random() * row), 10);
		food = { x: x, y: y };
	}
}

// 渲染游戏
function render() {
	const context = gamebox.getContext("2d");
	context.clearRect(0, 0, gamebox.width, gamebox.height);
	// 渲染食物
	context.beginPath();
	context.fillStyle = 'ghostwhite';
	context.rect(food.x*size, food.y*size, size, size);
	context.fill();
	// 渲染蛇
	snake.forEach((b, i) => {
		context.beginPath();
		context.fillStyle = 'plum';
		context.rect(b.x*size, b.y*size, size, size);
		context.fill();
	});
	// 渲染暂停时的内容
	if(pause) {
		context.font = "2rem '微软雅黑'";
		context.fillStyle = "white";
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillText('暂停中', gamebox.width/2, gamebox.height/2);
	}
}

// 统计游戏数据
function countData() {
	score += 100;
	if(score > lines) lines = score;
	renderData();
}

// 渲染游戏数据
function renderData() {
	const context = databox.getContext("2d");
	context.clearRect(0, 0, databox.width, databox.height);
	context.font = "2rem '微软雅黑'";
	context.textBaseline = 'middle';
	context.fillStyle = "white";
	context.fillText('最高分：' + lines, size, 4*size);
	context.fillText('得分：' + score, size, 5*size);
	context.fillText('长度：' + snake.length, size, 6*size);
	context.fillText('等级：' + level, size, 7*size);
}
```


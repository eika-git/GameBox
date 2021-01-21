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
	renderData();
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
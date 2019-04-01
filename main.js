/*Bibliography
1)https://codepen.io/Eika/pen/AtKkD
2)https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript
3)Image source: https://lh5.ggpht.com/FkG3dfS7qARoenjjiWS1seiTBqm-0wmuqD_jRQKvfS4c5EQ5cAAcdmqcay19ErM1Fw=w300
4)https://www.w3schools.com/graphics/canvas_text.asp
5)http://www.williammalone.com/briefs/how-to-draw-image-html5-canvas/
6)http://vignette4.wikia.nocookie.net/adventuretimewithfinnandjake/images/7/77/S2e16_You_lose.png/revision/latest?cb=20141109223427
*/

var leftKey=37;
var rightKey=39;
var pressedKeys={}
var brickWidth = 75;
var brickHeight = 20;
var score=0;
var lives=3;
var level=1;

$(document).ready(function() {
  drawimage();
  $('#start').click(function() {
   // document.location.reload();
    startGame()
    //document.getElementById('img').style.visibility='visible';
  })
})
$(window).keydown(function(event){
  pressedKeys[event.keyCode]=true;
})
$(window).keyup(function(event){
  delete pressedKeys[event.keyCode];
})
var prevT;
var levels;
function draw(t){

  //console.log("hello")
  if(prevT===undefined){
    prevT=t;
    window.requestAnimationFrame(draw);
    return;
  }
  var deltaT=t-prevT
  prevT=t;
  var ctx=document.getElementById('canvas').getContext('2d');
  ctx.fillStyle='rgba(255,255,255,0.5)';
  ctx.fillRect(0,0,400,500);
  ctx.fillStyle='black';
  ctx.save();
  paddle.draw(ctx)
  paddle.updatePosition(deltaT);
  ball.draw(ctx)
  Bricks.draw(ctx);
  Bricks.collision();
  ball.updatePosition(deltaT)
  drawScore(ctx);
  drawLives(ctx);
  Level(ctx);
  levelUp();
  ctx.restore();
  window.requestAnimationFrame(draw);
}
var paddle={
  x:150,
  y:490,
  vx:0.4,

  width:100,
  height:10,
  draw:function(ctx){
    ctx.lineCap='round'
    // console.log('draw')
    ctx.fillRect(this.x,this.y,this.width,this.height);
    ctx.stroke();
  },
  updatePosition:function(deltaT){
    if(pressedKeys[leftKey]){
      this.x=Math.max(this.x-this.vx*deltaT,0);
    }
    if(pressedKeys[rightKey]){
      this.x=Math.min(this.x+this.vx*deltaT,canvas.width-this.width);
    }
  },
  isBallColliding:function(){
    return(ball.y+ball.radius>this.y&&
           ball.x>=this.x&&
           ball.x<=this.x+this.width)
  }


}
var ball={
  x:paddle.x,
  y:paddle.y-50,
  vx:0.1,
  vy:0.1,
  radius:10,
  draw:function(ctx){
    //console.log('draw')
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.radius,0,Math.PI*2);
    ctx.stroke();
  },
  updatePosition:function(deltaT){
    this.checkBorderCollision()
    this.checkPaddleCollision();
    this.x=this.x+this.vx*deltaT;
    this.y=this.y+this.vy*deltaT;
  },
  checkBorderCollision:function(){
    if(this.y+this.radius>canvas.height){
      this.vy=-Math.abs(this.vy);
      lives--;
      if(lives==0){
        
        alert("You Lose!!!!!")
        document.location.reload();
        
      }
      // this.vx*=1.5;
      //this.vy*=1.5;
    }
    if(this.y-this.radius<=20){
      this.vy=Math.abs(this.vy);
    }
    if(this.x+this.radius>=canvas.width){
      this.vx=-Math.abs(this.vx);
    }
    if(this.x-this.radius<=0){
      this.vx=Math.abs(this.vx);
    }
  },
  checkPaddleCollision:function(){
    if(paddle.isBallColliding()){
      //this.vy=-Math.abs(this.vy*0.5);
      var x=((ball.x-(paddle.x+(paddle.width/2)) ) / (paddle.width/2))*0.8
      //console.log(x)

      var theta=Math.acos(x);
      var speed=Math.sqrt((Math.pow(ball.vx,2))+(Math.pow(ball.vy,2)));
      ball.vx=Math.cos(theta)*speed*1.05;
      ball.vy=-Math.abs(Math.sin(theta)*speed)*1.05;
    }


  }
}
var bricks;
var Bricks={
  draw:function(ctx){
    for(c=0; c<bricks.length; c++) {
      if(bricks[c].brick_status>0){
        ctx.beginPath();
        ctx.rect(bricks[c].x, bricks[c].y, brickWidth, brickHeight);
        ctx.fillStyle = bricks[c].color;
        ctx.fill();
        ctx.closePath();
      }
    }
  },
  collision:function(){
    //console.log(bricks)
    for(c=0; c<bricks.length; c++) {
      var b = bricks[c];

      var hitTop=ball.y+ball.radius>b.y&&ball.x> b.x && ball.x< b.x+brickWidth&&ball.y+ball.radius<b.y+brickHeight;
      var hitBottom=ball.y-ball.radius<b.y+brickHeight&&ball.x> b.x && ball.x< b.x+brickWidth&&ball.y-ball.radius>b.y;
      var hitLeft=ball.x+ball.radius>b.x&&ball.x+ball.radius<b.x+brickWidth && ball.y> b.y && ball.y<b.y+brickHeight;
      var hitRight=ball.x-ball.radius<b.x+brickWidth&&ball.x-ball.radius>b.x && ball.y> b.y && ball.y<b.y+brickHeight

      if(b.brick_status>0) {
        if((hitBottom||hitTop)&&!b.colliding) {
          ball.vy = -ball.vy
          b.brick_status--;
          b.colliding=true;
          if(isDestroyed(b)){
            score++
            var x=Math.random()
            console.log(x)
            powerup(x);
            console.log(paddle.width)
          }
        }
        if((hitLeft||hitRight)&&!b.colliding){
          // console.log(b.brick_status)
          ball.vx=-ball.vx;
          b.brick_status--;
          b.colliding=true;
          if(isDestroyed(b)){
            score++
            var x=Math.random()
            console.log(x)
            powerup(x);
            console.log(paddle.width)
          }
        }
        if(b.colliding&&!(hitBottom||hitLeft||hitRight||hitTop)){
          b.colliding=false;
        }
      }
    }
  }
}
function drawScore(ctx) {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.rect(325, 0, brickWidth, brickHeight);
  ctx.fillText("Score: "+score, 330, 16);
}
function drawLives(ctx) {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.rect(0, 0, brickWidth, brickHeight);
  ctx.fillText("Lives: "+lives, 5, 16);
}
function Level(ctx){
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.rect((canvas.width/2)-25, 0, brickWidth, brickHeight);
  ctx.fillText("Level: "+level, (canvas.width/2)-20, 16);
}
function isDestroyed(b){
  return (b.brick_status===0)
}
function levelUp(){
  if(bricks.every(isDestroyed)){
    console.log("finished")
    level++;

    bricks=levels[level-1];
    ball.x=paddle.x;
    ball.y=paddle.y-50;
    ball.vx=0.1;
    ball.vy=0.1;
    console.log(bricks) ; 
    if(level>2){
      alert("You win")
      document.location.reload();
    }
  }
}
function powerup(x){
  if(0.1<x&&x<0.2&&(paddle.width<140)){
    paddle.width=paddle.width+20;
  }
  if(0.2<x&&x<0.35&&ball.radius<20){
    ball.radius=ball.radius*2;
  }
  if(0.35<x&&x<0.5&&ball.radius>5){
      ball.radius=ball.radius/2;
  }
  if(0.5<x&&x<0.6&&(paddle.width>80)){
    paddle.width=paddle.width-20
  }
  if(0.6<x&&x<0.7){
    ball.vx=ball.vx*1.001;
    ball.vy=ball.vy*1.001;
  }
  if(0.7<x&&x<0.8){
    ball.vx=ball.vx*0.8;
    ball.vy=ball.vy*0.8;
  }
  if(0.8<x&&x<0.9){
    lives++;
  }
}
function startGame(){
  jQuery.getJSON( "level.json" , function(data){
    console.log(data)
    console.log("hello")
    levels=data;
    bricks=levels[level-1];
    window.requestAnimationFrame(draw);
  } )
  ball.x=paddle.x,
  ball.y=paddle.y-50
  ball.vx=0.1
  ball.vy=0.1
}
function drawimage(){
  var ctx=document.getElementById('canvas').getContext('2d');
  var img = new Image();
    img.onload = function () {
    ctx.drawImage(img, 0, 0,400, 500);
    ctx.font = "26px Arial";
    ctx.fillText("Brick Breaker",120,425);
  }
  img.src = "https://lh5.ggpht.com/FkG3dfS7qARoenjjiWS1seiTBqm-0wmuqD_jRQKvfS4c5EQ5cAAcdmqcay19ErM1Fw=w300";
}
/*function Lose(){
  var ctx=document.getElementById('canvas').getContext('2d');
  
  var img = new Image();
  img.onload = function () {
    ctx.drawImage(img, 0, 0,400, 500);
  }
  img.src = "http://vignette4.wikia.nocookie.net/adventuretimewithfinnandjake/images/7/77/S2e16_You_lose.png/revision/latest?cb=20141109223427";
}*/



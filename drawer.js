var canvas = document.getElementById("draw");
var color = '';

var ctx = canvas.getContext("2d");
resize();

function resize() {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
document.addEventListener("mousemove", draw);
document.addEventListener("mousedown", setPosition);
document.addEventListener("mouseenter", setPosition);


var pos = { x: 0, y: 0 };

function setPosition(e) {
  pos.x = e.clientX;
  pos.y = e.clientY;
}

function changeColor(value){
    color= value;
}

function draw(e) {
  if (e.buttons !== 1) return;

  console.log(color);
  ctx.beginPath();

  ctx.lineWidth = 20;
  ctx.lineCap = "square";
  ctx.strokeStyle = color;

  ctx.moveTo(pos.x, pos.y);
  setPosition(e);
  ctx.lineTo(pos.x, pos.y);

  ctx.stroke();

}

var canvas = document.getElementById("draw");

var ctx = canvas.getContext("2d");
resize();

function resize() {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
}

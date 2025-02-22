// clouds.js
// Arc-based lumps for each cloud, drifting horizontally.

let cloudCount = 5;
let clouds = [];

function createCloud(W, H) {
  const w = 30 + Math.random() * 30;
  const h = 15 + Math.random() * 15;
  const lumpCount = 3 + Math.floor(Math.random() * 3);
  const lumps = [];
  for (let i=0; i<lumpCount; i++){
    lumps.push({
      dx: Math.random()*w,
      dy: Math.random()*h,
      r: (h*0.3) + Math.random()*(h*0.4)
    });
  }
  return {
    x: Math.random()*W,
    y: 5 + Math.random()*40,
    w, h,
    lumps,
    speed: 0.01 + Math.random()*0.015,
    baseAlpha: 0.4 + Math.random()*0.3
  };
}

function initClouds(W, H){
  clouds = [];
  for (let i=0; i<cloudCount; i++){
    clouds.push(createCloud(W, H));
  }
}

function drawClouds(ctx, W, H, hour) {
  const isNight = (hour < 6 || hour >= 20);
  clouds.forEach(cl => {
    const dayColor = `rgba(255,255,255,${cl.baseAlpha})`;
    const nightColor= `rgba(120,120,120,${cl.baseAlpha*0.6})`;
    ctx.fillStyle = isNight ? nightColor : dayColor;

    ctx.beginPath();
    cl.lumps.forEach(l => {
      const cx = cl.x + l.dx;
      const cy = cl.y + l.dy;
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, l.r, 0, 2*Math.PI);
    });
    ctx.fill();

    cl.x += cl.speed;
    if (cl.x > W + cl.w) {
      cl.x = -cl.w;
      cl.y = 5 + Math.random()*40;
    }
  });
}

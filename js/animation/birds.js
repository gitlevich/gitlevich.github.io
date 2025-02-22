// birds.js
// Bird(s) only in daytime.

let birds=[];

function initBirds(W,H){
  // e.g. 1 bird
  birds = [
    { x: Math.random()*W, y:10+Math.random()*15, speed:0.02 }
  ];
}

function updateAndDrawBirds(ctx, W, H, hour){
  const isNight= (hour<6 || hour>=20);
  if(isNight) return;

  birds.forEach(b => {
    b.x += b.speed;
    if(b.x>W+5) b.x= -5;
    ctx.fillStyle='rgb(200,200,200)';
    ctx.fillRect(b.x,b.y,2,1);
  });
}

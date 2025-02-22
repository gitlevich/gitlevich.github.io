// vehicles.js
// dayVehicles vs. nightVehicles, plus bigger tractor & harvester.

let dayVehicles = [];
let nightVehicles = [];

function createVehicleArray(count, W, H, minSpd, maxSpd){
  const arr=[];
  const horizon= 0.75*H;
  for(let i=0; i<count; i++){
    arr.push({
      x: Math.random()*W,
      y: horizon+ Math.random()*(H-horizon-6),
      speed: minSpd+ Math.random()*(maxSpd-minSpd),
      type: (Math.random()<0.5)? 'tractor':'harvester'
    });
  }
  return arr;
}

function initVehicles(W,H){
  dayVehicles   = createVehicleArray(4, W,H, 0.02,0.04);
  nightVehicles = createVehicleArray(2, W,H, 0.01,0.02);
}

function drawTractor(ctx,v){
  // bigger tractor
  ctx.fillStyle='rgb(20,20,20)';
  ctx.fillRect(v.x,   v.y+3, 2,2);
  ctx.fillRect(v.x+6, v.y+3, 2,2);
  ctx.fillStyle='rgb(80,80,150)';
  ctx.fillRect(v.x, v.y, 8,3);
}

function drawHarvester(ctx,v){
  // bigger harvester
  ctx.fillStyle='rgb(20,20,20)';
  ctx.fillRect(v.x+2, v.y+4, 2,2);
  ctx.fillRect(v.x+8, v.y+4, 2,2);
  ctx.fillStyle='rgb(100,100,50)';
  ctx.fillRect(v.x, v.y, 10,3);
  ctx.fillStyle='rgb(120,120,60)';
  ctx.fillRect(v.x-2, v.y+1, 2,2);
}

function updateAndDrawVehicles(ctx, W, H, hour){
  const isNight= (hour<6 || hour>=20);
  const active= isNight? nightVehicles: dayVehicles;

  active.forEach(v=>{
    v.x += v.speed;
    if(v.x> W+10) v.x= -10;
    if(v.type==='tractor') drawTractor(ctx,v);
    else drawHarvester(ctx,v);
  });
}

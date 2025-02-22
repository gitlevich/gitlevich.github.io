// staticElements.js
// Foreground items like hay bales, crates, barrels, scarecrows.

let fgCount=6;
let fgObjects=[];
const fgTypes=['hayBale','crate','barrel','scarecrow'];

function initStaticElements(W,H){
  const horizon= 0.75*H;
  fgObjects = [];
  for(let i=0; i<fgCount; i++){
    fgObjects.push({
      x: Math.random()*(W-20),
      y: horizon+2+ Math.random()*(H-horizon-4),
      type: fgTypes[Math.floor(Math.random()*fgTypes.length)]
    });
  }
}

function drawStaticElements(ctx){
  fgObjects.forEach(o => {
    switch(o.type){
      case 'hayBale':
        ctx.fillStyle='rgb(200,180,80)';
        ctx.fillRect(o.x,o.y-2,4,2);
        break;
      case 'crate':
        ctx.fillStyle='rgb(120,80,40)';
        ctx.fillRect(o.x,o.y-3,3,3);
        break;
      case 'barrel':
        ctx.fillStyle='rgb(100,60,30)';
        ctx.fillRect(o.x,o.y-3,2,3);
        break;
      case 'scarecrow':
        ctx.fillStyle='rgb(150,150,150)';
        ctx.fillRect(o.x,o.y-5,1,5);
        ctx.fillRect(o.x-1,o.y-4,3,1);
        break;
    }
  });
}

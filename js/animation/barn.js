// barn.js
function drawBarn(ctx, W, H){
  const horizon = 0.75 * H;

  // Bigger barn
  const barnW = 40;
  const barnH = 20;
  const roofH = 5;

  // Shift to the right (10px from right edge)
  const barnX = W - barnW - 10;
  const barnY = horizon - barnH;

  // Walls
  ctx.fillStyle = 'rgb(150,30,30)';
  ctx.fillRect(barnX, barnY, barnW, barnH);

  // Roof
  ctx.fillStyle = 'rgb(70,0,0)';
  ctx.fillRect(barnX, barnY - roofH, barnW, roofH);
}

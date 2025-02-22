// grass.js
// Creates random "color-shifting" blades with no movement, just color variation.

let bladeCount = 1000;
let blades = [];

function initGrass(W, H) {
  blades = [];
  const horizon = 0.75 * H;
  for (let i = 0; i < bladeCount; i++) {
    const x = Math.random() * W;
    const y = horizon + 2 + Math.random() * (H - horizon - 4);
    blades.push({
      x,
      y,
      h: 2 + Math.random() * 3,
      colorPhase: Math.random() * 10,
      colorFreq: 2.0 + Math.random() * 0.5
    });
  }
}

function drawGrass(ctx, W, H, timeSec) {
  // Fill ground
  const horizon = 0.75 * H;
  ctx.fillStyle = 'rgb(23,99,23)';
  ctx.fillRect(0, horizon, W, H - horizon);

  // Draw each blade as a short line with color wave
  blades.forEach(b => {
    const factor = 0.5 + 0.5 * Math.sin(b.colorFreq * timeSec + b.colorPhase);
    const g = Math.floor(70 + factor * 50);
    ctx.strokeStyle = `rgb(20,${g},20)`;

    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x, b.y - b.h);
    ctx.stroke();
  });
}

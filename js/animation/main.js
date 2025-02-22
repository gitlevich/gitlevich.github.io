// main.js
// Ties everything together.

let canvas, ctx, W, H;
let frameCount = 0;
let lastTime   = performance.now();

function initAll() {
  // Grab the <canvas>
  canvas = document.getElementById('farmCanvas');
  ctx    = canvas.getContext('2d');
  W      = canvas.width;
  H      = canvas.height;

  // Initialize each module
  initSky();
  initGrass(W, H);
  initClouds(W, H);
  initStaticElements(W, H);
  initForest(W, H);
  initVehicles(W, H);
  initBirds(W, H);
}

function render(t) {
  requestAnimationFrame(render);
  const dt = (t - lastTime)/1000;
  lastTime= t;
  frameCount++;

  // Compute hour from local time
  const now= new Date();
  const hour= now.getHours() + now.getMinutes()/60;

  // 1) Draw sky (stars if night)
  drawSky(ctx, W, H, hour, frameCount);

  // 2) Clouds
  drawClouds(ctx, W, H, hour);

  // 3) Grass (color shifting)
  drawGrass(ctx, W, H, t/1000);

  // 4) Barn
  drawBarn(ctx, W, H);

  // 5) Forest
  drawForest(ctx, W, H);

  // 6) Foreground crates, etc.
  drawStaticElements(ctx);

  // 7) Vehicles
  updateAndDrawVehicles(ctx, W, H, hour);

  // 8) Birds (day only)
  updateAndDrawBirds(ctx, W, H, hour);
}

// Start everything
initAll();
requestAnimationFrame(render);

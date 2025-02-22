// sky.js
// Defines initSky() and drawSky(), but NOT canvas or ctx directly.

let starCount = 50;
let stars = [];

// Could also define a simple lerpColor utility here if used only for sky
function lerpColor(c1, c2, t) {
  return [
    c1[0] + (c2[0] - c1[0]) * t,
    c1[1] + (c2[1] - c1[1]) * t,
    c1[2] + (c2[2] - c1[2]) * t
  ];
}

function getSkyColor(hour) {
  // Basic day->night color
  const nightColor = [15, 15, 50];
  const dayColor   = [135, 206, 235];
  let frac = (hour < 12) ? (hour / 12) : (1 - ((hour - 12) / 12));
  return lerpColor(nightColor, dayColor, frac);
}

// Initialize sky data (e.g., star positions)
function initSky() {
  stars = [];
  for (let i = 0; i < starCount; i++) {
    stars.push({
      dx: Math.random(),
      dy: Math.random() * 0.6
    });
  }
}

function drawStars(ctx, offsetX, W, H) {
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  stars.forEach(st => {
    let sx = st.dx * W + offsetX;
    sx = ((sx % W) + W) % W;  // wrap horizontally
    const sy = st.dy * (0.7 * H);
    ctx.fillRect(Math.floor(sx), Math.floor(sy), 1, 1);
  });
}

function drawSky(ctx, W, H, hour, frameCount) {
  // Fill background
  const [rSky,gSky,bSky] = getSkyColor(hour);
  ctx.fillStyle = `rgb(${rSky},${gSky},${bSky})`;
  ctx.fillRect(0,0,W,H);

  // If night, draw stars
  const isNight = (hour < 6 || hour >= 20);
  if (isNight) {
    const offsetX = frameCount * 0.0002;
    drawStars(ctx, offsetX, W, H);
  }
}

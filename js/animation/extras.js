/*
  extras.js

  Manages:
    - Tractors (random spawn, color, direction)
    - Birds (random spawn, day/night color, flapping)
    - Timecode overlay

  Usage in the main code:
    1) extras.initExtras(...) if needed (e.g., for spawn rates).
    2) Each frame:
       extras.maybeSpawnTractor();
       extras.updateAndDrawTractors(p5, horizonY);
       extras.maybeSpawnBird();
       extras.updateAndDrawBirds(p5);
       extras.displayTimecode(p5);

  No references to barn or people.
*/

export const extras = {
  tractors: [],
  birds: [],

  // We might keep some spawn counters or rates here if we want
  tractorSpawnRate: 0.0002, // ~1 in 5000 => ~83s at 60fps
  birdSpawnDay: 0.001,
  birdSpawnNight: 0.0001,

  // --- TRACTORS ---

  maybeSpawnTractor(p5) {
    if (p5.random(1) < this.tractorSpawnRate) {
      let direction = p5.random(1) < 0.5 ? -1 : 1;
      let startX = (direction === 1) ? -100 : p5.width + 80;
      let speed = p5.random(1, 3);
      let c = this.randomNonGreenColor(p5);

      this.tractors.push({
        x: startX,
        dir: direction,
        speed,
        color: c,
      });
    }
  },

  updateAndDrawTractors(p5, horizonY) {
    for (let i = this.tractors.length - 1; i >= 0; i--) {
      let t = this.tractors[i];
      t.x += t.dir * t.speed;

      if ((t.dir === -1 && t.x < -150) ||
        (t.dir === 1 && t.x > p5.width + 150)) {
        this.tractors.splice(i, 1);
        continue;
      }

      p5.push();
      p5.translate(t.x, horizonY - 10);
      this.drawTractor(p5, t);
      p5.pop();
    }
  },

  drawTractor(p5, t) {
    p5.noStroke();
    p5.fill(t.color);
    p5.rect(0, -15, 35, 15);   // body
    p5.rect(10, -25, 15, 10);  // cab
    p5.fill(0);
    p5.ellipse(8, 0, 12, 12);  // front wheel
    p5.ellipse(28, 0, 16, 16); // rear wheel
  },

  randomNonGreenColor(p5) {
    p5.colorMode(p5.HSB);
    let h = p5.random(360);
    while (h > 80 && h < 160) {
      h = p5.random(360);
    }
    let s = p5.random(50, 100);
    let b = p5.random(70, 100);
    let col = p5.color(h, s, b);
    p5.colorMode(p5.RGB);
    return col;
  },

  // --- BIRDS ---

  maybeSpawnBird(p5) {
    let hr = p5.hour();
    let spawnChance = this.birdSpawnDay;
    if (hr < 6 || hr >= 20) {
      spawnChance = this.birdSpawnNight;
    }

    if (p5.random(1) < spawnChance) {
      let dir = (p5.random(1) < 0.5) ? -1 : 1;
      let startX = (dir > 0) ? -20 : p5.width + 20;

      this.birds.push({
        x: startX,
        y: p5.random(p5.height * 0.4), // upper portion
        vx: p5.random(0.5, 1.2),
        dir,
        size: p5.random(6, 10),
        flapOffset: p5.random(p5.TWO_PI),
      });
    }
  },

  updateAndDrawBirds(p5) {
    for (let i = this.birds.length - 1; i >= 0; i--) {
      let b = this.birds[i];
      b.x += b.dir * b.vx;

      this.drawFlappingBird(p5, b);

      // remove if offscreen
      if (b.x < -50 || b.x > p5.width + 50) {
        this.birds.splice(i, 1);
      }
    }
  },

  drawFlappingBird(p5, bird) {
    p5.push();
    p5.translate(bird.x, bird.y);
    p5.noStroke();

    // day vs night color
    let hr = p5.hour();
    let cDay = p5.color(80);
    let cNight = p5.color(200);
    let birdColor = (hr < 6 || hr >= 20) ? cNight : cDay;
    p5.fill(birdColor);

    let baseLen = 8;
    let s = bird.size / baseLen;
    p5.scale(s);

    let flapSpeed = 0.25;
    let wingAngle = p5.sin(p5.frameCount * flapSpeed + bird.flapOffset) * 0.6;

    // Body
    p5.ellipse(0, 0, 6, 3);
    // Head
    p5.ellipse(3, -1.5, 2, 2);
    // Tail
    p5.triangle(-3, 0, -5, -1, -5, 1);

    // Left wing
    p5.push();
    p5.rotate(-wingAngle);
    p5.beginShape();
    p5.vertex(0, 0);
    p5.vertex(-10, -3);
    p5.vertex(-1, -2);
    p5.endShape(p5.CLOSE);
    p5.pop();

    // Right wing
    p5.push();
    p5.rotate(wingAngle);
    p5.beginShape();
    p5.vertex(0, 0);
    p5.vertex(10, -3);
    p5.vertex(1, -2);
    p5.endShape(p5.CLOSE);
    p5.pop();

    p5.pop();
  },

  // --- TIMECODE OVERLAY ---

  displayTimecode(p5) {
    let now = new Date();
    let h = now.getHours();
    let m = now.getMinutes();
    let s = now.getSeconds();
    let ms = now.getMilliseconds();
    let fps = 60;
    let frames = Math.floor((ms / 1000) * fps);

    let tc = `${p5.nf(h,2)}:${p5.nf(m,2)}:${p5.nf(s,2)}:${p5.nf(frames,2)}`;

    p5.push();
    p5.textSize(16);
    p5.textAlign(p5.LEFT, p5.TOP);

    let tw = p5.textWidth(tc);
    let ta = p5.textAscent();
    let td = p5.textDescent();
    let th = ta + td;
    let pad = 6;

    p5.fill(0, 51);
    p5.noStroke();
    p5.rect(5, 5, tw + pad * 2, th + pad * 2);

    p5.fill(255);
    p5.text(tc, 5 + pad, 5 + pad);
    p5.pop();
  },
};

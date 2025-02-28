export const extras = {
  tractors: [],
  birds: [],

  // Slow them down by half
  TRACTOR_SPEED_FACTOR: 0.5,

  tractorSpawnRate: 0.0002, // Rare by default
  birdSpawnDay: 0.001,
  birdSpawnNight: 0.0001,

  maybeSpawnTractor(p5) {
    if (p5.random(1) < this.tractorSpawnRate) {
      let direction = p5.random(1) < 0.5 ? -1 : 1;
      let startX = (direction === 1) ? -100 : p5.width + 80;
      let baseSpeed = p5.random(1, 3) * this.TRACTOR_SPEED_FACTOR;
      let c = this.randomNonGreenColor(p5);

      this.tractors.push({
        x: startX,
        dir: direction,
        speed: baseSpeed,
        color: c,
      });
    }
  },

  updateAndDrawTractors(p5, horizonY) {
    for (let i = this.tractors.length - 1; i >= 0; i--) {
      let t = this.tractors[i];
      t.x += t.dir * t.speed;

      // Remove if it has gone far offscreen
      if ((t.dir === -1 && t.x < -200) ||
        (t.dir === 1 && t.x > p5.width + 200)) {
        this.tractors.splice(i, 1);
        continue;
      }

      // Place the tractor so y=0 in local coords is at horizonY
      p5.push();
      p5.translate(t.x, horizonY);
      // Flip horizontally if driving left
      if (t.dir < 0) {
        p5.scale(-1, 1);
      }
      this.drawTractor(p5, t);
      p5.pop();
    }
  },

  /**
   * Draws a more “cartoon” tractor with both wheels on y=0 (the ground).
   * Local coords:
   *   - The REAR (big) wheel’s center is at (0, -16) => radius=16 => bottom at y=0.
   *   - The FRONT (small) wheel’s center is at (40, -10) => radius=10 => bottom at y=0.
   */
  drawTractor(p5, t) {
    p5.noStroke();
    const rearWheelR = 16;
    const frontWheelR = 10;

    // Big rear wheel at (0, -16)
    p5.fill(0);
    p5.ellipse(0, -rearWheelR, rearWheelR * 2, rearWheelR * 2);

    // Small front wheel at (40, -10)
    p5.ellipse(40, -frontWheelR, frontWheelR * 2, frontWheelR * 2);

    // Tractor body color
    p5.fill(t.color);

    // Chassis bridging the wheels
    // Let’s run a rectangle from x=0..x=40, slightly above the wheels.
    let chassisY = -frontWheelR - 8; // about 8 px above the smaller wheel center
    p5.rect(0, chassisY, 40, 8);

    // Hood: a small sloped area at the front
    p5.quad(
      0, chassisY,           // left-lower
      0, chassisY - 10,      // left-upper
      15, chassisY - 10,     // right-upper
      15, chassisY           // right-lower
    );

    // Cab behind hood
    // Place it from x=15..x=30, some height
    p5.rect(15, chassisY - 12, 15, 12);

    // Smokestack on top
    p5.fill(50);
    p5.rect(5, chassisY - 14, 3, 6);
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

  // ---------------- BIRDS ----------------
  maybeSpawnBird(p5) {
    let hr = p5.hour();
    let spawnChance = this.birdSpawnDay;
    if (hr < 6 || hr >= 20) {
      spawnChance = this.birdSpawnNight;
    }

    if (p5.random(1) < spawnChance) {
      let dir = p5.random(1) < 0.5 ? -1 : 1;
      let startX = (dir > 0) ? -20 : p5.width + 20;

      this.birds.push({
        x: startX,
        y: p5.random(p5.height * 0.4),
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

  // ---------------- TIMECODE ----------------
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

/*
  environment.js

  Manages:
    - Sky (time-based color, optional stars)
    - Clouds (spawn, drift) — with more realistic vertical distribution
    - Ground (green area + an optional grass wave)
    - Trees / forest strip

  Usage:
    1) environment.initEnvironment(horizon, initialOnscreenClouds, canvasWidth)
       to set up the sky and restore or spawn clouds.
    2) Each frame:
       environment.drawSky(p5);
       environment.updateAndDrawClouds(p5);
       environment.drawGround(p5);
       environment.drawTreesAndForest(p5, barnX);
    3) SHIFT+R => calls resetClouds() AND immediately respawns clouds,
       so you don’t end up with an empty sky.
    4) If you want to clear all clouds (and nuke persistence) programmatically:
       environment.resetClouds();
       // Next time you init or reload, it won’t load any from storage.

  -- PERSISTENCE & VERTICAL DISTRIBUTION --
  * We store/reload clouds from localStorage so their positions survive reloads.
  * If no saved data, we spawn multiple clouds that start ON screen
    distributed from top to near horizon (here, top 80% of the sky).
  * SHIFT+R triggers resetClouds() and spawns new clouds.

  This file does NOT import barn or people.
*/

export const environment = {
  horizonY: 0,
  canvasW: 900,
  clouds: [],
  grassOffset: 0.001,
  cloudSpawnCounter: 0,

  // Controls how far down clouds appear (fraction of horizonY).
  CLOUD_VERTICAL_FRACTION: 0.8,

  loadClouds() {
    try {
      const saved = localStorage.getItem("clouds");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.clouds = parsed;
          return true;
        }
      }
    } catch (e) {
      console.warn("Error loading saved clouds:", e);
    }
    return false;
  },

  saveClouds() {
    try {
      localStorage.setItem("clouds", JSON.stringify(this.clouds));
    } catch (e) {
      console.warn("Error saving clouds:", e);
    }
  },

  resetClouds() {
    this.clouds = [];
    try {
      localStorage.removeItem("clouds");
    } catch (e) {
      console.warn("Error removing saved clouds:", e);
    }
    console.log("Clouds have been reset.");
  },

  /**
   * Called once at setup with your horizon line, etc.
   * If saved data is found (and not empty), we restore it.
   * Otherwise, we spawn multiple on-screen clouds at random positions.
   * SHIFT+R => calls resetClouds() and immediately spawns new clouds.
   */
  initEnvironment(horizon, initialOnscreenClouds = 7, canvasWidth = 900) {
    this.horizonY = horizon;
    this.canvasW = canvasWidth;

    const restored = this.loadClouds();
    if (!restored || this.clouds.length === 0) {
      for (let i = 0; i < initialOnscreenClouds; i++) {
        this.spawnCloudOnScreen();
      }
    }

    window.addEventListener("beforeunload", () => {
      this.saveClouds();
    });

    // SHIFT+R => reset clouds + spawn new ones
    window.addEventListener("keydown", (event) => {
      if (event.key === "R" && event.shiftKey) {
        this.resetClouds();
        for (let i = 0; i < initialOnscreenClouds; i++) {
          this.spawnCloudOnScreen();
        }
      }
    });
  },

  drawSky(p5) {
    let hr = p5.hour() + p5.minute() / 60.0;
    let cNight = p5.color(10, 10, 50);
    let cDay   = p5.color(100, 185, 255);

    let skyCol;
    if (hr < 5) {
      skyCol = cNight;
    } else if (hr < 7) {
      let t = p5.map(hr, 5, 7, 0, 1);
      skyCol = p5.lerpColor(cNight, cDay, t);
    } else if (hr < 17) {
      skyCol = cDay;
    } else if (hr < 19) {
      let t = p5.map(hr, 17, 19, 0, 1);
      skyCol = p5.lerpColor(cDay, cNight, t);
    } else {
      skyCol = cNight;
    }

    p5.noStroke();
    p5.fill(skyCol);
    p5.rect(0, 0, p5.width, this.horizonY);

    // If night, draw stars
    if (hr < 5 || hr >= 19) {
      p5.fill(255);
      for (let i = 0; i < 50; i++) {
        let sx = p5.noise(i) * p5.width;
        let sy = p5.noise(i + 999) * (this.horizonY * 0.8);
        p5.circle(sx, sy, 1);
      }
    }
  },

  spawnCloudOnScreen() {
    let lumpsCount = Math.floor(Math.random() * 3 + 3);
    let lumpsData = [];
    for (let i = 0; i < lumpsCount; i++) {
      lumpsData.push({
        dx: Math.random() * 60 - 30,
        dy: Math.random() * 20 - 10,
        rx: Math.random() * 20 + 25,
        ry: Math.random() * 10 + 15
      });
    }

    const maxHeight = this.horizonY * this.CLOUD_VERTICAL_FRACTION;
    this.clouds.push({
      x: Math.random() * this.canvasW,
      y: Math.random() * maxHeight,
      speed: Math.random() * 0.03 + 0.02,
      lumps: lumpsData,
      baseColor: [
        Math.random() * 35 + 220,
        Math.random() * 35 + 220,
        Math.random() * 35 + 220,
        220
      ]
    });
  },

  spawnCloud() {
    let lumpsCount = Math.floor(Math.random() * 3 + 3);
    let lumpsData = [];
    for (let i = 0; i < lumpsCount; i++) {
      lumpsData.push({
        dx: Math.random() * 60 - 30,
        dy: Math.random() * 20 - 10,
        rx: Math.random() * 20 + 25,
        ry: Math.random() * 10 + 15
      });
    }

    const maxHeight = this.horizonY * this.CLOUD_VERTICAL_FRACTION;
    this.clouds.push({
      x: Math.random() * 300 - 300, // spawn left
      y: Math.random() * maxHeight,
      speed: Math.random() * 0.03 + 0.02,
      lumps: lumpsData,
      baseColor: [
        Math.random() * 35 + 220,
        Math.random() * 35 + 220,
        Math.random() * 35 + 220,
        220
      ]
    });
  },

  updateAndDrawClouds(p5) {
    p5.noStroke();

    for (let i = this.clouds.length - 1; i >= 0; i--) {
      let c = this.clouds[i];
      c.x += c.speed; // drift right

      p5.push();
      p5.translate(c.x, c.y);
      p5.fill(...c.baseColor);
      for (let lump of c.lumps) {
        p5.ellipse(lump.dx, lump.dy, lump.rx * 2, lump.ry * 2);
      }
      p5.pop();

      // if offscreen to the right, remove + spawn new from left
      if (c.x > p5.width + 200) {
        this.clouds.splice(i, 1);
        this.spawnCloud();
      }
    }
  },

  drawGround(p5) {
    p5.fill(30, 150, 70);
    p5.noStroke();
    p5.rect(0, this.horizonY, p5.width, p5.height - this.horizonY);

    let spacing = 5;
    let amplitude = 30;
    let speedScale = 5;

    for (let x = 0; x < p5.width; x += spacing) {
      let wave = p5.noise(x * 0.05, this.grassOffset * speedScale) * amplitude;
      p5.fill(50, 180, 90);
      p5.rect(
        x,
        this.horizonY + wave,
        spacing,
        p5.height - this.horizonY - wave
      );
    }
  },

  drawTreesAndForest(p5, barnX) {
    p5.fill(20, 100, 50);
    p5.rect(0, this.horizonY - 40, p5.width * 0.5, 40);
    p5.rect(barnX - 150, this.horizonY - 40, p5.width - (barnX - 150), 40);

    this.drawTree(p5, p5.width * 0.2, this.horizonY - 10, 20, 60);
    this.drawTree(p5, p5.width * 0.3, this.horizonY - 5, 15, 45);
  },

  drawTree(p5, baseX, baseY, tw, th) {
    p5.fill(70, 40, 20);
    p5.rect(baseX - tw * 0.1, baseY - th * 0.6, tw * 0.2, th * 0.6);
    p5.fill(30, 120, 40);
    p5.ellipse(baseX, baseY - th * 0.8, tw * 2, th * 0.8);
  }
};

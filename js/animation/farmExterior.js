/* farmExterior.js
 *
 * 1) Single tap on the barn toggles inside/outside (using touchStarted() for iOS).
 * 2) If device is in landscape (width > height), we resize canvas to fill windowWidth x windowHeight.
 *    If portrait, revert to 900×300. We recalc horizon and barn geometry accordingly.
 *
 * NOTE: On iOS Safari, "true" fullscreen typically requires meta tags and/or web-app mode.
 */

import { barn } from "./barn.js";
import { people } from "./people.js";
import { environment } from "./environment.js";
import { extras } from "./extras.js";

const DEFAULT_CANVAS_W = 900;
const DEFAULT_CANVAS_H = 300;

let horizonY = 0;

function setup() {
  createCanvas(DEFAULT_CANVAS_W, DEFAULT_CANVAS_H).parent("p5-farm-holder");
  computeLayout();

  // Initialize environment
  environment.initEnvironment(horizonY, 5, width);

  // Barn geometry
  initBarnGeometry();

  // People start offscreen
  people.initPeopleOffscreenRight(horizonY, width, barn.barnX, barn.barnW);
}

function draw() {
  // 1) Environment
  environment.drawSky(this);
  environment.updateAndDrawClouds(this);
  environment.drawGround(this);
  environment.drawTreesAndForest(this, barn.barnX);

  // 2) Barn interior glow
  barn.drawInteriorGlow(this);

  // 3) Door
  barn.updateDoor();
  barn.drawDoor(this);
  barn.drawBarnFacadeCutout(this);

  // 4) People logic
  let barnIsOpen = (barn.doorStage === "open");
  let { wantDoorOpen, allInside, allOutside } = people.update(
    barnIsOpen,
    barn.barnX,
    barn.barnW,
    width
  );
  if (wantDoorOpen) barn.openDoor();
  if (allInside || allOutside) barn.closeDoor();

  people.draw(this);

  // 5) Extras
  extras.maybeSpawnTractor(this);
  extras.updateAndDrawTractors(this, horizonY);
  extras.maybeSpawnBird(this);
  extras.updateAndDrawBirds(this);
  extras.displayTimecode(this);

  // Grass wave offset
  environment.grassOffset += 0.001;
}

/**
 * On iOS Safari, mousePressed() often won't fire reliably
 * for single taps. So we use touchStarted() for both desktop & mobile:
 */
function touchStarted() {
  // Check if tap inside barn rectangle
  if (
    mouseX >= barn.barnX &&
    mouseX <= barn.barnX + barn.barnW &&
    mouseY >= barn.barnY &&
    mouseY <= barn.barnY + barn.barnH
  ) {
    people.togglePeople();
  }
  // Returning false tells p5 to prevent default browser behaviors
  // like double-tap zoom on iOS.
  return false;
}

/**
 * On window resize or orientation change:
 * - If in landscape (width > height), fill entire window.
 * - Else revert to 900×300. Then recalc horizon & barn geometry.
 */
function windowResized() {
  if (windowWidth > windowHeight) {
    // Landscape => fill screen
    resizeCanvas(windowWidth, windowHeight);
  } else {
    // Portrait => default
    resizeCanvas(DEFAULT_CANVAS_W, DEFAULT_CANVAS_H);
  }
  computeLayout();
  environment.canvasW = width;
  environment.horizonY = horizonY;
  initBarnGeometry();
}

/** Recompute horizonY based on current canvas height. */
function computeLayout() {
  horizonY = height * 0.75;
}

/** (Re)initialize barn geometry after resizing. */
function initBarnGeometry() {
  let bW = width * 0.18;
  let bH = bW * 0.6;
  let bX = width * 0.65;
  let bY = horizonY - bH;
  barn.initBarn(bX, bY, bW, bH);
}

// Attach these functions for p5
window.setup = setup;
window.draw = draw;
window.touchStarted = touchStarted;
window.windowResized = windowResized;

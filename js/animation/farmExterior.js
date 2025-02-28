/* farmExterior.js
 *
 * Main entry point in p5 global mode.
 * - Single-tap inside the barn toggles people (without blocking scroll).
 * - If user drags more than ~10px, we assume scrolling and do nothing.
 * - On orientation change: fill screen in landscape, revert to 900×300 in portrait.
 */

import { barn } from "./barn.js";
import { people } from "./people.js";
import { environment } from "./environment.js";
import { extras } from "./extras.js";

// Default size for portrait
const DEFAULT_CANVAS_W = 900;
const DEFAULT_CANVAS_H = 300;

// We'll store horizon line
let horizonY = 0;

// We'll store the touch start position
let startX = 0;
let startY = 0;

function setup() {
  createCanvas(DEFAULT_CANVAS_W, DEFAULT_CANVAS_H).parent("p5-farm-holder");

  computeLayout();

  // Environment
  environment.initEnvironment(horizonY, 5, width);

  // Barn geometry
  initBarnGeometry();

  // People start offscreen to the right
  people.initPeopleOffscreenRight(horizonY, width, barn.barnX, barn.barnW);
}

function draw() {
  // 1) Sky and clouds
  environment.drawSky(this);
  environment.updateAndDrawClouds(this);

  // 2) Ground and trees
  environment.drawGround(this);
  environment.drawTreesAndForest(this, barn.barnX);

  // 3) Barn
  barn.drawInteriorGlow(this);
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

  if (wantDoorOpen) {
    barn.openDoor();
  }
  if (allInside || allOutside) {
    barn.closeDoor();
  }

  // Draw people
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
 * touchStarted() only stores initial finger coords.
 * We do NOT return false, so user can scroll if they drag.
 */
function touchStarted() {
  startX = mouseX;
  startY = mouseY;
}

/**
 * touchEnded():
 * If the user’s finger traveled < 10px, we treat it as a tap.
 * Otherwise, assume it was a scroll.
 */
function touchEnded() {
  let distanceMoved = dist(mouseX, mouseY, startX, startY);

  // If user didn’t move far => “tap”
  if (distanceMoved < 10) {
    // Check if tap is inside the barn bounding box
    if (
      mouseX >= barn.barnX &&
      mouseX <= barn.barnX + barn.barnW &&
      mouseY >= barn.barnY &&
      mouseY <= barn.barnY + barn.barnH
    ) {
      people.togglePeople();
    }
  }
}

/**
 * When device orientation changes or window is resized:
 * - If landscape => fill window
 * - If portrait => revert to 900x300
 */
function windowResized() {
  if (windowWidth > windowHeight) {
    resizeCanvas(windowWidth, windowHeight);
  } else {
    resizeCanvas(DEFAULT_CANVAS_W, DEFAULT_CANVAS_H);
  }
  computeLayout();
  environment.canvasW = width;
  environment.horizonY = horizonY;
  initBarnGeometry();
}

/** Calculate horizon line for the current canvas size. */
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

// Attach to p5 in global mode
window.setup = setup;
window.draw = draw;
window.touchStarted = touchStarted;
window.touchEnded = touchEnded;
window.windowResized = windowResized;

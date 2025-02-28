/* farmExterior.js
 *
 * Main entry point in p5 global mode.
 * - Double-click on the barn toggles people (like the original approach).
 * - If device is in landscape, fill window; else 900×300.
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

  // Initialize barn geometry
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

  // 3) Door updates & drawing
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
 * Double-click on the barn => toggle people inside/outside.
 */
function doubleClicked() {
  if (
    mouseX >= barn.barnX &&
    mouseX <= barn.barnX + barn.barnW &&
    mouseY >= barn.barnY &&
    mouseY <= barn.barnY + barn.barnH
  ) {
    people.togglePeople();
  }
}

/**
 * When the window size changes (rotation, etc.):
 * - If landscape => fill entire window
 * - If portrait => revert to 900×300
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

// Expose for p5 in global mode
window.setup = setup;
window.draw = draw;
window.doubleClicked = doubleClicked;
window.windowResized = windowResized;

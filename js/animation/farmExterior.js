/* farmExterior.js
 *
 * Main entry point that orchestrates barn, people, environment, and extras in p5 global mode.
 *
 * Changes from previous versions:
 * 1) Single tap triggers the people toggle instead of double-click.
 * 2) If the browser is landscape (w > h) on window resize, we go full screen.
 *    Otherwise, we revert to 900×300. We recalc horizon and barn geometry so it fits.
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
 * SINGLE TAP: if the user taps inside the barn’s rectangle,
 * toggle the people’s inside/outside state.
 */
function mousePressed() {
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
 * When the window size changes (e.g., rotating an iPhone),
 * switch to full-screen in landscape, revert to 900×300 in portrait.
 */
function windowResized() {
  if (windowWidth > windowHeight) {
    // Landscape => full screen
    resizeCanvas(windowWidth, windowHeight);
  } else {
    // Portrait => default size
    resizeCanvas(DEFAULT_CANVAS_W, DEFAULT_CANVAS_H);
  }
  // Recompute layout
  computeLayout();
  // Update environment’s internal size references
  environment.canvasW = width;
  environment.horizonY = horizonY;
  // Re-init barn geometry so it repositions at the correct spot
  initBarnGeometry();
}

/**
 * Compute horizonY based on current canvas size.
 */
function computeLayout() {
  horizonY = height * 0.75;
}

/**
 * Recompute barn geometry after a resize or on initial setup.
 */
function initBarnGeometry() {
  let bW = width * 0.18;
  let bH = bW * 0.6;
  let bX = width * 0.65;
  let bY = horizonY - bH;
  barn.initBarn(bX, bY, bW, bH);
}

// Attach global references for p5
window.setup = setup;
window.draw = draw;
window.mousePressed = mousePressed;
window.windowResized = windowResized;

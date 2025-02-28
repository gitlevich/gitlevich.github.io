/* farmExterior.js
 *
 * - People start offscreen on the right (fully outside).
 * - Double-click barn => toggles whether they move inside or outside.
 * - They approach the door from their side; once someone hits the sensor zone, the door opens.
 * - After the door is fully open, they cross into their final zone (inside = just behind door, outside = offscreen).
 * - The door closes once they're all fully in or out.
 */

import { barn } from "./barn.js";
import { people } from "./people.js";
import { environment } from "./environment.js";
import { extras } from "./extras.js";

const CANVAS_W = 900;
const CANVAS_H = 300;
let horizonY = 0;

function setup() {
  createCanvas(CANVAS_W, CANVAS_H).parent("p5-farm-holder");
  horizonY = height * 0.75;

  // Environment
  environment.initEnvironment(horizonY, 5, CANVAS_W);

  // Barn near the right
  const bW = width * 0.18;
  const bH = bW * 0.6;
  const bX = width * 0.65;
  const bY = horizonY - bH;
  barn.initBarn(bX, bY, bW, bH);

  // People start fully outside
  people.initPeopleOffscreenRight(horizonY, width, bX, bW);
}

function draw() {
  // 1) Environment
  environment.drawSky(this);
  environment.updateAndDrawClouds(this);
  environment.drawGround(this);
  environment.drawTreesAndForest(this, barn.barnX);

  // 2) Barn interior glow
  barn.drawInteriorGlow(this);

  // 3) Door mechanics
  barn.updateDoor();
  barn.drawDoor(this);
  barn.drawBarnFacadeCutout(this);

  // 4) People logic
  const barnIsOpen = (barn.doorStage === "open");
  const { wantDoorOpen, allInside, allOutside } = people.update(
    barnIsOpen,
    barn.barnX,
    barn.barnW,
    width
  );

  if (wantDoorOpen) barn.openDoor();
  if (allInside || allOutside) barn.closeDoor();

  // Draw people
  people.draw(this);

  // 5) Extras
  extras.maybeSpawnTractor(this);
  extras.updateAndDrawTractors(this, horizonY);
  extras.maybeSpawnBird(this);
  extras.updateAndDrawBirds(this);
  extras.displayTimecode(this);

  environment.grassOffset += 0.001;
}

/** Double-click barn => toggle whether people are inside or outside. */
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

window.setup = setup;
window.draw = draw;
window.doubleClicked = doubleClicked;

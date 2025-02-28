/* farmExterior.js
 *
 * This is the main entry point. It imports the barn, people, environment,
 * and extras subsystems and orchestrates them in p5’s global mode.
 *
 * The following assumptions apply:
 * 1) p5 is loaded first in index.html:
 *      <script src="https://cdn.jsdelivr.net/npm/p5@1.5.0/lib/p5.min.js"></script>
 * 2) Then this file is loaded as a module:
 *      <script type="module" src="js/animation/farmExterior.js"></script>
 * 3) The other subsystems (barn.js, people.js, environment.js, extras.js)
 *    are in the same directory and imported below.
 */

import { barn } from "./barn.js";
import { people } from "./people.js";
import { environment } from "./environment.js";
import { extras } from "./extras.js";

const CANVAS_W = 900;
const CANVAS_H = 300;

// We'll store the horizon line for environment rendering
let horizonY = 0;

/**
 * p5 global "setup" function.
 * Attached to window at the bottom so p5 sees it in global mode.
 */
function setup() {
  // Create our canvas behind the "farm-monitor-ratio" or whichever holder you want
  createCanvas(CANVAS_W, CANVAS_H).parent("p5-farm-holder");

  // Calculate horizon line
  horizonY = height * 0.75;

  // Initialize environment
  environment.initEnvironment(horizonY, 5); // horizon, initial cloud count

  // Initialize barn geometry
  // For demonstration, place it near the right side
  let bW = width * 0.18;
  let bH = bW * 0.6;
  let bX = width * 0.65;
  let bY = horizonY - bH;
  barn.initBarn(bX, bY, bW, bH);

  // Initialize two people, near the barn door
  people.initPeople(barn.doorX + 5, horizonY);

  // If you want, configure extras spawn rates here, e.g.:
  // extras.tractorSpawnRate = 0.0002;
  // extras.birdSpawnDay = 0.001;
}

/**
 * p5 global "draw" function.
 * Each frame, we orchestrate environment, barn, people, extras.
 */
function draw() {
  // 1) Environment: sky + clouds
  environment.drawSky(this);
  environment.updateAndDrawClouds(this);

  // 2) Ground + trees
  environment.drawGround(this);
  environment.drawTreesAndForest(this, barn.barnX);

  // 3) Barn interior glow
  barn.drawInteriorGlow(this);

  // 4) Barn door update + draw
  barn.updateDoor();
  barn.drawDoor(this);

  // 5) Barn facade with door hole
  barn.drawBarnFacadeCutout(this);

  // 6) People logic
  // Decide if barn door is open => let them cross
  let barnIsOpen = (barn.doorStage === "open");
  people.update(barnIsOpen, barn.doorX, width);
  people.draw(this);

  // 7) Extras: tractors, birds, timecode
  extras.maybeSpawnTractor(this);
  extras.updateAndDrawTractors(this, horizonY);

  extras.maybeSpawnBird(this);
  extras.updateAndDrawBirds(this);

  extras.displayTimecode(this);
  environment.grassOffset += 0.001;
}

// Attach setup/draw to the global window so p5 picks them up
window.setup = setup;
window.draw = draw;

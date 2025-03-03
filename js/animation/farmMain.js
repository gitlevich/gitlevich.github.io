/* farmMain.js
 *
 * Main entry point for the Agent Farm animation.
 * Coordinates between interior and exterior views based on time of day.
 * - Interior view: 9am-12pm, 1pm-5pm (work hours)
 * - Exterior view: Before 9am, 12pm-1pm, After 5pm
 */

import { initInterior, updateInterior, drawInterior } from './farmInterior.js';
import { barn } from './barn.js';
import { people } from './people.js';
import { environment } from './environment.js';
import { extras } from './extras.js';

const DEFAULT_CANVAS_W = 900;
const DEFAULT_CANVAS_H = 300;

let horizonY = 0;
let isInteriorView = false;
let canvasWidth, canvasHeight;
let lastViewChangeTime = 0;
let isTransitioning = false;
let transitionProgress = 0;

// Time control variables
let useManualTime = false; 
let manualHour = new Date().getHours();
let manualMinute = new Date().getMinutes();
let timeControlActive = false;
let timeControlMessage = '';
let timeControlMessageTimer = 0;

/**
 * Get current time info - either manual or system time
 * @returns {Object} Object with hour and minute properties
 */
function getTimeInfo() {
  if (useManualTime) {
    return { hour: manualHour, minute: manualMinute };
  } else {
    const now = new Date();
    return { hour: now.getHours(), minute: now.getMinutes() };
  }
}

/**
 * Checks if current time should show interior view
 * @returns {boolean} true if interior should be shown
 */
function shouldShowInterior() {
  const { hour } = getTimeInfo();
  // Interior during work hours (9-12, 1-5)
  return (hour >= 9 && hour < 12) || (hour >= 13 && hour < 17);
}

/**
 * P5.js setup function
 */
function setup() {
  const canvas = createCanvas(DEFAULT_CANVAS_W, DEFAULT_CANVAS_H).parent("p5-farm-holder");
  canvasWidth = width;
  canvasHeight = height;
  
  // Compute layout for exterior view
  computeExteriorLayout();
  
  // Initialize environment (exterior)
  environment.initEnvironment(horizonY, 5, width);
  
  // Initialize barn geometry (exterior)
  initBarnGeometry();
  
  // People start offscreen
  people.initPeopleOffscreenRight(horizonY, width, barn.barnX, barn.barnW);
  
  // Initialize interior view
  initInterior(window, canvasWidth, canvasHeight);
  
  // Check current time and decide which view to show
  isInteriorView = shouldShowInterior();
  
  // If starting with interior, set people to be inside but don't open the door
  if (isInteriorView) {
    people.peopleWantedInside = true;
    // Force people to be inside immediately without animation
    people.two.forEach(p => {
      p.x = people.insideX;
    });
  }
}

/**
 * P5.js draw function - called every frame
 */
function draw() {
  // Check if we need to switch views based on time
  const shouldBeInterior = shouldShowInterior();
  
  // If changing from exterior to interior
  if (shouldBeInterior && !isInteriorView) {
    // Only change if we haven't changed recently (to prevent rapid switching)
    const currentTime = Date.now();
    if (currentTime - lastViewChangeTime > 5000) {
      isTransitioning = true;
      transitionProgress = 0;
      people.peopleWantedInside = true;
      barn.openDoor();
      lastViewChangeTime = currentTime;
    }
  }
  
  // If changing from interior to exterior
  if (!shouldBeInterior && isInteriorView) {
    // Only change if we haven't changed recently
    const currentTime = Date.now();
    if (currentTime - lastViewChangeTime > 5000) {
      isTransitioning = true;
      transitionProgress = 0;
      people.peopleWantedInside = false;
      barn.openDoor();
      lastViewChangeTime = currentTime;
    }
  }
  
  // Handle transition
  if (isTransitioning) {
    transitionProgress += 0.02;
    if (transitionProgress >= 1) {
      isTransitioning = false;
      isInteriorView = shouldBeInterior;
      barn.closeDoor();
    }
  }
  
  // Draw the appropriate view
  if (isInteriorView && !isTransitioning) {
    drawInteriorView();
  } 
  else if (!isInteriorView && !isTransitioning) {
    drawExteriorView();
  }
  else {
    // During transition, we draw both views with opacity
    if (shouldBeInterior) {
      // Transitioning to interior
      push();
      drawExteriorView();
      pop();
      
      push();
      tint(255, 255 * transitionProgress);
      drawInteriorView();
      pop();
    } else {
      // Transitioning to exterior
      push();
      drawInteriorView();
      pop();
      
      push();
      tint(255, 255 * transitionProgress);
      drawExteriorView();
      pop();
    }
  }
  
  // Draw time control overlay if active
  if (timeControlActive || timeControlMessageTimer > 0) {
    drawTimeControlOverlay();
  }
  
  // Decrease message timer
  if (timeControlMessageTimer > 0) {
    timeControlMessageTimer--;
  }
}

/**
 * Draw the interior view
 */
function drawInteriorView() {
  // Pass the current time to updateInterior
  const { hour, minute } = getTimeInfo();
  updateInterior(window, hour, minute);
  drawInterior(window);
}

/**
 * Draw the exterior view
 */
function drawExteriorView() {
  // Update sky color based on time
  updateEnvironmentForTime();
  
  // 1) Environment
  environment.drawSky(window);
  environment.updateAndDrawClouds(window);
  environment.drawGround(window);
  environment.drawTreesAndForest(window, barn.barnX);

  // 2) Barn interior glow
  barn.drawInteriorGlow(window);

  // 3) Door updates & drawing
  barn.updateDoor();
  barn.drawDoor(window);
  barn.drawBarnFacadeCutout(window);

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

  people.draw(window);

  // 5) Extras
  extras.maybeSpawnTractor(window);
  extras.updateAndDrawTractors(window, horizonY);
  extras.maybeSpawnBird(window);
  extras.updateAndDrawBirds(window);
  
  // Use extras.displayTimecode instead of custom time display
  extras.displayTimecode(window);

  // Grass wave offset
  environment.grassOffset += 0.001;
}

/**
 * Update environment colors for the current time of day
 */
function updateEnvironmentForTime() {
  const { hour } = getTimeInfo();
  
  // Early morning (5-8am)
  if (hour >= 5 && hour < 8) {
    environment.skyTopColor = color(135, 206, 250);  // Light blue
    environment.skyBottomColor = color(255, 160, 100); // Sunrise orange
    environment.grassColor = color(60, 120, 40);      // Morning grass
  }
  // Mid-morning to afternoon (8am-4pm)
  else if (hour >= 8 && hour < 16) {
    environment.skyTopColor = color(120, 190, 255);    // Blue
    environment.skyBottomColor = color(180, 220, 255); // Light blue
    environment.grassColor = color(80, 150, 50);       // Vibrant grass
  }
  // Late afternoon/evening (4-7pm)
  else if (hour >= 16 && hour < 19) {
    environment.skyTopColor = color(100, 150, 230);     // Darkening blue
    environment.skyBottomColor = color(255, 140, 50);   // Orange sunset
    environment.grassColor = color(70, 130, 40);        // Evening grass
  }
  // Night (7pm-5am)
  else {
    environment.skyTopColor = color(10, 10, 50);        // Night blue
    environment.skyBottomColor = color(50, 50, 80);     // Dark blue
    environment.grassColor = color(40, 80, 30);         // Dark grass
  }
}

/**
 * Display the current time in the top-right corner
 */
function displayCurrentTime(p) {
  p.push();
  p.fill(255, 255, 255, 180);
  p.noStroke();
  p.textSize(14);
  p.textAlign(p.RIGHT);
  
  const { hour, minute } = getTimeInfo();
  const timeString = `${formatTime(hour)}:${formatTime(minute)}`;
  
  p.text(timeString, p.width - 10, 25);
  
  // If in manual time mode, add a small indicator
  if (useManualTime) {
    p.textSize(10);
    p.text("(manual)", p.width - 10, 40);
  }
  
  p.pop();
}

/**
 * Draw time control overlay
 */
function drawTimeControlOverlay() {
  push();
  // Semi-transparent background
  fill(0, 0, 0, 150);
  noStroke();
  rect(width/2 - 120, 10, 240, timeControlActive ? 80 : 30);
  
  // Time display text
  textAlign(CENTER);
  textSize(16);
  fill(255);
  
  if (timeControlActive) {
    // Active time control interface
    text(`Time: ${formatTime(manualHour)}:${formatTime(manualMinute)}`, width/2, 30);
    text("◄► Hours   ▲▼ Minutes", width/2, 55);
    text("Enter to apply, Esc to cancel", width/2, 80);
  } else if (timeControlMessageTimer > 0) {
    // Temporary message
    text(timeControlMessage, width/2, 30);
  } else {
    // Just show if using system or manual time
    text(useManualTime ? `Manual: ${formatTime(manualHour)}:${formatTime(manualMinute)}` : "System Time", width/2, 30);
  }
  pop();
}

/**
 * Format time with leading zero
 */
function formatTime(value) {
  return value.toString().padStart(2, '0');
}

/**
 * Double-click handler for user interaction
 */
function doubleClicked() {
  if (!isTransitioning) {
    if (
      mouseX >= barn.barnX &&
      mouseX <= barn.barnX + barn.barnW &&
      mouseY >= barn.barnY &&
      mouseY <= barn.barnY + barn.barnH
    ) {
      if (!isInteriorView) {
        people.togglePeople();
      }
    }
  }
}

/**
 * Keyboard handler for time control
 */
function keyPressed() {
  // 'T' key to toggle time control
  if (key === 't' || key === 'T') {
    timeControlActive = !timeControlActive;
    if (timeControlActive) {
      // Initialize with current values
      if (!useManualTime) {
        const now = new Date();
        manualHour = now.getHours();
        manualMinute = now.getMinutes();
      }
    }
    return false; // Prevent default behavior
  }
  
  // Handle time control inputs when active
  if (timeControlActive) {
    if (keyCode === LEFT_ARROW) {
      manualHour = (manualHour - 1 + 24) % 24;
      return false;
    }
    else if (keyCode === RIGHT_ARROW) {
      manualHour = (manualHour + 1) % 24;
      return false;
    }
    else if (keyCode === UP_ARROW) {
      manualMinute = (manualMinute + 1) % 60;
      return false;
    }
    else if (keyCode === DOWN_ARROW) {
      manualMinute = (manualMinute - 1 + 60) % 60;
      return false;
    }
    else if (keyCode === ENTER) {
      // Apply the manual time
      useManualTime = true;
      timeControlActive = false;
      timeControlMessage = `Time set to ${formatTime(manualHour)}:${formatTime(manualMinute)}`;
      timeControlMessageTimer = 90; // Show message for 90 frames
      
      // Force a view check
      isTransitioning = false;
      lastViewChangeTime = 0;
      
      return false;
    }
    else if (keyCode === ESCAPE) {
      // Cancel time control
      timeControlActive = false;
      return false;
    }
  }
  
  // System time shortcut - 'S' key
  if (key === 's' || key === 'S') {
    useManualTime = false;
    timeControlMessage = 'Using system time';
    timeControlMessageTimer = 90;
    
    // Force a view check
    isTransitioning = false;
    lastViewChangeTime = 0;
    
    return false;
  }
  
  // Quick time presets
  if (key === '1') { // Morning (10 AM)
    setQuickTimePreset(10, 0);
    return false;
  }
  else if (key === '2') { // Lunch (12:30 PM)
    setQuickTimePreset(12, 30);
    return false;
  }
  else if (key === '3') { // Afternoon (2 PM)
    setQuickTimePreset(14, 0);
    return false;
  }
  else if (key === '4') { // Evening (6 PM)
    setQuickTimePreset(18, 0);
    return false;
  }
  else if (key === '5') { // Night (10 PM)
    setQuickTimePreset(22, 0);
    return false;
  }
}

/**
 * Set a time preset quickly
 */
function setQuickTimePreset(hour, minute) {
  manualHour = hour;
  manualMinute = minute;
  useManualTime = true;
  timeControlMessage = `Time set to ${formatTime(hour)}:${formatTime(minute)}`;
  timeControlMessageTimer = 90;
  
  // Force a view check
  isTransitioning = false;
  lastViewChangeTime = 0;
}

/**
 * Window resize handler
 */
function windowResized() {
  const ratioContainer = document.querySelector('.farm-monitor-ratio');
  if (ratioContainer) {
    canvasWidth = ratioContainer.clientWidth;
    canvasHeight = ratioContainer.clientHeight;
    resizeCanvas(canvasWidth, canvasHeight);
  }
  
  // Recompute layout
  computeExteriorLayout();
  initBarnGeometry();
  
  // Reinitialize interior view with new dimensions
  initInterior(window, canvasWidth, canvasHeight);
}

/** Calculate horizon line for the current canvas size. */
function computeExteriorLayout() {
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
window.keyPressed = keyPressed; 
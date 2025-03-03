/* farmInterior.js
 *
 * Interior view of the Agent Farm
 * Shows the inside of the barn with:
 * - Two people working from 9-12 and 1-5
 * - Server racks, desks, whiteboard, and window
 */

// Constants for layout
const FLOOR_RATIO = 0.75; // Floor line at 3/4 of canvas height
const ROOF_RATIO = 1/6; // Roof band takes up 1/6 of canvas height

// Colors
const COLORS = {
  FLOOR: '#aaaaaa',
  WALL: '#dddddd',
  ROOF: '#8B4513',
  DESKS: '#ffffff',
  SERVER: '#444444',
  WINDOW_SKY: '#87CEEB',
  WINDOW_TREES: '#228B22',
  BEANBAG: '#cc6666',
  PERSON1: '#3366cc',
  PERSON2: '#cc6633',
  WHITEBOARD: '#ffffff'
};

// State
let floorY = 0;
let roofY = 0;
let interiorObjects = {};
let people = [];
let timeState = {
  currentHour: 0,
  currentMinute: 0
};

/**
 * Internal class for a person in the scene
 */
class Person {
  constructor(x, y, color, id) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.id = id;
    this.state = 'desk'; // desk, walking, whiteboard
    this.targetX = x;
    this.targetY = y;
    this.speed = 0.7;
    this.stateTimer = 0;
    this.width = 15;
    this.height = 40;
    this.headSize = 15;
  }
  
  update() {
    // Move towards target
    if (Math.abs(this.x - this.targetX) > 1) {
      this.x += (this.targetX - this.x) * this.speed / 60;
    }
    if (Math.abs(this.y - this.targetY) > 1) {
      this.y += (this.targetY - this.y) * this.speed / 60;
    }
    
    // State management
    this.stateTimer--;
    if (this.stateTimer <= 0 && this.state !== 'walking') {
      if (Math.random() < 0.01) { // 1% chance to change state
        this.changeState();
      }
    }
  }
  
  changeState() {
    const prevState = this.state;
    
    if (prevState === 'desk') {
      // From desk - can go to whiteboard or other desk
      if (Math.random() < 0.6) {
        this.state = 'whiteboard';
        this.targetX = interiorObjects.whiteboard.x + interiorObjects.whiteboard.w / 2;
        this.targetY = floorY;
      } else {
        // Go to other desk
        const otherDeskIndex = (this.id === 0) ? 1 : 0;
        this.state = 'desk';
        this.targetX = interiorObjects.desks[otherDeskIndex].x + interiorObjects.desks[otherDeskIndex].w / 2;
        this.targetY = floorY;
      }
    } else if (prevState === 'whiteboard') {
      // From whiteboard - go back to own desk
      this.state = 'desk';
      this.targetX = interiorObjects.desks[this.id].x + interiorObjects.desks[this.id].w / 2;
      this.targetY = floorY;
    }
    
    // Set walking state temporarily
    this.state = 'walking';
    this.stateTimer = Math.floor(Math.random() * 180) + 60; // 1-4 seconds
  }
  
  draw(p) {
    p.push();
    p.fill(this.color);
    p.noStroke();
    
    // Draw body (rectangle)
    p.rect(this.x - this.width/2, this.y - this.height, this.width, this.height);
    
    // Draw head (circle)
    p.ellipse(this.x, this.y - this.height - this.headSize/2, this.headSize, this.headSize);
    
    // If at whiteboard, draw arm pointing
    if (this.state === 'whiteboard' && Math.abs(this.x - this.targetX) < 5) {
      p.stroke(this.color);
      p.strokeWeight(4);
      p.line(
        this.x, 
        this.y - this.height + 10, 
        this.x + 20, 
        this.y - this.height - 10
      );
    }
    
    p.pop();
  }
}

/**
 * Initialize the scene with the canvas dimensions
 */
export function initInterior(p, canvasWidth, canvasHeight) {
  floorY = canvasHeight * FLOOR_RATIO;
  roofY = canvasHeight * ROOF_RATIO;
  
  // Calculate object dimensions based on canvas size
  const serverW = canvasWidth * 0.15;
  const serverH = canvasHeight * 0.5;
  const serverX = 0;
  const serverY = floorY - serverH;
  
  const whiteboardW = canvasWidth * 0.2;
  const whiteboardH = canvasHeight * 0.3;
  const whiteboardX = serverW + canvasWidth * 0.05;
  const whiteboardY = floorY - whiteboardH;
  
  const windowW = canvasWidth * 0.25;
  const windowH = canvasHeight * 0.3;
  const windowX = canvasWidth - windowW;
  const windowY = canvasHeight * 0.3;
  
  const deskW = canvasWidth * 0.15;
  const deskH = canvasHeight * 0.12;
  
  const desk1X = canvasWidth * 0.4;
  const desk1Y = floorY - deskH;
  
  const desk2X = canvasWidth * 0.65;
  const desk2Y = floorY - deskH;
  
  const beanbagW = canvasWidth * 0.12;
  const beanbagH = canvasHeight * 0.15;
  const beanbagX = canvasWidth * 0.8;
  const beanbagY = floorY - beanbagH / 2;
  
  // Save all interior objects
  interiorObjects = {
    server: { x: serverX, y: serverY, w: serverW, h: serverH },
    whiteboard: { x: whiteboardX, y: whiteboardY, w: whiteboardW, h: whiteboardH },
    window: { x: windowX, y: windowY, w: windowW, h: windowH },
    desks: [
      { x: desk1X, y: desk1Y, w: deskW, h: deskH },
      { x: desk2X, y: desk2Y, w: deskW, h: deskH }
    ],
    beanbag: { x: beanbagX, y: beanbagY, w: beanbagW, h: beanbagH }
  };
  
  // Initialize people
  people = [
    new Person(desk1X + deskW/2, floorY, COLORS.PERSON1, 0),
    new Person(desk2X + deskW/2, floorY, COLORS.PERSON2, 1)
  ];
}

/**
 * Update the scene based on current time
 * @param {object} p - p5 instance
 * @param {number} hour - current hour (0-23)
 * @param {number} minute - current minute (0-59)
 */
export function updateInterior(p, hour = null, minute = null) {
  // If hour and minute are not provided, use current time
  if (hour === null || minute === null) {
    const now = new Date();
    timeState.currentHour = now.getHours();
    timeState.currentMinute = now.getMinutes();
  } else {
    timeState.currentHour = hour;
    timeState.currentMinute = minute;
  }
  
  // Update people if work hours (9-12, 1-5)
  const isWorkHours = (
    (timeState.currentHour >= 9 && timeState.currentHour < 12) || 
    (timeState.currentHour >= 13 && timeState.currentHour < 17)
  );
  
  if (isWorkHours) {
    people.forEach(person => person.update());
  }
}

/**
 * Draw the interior scene
 */
export function drawInterior(p) {
  // Draw wall
  p.fill(COLORS.WALL);
  p.noStroke();
  p.rect(0, 0, p.width, floorY);
  
  // Draw floor
  p.fill(COLORS.FLOOR);
  p.rect(0, floorY, p.width, p.height - floorY);
  
  // Draw roof/ceiling
  p.fill(COLORS.ROOF);
  p.rect(0, 0, p.width, roofY);
  
  // Add horizontal lines to roof for texture
  p.stroke(90, 30, 0, 100);
  p.strokeWeight(1);
  const roofLines = 5;
  const roofLineSpacing = roofY / roofLines;
  for (let i = 1; i < roofLines; i++) {
    p.line(0, i * roofLineSpacing, p.width, i * roofLineSpacing);
  }
  
  // Draw window
  p.push();
  p.fill(COLORS.WINDOW_SKY);
  p.noStroke();
  p.rect(
    interiorObjects.window.x, 
    interiorObjects.window.y, 
    interiorObjects.window.w, 
    interiorObjects.window.h * 0.7
  );
  
  // Draw trees in window
  p.fill(COLORS.WINDOW_TREES);
  p.rect(
    interiorObjects.window.x, 
    interiorObjects.window.y + interiorObjects.window.h * 0.7, 
    interiorObjects.window.w, 
    interiorObjects.window.h * 0.3
  );
  
  // Window frame
  p.stroke(100);
  p.strokeWeight(4);
  p.noFill();
  p.rect(
    interiorObjects.window.x, 
    interiorObjects.window.y, 
    interiorObjects.window.w, 
    interiorObjects.window.h
  );
  p.line(
    interiorObjects.window.x + interiorObjects.window.w / 2, 
    interiorObjects.window.y, 
    interiorObjects.window.x + interiorObjects.window.w / 2, 
    interiorObjects.window.y + interiorObjects.window.h
  );
  p.line(
    interiorObjects.window.x, 
    interiorObjects.window.y + interiorObjects.window.h * 0.7, 
    interiorObjects.window.x + interiorObjects.window.w, 
    interiorObjects.window.y + interiorObjects.window.h * 0.7
  );
  p.pop();
  
  // Draw server rack
  p.push();
  p.fill(COLORS.SERVER);
  p.noStroke();
  p.rect(
    interiorObjects.server.x, 
    interiorObjects.server.y, 
    interiorObjects.server.w, 
    interiorObjects.server.h
  );
  
  // Add server LEDs
  for (let i = 0; i < 12; i++) {
    const yPos = interiorObjects.server.y + 10 + i * 20;
    // Vary the LED colors
    if (i % 3 === 0) {
      p.fill(0, 255, 0); // Green
    } else if (i % 3 === 1) {
      p.fill(255, 140, 0); // Orange
    } else {
      p.fill(0, 0, 255); // Blue
    }
    p.ellipse(
      interiorObjects.server.x + interiorObjects.server.w - 8, 
      yPos, 
      4, 
      4
    );
  }
  p.pop();
  
  // Draw whiteboard
  p.push();
  p.fill(COLORS.WHITEBOARD);
  p.stroke(100);
  p.strokeWeight(3);
  p.rect(
    interiorObjects.whiteboard.x, 
    interiorObjects.whiteboard.y, 
    interiorObjects.whiteboard.w, 
    interiorObjects.whiteboard.h
  );
  
  // Add some "writing" on the whiteboard
  p.stroke(0, 100);
  p.strokeWeight(1);
  // Some random squiggles to simulate AI diagrams
  for (let i = 0; i < 5; i++) {
    const yPos = interiorObjects.whiteboard.y + 20 + i * (interiorObjects.whiteboard.h / 6);
    p.beginShape();
    for (let x = 0; x < interiorObjects.whiteboard.w - 20; x += 10) {
      const noiseVal = p.noise(i * 0.5, x * 0.05) * 15;
      p.vertex(
        interiorObjects.whiteboard.x + 10 + x, 
        yPos + noiseVal
      );
    }
    p.endShape();
  }
  
  // Draw a crude neural network diagram
  const netX = interiorObjects.whiteboard.x + interiorObjects.whiteboard.w * 0.7;
  const netY = interiorObjects.whiteboard.y + interiorObjects.whiteboard.h * 0.5;
  const radius = 5;
  
  // Input layer
  for (let i = 0; i < 3; i++) {
    p.fill(0, 100);
    p.ellipse(netX - 40, netY - 20 + i * 20, radius * 2);
  }
  
  // Hidden layer
  for (let i = 0; i < 4; i++) {
    p.fill(0, 100);
    p.ellipse(netX, netY - 30 + i * 20, radius * 2);
  }
  
  // Output layer
  for (let i = 0; i < 2; i++) {
    p.fill(0, 100);
    p.ellipse(netX + 40, netY - 10 + i * 20, radius * 2);
  }
  
  // Draw connections
  p.stroke(0, 50);
  p.strokeWeight(0.5);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      p.line(
        netX - 40, netY - 20 + i * 20,
        netX, netY - 30 + j * 20
      );
    }
  }
  
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 2; j++) {
      p.line(
        netX, netY - 30 + i * 20,
        netX + 40, netY - 10 + j * 20
      );
    }
  }
  p.pop();
  
  // Draw desks
  p.push();
  p.fill(COLORS.DESKS);
  p.stroke(100);
  p.strokeWeight(2);
  interiorObjects.desks.forEach(desk => {
    p.rect(desk.x, desk.y, desk.w, desk.h);
    
    // Add a computer on the desk
    p.fill(40);
    p.noStroke();
    p.rect(desk.x + desk.w * 0.3, desk.y - 10, desk.w * 0.4, 10);
    p.rect(desk.x + desk.w * 0.4, desk.y - 20, desk.w * 0.2, 10);
  });
  p.pop();
  
  // Draw beanbag
  p.push();
  p.fill(COLORS.BEANBAG);
  p.noStroke();
  p.ellipse(
    interiorObjects.beanbag.x + interiorObjects.beanbag.w / 2,
    interiorObjects.beanbag.y + interiorObjects.beanbag.h / 2,
    interiorObjects.beanbag.w,
    interiorObjects.beanbag.h
  );
  
  // Add some wrinkles
  p.stroke(150, 50, 50, 100);
  p.strokeWeight(1);
  p.noFill();
  p.arc(
    interiorObjects.beanbag.x + interiorObjects.beanbag.w / 2,
    interiorObjects.beanbag.y + interiorObjects.beanbag.h / 2,
    interiorObjects.beanbag.w * 0.8,
    interiorObjects.beanbag.h * 0.8,
    p.PI * 0.2,
    p.PI * 0.9
  );
  p.arc(
    interiorObjects.beanbag.x + interiorObjects.beanbag.w / 2,
    interiorObjects.beanbag.y + interiorObjects.beanbag.h / 2,
    interiorObjects.beanbag.w * 0.6,
    interiorObjects.beanbag.h * 0.7,
    p.PI * 1.2,
    p.PI * 1.8
  );
  p.pop();
  
  // Draw people
  const isWorkHours = (
    (timeState.currentHour >= 9 && timeState.currentHour < 12) || 
    (timeState.currentHour >= 13 && timeState.currentHour < 17)
  );
  
  if (isWorkHours) {
    people.forEach(person => person.draw(p));
  }
}

/**
 * Returns whether it's time to show the interior view
 */
export function shouldShowInterior() {
  const now = new Date();
  const hour = now.getHours();
  
  // Interior during work hours (9-12, 1-5)
  return (hour >= 9 && hour < 12) || (hour >= 13 && hour < 17);
}

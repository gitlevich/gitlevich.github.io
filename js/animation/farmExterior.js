/* farmExterior.js
 *
 * A p5.js sketch that layers in 3 steps:
 *   1) Warm interior glow
 *   2) A sliding door
 *   3) A single barn facade (one shape + door cutout)
 *
 * The barn is not “mushroomed”; we define one polygon with a hole for the door region.
 * The door is drawn behind that hole. The two people are either inside or outside;
 * once the door is fully open, they cross, then it closes.
 *
 * Includes sky, clouds, ground, trees, tractors, birds, timecode.
 * No code is omitted or elided.
 */

const CANVAS_W = 900;
const CANVAS_H = 300;

let horizonY;

// Barn geometry
let barnX, barnY, barnW, barnH;

// Door geometry: slides left
let doorX, doorY, doorW, doorH;
let doorOffset = 0;        // 0 => fully closed, offset < 0 => partially/fully open
let doorStage = "closed";  // "opening","open","closing","closed"
let doorSpeed = 1;         // px per frame

// Exactly two people
let peopleState = "inside"; // or "outside"
let twoPeople = [];

// Clouds, tractors, birds
let clouds = [];
let tractors = [];
let birds = [];

// Grass wave
let grassOffset = 0.001;

// For demonstration: open door every ~6s
let nextDoorEventFrame = 0;

function setup() {
  createCanvas(CANVAS_W, CANVAS_H).parent("p5-farm-holder");

  horizonY = height * 0.75;

  // Barn geometry
  barnW = width * 0.18;
  barnH = barnW * 0.6;
  barnX = width * 0.65;
  barnY = horizonY - barnH;

  // Door is a rectangle in the bottom center
  doorW = barnW * 0.2;
  doorH = barnH * 0.5;
  doorX = barnX + (barnW - doorW) / 2;
  doorY = barnY + barnH - doorH;

  // Exactly two people, starting inside
  for (let i = 0; i < 2; i++) {
    twoPeople.push({
      x: doorX + 5, // near the door
      y: horizonY,
      speed: random(1,2),
      shirtCol: color(random(50,255), random(50,255), random(50,255)),
      pantsCol: color(random(50,255), random(50,255), random(50,255))
    });
  }

  // Spawn some clouds initially
  for (let i = 0; i < 5; i++) {
    spawnCloud();
  }
}

function draw() {
  // 1) Sky & clouds
  drawSkyByBrowserTime();
  updateAndDrawClouds();

  // 2) Ground & trees
  drawGround();
  drawTreesAndForest();

  // -----------------------------------
  // Step A: Warm interior glow
  drawInteriorGlow();

  // Step B: The sliding door
  updateDoor();
  drawDoor();

  // Step C: One-piece barn facade with a door cutout
  drawBarnFacadeCutout();

  // People logic
  maybeTogglePeople();
  updatePeople();
  drawPeople();

  // Tractors
  maybeSpawnTractor();
  updateAndDrawTractors();

  // Birds
  maybeSpawnBird();
  updateAndDrawBirds();

  // Time overlay
  displayTimecode();

  // Grass wave increment
  grassOffset += 0.001;
}

/* ----------------------------------------------------
   Step A: Warm interior glow
   We simply paint a rectangle in the door region
---------------------------------------------------- */
function drawInteriorGlow() {
  noStroke();
  fill(255,179,102); // ~3200K tungsten
  rect(doorX, doorY, doorW, doorH);
}

/* ----------------------------------------------------
   Step B: The door, drawn behind the future facade
   offset=0 => fully covering hole
   offset=-doorW => fully slid away
---------------------------------------------------- */
function updateDoor() {
  if (doorStage === "opening") {
    doorOffset -= doorSpeed;
    if (doorOffset <= -doorW) {
      doorOffset = -doorW;
      doorStage = "open";
    }
  }
  else if (doorStage === "closing") {
    doorOffset += doorSpeed;
    if (doorOffset >= 0) {
      doorOffset = 0;
      doorStage = "closed";
    }
  }
}

function drawDoor() {
  noStroke();
  fill(100, 30, 30);
  // Painted at (doorX+doorOffset, doorY). If offset=0 => fully closed
  rect(doorX + doorOffset, doorY, doorW, doorH);
}

function openDoor() {
  if (doorStage==="closed") {
    doorStage="opening";
  }
}
function closeDoor() {
  if (doorStage==="open") {
    doorStage="closing";
  }
}

/* ----------------------------------------------------
   Step C: Single barn shape with a cutout
   We define a polygon with outer corners for the barn,
   and an inner contour for the door hole.
   That shape is drawn last => top of the stack,
   effectively placing the door behind it.
---------------------------------------------------- */
function drawBarnFacadeCutout() {
  noStroke();
  fill(170,40,40);

  beginShape();
  // Outer corners of the barn (clockwise)
  vertex(barnX,        barnY);
  vertex(barnX+barnW,  barnY);
  vertex(barnX+barnW,  barnY+barnH);
  vertex(barnX,        barnY+barnH);

  // Door hole (counter-clockwise)
  beginContour();
  vertex(doorX+doorW, doorY);
  vertex(doorX,        doorY);
  vertex(doorX,        doorY+doorH);
  vertex(doorX+doorW,  doorY+doorH);
  endContour();

  endShape(CLOSE);

  // Roof on top
  fill(120,20,20);
  triangle(
    barnX, barnY,
    barnX + barnW, barnY,
    barnX + barnW*0.5, barnY - barnH*0.3
  );
}

/* ----------------------------------------------------
   PEOPLE: exactly 2
---------------------------------------------------- */
function updatePeople() {
  if (doorStage==="open") {
    if (peopleState==="inside") {
      for(let p of twoPeople){ p.x+= p.speed; }
      let anyOnScreen= twoPeople.some(p => p.x< width+50);
      if(!anyOnScreen) {
        peopleState="outside";
        closeDoor();
      }
    }
    else if (peopleState==="outside") {
      for(let p of twoPeople){ p.x-= p.speed; }
      let allInside= twoPeople.every(p => p.x<= doorX+5);
      if(allInside){
        peopleState="inside";
        closeDoor();
      }
    }
  }
}

function drawPeople() {
  for(let p of twoPeople){
    push();
    translate(p.x, p.y);
    noStroke();

    let bodyH=20, bodyW=6, headSize=6;

    fill(p.pantsCol);
    rect(-bodyW/2, -bodyH*0.4, bodyW, bodyH*0.4);
    fill(p.shirtCol);
    rect(-bodyW/2, -bodyH, bodyW, bodyH*0.6);
    fill(255,220,180);
    ellipse(0, -bodyH, headSize);

    pop();
  }
}

// Periodically open door => inside<->outside
function maybeTogglePeople() {
  if(frameCount> nextDoorEventFrame && doorStage==="closed"){
    nextDoorEventFrame= frameCount+ 6*60;
    openDoor();
  }
}

/* ----------------------------------------------------
   SKY
---------------------------------------------------- */
function drawSkyByBrowserTime() {
  let hr= hour() + minute()/60.0;
  let cNight= color(10,10,50);
  let cDay= color(100,185,255);

  let skyCol;
  if(hr<5) {
    skyCol= cNight;
  } else if(hr<7){
    let t= map(hr,5,7,0,1);
    skyCol= lerpColor(cNight,cDay,t);
  } else if(hr<17){
    skyCol= cDay;
  } else if(hr<19){
    let t= map(hr,17,19,0,1);
    skyCol= lerpColor(cDay,cNight,t);
  } else {
    skyCol= cNight;
  }

  noStroke();
  fill(skyCol);
  rect(0,0,width, horizonY);

  // starry if night
  if(hr<5||hr>=19){
    fill(255);
    for(let i=0; i<50; i++){
      let sx= noise(i)* width;
      let sy= noise(i+999)*(horizonY*0.8);
      circle(sx,sy,1);
    }
  }
}

/* ----------------------------------------------------
   CLOUDS
---------------------------------------------------- */
function spawnCloud() {
  let lumpsCount= floor(random(3,6));
  let lumpsData=[];
  for(let i=0;i< lumpsCount;i++){
    lumpsData.push({
      dx: random(-30,30),
      dy: random(-10,10),
      rx: random(25,45),
      ry: random(15,25)
    });
  }
  clouds.push({
    x: random(-300, width),
    y: random(0,horizonY*0.4),
    speed: random(0.02,0.05),
    lumps: lumpsData,
    baseColor: color(random(220,255))
  });
}

function updateAndDrawClouds() {
  noStroke();
  for(let i= clouds.length-1; i>=0; i--){
    let c= clouds[i];
    c.x += c.speed;
    push();
    translate(c.x,c.y);
    fill(c.baseColor);
    for(let lump of c.lumps){
      ellipse(lump.dx, lump.dy, lump.rx*2, lump.ry*2);
    }
    pop();

    if(c.x> width+200){
      clouds.splice(i,1);
      spawnCloud();
    }
  }
}

/* ----------------------------------------------------
   GROUND
---------------------------------------------------- */
function drawGround() {
  fill(30,150,70);
  noStroke();
  rect(0,horizonY, width, height - horizonY);

  let spacing=5;
  let amplitude=30;
  let speedScale=5;
  for(let x=0; x<width; x+=spacing){
    let wave= noise(x*0.05, grassOffset*speedScale)* amplitude;
    fill(50,180,90);
    rect(x, horizonY+wave, spacing, (height-horizonY)-wave);
  }
}

/* ----------------------------------------------------
   TREES
---------------------------------------------------- */
function drawTreesAndForest() {
  fill(20,100,50);
  rect(0, horizonY-40, width*0.5, 40);
  rect(barnX-150, horizonY-40, width-(barnX-150),40);

  drawTree(width*0.2, horizonY-10,20,60);
  drawTree(width*0.3, horizonY-5,15,45);
}

function drawTree(bx,by,tw,th) {
  fill(70,40,20);
  rect(bx - tw*0.1, by-th*0.6, tw*0.2, th*0.6);
  fill(30,120,40);
  ellipse(bx, by-th*0.8, tw*2, th*0.8);
}

/* ----------------------------------------------------
   TRACTORS
---------------------------------------------------- */
function maybeSpawnTractor() {
  if(random(1)<0.0002){
    let direction= (random(1)<0.5)? -1:1;
    let startX= (direction===1)? -100: width+80;
    let speed= random(1,3);
    let c= randomNonGreenColor();
    tractors.push({x:startX, dir:direction, speed, color:c});
  }
}

function updateAndDrawTractors() {
  for(let i=tractors.length-1; i>=0; i--){
    let t= tractors[i];
    t.x+= t.dir*t.speed;
    if((t.dir===-1 && t.x< -150) ||
      (t.dir===1 && t.x> width+150)){
      tractors.splice(i,1);
      continue;
    }
    push();
    translate(t.x,horizonY-10);
    drawTractor(t);
    pop();
  }
}

function randomNonGreenColor() {
  colorMode(HSB);
  let h= random(360);
  while(h>80&&h<160){ h= random(360); }
  let s= random(50,100);
  let b= random(70,100);
  let col= color(h,s,b);
  colorMode(RGB);
  return col;
}

function drawTractor(t){
  noStroke();
  fill(t.color);
  rect(0,-15,35,15);
  rect(10,-25,15,10);
  fill(0);
  ellipse(8,0,12,12);
  ellipse(28,0,16,16);
}

/* ----------------------------------------------------
   BIRDS
---------------------------------------------------- */
function maybeSpawnBird(){
  let hr= hour();
  let spawnChance=0.001;
  if(hr<6||hr>=20){
    spawnChance=0.0001;
  }
  if(random(1)<spawnChance){
    let dir= (random(1)<0.5)? -1:1;
    let startX= (dir>0)? -20: width+20;
    birds.push({
      x:startX,
      y: random(horizonY*0.4),
      vx: random(0.5,1.2),
      dir,
      size: random(6,10),
      flapOffset: random(TWO_PI)
    });
  }
}

function updateAndDrawBirds(){
  for(let i=birds.length-1; i>=0; i--){
    let b= birds[i];
    b.x+= b.dir*b.vx;
    drawFlappingBird(b);
    if(b.x< -50 || b.x>width+50){
      birds.splice(i,1);
    }
  }
}

function drawFlappingBird(bird){
  push();
  translate(bird.x,bird.y);
  noStroke();

  let hr= hour();
  let cDay= color(80);
  let cNight= color(200);
  let birdColor= (hr<6||hr>=20)? cNight:cDay;
  fill(birdColor);

  let baseLen=8;
  let s= bird.size / baseLen;
  scale(s);

  let flapSpeed=0.25;
  let wingAngle= sin(frameCount*flapSpeed + bird.flapOffset)*0.6;

  ellipse(0,0,6,3);
  ellipse(3,-1.5,2,2);
  triangle(-3,0, -5,-1, -5,1);

  // Left wing
  push();
  rotate(-wingAngle);
  beginShape();
  vertex(0,0);
  vertex(-10,-3);
  vertex(-1,-2);
  endShape(CLOSE);
  pop();

  // Right wing
  push();
  rotate(wingAngle);
  beginShape();
  vertex(0,0);
  vertex(10,-3);
  vertex(1,-2);
  endShape(CLOSE);
  pop();

  pop();
}

/* ----------------------------------------------------
   TIME CODE
---------------------------------------------------- */
function displayTimecode() {
  let now= new Date();
  let h= now.getHours();
  let m= now.getMinutes();
  let s= now.getSeconds();
  let ms= now.getMilliseconds();
  let fps=60;
  let frames= floor((ms/1000)*fps);

  let tc= `${nf(h,2)}:${nf(m,2)}:${nf(s,2)}:${nf(frames,2)}`;

  push();
  textSize(16);
  textAlign(LEFT,TOP);
  let tw= textWidth(tc);
  let th= textAscent()+ textDescent();
  let pad=6;
  fill(0,51);
  noStroke();
  rect(5,5, tw+pad*2, th+pad*2);

  fill(255);
  text(tc, 5+pad, 5+pad);
  pop();
}

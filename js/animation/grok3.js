// Global variables
let trees = [];
let clouds = [];
let people = [];
let tractors = [];
let grass = [];

function setup() {
  createCanvas(800, 400); // Wide canvas for ext master shot (24mm lens)

  // Initialize forest trees behind the barn
  for (let i = 0; i < 20; i++) {
    trees.push({ x: random(0, width), size: random(10, 30) });
  }

  // Initialize clouds with varied sizes and shapes
  for (let i = 0; i < 3; i++) {
    let cloud = {
      x: random(0, width),
      y: random(50, 150),
      speed: (random() < 0.5 ? 1 : -1) * random(0.05, 0.2),
      scale: random(0.8, 1.5),
      puffs: []
    };
    let numPuffs = floor(random(3, 7));
    for (let j = 0; j < numPuffs; j++) {
      cloud.puffs.push({
        offsetX: random(-40, 40),
        offsetY: random(-20, 20),
        width: random(40, 80),
        height: random(20, 40)
      });
    }
    clouds.push(cloud);
  }

  // Initialize grass blades
  let num_grass = 800;
  for (let i = 0; i < num_grass; i++) {
    let y = random(height * 0.75, height);
    let max_h = map(y, height * 0.75, height, 5, 15);
    let h = random(max_h * 0.8, max_h);
    let x = random(0, width);
    let r = 50 + random(-10, 10);
    let g = 205 + random(-10, 10);
    let b = 50 + random(-10, 10);
    grass.push({ x: x, y: y, height: h, color: color(r, g, b) });
  }
}

function draw() {
  // Dynamic sky color based on real-time
  let h = hour();
  let m = minute();
  let time = h + m / 60;
  let angle = (time - 12) / 12 * PI;
  let brightness = (1 + cos(angle)) / 2;
  let skyColor = lerpColor(color('#191970'), color('#87CEEB'), brightness);

  // Draw sky
  noStroke();
  fill(skyColor);
  rect(0, 0, width, height * 0.75); // Horizon at 1/4 from bottom (y=300)

  // Draw clouds
  for (let cloud of clouds) {
    drawCloud(cloud);
    cloud.x += cloud.speed;
    if (cloud.speed > 0 && cloud.x > width) {
      cloud.x = -100;
    } else if (cloud.speed < 0 && cloud.x < -100) {
      cloud.x = width;
    }
  }

  // Draw ground
  fill(34, 139, 34); // Forest green
  rect(0, height * 0.75, width, height * 0.25);

  // Draw waving grass
  for (let blade of grass) {
    stroke(blade.color);
    strokeWeight(1);
    drawGrass(blade.x, blade.y, blade.height);
  }

  // Draw forest trees
  for (let tree of trees) {
    drawTree(tree.x, height * 0.75, tree.size);
  }

  // Draw red barn on the right
  fill('red');
  rect(600, 220, 100, 80); // Barn positioned for ext master shot
  triangle(600, 220, 700, 220, 650, 180);

  // Draw people
  for (let person of people) {
    drawPerson(person.x, person.y);
    person.x += person.speed;
  }
  people = people.filter(p => !(p.speed > 0 && p.x > width) && !(p.speed < 0 && p.x < 0));

  // Draw tractors
  for (let tractor of tractors) {
    drawTractor(tractor.x, tractor.y);
    tractor.x += tractor.speed;
  }
  tractors = tractors.filter(t => !(t.speed > 0 && t.x > width) && !(t.speed < 0 && t.x < 0));

  // Spawn occasional people
  if (random() < 0.002) {
    let direction = random() < 0.5 ? 1 : -1;
    let x = direction > 0 ? 0 : width;
    let speed = direction * random(0.5, 1.5);
    people.push({ x: x, y: 295, speed: speed });
  }

  // Spawn occasional tractors
  if (random() < 0.001) {
    let direction = random() < 0.5 ? 1 : -1;
    let x = direction > 0 ? 0 : width;
    let speed = direction * random(0.2, 0.5);
    tractors.push({ x: x, y: 295, speed: speed });
  }
}

// Function to draw a tree
function drawTree(x, y, size) {
  noStroke();
  fill('brown');
  rect(x - size / 4, y - size, size / 2, size);
  fill('green');
  ellipse(x, y - size, size * 1.5, size * 1.5);
}

// Function to draw a person
function drawPerson(x, y) {
  noStroke();
  fill('black');
  ellipse(x, y - 10, 5, 5);
  stroke('black');
  line(x, y - 5, x, y + 5);
}

// Function to draw a tractor
function drawTractor(x, y) {
  noStroke();
  fill('yellow');
  rect(x - 10, y - 5, 20, 10);
  fill('black');
  ellipse(x - 5, y + 5, 5, 5);
  ellipse(x + 5, y + 5, 5, 5);
}

// Function to draw a cloud
function drawCloud(cloud) {
  noStroke();
  fill(255, 255, 255, 200);
  for (let puff of cloud.puffs) {
    let px = cloud.x + puff.offsetX * cloud.scale;
    let py = cloud.y + puff.offsetY * cloud.scale;
    let pw = puff.width * cloud.scale;
    let ph = puff.height * cloud.scale;
    ellipse(px, py, pw, ph);
  }
}

// Function to draw waving grass
function drawGrass(x, y, h) {
  let t = millis() / 1000;
  let amplitude = map(y, height * 0.75, height, 2, 5);
  let offset = amplitude * sin(x / 50 - t);
  beginShape();
  curveVertex(x, y);
  curveVertex(x, y);
  curveVertex(x + offset / 2, y - h / 2);
  curveVertex(x + offset, y - h);
  curveVertex(x + offset, y - h);
  endShape();
}

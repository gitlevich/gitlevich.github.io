function setup() {
  const ratioContainer = document.querySelector('.farm-monitor-ratio');
  let w = 900, h = 300;
  if (ratioContainer) {
    w = ratioContainer.clientWidth;
    h = ratioContainer.clientHeight;
  }
  createCanvas(w, h).parent("p5-farm-holder");
  noLoop();
}

function draw() {
  const w = width;
  const h = height;

  // Roof at 1/6 from top
  const roofHeight = h / 6;
  // Floor at 3/4 from top
  const floorY = h * 0.75;

  //--- WALL (light gray)
  background(240);

  //--- FLOOR (darker gray)
  fill(160);
  rect(0, floorY, w, h - floorY);

  //--- ROOF (brown planks)
  fill(168, 106, 50);
  rect(0, 0, w, roofHeight);
  stroke(140, 88, 40);
  for (let y = 5; y < roofHeight; y += 10) {
    line(0, y, w, y);
  }
  noStroke();

  //--- DESKS (centered, separated further, half below floor)
  fill(255);
  const deskW = 80, deskH = 20;
  // Desk 1
  const desk1X = w / 2 - 80;
  const desk1Y = floorY - deskH / 2;
  rect(desk1X, desk1Y, deskW, deskH);
  // Desk 2
  const desk2X = w / 2 + 40;
  const desk2Y = floorY - deskH / 2;
  rect(desk2X, desk2Y, deskW, deskH);

  //--- SERVER RACK (front aligned with desk fronts)
  fill(100);
  const rackW = 150, rackH = 120;
  // front edge => rackY + rackH = floorY + deskH/2
  const rackY = floorY + (deskH / 2) - rackH;
  const rackX = -30;
  rect(rackX, rackY, rackW, rackH);

  //--- WHITEBOARD (right of rack, minimal overlap)
  fill(255);
  const boardW = 80, boardH = 100;
  const boardX = rackX + rackW + 10;
  // half below floor for mild perspective
  const boardY = floorY - boardH / 2 - 10;
  rect(boardX, boardY, boardW, boardH);
  fill(0);
  textSize(14);
  text("Whiteboard", boardX + 5, boardY + 20);

  //--- WINDOW (on right, partly off-canvas)
  fill(180, 220, 255);
  const winW = 240, winH = 120;
  const winX = w - (winW - 40);
  const winY = roofHeight + 10;
  rect(winX, winY, winW, winH);
  // Tree band
  fill(34, 139, 34);
  rect(winX, winY + 70, winW, 50);

  //--- BEANBAG (moved right, in front of window)
  fill(204, 102, 102);
  // placed so it dips more below floor, giving a “forward” perspective
  const beanbagX = w - 120;
  const beanbagY = floorY + 20;
  ellipse(beanbagX, beanbagY, 50, 30);

  //--- PEOPLE (feet at floorY)
  fill(0);
  const bodyH = 30;

  // Person A
  const pA_x = desk1X + deskW / 2;
  const pA_y = floorY - bodyH;
  rect(pA_x - 10, pA_y, 20, bodyH);
  ellipse(pA_x, pA_y - 10, 20, 20);

  // Person B
  const pB_x = desk2X + deskW / 2;
  const pB_y = floorY - bodyH;
  rect(pB_x - 10, pB_y, 20, bodyH);
  ellipse(pB_x, pB_y - 10, 20, 20);
}

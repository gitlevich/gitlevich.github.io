/*
  barn.js

  This module handles everything about our barn:
    - Geometry (barn facade coordinates)
    - One-piece facade shape with door cutout
    - Warm interior glow (the “inside” rectangle)
    - Sliding door (offset logic, open/close states)
    - No references to the environment or people logic here;
      we’ll call these functions from farmExterior.js or elsewhere.

  Usage flow (in your main code):
    1) barn.initBarn(...) once at setup, providing coordinates/sizes.
    2) Each frame:
       barn.drawInteriorGlow();
       barn.updateDoor();
       barn.drawDoor();
       barn.drawBarnFacadeCutout();
    3) When people arrive:
       barn.openDoor();
    4) After they cross:
       barn.closeDoor();
*/

export const barn = {
  // Barn position and size
  barnX: 0,
  barnY: 0,
  barnW: 0,
  barnH: 0,

  // Door geometry
  doorX: 0,
  doorY: 0,
  doorW: 0,
  doorH: 0,

  // Door sliding logic
  doorOffset: 0,       // 0 => closed, negative => slid behind facade
  doorStage: "closed", // "opening","open","closing","closed"
  doorSpeed: 1,        // how many pixels/step the door slides

  /**
   * Initialize barn geometry.
   *  x, y => top-left barn corner
   *  w, h => barn width, height
   * The door occupies bottom-center portion.
   */
  initBarn(x, y, w, h) {
    this.barnX = x;
    this.barnY = y;
    this.barnW = w;
    this.barnH = h;

    // Door is a fraction of the barn’s bottom center
    this.doorW = this.barnW * 0.2;
    this.doorH = this.barnH * 0.5;
    this.doorX = this.barnX + (this.barnW - this.doorW) / 2;
    this.doorY = this.barnY + this.barnH - this.doorH;

    // Start fully closed
    this.doorOffset = 0;
    this.doorStage = "closed";
  },

  /**
   * Draw the warm interior glow behind the door area.
   * Call this before drawDoor() if you want the glow to appear behind it.
   */
  drawInteriorGlow(p5) {
    // p5 => reference to p5 context
    p5.noStroke();
    p5.fill(255, 179, 102); // ~3200K color
    p5.rect(this.doorX, this.doorY, this.doorW, this.doorH);
  },

  /**
   * Update door offset based on doorStage.
   * Typically called each frame.
   */
  updateDoor() {
    if (this.doorStage === "opening") {
      this.doorOffset -= this.doorSpeed;
      if (this.doorOffset <= -this.doorW) {
        this.doorOffset = -this.doorW;
        this.doorStage = "open";
      }
    }
    else if (this.doorStage === "closing") {
      this.doorOffset += this.doorSpeed;
      if (this.doorOffset >= 0) {
        this.doorOffset = 0;
        this.doorStage = "closed";
      }
    }
  },

  /**
   * Draw the actual door rectangle,
   * offset behind the facade.
   */
  drawDoor(p5) {
    p5.noStroke();
    p5.fill(100, 30, 30); // door color
    let doorDrawX = this.doorX + this.doorOffset; // negative offset => slid left
    p5.rect(doorDrawX, this.doorY, this.doorW, this.doorH);
  },

  /**
   * Draw the barn facade as ONE piece with a door cutout using p5 beginContour.
   * This shape is painted last => door (drawn earlier) appears behind the hole.
   */
  drawBarnFacadeCutout(p5) {
    p5.noStroke();
    p5.fill(170, 40, 40);

    p5.beginShape();
    // Outer rectangle (clockwise)
    p5.vertex(this.barnX,             this.barnY);
    p5.vertex(this.barnX + this.barnW, this.barnY);
    p5.vertex(this.barnX + this.barnW, this.barnY + this.barnH);
    p5.vertex(this.barnX,             this.barnY + this.barnH);

    // Door hole (counter-clockwise)
    p5.beginContour();
    p5.vertex(this.doorX + this.doorW, this.doorY);
    p5.vertex(this.doorX,              this.doorY);
    p5.vertex(this.doorX,              this.doorY + this.doorH);
    p5.vertex(this.doorX + this.doorW, this.doorY + this.doorH);
    p5.endContour();

    p5.endShape(p5.CLOSE);

    // Roof
    p5.fill(120, 20, 20);
    p5.triangle(
      this.barnX, this.barnY,
      this.barnX + this.barnW, this.barnY,
      this.barnX + this.barnW * 0.5, this.barnY - this.barnH * 0.3
    );
  },

  /** Trigger door opening (if fully closed). */
  openDoor() {
    if (this.doorStage === "closed") {
      this.doorStage = "opening";
    }
  },
  /** Trigger door closing (if fully open). */
  closeDoor() {
    if (this.doorStage === "open") {
      this.doorStage = "closing";
    }
  },
};

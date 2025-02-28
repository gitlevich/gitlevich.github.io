/*
  people.js
  ---------

  Two people who can be "fully outside" (x >= outsideX) or "fully inside" (x <= insideX).
  Here, insideX = doorX + 5, so they vanish right behind the barn door rather than wandering far left.

  Flow:
  - If they want inside but are outside, they approach from the right until they reach the sensor zone.
  - That triggers wantDoorOpen => true. Once barnIsOpen, they cross behind the door (x <= insideX).
  - Next double-click => they approach from the left until sensor zone, door opens, they exit offscreen.
*/

export const people = {
  two: [],
  peopleWantedInside: false,

  // The sensor extends +/- this distance around the door center
  SENSOR_RANGE: 30,
  insideX: 0,    // behind the door
  outsideX: 0,   // offscreen to the right

  /**
   * Place them offscreen to the right; define inside/outside boundaries.
   * insideX => doorX + 5  so they vanish right behind the barn door.
   * outsideX => width + 50 so they vanish offscreen.
   */
  initPeopleOffscreenRight(startY, canvasW, barnX, barnW) {
    const doorX = barnX + (barnW * 0.4); // approximate left side of door
    this.insideX = doorX + 5;           // stop just behind the door
    this.outsideX = canvasW + 50;       // well offscreen

    // Start them well to the right
    this.two = [
      {
        x: this.outsideX + 50,
        y: startY,
        speed: 2.0,
      },
      {
        x: this.outsideX + 70,
        y: startY,
        speed: 2.5,
      },
    ];

    // Random clothes
    this.two.forEach((p) => {
      p.shirtCol = color(random(50, 255), random(50, 255), random(50, 255));
      p.pantsCol = color(random(50, 255), random(50, 255), random(50, 255));
    });

    // Start as "outside"
    this.peopleWantedInside = false;
  },

  togglePeople() {
    this.peopleWantedInside = !this.peopleWantedInside;
    console.log("peopleWantedInside =>", this.peopleWantedInside);
  },

  /**
   * Called each frame.
   * Return { wantDoorOpen, allInside, allOutside } for the barn logic.
   */
  update(barnIsOpen, barnX, barnW, canvasW) {
    let wantDoorOpen = false;
    let allInside = false;
    let allOutside = false;

    // Check who is fully inside/outside
    const everyoneInside = this.two.every((p) => p.x <= this.insideX);
    const everyoneOutside = this.two.every((p) => p.x >= this.outsideX);

    // If they're all set, no door needed
    if (
      (this.peopleWantedInside && everyoneInside) ||
      (!this.peopleWantedInside && everyoneOutside)
    ) {
      return { wantDoorOpen, allInside: everyoneInside, allOutside: everyoneOutside };
    }

    // Step A: approach the door
    const doorCenter = barnX + barnW / 2;

    this.two.forEach((p) => {
      if (this.peopleWantedInside) {
        // Move from right -> sensor zone if x > doorCenter+SENSOR_RANGE
        if (p.x > doorCenter + this.SENSOR_RANGE) {
          p.x -= p.speed;
          if (p.x < doorCenter + this.SENSOR_RANGE) {
            p.x = doorCenter + this.SENSOR_RANGE;
          }
        }
      } else {
        // Move from left -> sensor zone if x < doorCenter-SENSOR_RANGE
        if (p.x < doorCenter - this.SENSOR_RANGE) {
          p.x += p.speed;
          if (p.x > doorCenter - this.SENSOR_RANGE) {
            p.x = doorCenter - this.SENSOR_RANGE;
          }
        }
      }
    });

    // Step B: if anyone is in sensor range => wantDoorOpen
    const sensorTriggered = this.two.some((p) => {
      return Math.abs(p.x - doorCenter) <= this.SENSOR_RANGE;
    });
    if (sensorTriggered) {
      wantDoorOpen = true;
    }

    // Step C: if barn is open, cross fully
    if (barnIsOpen) {
      this.two.forEach((p) => {
        if (this.peopleWantedInside) {
          // move left until x <= insideX
          if (p.x > this.insideX) {
            p.x -= p.speed;
            if (p.x < this.insideX) {
              p.x = this.insideX;
            }
          }
        } else {
          // move right until x >= outsideX
          if (p.x < this.outsideX) {
            p.x += p.speed;
            if (p.x > this.outsideX) {
              p.x = this.outsideX;
            }
          }
        }
      });
    }

    // Step D: re-check if everyone is now truly inside or outside
    const nowInside = this.two.every((p) => p.x <= this.insideX);
    const nowOutside = this.two.every((p) => p.x >= this.outsideX);
    if (nowInside) allInside = true;
    if (nowOutside) allOutside = true;

    return { wantDoorOpen, allInside, allOutside };
  },

  /** Draw them if  insideX < x < outsideX.  */
  draw(p5) {
    p5.noStroke();
    for (let p of this.two) {
      // If already fully inside or outside, skip
      if (p.x <= this.insideX) continue;
      if (p.x >= this.outsideX) continue;

      // Otherwise draw
      p5.push();
      p5.translate(p.x, p.y);
      const bodyH = 20;
      const bodyW = 6;
      const headSize = 6;

      // Pants
      p5.fill(p.pantsCol || 0);
      p5.rect(-bodyW / 2, -bodyH * 0.4, bodyW, bodyH * 0.4);
      // Shirt
      p5.fill(p.shirtCol || 128);
      p5.rect(-bodyW / 2, -bodyH, bodyW, bodyH * 0.6);
      // Head
      p5.fill(255, 220, 180);
      p5.ellipse(0, -bodyH, headSize);

      p5.pop();
    }
  },
};

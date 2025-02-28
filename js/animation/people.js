/*
  people.js

  Manages exactly two people in a simple “inside” or “outside” state.
  Each person has:
    - (x, y) position
    - speed
    - shirt/pants color

  Usage:
    1) people.initPeople(...) once at setup if you need to set positions
       or something else.
    2) Each frame:
       people.update(barnDoorState, barnIsOpen);
       people.draw(p5);
    3) The door’s open => if they’re inside, they move out; if they’re outside,
       they move in.

  This file does NOT import barn.js. You’ll call, e.g., `if (barn.doorStage==="open")`
  from the main code, then pass that info to people.update(...).
*/

export const people = {
  // array of exactly two person objects
  two: [],

  // global state for them: "inside" or "outside"
  peopleState: "inside", // or "outside"

  /**
   * Initialize the two people array.
   * Provide a default x, y for them, or they can be set individually.
   */
  initPeople(startX, startY) {
    // We store two separate objects for them
    this.two = [
      {
        x: startX,
        y: startY,
        speed: 1.5,
        shirtCol: null,
        pantsCol: null,
      },
      {
        x: startX + 10, // offset them slightly
        y: startY,
        speed: 2.0,
        shirtCol: null,
        pantsCol: null,
      },
    ];

    // random clothing
    this.two.forEach(p => {
      p.shirtCol = color(random(50,255), random(50,255), random(50,255));
      p.pantsCol = color(random(50,255), random(50,255), random(50,255));
    });

    this.peopleState = "inside";
  },

  /**
   * Update positions if door is open, so they cross.
   * `barnIsOpen` is a boolean you pass in. If true, they can move.
   * width is the global canvas width for offscreen checks, etc.
   * doorX is the left boundary of door if you want them to come back in.
   */
  update(barnIsOpen, doorX, width) {
    // If door is open => let them cross
    if (barnIsOpen) {
      if (this.peopleState === "inside") {
        // move them right
        this.two.forEach(p => {
          p.x += p.speed;
        });
        // once both are offscreen => they're "outside"
        const anyOnScreen = this.two.some(p => p.x < width + 50);
        if (!anyOnScreen) {
          this.peopleState = "outside";
        }
      }
      else if (this.peopleState === "outside") {
        // move them left
        this.two.forEach(p => {
          p.x -= p.speed;
        });
        // once they all reach doorX => "inside"
        const allInside = this.two.every(p => p.x <= doorX + 5);
        if (allInside) {
          this.peopleState = "inside";
        }
      }
    }
  },

  /**
   * Draw them as simple “head + shirt + pants.”
   * p5 => your p5 instance or `this` from main draw code.
   */
  draw(p5) {
    p5.noStroke();

    // each person
    for (let p of this.two) {
      p5.push();
      p5.translate(p.x, p.y);

      let bodyH = 20;
      let bodyW = 6;
      let headSize = 6;

      // Pants
      p5.fill(p.pantsCol || 0);
      p5.rect(-bodyW/2, -bodyH * 0.4, bodyW, bodyH * 0.4);

      // Shirt
      p5.fill(p.shirtCol || 128);
      p5.rect(-bodyW/2, -bodyH, bodyW, bodyH * 0.6);

      // Head
      p5.fill(255, 220, 180);
      p5.ellipse(0, -bodyH, headSize);

      p5.pop();
    }
  },

  /**
   * If external logic decides “people want to pass,” we rely on barnIsOpen
   * to move them. This file doesn’t directly open the door.
   * But you can have a helper function for something like scheduling, if you want.
   */
};

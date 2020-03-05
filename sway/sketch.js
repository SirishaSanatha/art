/******************************************************************************
 * Sway
 * Michael Ruppe, Feb 2020
 *
 * A smooth, colourful tangle.
 * Each particle is assigned its own flow field to move it around.
 * Each particle-pair will draw with a colour chosen out of a pallette.
 *
 ******************************************************************************/

let alphaMax = 15; // Max alpha for a line

let inc = 0.01;
let scl = 100;
let cols, rows;
let zoff = 100; // near zero, all particles move in the same direction at start
let pallette, colours;

let particles = [],
  simplex = [],
  flowfield = [];


function setup() {
  pallette = new Array();
  setPallette();
  colours = random(pallette);

  createCanvas(windowWidth, windowHeight);
  cols = floor(width / scl);
  rows = floor(height / scl);

  // Unique seed noise
  let seedTime = (3600 * 24 * 30 * 12 * year() +
    3600 * 24 * 30 * month() +
    3600 * 24 * day() +
    3600 * hour() +
    60 * minute() +
    second());

  for (let i = 0; i < 50; i++) {
    particles.push(new Particle());
    simplex.push(new openSimplexNoise(seedTime + random(1000)));
    flowfield.push(new Array(cols * rows));
  }

}

function draw() {
  for (let i = 0; i < flowfield.length; i++) {
    let yoff = 0;
    for (let y = 0; y < rows; y++) {
      let xoff = 0;
      for (let x = 0; x < cols; x++) {
        let index = (x + y * cols);
        let angle = simplex[i].noise3D(xoff, yoff, zoff) * TWO_PI;
        xoff += inc;
        let v = p5.Vector.fromAngle(angle);
        v.setMag(0.05); // for force
        flowfield[i][index] = v; // Store the calculated vector in the array for later
      }
      yoff += inc;
    }

  }
  zoff += 0.002

  for (let i = 0; i < particles.length; i++) {
    particles[i].follow(flowfield[i]);
    particles[i].update();
    particles[i].edges();
    // particles[i].show();
  }

  linkup();
}


linkup = function() {
  let dmax = width / 10;

  // Draw the lines between particles.
  for (let i = 0; i < particles.length; i++) {
    for (let j = 0; j < i; j++) { // Draw from jth element up to i. Prevents double lines or drawing line from self to self
      let v1 = particles[i].pos.copy();
      let v2 = particles[j].pos.copy();
      let v = v1.copy();
      v.sub(v2);
      let d = v.mag(); // Minimise calls to mag() by saving in variable.
      if (d <= dmax) { // save some cycles - don't bother doing calculations if distance is too great anyway.
        d = constrain(d, 20, dmax);
        let alpha = map(d, 0, dmax, alphaMax, 0, 1);
        let palletteIndex = (i + j) % colours.length; // select a colour for a pair of particles
        let c = colours[palletteIndex];
        c.setAlpha(alpha);
        stroke(c);

        strokeWeight(1);
        line(v1.x, v1.y, v2.x, v2.y);
      }
    }
  }

}


// Populates an array with several pallettes that can be selected by the script.
setPallette = function() {

  // Forest
  pallette.push([color(109, 64, 13),
    color(3, 137, 113),
    color(59, 158, 184),
    color(113, 193, 108),
    color(52, 87, 32),
  ]);

  // Warm
  pallette.push([color(211, 217, 35),
    color(214, 217, 143),
    color(241, 242, 206),
    color(140, 91, 48),
    color(64, 57, 26)
  ]);

  // Night
  pallette.push([color(1, 2, 35, 1),
    color(2, 11, 61, 1),
    color(124, 158, 212, 1),
    color(117, 179, 212, 1),
    color(135, 239, 239, 1)
  ]);

  // Soda
  pallette.push([color(2, 7, 114),
    color(131, 191, 3),
    color(242, 202, 4),
    color(242, 127, 26),
    color(242, 101, 19)
  ]);

  // Beach
  pallette.push([color(91, 193, 216, 1),
    color(167, 228, 242, 1),
    color(101, 205, 216, 1),
    color(216, 186, 160, 1),
    color(242, 212, 186, 1)
  ]);

}
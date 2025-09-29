window.function = function (seedText, colorScheme, complexity) {
  const seed = seedText.value || 'default';
  const scheme = colorScheme.value || 'cosmic';
  const level = complexity.value || 5;
  
  try {
    const artPage = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Generative Art</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #000;
        }
        canvas {
            display: block;
            box-shadow: 0 0 50px rgba(0,0,0,0.5);
        }
    </style>
</head>
<body>
    <script>
        // Seed-based random number generator for reproducibility
        class SeededRandom {
            constructor(seed) {
                this.seed = this.hashCode(seed.toString());
            }
            
            hashCode(str) {
                let hash = 0;
                for (let i = 0; i < str.length; i++) {
                    hash = ((hash << 5) - hash) + str.charCodeAt(i);
                    hash = hash & hash;
                }
                return Math.abs(hash);
            }
            
            random() {
                this.seed = (this.seed * 9301 + 49297) % 233280;
                return this.seed / 233280;
            }
        }
        
        const SEED = '${seed}';
        const SCHEME = '${scheme}'.toLowerCase();
        const COMPLEXITY = Math.max(1, Math.min(10, ${level}));
        
        const rng = new SeededRandom(SEED);
        
        // Color schemes
        const colorSchemes = {
            cosmic: ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF'],
            ocean: ['#03045E', '#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8'],
            sunset: ['#FF5400', '#FF6D00', '#FF8500', '#FFAA00', '#FFDD00'],
            forest: ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#95D5B2'],
            fire: ['#370617', '#6A040F', '#9D0208', '#D00000', '#DC2F02'],
            neon: ['#FF006E', '#00F5FF', '#FFFF00', '#FF00FF', '#00FF00'],
            monochrome: ['#000000', '#333333', '#666666', '#999999', '#CCCCCC'],
            pastel: ['#FFB5E8', '#B5DEFF', '#C5FFC5', '#FFF4B5', '#FFCCE6']
        };
        
        const colors = colorSchemes[SCHEME] || colorSchemes.cosmic;
        
        let particles = [];
        let flowField = [];
        let cols, rows;
        const scl = 20;
        
        function setup() {
            createCanvas(800, 800);
            cols = floor(width / scl);
            rows = floor(height / scl);
            
            // Generate flow field
            flowField = new Array(cols * rows);
            let yoff = 0;
            for (let y = 0; y < rows; y++) {
                let xoff = 0;
                for (let x = 0; x < cols; x++) {
                    let index = x + y * cols;
                    let angle = noise(xoff, yoff) * TWO_PI * 4;
                    let v = p5.Vector.fromAngle(angle);
                    v.setMag(0.5);
                    flowField[index] = v;
                    xoff += 0.1;
                }
                yoff += 0.1;
            }
            
            // Create particles based on complexity
            const numParticles = COMPLEXITY * 100;
            for (let i = 0; i < numParticles; i++) {
                particles.push(new Particle());
            }
            
            background(0);
        }
        
        function draw() {
            // Fade effect
            fill(0, 5);
            noStroke();
            rect(0, 0, width, height);
            
            // Update and display particles
            for (let particle of particles) {
                particle.follow(flowField);
                particle.update();
                particle.edges();
                particle.show();
            }
        }
        
        class Particle {
            constructor() {
                this.pos = createVector(rng.random() * width, rng.random() * height);
                this.vel = createVector(0, 0);
                this.acc = createVector(0, 0);
                this.maxSpeed = 2;
                this.prevPos = this.pos.copy();
                this.colorIndex = floor(rng.random() * colors.length);
                this.hue = color(colors[this.colorIndex]);
                this.alpha = rng.random() * 100 + 50;
            }
            
            follow(vectors) {
                let x = floor(this.pos.x / scl);
                let y = floor(this.pos.y / scl);
                let index = x + y * cols;
                let force = vectors[index];
                if (force) {
                    this.applyForce(force);
                }
            }
            
            applyForce(force) {
                this.acc.add(force);
            }
            
            update() {
                this.vel.add(this.acc);
                this.vel.limit(this.maxSpeed);
                this.pos.add(this.vel);
                this.acc.mult(0);
            }
            
            show() {
                stroke(red(this.hue), green(this.hue), blue(this.hue), this.alpha);
                strokeWeight(1);
                line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
                this.updatePrev();
            }
            
            updatePrev() {
                this.prevPos.x = this.pos.x;
                this.prevPos.y = this.pos.y;
            }
            
            edges() {
                if (this.pos.x > width) {
                    this.pos.x = 0;
                    this.updatePrev();
                }
                if (this.pos.x < 0) {
                    this.pos.x = width;
                    this.updatePrev();
                }
                if (this.pos.y > height) {
                    this.pos.y = 0;
                    this.updatePrev();
                }
                if (this.pos.y < 0) {
                    this.pos.y = height;
                    this.updatePrev();
                }
            }
        }
        
        // Override p5's random to use seeded random
        function random(min, max) {
            if (arguments.length === 0) {
                return rng.random();
            } else if (arguments.length === 1) {
                return rng.random() * min;
            } else {
                return rng.random() * (max - min) + min;
            }
        }
        
        // Override noise for consistency
        noiseSeed(rng.random() * 100000);
    </script>
</body>
</html>`;
    
    const encodedHtml = encodeURIComponent(artPage);
    return "data:text/html;charset=utf-8," + encodedHtml;
    
  } catch (error) {
    console.error('Generative Art Error:', error);
    return undefined;
  }
}

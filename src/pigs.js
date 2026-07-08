import { AudioSynth } from './audio.js';

export class Pig {
  constructor(x, y, type, body) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.body = body;
    if (this.body) {
      this.body.plugin.entity = this;
    }

    this.isDead = false;
    this.shouldRemove = false;

    // Attributes
    switch (type) {
      case "small":
        this.radius = 14;
        this.maxHp = 50;
        this.points = 1000;
        this.multiplier = 1.0;
        break;
      case "regular":
        this.radius = 18;
        this.maxHp = 80;
        this.points = 1500;
        this.multiplier = 1.0;
        break;
      case "helmet":
        this.radius = 20;
        this.maxHp = 120;
        this.points = 2000;
        this.multiplier = 0.8; // 20% damage reduction
        break;
      case "moustache":
        this.radius = 23;
        this.maxHp = 180;
        this.points = 3000;
        this.multiplier = 0.7; // 30% damage reduction
        break;
      case "king":
        this.radius = 30;
        this.maxHp = 250;
        this.points = 5000;
        this.multiplier = 0.6; // 40% damage reduction
        break;
      default:
        this.radius = 18;
        this.maxHp = 80;
        this.points = 1500;
        this.multiplier = 1.0;
    }
    this.hp = this.maxHp;

    // Blinking timers
    this.blinkTimer = Math.random() * 180 + 120; // Blinks every 2-5 seconds (at 60fps)
    this.blinkDuration = 0;
  }

  update(dt) {
    if (this.body) {
      this.x = this.body.position.x;
      this.y = this.body.position.y;
    }

    // Blinking logic
    if (this.blinkDuration > 0) {
      this.blinkDuration--;
    } else {
      this.blinkTimer--;
      if (this.blinkTimer <= 0) {
        this.blinkDuration = 8; // Blinks for 8 frames
        this.blinkTimer = Math.random() * 180 + 120;
      }
    }
  }

  takeDamage(amount, game) {
    if (this.isDead) return;
    this.hp -= amount;

    if (this.hp <= 0) {
      this.die(game);
    }
  }

  die(game) {
    this.isDead = true;
    this.shouldRemove = true;
    
    // Play sound and award points
    AudioSynth.play("pig");
    game.addScore(this.points, this.x, this.y - this.radius);

    // Spawn green smoke popping particles
    const popParticles = Math.floor(Math.random() * 4) + 6; // 6 to 9 particles
    for (let i = 0; i < popParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      game.particles.push({
        type: "smoke",
        x: this.x + Math.cos(angle) * (this.radius * 0.5),
        y: this.y + Math.sin(angle) * (this.radius * 0.5),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        radius: Math.random() * 6 + 6,
        color: "rgba(180, 240, 180, 0.7)", // green smoke
        life: 1.0,
        decay: Math.random() * 0.04 + 0.03
      });
    }
  }

  draw(ctx, cameraX) {
    if (!this.body) return;

    ctx.save();
    ctx.translate(this.body.position.x - cameraX, this.body.position.y);
    ctx.rotate(this.body.angle);

    const rad = this.radius;
    const healthPercent = this.hp / this.maxHp;

    // 1. Draw ears
    ctx.fillStyle = "#81C784";
    ctx.strokeStyle = "#2E7D32";
    ctx.lineWidth = 2.5;

    // Left Ear
    ctx.beginPath();
    ctx.ellipse(-rad * 0.7, -rad * 0.8, rad * 0.25, rad * 0.4, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Left ear inner
    ctx.fillStyle = "#A5D6A7";
    ctx.beginPath();
    ctx.ellipse(-rad * 0.7, -rad * 0.8, rad * 0.12, rad * 0.22, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // Right Ear
    ctx.fillStyle = "#81C784";
    ctx.beginPath();
    ctx.ellipse(rad * 0.7, -rad * 0.8, rad * 0.25, rad * 0.4, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Right ear inner
    ctx.fillStyle = "#A5D6A7";
    ctx.beginPath();
    ctx.ellipse(rad * 0.7, -rad * 0.8, rad * 0.12, rad * 0.22, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // 2. Main Round Pig Body
    ctx.fillStyle = "#81C784";
    if (healthPercent < 0.75) ctx.fillStyle = "#72B775"; // darker green when bruised
    if (healthPercent < 0.4) ctx.fillStyle = "#63A466"; // even darker green
    
    ctx.strokeStyle = "#2E7D32";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3. Eyes
    const eyeSize = rad * 0.24;
    const pupilSize = rad * 0.08;
    const isBlinking = this.blinkDuration > 0;

    // Draw left eye
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(-rad * 0.35, -rad * 0.15, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw right eye
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(rad * 0.35, -rad * 0.15, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pupils/Expressions
    ctx.fillStyle = "#000000";
    if (isBlinking) {
      // Blinking: draw flat line
      ctx.strokeStyle = "#2E7D32";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-rad * 0.35 - eyeSize, -rad * 0.15);
      ctx.lineTo(-rad * 0.35 + eyeSize, -rad * 0.15);
      ctx.moveTo(rad * 0.35 - eyeSize, -rad * 0.15);
      ctx.lineTo(rad * 0.35 + eyeSize, -rad * 0.15);
      ctx.stroke();
    } else if (healthPercent < 0.4) {
      // Dizzy eyes (crosses X X)
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1.8;
      // Left eye X
      ctx.beginPath();
      ctx.moveTo(-rad * 0.35 - 3, -rad * 0.15 - 3);
      ctx.lineTo(-rad * 0.35 + 3, -rad * 0.15 + 3);
      ctx.moveTo(-rad * 0.35 + 3, -rad * 0.15 - 3);
      ctx.lineTo(-rad * 0.35 - 3, -rad * 0.15 + 3);
      // Right eye X
      ctx.moveTo(rad * 0.35 - 3, -rad * 0.15 - 3);
      ctx.lineTo(rad * 0.35 + 3, -rad * 0.15 + 3);
      ctx.moveTo(rad * 0.35 + 3, -rad * 0.15 - 3);
      ctx.lineTo(rad * 0.35 - 3, -rad * 0.15 + 3);
      ctx.stroke();
    } else if (healthPercent < 0.75) {
      // Bruised/worried pupils (smaller and looking upwards-inward)
      ctx.beginPath();
      ctx.arc(-rad * 0.3, -rad * 0.15, pupilSize * 0.7, 0, Math.PI * 2);
      ctx.arc(rad * 0.3, -rad * 0.15, pupilSize * 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Worried eyebrows
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-rad * 0.5, -rad * 0.4);
      ctx.lineTo(-rad * 0.2, -rad * 0.3);
      ctx.moveTo(rad * 0.5, -rad * 0.4);
      ctx.lineTo(rad * 0.2, -rad * 0.3);
      ctx.stroke();
    } else {
      // Healthy round pupils
      ctx.beginPath();
      ctx.arc(-rad * 0.32, -rad * 0.12, pupilSize, 0, Math.PI * 2);
      ctx.arc(rad * 0.32, -rad * 0.12, pupilSize, 0, Math.PI * 2);
      ctx.fill();

      // Simple horizontal eyebrows
      ctx.strokeStyle = "#2E7D32";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-rad * 0.5, -rad * 0.32);
      ctx.lineTo(-rad * 0.2, -rad * 0.32);
      ctx.moveTo(rad * 0.5, -rad * 0.32);
      ctx.lineTo(rad * 0.2, -rad * 0.32);
      ctx.stroke();
    }

    // 4. Snout (Pig Nose)
    ctx.fillStyle = "#A5D6A7";
    ctx.strokeStyle = "#2E7D32";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, rad * 0.15, rad * 0.32, rad * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Nostrils
    ctx.fillStyle = "#2E7D32";
    ctx.beginPath();
    ctx.arc(-rad * 0.1, rad * 0.15, rad * 0.05, 0, Math.PI * 2);
    ctx.arc(rad * 0.1, rad * 0.15, rad * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // 5. Bruises or Band-aids if damaged
    if (healthPercent < 0.75) {
      // Purple bruise under left eye
      ctx.fillStyle = "rgba(103, 58, 183, 0.4)";
      ctx.beginPath();
      ctx.arc(-rad * 0.4, rad * 0.1, rad * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
    if (healthPercent < 0.4) {
      // Band-aid on head
      ctx.fillStyle = "#F5DEB3";
      ctx.strokeStyle = "#D2B48C";
      ctx.lineWidth = 1.2;
      ctx.save();
      ctx.translate(rad * 0.2, -rad * 0.5);
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      ctx.rect(-6, -2.5, 12, 5);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 6. Draw decorations/types (Helmet, Mustache, King crown)
    if (this.type === "helmet") {
      // Grey Helmet on top
      ctx.fillStyle = "#78909C";
      ctx.strokeStyle = "#37474F";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      // Draw semi-circle shell covering upper half of the head
      ctx.arc(0, -rad * 0.2, rad * 1.05, Math.PI, 0);
      ctx.lineTo(rad * 1.05, rad * 0.1);
      ctx.lineTo(rad * 0.7, rad * 0.1);
      ctx.lineTo(-rad * 0.7, rad * 0.1);
      ctx.lineTo(-rad * 1.05, rad * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Helmet visor detail line
      ctx.strokeStyle = "#37474F";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-rad * 0.9, -rad * 0.2);
      ctx.lineTo(rad * 0.9, -rad * 0.2);
      ctx.stroke();

      // Draw cracks on helmet if damaged
      if (healthPercent < 0.6) {
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-rad * 0.3, -rad * 0.6);
        ctx.lineTo(-rad * 0.5, -rad * 1.1);
        ctx.moveTo(rad * 0.3, -rad * 0.6);
        ctx.lineTo(rad * 0.5, -rad * 1.1);
        ctx.stroke();
      }
    } else if (this.type === "moustache") {
      // Big brown mustache under the snout
      ctx.fillStyle = "#8B4513";
      ctx.strokeStyle = "#3E2723";
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Draw curl left
      ctx.moveTo(0, rad * 0.3);
      ctx.bezierCurveTo(-rad * 0.4, rad * 0.2, -rad * 0.8, rad * 0.4, -rad * 0.75, rad * 0.65);
      ctx.bezierCurveTo(-rad * 0.65, rad * 0.75, -rad * 0.3, rad * 0.5, 0, rad * 0.38);
      // Draw curl right
      ctx.bezierCurveTo(rad * 0.3, rad * 0.5, rad * 0.65, rad * 0.75, rad * 0.75, rad * 0.65);
      ctx.bezierCurveTo(rad * 0.8, rad * 0.4, rad * 0.4, rad * 0.2, 0, rad * 0.3);
      ctx.fill();
      ctx.stroke();

      // Big dark iron helmet
      ctx.fillStyle = "#455A64";
      ctx.strokeStyle = "#212F3D";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -rad * 0.3, rad * 1.05, Math.PI * 1.08, -Math.PI * 0.08);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (this.type === "king") {
      // Golden Crown on top of head
      ctx.fillStyle = "#FFC107";
      ctx.strokeStyle = "#5D4037";
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(-rad * 0.6, -rad * 0.85);
      ctx.lineTo(-rad * 0.5, -rad * 1.4); // left peak
      ctx.lineTo(-rad * 0.2, -rad * 1.1); // inner valley
      ctx.lineTo(0, -rad * 1.55);         // middle high peak
      ctx.lineTo(rad * 0.2, -rad * 1.1);  // inner valley
      ctx.lineTo(rad * 0.5, -rad * 1.4);  // right peak
      ctx.lineTo(rad * 0.6, -rad * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Jewels on crown
      ctx.fillStyle = "#E91E63"; // pinkish red ruby
      ctx.beginPath();
      ctx.arc(0, -rad * 1.45, rad * 0.06, 0, Math.PI * 2);
      ctx.arc(-rad * 0.5, -rad * 1.3, rad * 0.05, 0, Math.PI * 2);
      ctx.arc(rad * 0.5, -rad * 1.3, rad * 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Crown crown base rim
      ctx.fillStyle = "#FFA000";
      ctx.beginPath();
      ctx.rect(-rad * 0.6, -rad * 0.95, rad * 1.2, rad * 0.12);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }
}

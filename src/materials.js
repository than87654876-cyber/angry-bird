import { AudioSynth } from './audio.js';

export class MaterialBlock {
  constructor(x, y, w, h, type, body) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type;
    this.body = body;
    if (this.body) {
      this.body.plugin.entity = this;
    }

    this.isBroken = false;
    this.shouldRemove = false;

    // HP and multipliers
    switch (type) {
      case "glass":
        this.maxHp = 25;
        this.points = 50;
        this.multiplier = 2.0;
        break;
      case "wood":
        this.maxHp = 60;
        this.points = 100;
        this.multiplier = 1.2;
        break;
      case "stone":
        this.maxHp = 120;
        this.points = 200;
        this.multiplier = 0.6;
        break;
      case "tnt":
        this.maxHp = 10;
        this.points = 500;
        this.multiplier = 1.5;
        break;
      default:
        this.maxHp = 50;
        this.points = 100;
        this.multiplier = 1.0;
    }
    this.hp = this.maxHp;
  }

  update(dt) {
    if (this.body) {
      this.x = this.body.position.x;
      this.y = this.body.position.y;
    }
  }

  takeDamage(amount, game) {
    if (this.isBroken) return;
    this.hp -= amount;

    if (this.hp <= 0) {
      this.breakBlock(game);
    }
  }

  breakBlock(game) {
    this.isBroken = true;
    this.shouldRemove = true;
    game.addScore(this.points, this.x, this.y - 15);

    // Audio SFX
    if (this.type === "tnt") {
      AudioSynth.play("tnt");
      this.explode(game);
    } else {
      AudioSynth.play(this.type);
      // Spawn Debris
      this.spawnDebris(game);
    }
  }

  spawnDebris(game) {
    const debrisCount = Math.floor(Math.random() * 4) + 4; // 4 to 7 debris particles
    let color;
    switch (this.type) {
      case "glass": color = "rgba(173, 216, 230, 0.8)"; break;
      case "wood": color = "#CD853F"; break;
      case "stone": color = "#808080"; break;
    }

    for (let i = 0; i < debrisCount; i++) {
      game.particles.push({
        type: "debris",
        x: this.x,
        y: this.y,
        vx: (Math.random() * 6 - 3),
        vy: (Math.random() * -6 - 2),
        radius: Math.random() * 4 + 2,
        color: color,
        life: 1.0,
        decay: Math.random() * 0.05 + 0.03,
        gravity: 0.25,
        rotation: Math.random() * Math.PI,
        vRot: Math.random() * 0.2 - 0.1
      });
    }
  }

  explode(game) {
    // TNT explosion details
    const radius = 185;
    const forceFactor = 0.14;
    const maxExplosionDamage = 350;

    // Visual shockwave and fire particles
    game.particles.push({
      type: "shockwave",
      x: this.x,
      y: this.y,
      radius: 5,
      maxRadius: radius,
      life: 1.0,
      decay: 0.08
    });

    // Spawn 15-20 fire particles
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 4;
      game.particles.push({
        type: "fire",
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        radius: Math.random() * 8 + 6,
        life: 1.0,
        decay: Math.random() * 0.06 + 0.04
      });
    }

    // Apply physics forces and damage
    const Matter = window.Matter;
    if (!Matter) return;

    const bodies = Matter.Composite.allBodies(game.physics.world);
    bodies.forEach(otherBody => {
      if (otherBody === this.body) return;

      const entity = otherBody.plugin.entity;
      if (!entity || entity.isBroken || entity.shouldRemove) return;

      // Distance calculation
      const dx = otherBody.position.x - this.x;
      const dy = otherBody.position.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        // Calculate force vector
        const dirX = dist === 0 ? 0 : dx / dist;
        const dirY = dist === 0 ? -1 : dy / dist;
        const factor = (radius - dist) / radius;

        // Apply force if body is dynamic
        if (!otherBody.isStatic) {
          const mass = otherBody.mass;
          const forceMag = factor * forceFactor * 0.05 * mass;
          Matter.Body.applyForce(otherBody, otherBody.position, {
            x: dirX * forceMag,
            y: dirY * forceMag
          });
        }

        // Deal damage based on distance
        const damage = factor * maxExplosionDamage;
        if (entity && typeof entity.takeDamage === 'function') {
          entity.takeDamage(damage, game);
        }
      }
    });
  }

  draw(ctx, cameraX) {
    if (!this.body) return;

    ctx.save();
    ctx.translate(this.body.position.x - cameraX, this.body.position.y);
    ctx.rotate(this.body.angle);

    const halfW = this.w / 2;
    const halfH = this.h / 2;

    // Apply styles
    switch (this.type) {
      case "glass":
        // Semi-transparent blue glass
        ctx.fillStyle = "rgba(173, 216, 230, 0.5)";
        ctx.strokeStyle = "rgba(135, 206, 250, 0.9)";
        ctx.lineWidth = 2;
        ctx.shadowColor = "rgba(173, 216, 230, 0.4)";
        ctx.shadowBlur = 4;
        break;
      case "wood":
        // Warm brown wood
        ctx.fillStyle = "#A0522D";
        ctx.strokeStyle = "#5C2E0B";
        ctx.lineWidth = 3;
        break;
      case "stone":
        // Slate grey stone
        ctx.fillStyle = "#708090";
        ctx.strokeStyle = "#474F59";
        ctx.lineWidth = 3.5;
        break;
      case "tnt":
        // Explosive Red Box
        ctx.fillStyle = "#D2143A";
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "#D2143A";
        ctx.shadowBlur = 8;
        break;
    }

    // Draw main rectangle block
    ctx.beginPath();
    ctx.rect(-halfW, -halfH, this.w, this.h);
    ctx.fill();
    ctx.stroke();

    // Draw highlights for wood/stone textures
    if (this.type === "wood") {
      // Wood grain lines
      ctx.strokeStyle = "rgba(92, 46, 11, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-halfW + 5, -halfH + 5);
      ctx.lineTo(halfW - 5, -halfH + 5);
      ctx.moveTo(-halfW + 5, 0);
      ctx.lineTo(halfW - 5, 0);
      ctx.moveTo(-halfW + 5, halfH - 5);
      ctx.lineTo(halfW - 5, halfH - 5);
      ctx.stroke();
    } else if (this.type === "stone") {
      // Speckled stone texture
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.beginPath();
      ctx.arc(-halfW/2, -halfH/2, 3, 0, Math.PI*2);
      ctx.arc(halfW/3, halfH/4, 2, 0, Math.PI*2);
      ctx.arc(-halfW/3, halfH/3, 2.5, 0, Math.PI*2);
      ctx.fill();
    } else if (this.type === "tnt") {
      // Draw stencil "TNT" text
      ctx.fillStyle = "#FFCC00";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowBlur = 0; // turn off shadow for text
      ctx.fillText("TNT", 0, 0);

      // Warning hazard stripes
      ctx.strokeStyle = "#FFCC00";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-halfW + 4, -halfH + 4);
      ctx.lineTo(-halfW + 12, -halfH + 4);
      ctx.moveTo(-halfW + 4, -halfH + 4);
      ctx.lineTo(-halfW + 4, -halfH + 12);
      ctx.moveTo(halfW - 4, halfH - 4);
      ctx.lineTo(halfW - 12, halfH - 4);
      ctx.moveTo(halfW - 4, halfH - 4);
      ctx.lineTo(halfW - 4, halfH - 12);
      ctx.stroke();
    }

    // Draw damage crack decals if HP is reduced
    const healthPercent = this.hp / this.maxHp;
    if (healthPercent < 0.75 && this.type !== "tnt") {
      ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Outer cracks
      ctx.moveTo(-halfW + 10, -halfH + 10);
      ctx.lineTo(0, 0);
      ctx.lineTo(halfW - 10, halfH - 15);
      
      if (healthPercent < 0.4) {
        // Severe crack lines
        ctx.moveTo(halfW - 10, -halfH + 15);
        ctx.lineTo(-halfW/4, halfH/6);
        ctx.lineTo(-halfW + 15, halfH - 10);
      }
      ctx.stroke();
    }

    ctx.restore();
  }
}

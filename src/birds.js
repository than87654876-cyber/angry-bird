import { AudioSynth } from './audio.js';

export class Bird {
  constructor(x, y, type, body) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.body = body;
    if (this.body) {
      this.body.plugin.entity = this;
    }

    this.isFired = false;
    this.abilityTriggered = false;
    this.shouldRemove = false;
    this.trail = [];
    this.trailTimer = 0;

    // Breathing idle animation timing
    this.breathingPhase = Math.random() * Math.PI * 2;

    // Specific stats
    switch (type) {
      case "red":
        this.radius = 18;
        this.mass = 1.0;
        break;
      case "blue":
        this.radius = 12;
        this.mass = 0.5;
        break;
      case "yellow":
        this.radius = 16;
        this.mass = 1.6;
        break;
      case "black":
        this.radius = 22;
        this.mass = 3.5;
        this.explosionTimer = null; // Auto explode after collision
        break;
      case "white":
        this.radius = 20;
        this.mass = 2.2;
        break;
      case "green":
        this.radius = 16;
        this.mass = 1.2;
        break;
      case "orange":
        this.radius = 14;
        this.mass = 2.0;
        this.isInflated = false;
        break;
      case "purple":
        this.radius = 16;
        this.mass = 1.0;
        this.laserFired = false;
        this.laserLine = null;
        break;
      default:
        this.radius = 18;
        this.mass = 1.0;
    }
  }

  update(dt) {
    if (this.body) {
      this.x = this.body.position.x;
      this.y = this.body.position.y;

      // Handle trail recording if moving fast and fired
      if (this.isFired) {
        const vel = Math.sqrt(this.body.velocity.x * this.body.velocity.x + this.body.velocity.y * this.body.velocity.y);
        if (vel > 1.5) {
          this.trailTimer++;
          if (this.trailTimer % 2 === 0) {
            this.trail.push({ 
              x: this.x, 
              y: this.y, 
              life: 1.0,
              size: Math.random() * 4 + 3,
              angle: Math.random() * Math.PI * 2
            });
            if (this.trail.length > 25) {
              this.trail.shift();
            }
          }
        }
      }
    }

    // Decay trail particles
    this.trail.forEach(t => t.life -= 0.04);
    this.trail = this.trail.filter(t => t.life > 0);

    // Decay laser segment if purple bird fired
    if (this.laserLine) {
      this.laserLine.life -= 0.08 * dt;
      if (this.laserLine.life <= 0) {
        this.laserLine = null;
      }
    }

    // Update breathing phase
    this.breathingPhase += 0.08;
  }

  takeDamage(amount, game) {
    // Birds do not have health points, they are indestructible by explosions/blocks.
  }

  // Set when bird has a collision
  onCollision(game) {
    if (this.type === "black" && !this.abilityTriggered && this.explosionTimer === null) {
      // Explode automatically 2 seconds (120 frames or 2000ms) after collision
      this.explosionTimer = setTimeout(() => {
        if (!this.shouldRemove && !this.abilityTriggered) {
          this.triggerAbility(game);
        }
      }, 1500);
    }
  }

  triggerAbility(game) {
    if (this.abilityTriggered || !this.isFired || this.shouldRemove) return;
    this.abilityTriggered = true;

    const Matter = window.Matter;
    if (!Matter) return;

    if (this.type === "blue") {
      // Split into 3 birds: current continues, 2 new spawned
      AudioSynth.play("blue_split");

      const currentVel = this.body.velocity;
      const speed = Math.sqrt(currentVel.x * currentVel.x + currentVel.y * currentVel.y);
      const baseAngle = Math.atan2(currentVel.y, currentVel.x);

      // Spawn 2 angled birds
      const angles = [baseAngle + 0.22, baseAngle - 0.22]; // ~ +12.6 and -12.6 degrees
      
      angles.forEach(angle => {
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        // Create Matter Body slightly offset to avoid overlapping instantly
        const offsetX = Math.cos(angle + Math.PI/2) * 15;
        const offsetY = Math.sin(angle + Math.PI/2) * 15;
        
        const splitBody = Matter.Bodies.circle(this.x + offsetX, this.y + offsetY, this.radius, {
          density: 0.005,
          friction: 0.1,
          restitution: 0.5,
          frictionAir: 0.01
        });
        
        Matter.Body.setVelocity(splitBody, { x: vx, y: vy });
        Matter.Composite.add(game.physics.world, splitBody);

        const splitBird = new Bird(this.x + offsetX, this.y + offsetY, "blue", splitBody);
        splitBird.isFired = true;
        splitBird.abilityTriggered = true; // no nested splitting
        game.entities.push(splitBird);
      });

      // Spawn pop particles
      for (let i = 0; i < 6; i++) {
        game.particles.push({
          type: "smoke",
          x: this.x,
          y: this.y,
          vx: (Math.random() * 4 - 2),
          vy: (Math.random() * 4 - 2),
          radius: Math.random() * 4 + 4,
          color: "rgba(100, 200, 255, 0.6)",
          life: 1.0,
          decay: 0.04
        });
      }

    } else if (this.type === "yellow") {
      // Boost speed forward instantly
      AudioSynth.play("yellow_boost");

      const currentVel = this.body.velocity;
      const angle = Math.atan2(currentVel.y, currentVel.x);
      const speed = Math.max(Math.sqrt(currentVel.x * currentVel.x + currentVel.y * currentVel.y), 10);
      const newSpeed = speed * 2.2;

      Matter.Body.setVelocity(this.body, {
        x: Math.cos(angle) * newSpeed,
        y: Math.sin(angle) * newSpeed
      });

      // Spawn boost trail puff particles
      for (let i = 0; i < 8; i++) {
        game.particles.push({
          type: "smoke",
          x: this.x - Math.cos(angle) * 15,
          y: this.y - Math.sin(angle) * 15,
          vx: -Math.cos(angle) * (Math.random() * 3 + 1) + (Math.random() * 2 - 1),
          vy: -Math.sin(angle) * (Math.random() * 3 + 1) + (Math.random() * 2 - 1),
          radius: Math.random() * 5 + 5,
          color: "rgba(255, 235, 120, 0.7)",
          life: 1.0,
          decay: 0.05
        });
      }

    } else if (this.type === "black") {
      // Explode!
      if (this.explosionTimer) {
        clearTimeout(this.explosionTimer);
      }
      this.shouldRemove = true;
      AudioSynth.play("explode");
      game.triggerShake(16); // High magnitude shake for heavy explosion

      // Explode physics & damage
      const radius = 165;
      const forceFactor = 0.15;
      const maxDamage = 350;

      // Spawn explosion shockwave
      game.particles.push({
        type: "shockwave",
        x: this.x,
        y: this.y,
        radius: 5,
        maxRadius: radius,
        life: 1.0,
        decay: 0.06
      });

      // Fire particles
      for (let i = 0; i < 18; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 3;
        game.particles.push({
          type: "fire",
          x: this.x,
          y: this.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.8,
          radius: Math.random() * 7 + 5,
          life: 1.0,
          decay: Math.random() * 0.05 + 0.03
        });
      }

      // Hit bodies
      const bodies = Matter.Composite.allBodies(game.physics.world);
      bodies.forEach(otherBody => {
        if (otherBody === this.body) return;

        const entity = otherBody.plugin.entity;
        if (!entity || entity.isBroken || entity.isDead || entity.shouldRemove) return;

        const dx = otherBody.position.x - this.x;
        const dy = otherBody.position.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius) {
          const dirX = dist === 0 ? 0 : dx / dist;
          const dirY = dist === 0 ? -1 : dy / dist;
          const factor = (radius - dist) / radius;

          if (!otherBody.isStatic) {
            const force = factor * forceFactor * 0.05 * otherBody.mass;
            Matter.Body.applyForce(otherBody, otherBody.position, {
              x: dirX * force,
              y: dirY * force
            });
          }

          const damage = factor * maxDamage;
          if (entity && typeof entity.takeDamage === 'function') {
            entity.takeDamage(damage, game);
          }
        }
      });

    } else if (this.type === "white") {
      // Drop a vertical bomb + boost bird upward
      AudioSynth.play("launch");

      // Spawn bomb body
      const bombRadius = 14;
      const bombBody = Matter.Bodies.circle(this.x, this.y + this.radius + 10, bombRadius, {
        density: 0.008,
        friction: 0.2,
        restitution: 0.1
      });
      // Set vertical velocity downwards + match horizontal speed
      Matter.Body.setVelocity(bombBody, {
        x: this.body.velocity.x * 0.6,
        y: 8
      });
      
      // Setup bomb entity so it triggers explosion on first collision
      const bombEntity = {
        x: this.x,
        y: this.y + this.radius + 10,
        body: bombBody,
        isBroken: false,
        shouldRemove: false,
        update(dt) {
          if (bombBody) {
            this.x = bombBody.position.x;
            this.y = bombBody.position.y;
          }
        },
        takeDamage(amount, game) {
          this.detonate(game);
        },
        onCollision(game) {
          this.detonate(game);
        },
        detonate(game) {
          if (this.isBroken) return;
          this.isBroken = true;
          this.shouldRemove = true;

          AudioSynth.play("explode");
          game.triggerShake(10); // Moderate screen shake
          const radius = 150;
          const forceFactor = 0.12;
          const maxDamage = 250;

          // Shockwave
          game.particles.push({
            type: "shockwave",
            x: this.x,
            y: this.y,
            radius: 5,
            maxRadius: radius,
            life: 1.0,
            decay: 0.07
          });

          // Fire particles
          for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 3;
            game.particles.push({
              type: "fire",
              x: this.x,
              y: this.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              radius: Math.random() * 6 + 4,
              life: 1.0,
              decay: 0.05
            });
          }

          // Damage loop
          const bodies = Matter.Composite.allBodies(game.physics.world);
          bodies.forEach(ob => {
            if (ob === bombBody || ob === this.body) return;
            const entity = ob.plugin.entity;
            if (!entity || entity.isBroken || entity.isDead || entity.shouldRemove) return;

            const dx = ob.position.x - this.x;
            const dy = ob.position.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < radius) {
              const dirX = dist === 0 ? 0 : dx / dist;
              const dirY = dist === 0 ? -1 : dy / dist;
              const factor = (radius - dist) / radius;

              if (!ob.isStatic) {
                const force = factor * forceFactor * 0.05 * ob.mass;
                Matter.Body.applyForce(ob, ob.position, { x: dirX * force, y: dirY * force });
              }
              if (entity && typeof entity.takeDamage === 'function') {
                entity.takeDamage(factor * maxDamage, game);
              }
            }
          });
        },
        draw(ctx, cameraX) {
          ctx.save();
          ctx.translate(this.x - cameraX, this.y);
          ctx.rotate(bombBody.angle);
          // Draw round black bomb with burning fuse
          ctx.fillStyle = "#263238";
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, bombRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Fuse
          ctx.strokeStyle = "#FF9800";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, -bombRadius);
          ctx.quadraticCurveTo(-5, -bombRadius - 5, -8, -bombRadius - 2);
          ctx.stroke();

          // Spark particle
          ctx.fillStyle = "#FFEB3B";
          ctx.beginPath();
          ctx.arc(-8, -bombRadius - 2, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      };

      bombBody.plugin.entity = bombEntity;
      Matter.Composite.add(game.physics.world, bombBody);
      game.entities.push(bombEntity);

      // Recoil: catapult white bird upwards & forward
      Matter.Body.setVelocity(this.body, {
        x: this.body.velocity.x * 0.85,
        y: -9
      });
    } else if (this.type === "green") {
      // Boomerang: reverse X and slightly boost Y
      AudioSynth.play("yellow_boost");
      const currentVel = this.body.velocity;
      Matter.Body.setVelocity(this.body, {
        x: -currentVel.x * 1.15,
        y: currentVel.y - 4.5
      });
      // Smoke puff
      for (let i = 0; i < 6; i++) {
        game.particles.push({
          type: "smoke",
          x: this.x,
          y: this.y,
          vx: (Math.random() * 4 - 2),
          vy: (Math.random() * 4 - 2),
          radius: Math.random() * 4 + 4,
          color: "rgba(46, 204, 113, 0.6)",
          life: 1.0,
          decay: 0.04
        });
      }
    } else if (this.type === "orange") {
      // Inflate: scale body 3.2x, apply massive force to surrounding blocks/pigs
      AudioSynth.play("yellow_boost");
      this.isInflated = true;
      Matter.Body.scale(this.body, 3.2, 3.2);
      this.radius = 45;

      const radius = 180;
      const forceFactor = 0.22;
      const bodies = Matter.Composite.allBodies(game.physics.world);
      bodies.forEach(ob => {
        if (ob === this.body) return;
        const dx = ob.position.x - this.x;
        const dy = ob.position.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius) {
          const factor = (radius - dist) / radius;
          const dirX = dist === 0 ? 0 : dx / dist;
          const dirY = dist === 0 ? -1 : dy / dist;

          if (!ob.isStatic) {
            const force = factor * forceFactor * 0.08 * ob.mass;
            Matter.Body.applyForce(ob, ob.position, {
              x: dirX * force,
              y: dirY * force
            });
          }

          if (ob.plugin.entity && typeof ob.plugin.entity.takeDamage === 'function') {
            ob.plugin.entity.takeDamage(factor * 100, game);
          }
        }
      });

      // Deflate after 1.2 seconds
      setTimeout(() => {
        if (this.body && !this.shouldRemove) {
          Matter.Body.scale(this.body, 1/3.2, 1/3.2);
          this.radius = 14;
          this.isInflated = false;
        }
      }, 1200);

    } else if (this.type === "purple") {
      // Laser: fire ray along flight path penetrating glass/wood, stopped by stone
      AudioSynth.play("yellow_boost");
      this.laserFired = true;

      const currentVel = this.body.velocity;
      let angle = Math.atan2(currentVel.y, currentVel.x);
      if (currentVel.x === 0 && currentVel.y === 0) angle = 0;

      const range = 250;
      const startX = this.x;
      const startY = this.y;
      let endX = startX + Math.cos(angle) * range;
      let endY = startY + Math.sin(angle) * range;

      this.laserLine = { startX, startY, endX, endY, life: 1.0 };

      const bodies = Matter.Composite.allBodies(game.physics.world);
      
      const hitCandidates = [];
      bodies.forEach(ob => {
        if (ob === this.body) return;
        const entity = ob.plugin.entity;
        if (!entity || entity.isBroken || entity.isDead || entity.shouldRemove) return;

        const dx = ob.position.x - startX;
        const dy = ob.position.y - startY;
        const projDist = dx * Math.cos(angle) + dy * Math.sin(angle);
        if (projDist < 0 || projDist > range) return;

        const projX = startX + Math.cos(angle) * projDist;
        const projY = startY + Math.sin(angle) * projDist;
        const distToLine = Math.sqrt((ob.position.x - projX) ** 2 + (ob.position.y - projY) ** 2);

        const hitRadius = ob.circleRadius || 25;
        if (distToLine < hitRadius) {
          hitCandidates.push({ body: ob, entity, dist: projDist });
        }
      });

      hitCandidates.sort((a, b) => a.dist - b.dist);

      for (let i = 0; i < hitCandidates.length; i++) {
        const candidate = hitCandidates[i];
        if (candidate.entity.type === "stone") {
          // Truncate laser here
          this.laserLine.endX = startX + Math.cos(angle) * candidate.dist;
          this.laserLine.endY = startY + Math.sin(angle) * candidate.dist;
          break;
        }
        // Deal 100 laser damage
        if (typeof candidate.entity.takeDamage === 'function') {
          candidate.entity.takeDamage(100, game);
        }
      }

      // Spawn fire sparks at end of laser
      for (let i = 0; i < 8; i++) {
        const sparkAngle = Math.random() * Math.PI * 2;
        const sparkSpeed = Math.random() * 3 + 2;
        game.particles.push({
          type: "fire",
          x: this.laserLine.endX,
          y: this.laserLine.endY,
          vx: Math.cos(sparkAngle) * sparkSpeed,
          vy: Math.sin(sparkAngle) * sparkSpeed,
          radius: Math.random() * 3 + 2,
          life: 1.0,
          decay: 0.06
        });
      }
    }
  }

  draw(ctx, cameraX) {
    if (!this.body) return;

  draw(ctx, cameraX) {
    if (!this.body) return;

    // Draw laser segment if present
    if (this.laserLine) {
      ctx.save();
      ctx.strokeStyle = `rgba(186, 104, 200, ${this.laserLine.life})`; // Glowing purple
      ctx.lineWidth = 6 * this.laserLine.life;
      ctx.lineCap = "round";
      ctx.shadowColor = "#ba68c8";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(this.laserLine.startX - cameraX, this.laserLine.startY);
      ctx.lineTo(this.laserLine.endX - cameraX, this.laserLine.endY);
      ctx.stroke();
      ctx.restore();
    }

    // Draw trail
    this.trail.forEach(t => {
      ctx.save();
      switch (this.type) {
        case "red":
          // Red feather particles: slightly elongated red ovals that rotate
          ctx.fillStyle = `rgba(229, 57, 53, ${t.life * 0.6})`;
          ctx.translate(t.x - cameraX, t.y);
          ctx.rotate(t.angle || 0);
          ctx.beginPath();
          ctx.ellipse(0, 0, (t.size || 4) * t.life, (t.size || 4) * 0.45 * t.life, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "yellow":
          // Yellow stars/sparks: small glowing yellow diamonds
          ctx.fillStyle = `rgba(253, 216, 53, ${t.life * 0.8})`;
          ctx.translate(t.x - cameraX, t.y);
          ctx.rotate(Math.PI / 4); // Rotated square = diamond
          ctx.beginPath();
          ctx.rect(-(t.size || 3) * t.life, -(t.size || 3) * t.life, (t.size || 3) * 2 * t.life, (t.size || 3) * 2 * t.life);
          ctx.fill();
          break;
        case "blue":
          // Blue bubbles: light blue ring circles
          ctx.strokeStyle = `rgba(41, 182, 246, ${t.life * 0.7})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(t.x - cameraX, t.y, (t.size || 4) * 1.1 * t.life, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case "black":
          // Black smoke puff: dark grey fading circles
          ctx.fillStyle = `rgba(55, 71, 79, ${t.life * 0.45})`;
          ctx.beginPath();
          ctx.arc(t.x - cameraX, t.y, (t.size || 5) * 1.4 * t.life, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "white":
          // White cloud puff: soft white circles
          ctx.fillStyle = `rgba(255, 255, 255, ${t.life * 0.6})`;
          ctx.beginPath();
          ctx.arc(t.x - cameraX, t.y, (t.size || 6) * 1.3 * t.life, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "green":
          // Green feather particles
          ctx.fillStyle = `rgba(46, 204, 113, ${t.life * 0.65})`;
          ctx.translate(t.x - cameraX, t.y);
          ctx.rotate(t.angle || 0);
          ctx.beginPath();
          ctx.ellipse(0, 0, (t.size || 4) * t.life, (t.size || 4) * 0.45 * t.life, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "orange":
          // Orange circular trails
          ctx.fillStyle = `rgba(230, 74, 25, ${t.life * 0.6})`;
          ctx.beginPath();
          ctx.arc(t.x - cameraX, t.y, (t.size || 4) * t.life, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "purple":
          // Purple diamonds
          ctx.fillStyle = `rgba(186, 104, 200, ${t.life * 0.8})`;
          ctx.translate(t.x - cameraX, t.y);
          ctx.rotate(Math.PI / 4);
          ctx.beginPath();
          ctx.rect(-(t.size || 3) * t.life, -(t.size || 3) * t.life, (t.size || 3) * 2 * t.life, (t.size || 3) * 2 * t.life);
          ctx.fill();
          break;
        default:
          ctx.fillStyle = `rgba(220, 220, 220, ${t.life * 0.35})`;
          ctx.beginPath();
          ctx.arc(t.x - cameraX, t.y, this.radius * 0.45 * t.life, 0, Math.PI * 2);
          ctx.fill();
      }
      ctx.restore();
    });

    ctx.save();
    
    // Scale oscillation (breathing) when idle (not fired yet)
    let finalRadius = this.radius;
    let scale = 1.0;
    if (!this.isFired) {
      scale = 1.0 + 0.05 * Math.sin(this.breathingPhase);
    }
    
    ctx.translate(this.body.position.x - cameraX, this.body.position.y);
    ctx.rotate(this.body.angle);
    ctx.scale(scale, scale);

    const rad = this.radius;

    // Draw specific bird graphics
    switch (this.type) {
      case "red":
        this.drawRedBird(ctx, rad);
        break;
      case "blue":
        this.drawBlueBird(ctx, rad);
        break;
      case "yellow":
        this.drawYellowBird(ctx, rad);
        break;
      case "black":
        this.drawBlackBird(ctx, rad);
        break;
      case "white":
        this.drawWhiteBird(ctx, rad);
        break;
      case "green":
        this.drawGreenBird(ctx, rad);
        break;
      case "orange":
        this.drawOrangeBird(ctx, rad);
        break;
      case "purple":
        this.drawPurpleBird(ctx, rad);
        break;
    }

    ctx.restore();
  }

  drawRedBird(ctx, rad) {
    // Tail feathers
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(-rad, -3);
    ctx.lineTo(-rad - 8, -8);
    ctx.lineTo(-rad - 5, 0);
    ctx.lineTo(-rad - 8, 8);
    ctx.lineTo(-rad, 3);
    ctx.closePath();
    ctx.fill();

    // Red Body
    ctx.fillStyle = "#E53935";
    ctx.strokeStyle = "#9A0007";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Beige belly (bottom semi-circle arc)
    ctx.fillStyle = "#F5F5DC";
    ctx.beginPath();
    ctx.arc(0, rad * 0.2, rad * 0.8, Math.PI * 0.1, Math.PI * 0.9);
    ctx.lineTo(rad * 0.8 * Math.cos(Math.PI * 0.1), rad * 0.2);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.arc(rad * 0.22, -rad * 0.15, rad * 0.24, 0, Math.PI * 2);
    ctx.arc(rad * 0.52, -rad * 0.15, rad * 0.24, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(rad * 0.26, -rad * 0.12, rad * 0.08, 0, Math.PI * 2);
    ctx.arc(rad * 0.48, -rad * 0.12, rad * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Angry Eyebrows
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(rad * 0.05, -rad * 0.38);
    ctx.lineTo(rad * 0.4, -rad * 0.24);
    ctx.moveTo(rad * 0.65, -rad * 0.38);
    ctx.lineTo(rad * 0.3, -rad * 0.24);
    ctx.stroke();

    // Beak
    ctx.fillStyle = "#FFB300";
    ctx.strokeStyle = "#B77A00";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(rad * 0.35, -rad * 0.08);
    ctx.lineTo(rad * 0.8, 0);
    ctx.lineTo(rad * 0.35, rad * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  drawBlueBird(ctx, rad) {
    // Tiny tail feathers
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.rect(-rad - 4, -2, 4, 4);
    ctx.fill();

    // Blue Body
    ctx.fillStyle = "#29B6F6";
    ctx.strokeStyle = "#0288D1";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Red bags around eyes (mask style)
    ctx.fillStyle = "rgba(229, 57, 53, 0.6)";
    ctx.beginPath();
    ctx.arc(rad * 0.15, -rad * 0.1, rad * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.arc(rad * 0.1, -rad * 0.1, rad * 0.25, 0, Math.PI * 2);
    ctx.arc(rad * 0.45, -rad * 0.1, rad * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(rad * 0.15, -rad * 0.08, rad * 0.08, 0, Math.PI * 2);
    ctx.arc(rad * 0.4, -rad * 0.08, rad * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = "#FFB300";
    ctx.strokeStyle = "#B77A00";
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(rad * 0.25, -rad * 0.02);
    ctx.lineTo(rad * 0.65, 0.05);
    ctx.lineTo(rad * 0.25, rad * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  drawYellowBird(ctx, rad) {
    // Triangular head pointer shape
    ctx.fillStyle = "#FDD835";
    ctx.strokeStyle = "#F57F17";
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    // Tip pointing right
    ctx.moveTo(rad * 1.3, rad * 0.1);
    ctx.lineTo(-rad * 0.9, rad * 0.95);
    ctx.lineTo(-rad * 0.9, -rad * 0.95);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Belly (bottom-left triangle cut)
    ctx.fillStyle = "#F5F5DC";
    ctx.beginPath();
    ctx.moveTo(rad * 0.4, rad * 0.45);
    ctx.lineTo(-rad * 0.9, rad * 0.95);
    ctx.lineTo(-rad * 0.9, rad * 0.1);
    ctx.closePath();
    ctx.fill();

    // Black pointy hair/feather at back corner
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(-rad * 0.9, -rad * 0.4);
    ctx.lineTo(-rad - 8, -rad * 0.8);
    ctx.lineTo(-rad * 0.8, -rad * 0.1);
    ctx.lineTo(-rad - 12, -rad * 0.3);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.arc(rad * 0.22, -rad * 0.18, rad * 0.28, 0, Math.PI * 2);
    ctx.arc(rad * 0.58, -rad * 0.18, rad * 0.28, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(rad * 0.3, -rad * 0.14, rad * 0.08, 0, Math.PI * 2);
    ctx.arc(rad * 0.52, -rad * 0.14, rad * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows (angry angled)
    ctx.strokeStyle = "#821E12";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(rad * 0.05, -rad * 0.45);
    ctx.lineTo(rad * 0.4, -rad * 0.3);
    ctx.moveTo(rad * 0.72, -rad * 0.45);
    ctx.lineTo(rad * 0.38, -rad * 0.3);
    ctx.stroke();

    // Beak (very long triangle)
    ctx.fillStyle = "#FFB300";
    ctx.strokeStyle = "#B77A00";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(rad * 0.38, -rad * 0.08);
    ctx.lineTo(rad * 1.1, 0.08);
    ctx.lineTo(rad * 0.38, rad * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  drawBlackBird(ctx, rad) {
    // Fuse spark feather on top
    ctx.strokeStyle = "#FF9800";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -rad);
    ctx.lineTo(0, -rad - 6);
    ctx.stroke();
    // spark tip
    ctx.fillStyle = "#FFEB3B";
    ctx.beginPath();
    ctx.arc(0, -rad - 6, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Black Body
    ctx.fillStyle = "#37474F";
    ctx.strokeStyle = "#212121";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Grey forehead dot
    ctx.fillStyle = "#78909C";
    ctx.beginPath();
    ctx.arc(0, -rad * 0.6, rad * 0.2, 0, Math.PI*2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.arc(rad * 0.22, -rad * 0.15, rad * 0.25, 0, Math.PI * 2);
    ctx.arc(rad * 0.52, -rad * 0.15, rad * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(rad * 0.25, -rad * 0.12, rad * 0.08, 0, Math.PI * 2);
    ctx.arc(rad * 0.48, -rad * 0.12, rad * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = "#FF9800"; // Orange angry brows
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(rad * 0.05, -rad * 0.38);
    ctx.lineTo(rad * 0.4, -rad * 0.24);
    ctx.moveTo(rad * 0.68, -rad * 0.38);
    ctx.lineTo(rad * 0.32, -rad * 0.24);
    ctx.stroke();

    // Beak
    ctx.fillStyle = "#FFB300";
    ctx.strokeStyle = "#B77A00";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(rad * 0.35, -rad * 0.08);
    ctx.lineTo(rad * 0.72, 0);
    ctx.lineTo(rad * 0.35, rad * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  drawWhiteBird(ctx, rad) {
    // Crest feather
    ctx.fillStyle = "#FFEB3B";
    ctx.beginPath();
    ctx.ellipse(0, -rad - 2, rad * 0.15, rad * 0.28, 0, 0, Math.PI*2);
    ctx.fill();

    // White Egg-shape Body
    ctx.fillStyle = "#ECEFF1";
    ctx.strokeStyle = "#B0BEC5";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, rad * 0.95, rad * 1.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Yellow Cheeks
    ctx.fillStyle = "#FFEB3B";
    ctx.beginPath();
    ctx.arc(-rad * 0.42, rad * 0.1, rad * 0.2, 0, Math.PI * 2);
    ctx.arc(rad * 0.42, rad * 0.1, rad * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.arc(-rad * 0.2, -rad * 0.2, rad * 0.2, 0, Math.PI * 2);
    ctx.arc(rad * 0.2, -rad * 0.2, rad * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Pupils (Worried/Looking Down)
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(-rad * 0.18, -rad * 0.18, rad * 0.06, 0, Math.PI * 2);
    ctx.arc(rad * 0.18, -rad * 0.18, rad * 0.06, 0, Math.PI * 2);
    ctx.fill();

    // Worried eyebrows
    ctx.strokeStyle = "#546E7A";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-rad * 0.35, -rad * 0.38);
    ctx.lineTo(-rad * 0.08, -rad * 0.32);
    ctx.moveTo(rad * 0.35, -rad * 0.38);
    ctx.lineTo(rad * 0.08, -rad * 0.32);
    ctx.stroke();

    // Beak
    ctx.fillStyle = "#FFA000";
    ctx.strokeStyle = "#5D4037";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-rad * 0.15, -rad * 0.05);
    ctx.lineTo(0, rad * 0.15);
    ctx.lineTo(rad * 0.15, -rad * 0.05);
    ctx.lineTo(0, -rad * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  drawGreenBird(ctx, rad) {
    // Tail feathers
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.rect(-rad - 4, -4, 4, 8);
    ctx.fill();

    // Green Body
    ctx.fillStyle = "#2ecc71";
    ctx.strokeStyle = "#27ae60";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Belly
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.arc(0, rad * 0.2, rad * 0.8, Math.PI * 0.1, Math.PI * 0.9);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.arc(rad * 0.2, -rad * 0.2, rad * 0.25, 0, Math.PI * 2);
    ctx.arc(rad * 0.5, -rad * 0.2, rad * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(rad * 0.25, -rad * 0.18, rad * 0.08, 0, Math.PI * 2);
    ctx.arc(rad * 0.45, -rad * 0.18, rad * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Beak: long curved shape pointing right (like a toucan/boomerang)
    ctx.fillStyle = "#FF9800";
    ctx.strokeStyle = "#E65100";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(rad * 0.3, -rad * 0.1);
    ctx.quadraticCurveTo(rad * 1.3, -rad * 0.4, rad * 1.5, rad * 0.1);
    ctx.quadraticCurveTo(rad * 0.9, rad * 0.4, rad * 0.3, rad * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  drawOrangeBird(ctx, rad) {
    // Orange Body
    ctx.fillStyle = "#FF9800";
    ctx.strokeStyle = "#E65100";
    ctx.lineWidth = this.isInflated ? 4 : 2;
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Beige belly
    ctx.fillStyle = "#FFE0B2";
    ctx.beginPath();
    ctx.arc(0, rad * 0.3, rad * 0.7, Math.PI * 0.15, Math.PI * 0.85);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    const eyeSize = rad * 0.22;
    ctx.arc(rad * 0.15, -rad * 0.15, eyeSize, 0, Math.PI * 2);
    ctx.arc(rad * 0.45, -rad * 0.15, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(rad * 0.18, -rad * 0.12, rad * 0.08, 0, Math.PI * 2);
    ctx.arc(rad * 0.42, -rad * 0.12, rad * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = "#FFEB3B";
    ctx.strokeStyle = "#F57F17";
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(rad * 0.3, -rad * 0.05);
    ctx.lineTo(rad * 0.65, 0.02);
    ctx.lineTo(rad * 0.3, rad * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  drawPurpleBird(ctx, rad) {
    // Sleek angular shape
    ctx.fillStyle = "#9C27B0";
    ctx.strokeStyle = "#7B1FA2";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(rad, 0);
    ctx.lineTo(-rad * 0.5, -rad * 0.95);
    ctx.lineTo(-rad * 0.8, -rad * 0.2);
    ctx.lineTo(-rad * 0.8, rad * 0.2);
    ctx.lineTo(-rad * 0.5, rad * 0.95);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Laser mask forehead pattern
    ctx.fillStyle = "#E040FB";
    ctx.beginPath();
    ctx.moveTo(0, -rad * 0.5);
    ctx.lineTo(rad * 0.4, 0);
    ctx.lineTo(0, rad * 0.5);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.arc(rad * 0.1, -rad * 0.18, rad * 0.26, 0, Math.PI * 2);
    ctx.arc(rad * 0.42, -rad * 0.18, rad * 0.26, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(rad * 0.15, -rad * 0.14, rad * 0.08, 0, Math.PI * 2);
    ctx.arc(rad * 0.38, -rad * 0.14, rad * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = "#FFEB3B";
    ctx.strokeStyle = "#F57F17";
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(rad * 0.25, -rad * 0.08);
    ctx.lineTo(rad * 0.75, 0.02);
    ctx.lineTo(rad * 0.25, rad * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

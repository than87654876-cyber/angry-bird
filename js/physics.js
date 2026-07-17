// Wraps Matter.js physics engine and updates

export class PhysicsManager {
  constructor(game) {
    this.game = game;
    
    const Matter = window.Matter;
    if (!Matter) {
      console.error("Matter.js is not loaded! Make sure CDN script is loaded.");
      return;
    }

    // Create Matter Engine
    this.engine = Matter.Engine.create({
      gravity: { y: 1.0, scale: 0.001 } // Standard gravity
    });
    this.world = this.engine.world;

    this.boundaries = [];
    this.collisionEventSetup();
  }

  // Creates the static ground and side walls to keep elements on screen
  setupLevelBoundaries(width, height) {
    const Matter = window.Matter;
    if (!Matter) return;

    // Clear old boundaries
    this.boundaries.forEach(b => Matter.Composite.remove(this.world, b));
    this.boundaries = [];

    const thickness = 100;
    
    // Ground
    const ground = Matter.Bodies.rectangle(width / 2, height - 30 + thickness / 2, width * 2, thickness, {
      isStatic: true,
      friction: 0.8,
      restitution: 0.1,
      label: "ground"
    });

    // Left Wall
    const leftWall = Matter.Bodies.rectangle(-thickness / 2, height / 2, thickness, height * 2, {
      isStatic: true,
      friction: 0.5,
      restitution: 0.2,
      label: "leftWall"
    });

    // Right Wall (Based on level width)
    const rightWall = Matter.Bodies.rectangle(width + thickness / 2, height / 2, thickness, height * 2, {
      isStatic: true,
      friction: 0.5,
      restitution: 0.2,
      label: "rightWall"
    });

    // Ceiling
    const ceiling = Matter.Bodies.rectangle(width / 2, -thickness / 2, width * 2, thickness, {
      isStatic: true,
      friction: 0.2,
      restitution: 0.2,
      label: "ceiling"
    });

    this.boundaries = [ground, leftWall, rightWall, ceiling];
    Matter.Composite.add(this.world, this.boundaries);
  }

  update(dtMs) {
    const Matter = window.Matter;
    if (!Matter) return;
    // Step Matter engine manually inside game loop using fixed step
    Matter.Engine.update(this.engine, Math.min(dtMs, 30));
  }

  collisionEventSetup() {
    const Matter = window.Matter;
    if (!Matter) return;

    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      event.pairs.forEach(pair => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        const entityA = bodyA.plugin.entity;
        const entityB = bodyB.plugin.entity;

        // Calculate impact velocity
        const relVelX = bodyA.velocity.x - bodyB.velocity.x;
        const relVelY = bodyA.velocity.y - bodyB.velocity.y;
        const relVel = Math.sqrt(relVelX * relVelX + relVelY * relVelY);

        // Threshold to avoid micro-settling collisions causing damage
        const minVelThreshold = 1.8;

        // Grace period check to prevent level-load settling from dealing damage
        if (this.game.levelTime < 1.2) return;

        if (relVel > minVelThreshold) {
          // Damage calculation using: Damage = Impact Velocity * Mass * Target Multiplier
          // Cap mass values to prevent static bodies (Infinity mass) from dealing infinite damage
          const massA = bodyA.isStatic ? 3.0 : Math.min(bodyA.mass || 1.0, 5.0);
          const massB = bodyB.isStatic ? 3.0 : Math.min(bodyB.mass || 1.0, 5.0);

          if (entityA && typeof entityA.takeDamage === 'function') {
            const multA = entityA.multiplier !== undefined ? entityA.multiplier : 1.0;
            const damageToA = relVel * massB * multA * 1.3;
            entityA.takeDamage(damageToA, this.game);
          }

          if (entityB && typeof entityB.takeDamage === 'function') {
            const multB = entityB.multiplier !== undefined ? entityB.multiplier : 1.0;
            const damageToB = relVel * massA * multB * 1.3;
            entityB.takeDamage(damageToB, this.game);
          }
        }

        // Trigger bird collision callback to start automatic timers (e.g. Black bird bomb fuses)
        if (entityA && typeof entityA.onCollision === 'function') {
          entityA.onCollision(this.game);
        }
        if (entityB && typeof entityB.onCollision === 'function') {
          entityB.onCollision(this.game);
        }
      });
    });
  }

  // Factory methods for creating bodies in the Matter world
  createBirdBody(x, y, radius) {
    const Matter = window.Matter;
    if (!Matter) return null;

    const body = Matter.Bodies.circle(x, y, radius, {
      density: 0.005,
      friction: 0.1,
      restitution: 0.5, // bouncy birds
      frictionAir: 0.01
    });

    Matter.Composite.add(this.world, body);
    return body;
  }

  createPigBody(x, y, radius) {
    const Matter = window.Matter;
    if (!Matter) return null;

    const body = Matter.Bodies.circle(x, y, radius, {
      density: 0.004,
      friction: 0.3,
      restitution: 0.3,
      frictionAir: 0.02
    });

    Matter.Composite.add(this.world, body);
    return body;
  }

  createBlockBody(x, y, w, h, type) {
    const Matter = window.Matter;
    if (!Matter) return null;

    // Density and friction depending on material
    let density = 0.002;
    let friction = 0.5;
    let restitution = 0.1;

    switch (type) {
      case "glass":
        density = 0.0015;
        friction = 0.2;
        restitution = 0.4;
        break;
      case "wood":
        density = 0.0025;
        friction = 0.6;
        restitution = 0.15;
        break;
      case "stone":
        density = 0.006;
        friction = 0.8;
        restitution = 0.05;
        break;
      case "tnt":
        density = 0.002;
        friction = 0.7;
        restitution = 0.1;
        break;
    }

    const body = Matter.Bodies.rectangle(x, y, w, h, {
      density: density,
      friction: friction,
      restitution: restitution
    });

    Matter.Composite.add(this.world, body);
    return body;
  }

  clearWorld() {
    const Matter = window.Matter;
    if (!Matter) return;
    
    // Clear all composites
    Matter.Composite.clear(this.world, false);
    this.boundaries = [];
  }
}

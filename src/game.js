import { SaveManager } from './saveManager.js';
import { AudioSynth } from './audio.js';
import { Levels } from './levels.js';
import { PhysicsManager } from './physics.js';
import { Bird } from './birds.js';
import { Pig } from './pigs.js';
import { MaterialBlock } from './materials.js';

export const GameState = {
  BOOT: "BOOT",
  SPLASH: "SPLASH",
  MENU: "MENU",
  LEVEL_SELECT: "LEVEL_SELECT",
  PLAYING: "PLAYING",
  PAUSE: "PAUSE",
  WIN: "WIN",
  LOSE: "LOSE"
};

class GameController {
  constructor() {
    this.state = GameState.BOOT;
    this.canvas = null;
    this.ctx = null;

    // Core game sizing (Internal canvas coordinate system)
    this.width = 1200;
    this.height = 600;

    this.physics = null;
    this.saveState = null;

    // Level state
    this.currentLevelId = 1;
    this.currentLevelConfig = null;
    this.entities = [];
    this.particles = []; // Pool limit: 150
    this.maxParticles = 150;

    this.score = 0;
    this.birdsQueue = []; // birds left in line
    this.activeBird = null; // currently loaded or flying bird

    // Slingshot dragging
    this.isDraggingSling = false;
    this.dragStart = { x: 0, y: 0 };
    this.dragCurrent = { x: 0, y: 0 };
    this.maxDragDistance = 120;
    this.launchMultiplier = 0.28; // Balanced launch multiplier for standard shots

    // Camera system
    this.cameraX = 0;
    this.targetCameraX = 0;
    this.cameraState = "idle"; // "idle", "follow", "return"
    this.cameraReturnTimer = 0;

    // Timing
    this.lastTime = 0;

    // Background decoration
    this.clouds = [];
    this.balloons = [];
    this.leaves = [];
    this.screenShake = 0;
    this.currentWeather = "clear";
    this.currentTimeOfDay = "day";
    this.rainDrops = [];
    this.snowFlakes = [];

    // Ability listening
    this.canvasClickedForAbility = false;

    // Level elapsed time for physics settling grace period
    this.levelTime = 0;

    // Map dragging state
    this.isDraggingMap = false;
    this.mapDragStartPointerX = 0;
    this.mapDragStartCameraX = 0;
  }

  init() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.physics = new PhysicsManager(this);

    // Load LocalStorage save state
    this.saveState = SaveManager.load();

    // Bind event listeners
    this.setupEvents();

    // Transition to Splash Screen
    this.changeState(GameState.SPLASH);

    // Start Main Game Loop
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  changeState(newState) {
    this.state = newState;

    // Hide all overlay screens
    document.querySelectorAll(".screen-overlay").forEach(el => {
      el.classList.add("hidden");
    });

    // Handle music starting/stopping and overlay transitions
    if (newState === GameState.SPLASH) {
      document.getElementById("splashScreen").classList.remove("hidden");
    } else if (newState === GameState.MENU) {
      document.getElementById("mainMenu").classList.remove("hidden");
      AudioSynth.startMusic();
    } else if (newState === GameState.LEVEL_SELECT) {
      document.getElementById("levelSelectScreen").classList.remove("hidden");
      this.populateLevelSelect();
      AudioSynth.startMusic();
    } else if (newState === GameState.PLAYING) {
      document.getElementById("gameUi").classList.remove("hidden");
      AudioSynth.startMusic();
    } else if (newState === GameState.PAUSE) {
      document.getElementById("gameUi").classList.remove("hidden");
      document.getElementById("pauseScreen").classList.remove("hidden");
    } else if (newState === GameState.WIN) {
      document.getElementById("winScreen").classList.remove("hidden");
      this.showWinModal();
    } else if (newState === GameState.LOSE) {
      document.getElementById("loseScreen").classList.remove("hidden");
      this.showLoseModal();
    } else if (newState === "ACHIEVEMENTS") {
      document.getElementById("achievementsScreen").classList.remove("hidden");
    }
  }

  generateClouds() {
    this.clouds = [];
    // Cloudy weather gets double clouds
    const cloudCount = (this.currentWeather === "cloudy") ? 10 : 5;
    for (let i = 0; i < cloudCount; i++) {
      this.clouds.push({
        x: Math.random() * this.width * 1.5,
        y: Math.random() * 150 + 30,
        speed: Math.random() * 0.1 + 0.05,
        w: Math.random() * 80 + 60,
        h: Math.random() * 30 + 20
      });
    }
  }

  generateBackgroundExtras() {
    this.balloons = [
      { x: 350, y: 140, speed: 0.02, size: 40, floatPhase: Math.random() * Math.PI },
      { x: 900, y: 80, speed: 0.015, size: 30, floatPhase: Math.random() * Math.PI }
    ];

    this.leaves = [];
    for (let i = 0; i < 20; i++) {
      this.leaves.push({
        x: Math.random() * this.width * 1.5,
        y: Math.random() * this.height,
        vx: -0.4 - Math.random() * 0.4,
        vy: 0.3 + Math.random() * 0.4,
        w: Math.random() * 5 + 5,
        h: Math.random() * 3 + 3,
        angle: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.03 + 0.02,
        swayAmplitude: Math.random() * 1.2 + 0.8,
        color: Math.random() > 0.5 ? "rgba(46, 117, 89, 0.4)" : "rgba(139, 195, 74, 0.35)"
      });
    }

    this.rainDrops = [];
    for (let i = 0; i < 60; i++) {
      this.rainDrops.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        length: Math.random() * 15 + 15,
        speed: Math.random() * 12 + 15
      });
    }

    this.snowFlakes = [];
    for (let i = 0; i < 40; i++) {
      this.snowFlakes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2 + 1.5,
        speed: Math.random() * 1.5 + 1.0,
        swayPhase: Math.random() * Math.PI * 2
      });
    }
  }

  triggerShake(magnitude) {
    this.screenShake = magnitude;
  }

  populateLevelSelect() {
    const grid = document.getElementById("levelGrid");
    grid.innerHTML = ""; // Clear existing grid

    this.saveState = SaveManager.load(); // Refresh state

    Levels.forEach(lvl => {
      const card = document.createElement("button");
      card.className = "level-card";

      const record = this.saveState.levels[lvl.id - 1];
      const isUnlocked = record ? record.unlocked : (lvl.id === 1);

      if (!isUnlocked) {
        card.classList.add("locked");
        card.innerHTML = `
          <div class="level-num">${lvl.id}</div>
          <div class="lock-icon">🔒</div>
        `;
      } else {
        let starsStr = "";
        const starsGot = record ? record.stars : 0;
        for (let i = 0; i < 3; i++) {
          starsStr += i < starsGot ? "★" : "☆";
        }

        card.innerHTML = `
          <div class="level-num">${lvl.id}</div>
          <div class="level-diff">${lvl.difficulty}</div>
          <div class="level-stars">${starsStr}</div>
          <div class="level-score">Best: ${record ? record.bestScore : 0}</div>
        `;
        card.addEventListener("click", () => {
          this.startLevel(lvl.id);
        });
      }
      grid.appendChild(card);
    });
  }

  startLevel(levelId) {
    this.currentLevelId = levelId;
    this.currentLevelConfig = Levels.find(l => l.id === levelId);

    this.score = 0;
    this.entities = [];
    this.particles = [];
    this.cameraX = 0;
    this.targetCameraX = 0;
    this.cameraState = "idle";
    this.isDraggingSling = false;
    this.canvasClickedForAbility = false;
    this.levelTime = 0; // Reset level grace time

    // Setup weather options randomly
    const weatherOptions = ["clear", "cloudy", "rain", "snow"];
    const timeOfDayOptions = ["day", "sunset", "night"];
    this.currentWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
    this.currentTimeOfDay = timeOfDayOptions[Math.floor(Math.random() * timeOfDayOptions.length)];

    // Reset physics world
    this.physics.clearWorld();
    this.physics.setupLevelBoundaries(this.currentLevelConfig.width, this.height);

    // Spawn materials/blocks
    this.currentLevelConfig.blocks.forEach(blockSpec => {
      const body = this.physics.createBlockBody(blockSpec.x, blockSpec.y, blockSpec.w, blockSpec.h, blockSpec.type);
      if (body) {
        const block = new MaterialBlock(blockSpec.x, blockSpec.y, blockSpec.w, blockSpec.h, blockSpec.type, body);
        this.entities.push(block);
      }
    });

    // Spawn pigs
    this.currentLevelConfig.pigs.forEach(pigSpec => {
      const radiusSpec = pigSpec.type === "small" ? 14 : pigSpec.type === "regular" ? 18 : pigSpec.type === "helmet" ? 20 : pigSpec.type === "moustache" ? 23 : 30;
      const body = this.physics.createPigBody(pigSpec.x, pigSpec.y, radiusSpec);
      if (body) {
        const pig = new Pig(pigSpec.x, pigSpec.y, pigSpec.type, body);
        this.entities.push(pig);
      }
    });

    // Set up birds queue
    this.birdsQueue = [...this.currentLevelConfig.birds];
    this.activeBird = null;
    this.totalBirds = this.birdsQueue.length; // Store total birds at start
    this.birdsFired = 0;
    this.pigsKilled = 0;
    this.totalPigs = this.entities.filter(ent => ent instanceof Pig).length;
    this.pigsKilledInCurrentTurn = 0;

    // Generate weather-related clouds and elements
    this.generateClouds();
    this.generateBackgroundExtras();

    // Load first bird onto slingshot
    this.loadNextBird();

    // Setup HUD UI details
    document.getElementById("hudLevelName").innerText = `${this.currentLevelConfig.name} (${this.currentTimeOfDay.toUpperCase()}, ${this.currentWeather.toUpperCase()})`;
    this.updateHud();

    // Transition to playing
    this.changeState(GameState.PLAYING);
  }

  loadNextBird() {
    if (this.birdsQueue.length === 0) {
      this.activeBird = null;
      return;
    }

    const type = this.birdsQueue.shift();
    const sling = this.currentLevelConfig.sling;

    // Create bird body in physics world at slingshot anchor
    const radius = type === "blue" ? 12 : type === "yellow" ? 16 : type === "black" ? 22 : type === "white" ? 20 : 18;
    const body = this.physics.createBirdBody(sling.x, sling.y, radius);

    // Disable gravity on bird while sitting on slingshot
    const Matter = window.Matter;
    if (body && Matter) {
      Matter.Body.setStatic(body, true);
    }

    this.activeBird = new Bird(sling.x, sling.y, type, body);
    this.entities.push(this.activeBird);
    this.canvasClickedForAbility = false;

    // Position queue representations
    this.updateHud();
  }

  updateHud() {
    document.getElementById("hudScore").innerText = this.score;

    // Render queue line of remaining birds inside HUD
    const container = document.getElementById("hudBirdsQueue");
    container.innerHTML = "";
    this.birdsQueue.forEach(type => {
      const icon = document.createElement("div");
      icon.className = `bird-queue-icon bird-${type}`;
      container.appendChild(icon);
    });

    // Update stars indicator bar
    if (this.currentLevelConfig) {
      const t = this.currentLevelConfig.starThresholds;
      let percent = 0;
      if (this.score >= t.three) percent = 100;
      else if (this.score >= t.two) percent = 66 + ((this.score - t.two) / (t.three - t.two)) * 34;
      else percent = (this.score / t.two) * 66;

      document.getElementById("starsGaugeFill").style.width = `${Math.min(percent, 100)}%`;

      // Glow indicators
      const star1 = document.getElementById("starMarker1");
      const star2 = document.getElementById("starMarker2");
      const star3 = document.getElementById("starMarker3");

      star1.classList.add("active"); // Completed clears gets 1 star
      if (this.score >= t.two) star2.classList.add("active");
      else star2.classList.remove("active");
      if (this.score >= t.three) star3.classList.add("active");
      else star3.classList.remove("active");
    }
  }

  addScore(points, x, y) {
    this.score += points;
    this.updateHud();

    // Spawn floating score pop particle
    this.particles.push({
      type: "score",
      text: `+${points}`,
      x: x,
      y: y,
      vy: -1.2,
      life: 1.0,
      decay: 0.02
    });
  }

  setupEvents() {
    // Buttons routing
    document.getElementById("btnPlay").addEventListener("click", () => {
      this.changeState(GameState.LEVEL_SELECT);
    });
    document.getElementById("btnSplashStart").addEventListener("click", () => {
      this.changeState(GameState.MENU);
    });
    document.getElementById("btnMenuBack").addEventListener("click", () => {
      this.changeState(GameState.MENU);
    });
    document.getElementById("btnAchievements").addEventListener("click", () => {
      this.renderAchievements();
      this.changeState("ACHIEVEMENTS");
    });
    document.getElementById("btnAchievementsBack").addEventListener("click", () => {
      this.changeState(GameState.MENU);
    });
    document.getElementById("btnCredits").addEventListener("click", () => {
      alert("ANGRY BIRDS 2D\n\n Dùng những chú chim giận dữ hạ gục những kẻ thù");
    });

    // Pause panel
    document.getElementById("hudPause").addEventListener("click", () => {
      this.changeState(GameState.PAUSE);
    });
    document.getElementById("hudReset").addEventListener("click", () => {
      this.startLevel(this.currentLevelId);
    });
    document.getElementById("btnResume").addEventListener("click", () => {
      this.changeState(GameState.PLAYING);
    });
    document.getElementById("btnPauseRestart").addEventListener("click", () => {
      this.startLevel(this.currentLevelId);
    });
    document.getElementById("btnPauseMenu").addEventListener("click", () => {
      this.changeState(GameState.LEVEL_SELECT);
    });

    // Win modal buttons
    document.getElementById("btnWinRestart").addEventListener("click", () => {
      this.startLevel(this.currentLevelId);
    });
    document.getElementById("btnWinSelect").addEventListener("click", () => {
      this.changeState(GameState.LEVEL_SELECT);
    });
    document.getElementById("btnWinNext").addEventListener("click", () => {
      if (this.currentLevelId < 20) {
        this.startLevel(this.currentLevelId + 1);
      }
    });

    // Lose modal buttons
    document.getElementById("btnLoseRestart").addEventListener("click", () => {
      this.startLevel(this.currentLevelId);
    });
    document.getElementById("btnLoseSelect").addEventListener("click", () => {
      this.changeState(GameState.LEVEL_SELECT);
    });

    // Settings Toggle setup
    const toggleMusic = document.getElementById("toggleMusic");
    const toggleSound = document.getElementById("toggleSound");

    toggleMusic.checked = this.saveState.settings.music;
    toggleSound.checked = this.saveState.settings.sound;

    toggleMusic.addEventListener("change", (e) => {
      this.saveState = SaveManager.updateSetting("music", e.target.checked);
      AudioSynth.toggleMusic();
    });

    toggleSound.addEventListener("change", (e) => {
      this.saveState = SaveManager.updateSetting("sound", e.target.checked);
    });

    // Canvas pointing drag setup
    this.canvas.addEventListener("mousedown", (e) => this.handlePointerDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.handlePointerMove(e));
    window.addEventListener("mouseup", (e) => this.handlePointerUp(e));

    this.canvas.addEventListener("touchstart", (e) => {
      if (e.touches.length > 0) this.handlePointerDown(e.touches[0]);
    });
    this.canvas.addEventListener("touchmove", (e) => {
      if (e.touches.length > 0) this.handlePointerMove(e.touches[0]);
      e.preventDefault(); // stop scroll bouncing
    }, { passive: false });
    window.addEventListener("touchend", () => {
      this.handlePointerUp();
    });
  }

  getPointerCanvasPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    // Scale according to actual rendering dimensions vs coordinates
    return {
      x: ((e.clientX - rect.left) / rect.width) * this.width,
      y: ((e.clientY - rect.top) / rect.height) * this.height
    };
  }

  handlePointerDown(e) {
    if (this.state !== GameState.PLAYING) return;

    const pos = this.getPointerCanvasPos(e);
    // Relative coordinates considering camera offset
    const worldX = pos.x + this.cameraX;
    const worldY = pos.y;

    if (this.activeBird && !this.activeBird.isFired) {
      // Check if clicking near the slingshot anchor
      const sling = this.currentLevelConfig.sling;
      const dx = worldX - sling.x;
      const dy = worldY - sling.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 60) {
        this.isDraggingSling = true;
        this.dragStart = { x: sling.x, y: sling.y };
        this.dragCurrent = { x: worldX, y: worldY };
        AudioSynth.play("stretch");
        return;
      }
    } else if (this.activeBird && this.activeBird.isFired && !this.activeBird.abilityTriggered) {
      // Clicked mid-air: trigger special bird skill
      this.canvasClickedForAbility = true;
      return;
    }

    // Start map dragging if camera is idle
    if (this.cameraState === "idle") {
      this.isDraggingMap = true;
      this.mapDragStartPointerX = pos.x;
      this.mapDragStartCameraX = this.cameraX;
    }
  }

  handlePointerMove(e) {
    if (this.state !== GameState.PLAYING) return;

    const pos = this.getPointerCanvasPos(e);

    if (this.isDraggingMap) {
      const dx = pos.x - this.mapDragStartPointerX;
      const mapWidth = this.currentLevelConfig ? this.currentLevelConfig.width : this.width;
      this.cameraX = this.mapDragStartCameraX - dx;
      this.cameraX = Math.max(0, Math.min(this.cameraX, mapWidth - this.width));
      return;
    }

    if (!this.isDraggingSling) return;

    const worldX = pos.x + this.cameraX;
    const worldY = pos.y;

    this.dragCurrent = { x: worldX, y: worldY };

    // Update loaded bird position
    const sling = this.currentLevelConfig.sling;
    const dx = worldX - sling.x;
    const dy = worldY - sling.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    let targetX = worldX;
    let targetY = worldY;

    // Clamp drag distance
    if (dist > this.maxDragDistance) {
      const angle = Math.atan2(dy, dx);
      targetX = sling.x + Math.cos(angle) * this.maxDragDistance;
      targetY = sling.y + Math.sin(angle) * this.maxDragDistance;
    }

    const Matter = window.Matter;
    if (this.activeBird && this.activeBird.body && Matter) {
      Matter.Body.setPosition(this.activeBird.body, { x: targetX, y: targetY });
    }
  }

  handlePointerUp() {
    if (this.isDraggingMap) {
      this.isDraggingMap = false;
      return;
    }

    if (this.state !== GameState.PLAYING || !this.isDraggingSling) return;
    this.isDraggingSling = false;

    const sling = this.currentLevelConfig.sling;
    const birdPos = this.activeBird.body.position;

    // Vector pointing from released point back to the slingshot anchor (opposite force direction)
    const pullX = sling.x - birdPos.x;
    const pullY = sling.y - birdPos.y;

    const Matter = window.Matter;
    if (this.activeBird && this.activeBird.body && Matter) {
      // Re-enable gravity physics
      Matter.Body.setStatic(this.activeBird.body, false);

      // Apply initial launch velocity
      Matter.Body.setVelocity(this.activeBird.body, {
        x: pullX * this.launchMultiplier,
        y: pullY * this.launchMultiplier
      });

      this.activeBird.isFired = true;
      this.birdsFired++;
      this.pigsKilledInCurrentTurn = 0;
      AudioSynth.play("launch");

      // Shift camera state
      this.cameraState = "follow";
    }
  }

  gameLoop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const elapsed = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // Normalize dt: standard 16.666 ms frame represents 1.0 multiplier
    const dt = elapsed / 16.666;

    this.update(dt, elapsed);
    this.draw();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt, elapsedMs) {
    // 1. Process physics updates if playing
    if (this.state === GameState.PLAYING) {
      this.levelTime += elapsedMs / 1000; // Increment level time in seconds
      this.physics.update(elapsedMs);

      // If user tapped canvas, trigger ability
      if (this.canvasClickedForAbility) {
        this.canvasClickedForAbility = false;
        if (this.activeBird) {
          this.activeBird.triggerAbility(this);
        }
      }
    }

    // 2. Update entities (Birds, Pigs, Blocks, Bombs)
    this.entities.forEach(ent => ent.update(dt));

    // Handle removals
    this.entities = this.entities.filter(ent => {
      if (ent.shouldRemove) {
        if (ent.body) {
          const Matter = window.Matter;
          if (Matter) Matter.Composite.remove(this.physics.world, ent.body);
        }
        return false;
      }
      return true;
    });

    // 3. Update particle animations (Debris, fire, smoke, shockwaves, text)
    this.updateParticles(dt);

    // 4. Update looping background clouds
    this.clouds.forEach(cloud => {
      cloud.x -= cloud.speed * dt;
      if (cloud.x < -cloud.w) {
        cloud.x = (this.currentLevelConfig ? this.currentLevelConfig.width : this.width) + 50;
      }
    });

    // Update drifting hot-air balloons
    this.balloons.forEach(b => {
      b.x -= b.speed * dt;
      b.floatPhase += 0.01 * dt;
      if (b.x < -b.size) {
        b.x = (this.currentLevelConfig ? this.currentLevelConfig.width : this.width) + 50;
      }
    });

    // Update falling leaves
    this.leaves.forEach(leaf => {
      leaf.x += (leaf.vx + Math.sin(timestampToSec() * leaf.swaySpeed * 10) * leaf.swayAmplitude * 0.15) * dt;
      leaf.y += leaf.vy * dt;
      leaf.angle += 0.01 * dt;
      if (leaf.y > this.height) {
        leaf.y = -20;
        leaf.x = Math.random() * (this.currentLevelConfig ? this.currentLevelConfig.width : this.width);
      }
      if (leaf.x < -20) {
        leaf.x = (this.currentLevelConfig ? this.currentLevelConfig.width : this.width) + 20;
      }
    });

    // Decay screen shake
    if (this.screenShake > 0) {
      this.screenShake -= 0.5 * dt;
      if (this.screenShake < 0) this.screenShake = 0;
    }

    // 5. Check level transitions, win/lose criteria, and camera tracking
    if (this.state === GameState.PLAYING) {
      this.updateCamera(dt);
      this.checkEndConditions(dt);
    }
  }

  updateParticles(dt) {
    this.particles.forEach(p => {
      p.life -= p.decay * dt;

      if (p.type === "debris") {
        p.vy += p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.vRot * dt;
      } else if (p.type === "fire" || p.type === "smoke") {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // decelerate smoke/fire slightly
        p.vx *= Math.pow(0.96, dt);
        p.vy *= Math.pow(0.96, dt);
      } else if (p.type === "score") {
        p.y += p.vy * dt;
      } else if (p.type === "shockwave") {
        p.radius += (p.maxRadius - p.radius) * 0.15 * dt;
      }
    });

    // Recycle dead particles
    this.particles = this.particles.filter(p => p.life > 0);
    if (this.particles.length > this.maxParticles) {
      this.particles = this.particles.slice(-this.maxParticles);
    }
  }

  updateCamera(dt) {
    if (!this.currentLevelConfig) return;

    const mapWidth = this.currentLevelConfig.width;

    if (this.cameraState === "follow" && this.activeBird && this.activeBird.isFired) {
      // If the active bird is marked for deletion or removed, trigger camera return immediately
      if (this.activeBird.shouldRemove || !this.entities.includes(this.activeBird)) {
        this.cameraState = "return";
        this.cameraReturnTimer = 0;
        return;
      }

      // Smoothly follow the active bird
      const idealX = this.activeBird.x - this.width / 3;
      this.targetCameraX = Math.max(0, Math.min(idealX, mapWidth - this.width));

      // Ease current camera position towards target
      this.cameraX += (this.targetCameraX - this.cameraX) * 0.1 * dt;

      // Check if bird has come to a stop or left bounds
      const body = this.activeBird.body;
      const speed = body ? Math.sqrt(body.velocity.x * body.velocity.x + body.velocity.y * body.velocity.y) : 0;

      const outOfBounds = this.activeBird.x > mapWidth + 100 || this.activeBird.x < -100 || this.activeBird.y > this.height + 100;

      if (outOfBounds || (speed < 0.2 && !this.isDraggingSling)) {
        this.cameraReturnTimer += dt;
        if (this.cameraReturnTimer > 45 || outOfBounds) { // ~0.75 seconds of rest
          this.cameraState = "return";
          this.cameraReturnTimer = 0;

          // Remove active bird from physics
          this.activeBird.shouldRemove = true;
        }
      } else {
        this.cameraReturnTimer = 0;
      }

    } else if (this.cameraState === "return") {
      // Pan camera back to slingshot anchor
      this.targetCameraX = 0;
      this.cameraX += (this.targetCameraX - this.cameraX) * 0.08 * dt;

      // When camera is close enough to 0, load the next bird
      if (this.cameraX < 1.0) {
        this.cameraX = 0;
        this.cameraState = "idle";
        this.loadNextBird();
      }
    }
  }

  checkEndConditions(dt) {
    // Counts pigs
    const pigsCount = this.entities.filter(ent => ent instanceof Pig && !ent.isDead).length;

    if (pigsCount === 0) {
      // Clear level delay
      setTimeout(() => {
        if (this.state === GameState.PLAYING) {
          this.handleWin();
        }
      }, 1000);
      return;
    }

    // Lose conditions: active bird is null, and queue is empty, and camera back to idle
    const activeFiredOrGone = !this.activeBird || this.activeBird.shouldRemove || (this.activeBird.isFired && this.cameraState === "return");
    if (this.birdsQueue.length === 0 && activeFiredOrGone && pigsCount > 0) {
      setTimeout(() => {
        if (this.state === GameState.PLAYING) {
          this.changeState(GameState.LOSE);
          AudioSynth.play("lose");
        }
      }, 1500);
    }
  }

  handleWin() {
    this.changeState(GameState.WIN);
    AudioSynth.play("win");
  }

  showWinModal() {
    const t = this.currentLevelConfig.starThresholds;

    // Remaining birds score bonus
    const birdsRemaining = this.totalBirds - this.birdsFired;
    const birdBonus = Math.max(0, birdsRemaining) * 1000;
    const finalScore = this.score + birdBonus;

    // Deduce stars count
    let starsEarned = 1; // Completed clears gets 1 star
    if (finalScore >= t.two) starsEarned = 2;
    if (finalScore >= t.three) starsEarned = 3;

    // Unlock in LocalStorage
    this.saveState = SaveManager.unlockLevel(this.currentLevelId, starsEarned, finalScore);

    // Achievements master check
    if (starsEarned === 3) {
      this.unlockAchievement("threeStarsMaster", "Bậc Thầy 3 Sao", "Đạt đánh giá 3 sao ở bất kỳ màn chơi nào!");
    }

    // UI Title Updates
    document.getElementById("winLevelTitle").innerText = `${this.currentLevelConfig.name} Hoàn thành!`;

    // Star animations
    const starsContainer = document.getElementById("winStars");
    starsContainer.innerHTML = "";

    for (let i = 1; i <= 3; i++) {
      const star = document.createElement("span");
      star.className = "win-star";
      star.innerText = i <= starsEarned ? "★" : "☆";
      star.style.animationDelay = `${i * 250}ms`;
      if (i <= starsEarned) star.classList.add("glowing");
      starsContainer.appendChild(star);
    }

    // Animated Count-Ups for Statistics
    const duration = 1200; // 1.2 seconds of animation
    
    // 1. Animated Score
    this.animateCountUp("statWinScore", 0, finalScore, duration);
    
    // 2. Birds Used
    this.animateCountUp("statBirdsUsed", 0, this.birdsFired, duration, (val) => `${val}/${this.totalBirds}`);
    
    // 3. Pigs Defeated
    this.animateCountUp("statPigsKilled", 0, this.pigsKilled, duration);
    
    // 4. Accuracy %
    const accuracyVal = Math.min(100, Math.round((this.pigsKilled / (this.birdsFired || 1)) * 100));
    this.animateCountUp("statAccuracy", 0, accuracyVal, duration, (val) => `${val}%`);
    
    // 5. Time played
    const formattedTime = (val) => {
      const m = Math.floor(val / 60);
      const s = Math.floor(val % 60);
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };
    this.animateCountUp("statTime", 0, Math.floor(this.levelTime), duration, formattedTime);

    // Unlock bird achievements progression
    if (this.currentLevelId === 10) {
      this.unlockAchievement("unlockGreen", "Mở Khóa Big Red", "Hoàn thành Level 10 - Người khổng lồ Big Red (Terence) đã gia nhập đội hình!");
    } else if (this.currentLevelId === 12) {
      this.unlockAchievement("unlockOrange", "Mở Khóa Chim Cam", "Hoàn thành Level 12 - Chim Cam Phình To sẵn sàng xuất kích!");
    } else if (this.currentLevelId === 15) {
      this.unlockAchievement("unlockPurple", "Mở Khóa Chim Tím", "Hoàn thành Level 15 - Siêu phẩm Chim Laser đã xuất hiện!");
    }
 
    // Hide/show next level button
    const btnNext = document.getElementById("btnWinNext");
    if (this.currentLevelId >= 20) {
      btnNext.classList.add("hidden");
    } else {
      btnNext.classList.remove("hidden");
    }
  }

  showLoseModal() {
    document.getElementById("loseLevelTitle").innerText = `${this.currentLevelConfig.name} Thất bại!`;
    document.getElementById("loseScore").innerText = `Score đạt được: ${this.score}`;
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // Apply Screen Shake
    const shakeX = (Math.random() - 0.5) * this.screenShake;
    const shakeY = (Math.random() - 0.5) * this.screenShake;
    ctx.save();
    ctx.translate(shakeX, shakeY);

    // 1. Draw beautiful Sky-to-Horizon Backdrop Gradients based on Time of Day
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    let farHillColor, midHillColor, nearHillColor, groundColor, grassColor, grassDecorColor;
    
    if (this.currentTimeOfDay === "sunset") {
      skyGrad.addColorStop(0, "#2c1b4d"); // Deep purple
      skyGrad.addColorStop(0.4, "#8a307f"); // Pinkish magenta
      skyGrad.addColorStop(0.75, "#db5a42"); // Warm orange
      skyGrad.addColorStop(1.0, "#f2a65a"); // Pale gold horizon
      
      farHillColor = "#684f7b";
      midHillColor = "#8c4f5e";
      nearHillColor = "#a65d50";
      groundColor = "#5c382f";
      grassColor = "#c08d24";
      grassDecorColor = "#d39e2f";
    } else if (this.currentTimeOfDay === "night") {
      skyGrad.addColorStop(0, "#0b0c10"); // Deep space
      skyGrad.addColorStop(0.3, "#1a2332"); // Indigo/midnight blue
      skyGrad.addColorStop(0.7, "#28354a"); // Skyline
      skyGrad.addColorStop(1.0, "#1e2736"); // Horizon
      
      farHillColor = "#17202a";
      midHillColor = "#1f2d3d";
      nearHillColor = "#2c3e50";
      groundColor = "#1b2631";
      grassColor = "#1e8449";
      grassDecorColor = "#27ae60";
    } else { // "day"
      skyGrad.addColorStop(0, "#4be0ff");    // Bright sky blue
      skyGrad.addColorStop(0.4, "#a3f3ff");  // Light blue-cyan
      skyGrad.addColorStop(0.75, "#e1faff"); // Soft white-cyan
      skyGrad.addColorStop(1.0, "#f9fdff");  // Warm pale horizon
      
      farHillColor = "#8fe1d9";
      midHillColor = "#5cbfae";
      nearHillColor = "#3ca98a";
      groundColor = "#6d4c41";
      grassColor = "#8cdb34";
      grassDecorColor = "#8cdb34";
    }
    
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw Glowing Sun or Crescent Moon (Behind clouds)
    if (this.currentTimeOfDay === "night") {
      // Draw Moon
      ctx.save();
      ctx.translate(850 - this.cameraX * 0.15, 120);
      ctx.fillStyle = "#f4f6f7";
      ctx.shadowColor = "rgba(244, 246, 247, 0.65)";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      ctx.fill();
      // Cut out crescent shape
      ctx.fillStyle = skyGrad;
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(12, -5, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      const sunColor = this.currentTimeOfDay === "sunset" ? "rgba(255, 110, 0, " : "rgba(255, 255, 255, ";
      const sunGrad = ctx.createRadialGradient(850 - this.cameraX * 0.15, 120, 10, 850 - this.cameraX * 0.15, 120, 220);
      sunGrad.addColorStop(0, sunColor + "1.0)");
      sunGrad.addColorStop(0.2, this.currentTimeOfDay === "sunset" ? "rgba(255, 160, 0, 0.85)" : "rgba(255, 253, 200, 0.85)");
      sunGrad.addColorStop(0.5, sunColor + "0.3)");
      sunGrad.addColorStop(1.0, sunColor + "0)");
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(850 - this.cameraX * 0.15, 120, 220, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Draw Clouds (Toned for sunset/night)
    const cloudColor = this.currentTimeOfDay === "night" ? "rgba(100, 110, 130, 0.35)" : this.currentTimeOfDay === "sunset" ? "rgba(230, 170, 170, 0.5)" : "rgba(255, 255, 255, 0.65)";
    ctx.fillStyle = cloudColor;
    this.clouds.forEach(cloud => {
      ctx.beginPath();
      ctx.arc(cloud.x - this.cameraX, cloud.y, cloud.h, 0, Math.PI * 2);
      ctx.arc(cloud.x - this.cameraX + cloud.w * 0.3, cloud.y - cloud.h * 0.4, cloud.h * 1.2, 0, Math.PI * 2);
      ctx.arc(cloud.x - this.cameraX + cloud.w * 0.6, cloud.y, cloud.h * 0.9, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw drifting hot-air balloons (Behind background hills)
    this.balloons.forEach(b => {
      this.drawHotAirBalloon(ctx, b.x - this.cameraX * 0.1, b.y, b.size, b.floatPhase);
    });

    // 3. Draw hills in the far background
    // Far layer (slower parallax)
    ctx.fillStyle = farHillColor;
    ctx.beginPath();
    ctx.ellipse(300 - this.cameraX * 0.15, 540, 450, 110, 0, 0, Math.PI * 2);
    ctx.ellipse(950 - this.cameraX * 0.15, 550, 550, 130, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mid layer (medium parallax)
    ctx.fillStyle = midHillColor;
    ctx.beginPath();
    ctx.ellipse(600 - this.cameraX * 0.3, 550, 480, 95, 0, 0, Math.PI * 2);
    ctx.fill();

    // Near layer (faster parallax)
    ctx.fillStyle = nearHillColor;
    ctx.beginPath();
    ctx.ellipse(150 - this.cameraX * 0.45, 565, 300, 75, 0, 0, Math.PI * 2);
    ctx.ellipse(1080 - this.cameraX * 0.45, 570, 380, 85, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. Draw Ground
    ctx.fillStyle = groundColor; // Warm soil brown structure
    ctx.fillRect(0, this.height - 30, this.width, 30);

    // Top grass layer
    ctx.fillStyle = grassColor; // Bright vibrant green grass
    ctx.fillRect(0, this.height - 34, this.width, 4);

    // Draw little grass decorations waving
    ctx.strokeStyle = grassDecorColor;
    ctx.lineWidth = 1.5;
    const waveOffset = Math.sin(timestampToSec() * 4) * 3;
    for (let x = 20; x < this.width; x += 60) {
      const scrollX = x - (this.cameraX % 60);
      ctx.beginPath();
      ctx.moveTo(scrollX, this.height - 34);
      ctx.quadraticCurveTo(scrollX + waveOffset, this.height - 44, scrollX + waveOffset * 0.5, this.height - 48);
      ctx.moveTo(scrollX + 4, this.height - 34);
      ctx.quadraticCurveTo(scrollX + 4 + waveOffset, this.height - 40, scrollX + 2 + waveOffset * 0.5, this.height - 44);
      ctx.stroke();
    }

    // 5. Draw Slingshot BACK Rubber Band
    if (this.currentLevelConfig) {
      this.drawSlingshot(ctx, true);
    }

    // 6. Draw active bird's projected trajectory line
    if (this.isDraggingSling && this.activeBird) {
      this.drawTrajectory(ctx);
    }

    // 7. Draw Entities (Blocks, Pigs, Birds, Bombs)
    this.entities.forEach(ent => ent.draw(ctx, this.cameraX));

    // 8. Draw Slingshot FRONT Post & Rubber Band (Wraps bird in the pouch!)
    if (this.currentLevelConfig) {
      this.drawSlingshot(ctx, false);
    }

    // 9. Draw Particle effects (feathers, shockwaves, scores)
    this.drawParticles(ctx);

    // 10. Draw falling leaves (Foreground layer)
    this.leaves.forEach(leaf => {
      ctx.save();
      ctx.translate(leaf.x - this.cameraX, leaf.y);
      ctx.rotate(leaf.angle);
      ctx.fillStyle = leaf.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, leaf.w, leaf.h, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 11. Draw weather rain overlay
    if (this.currentWeather === "rain") {
      ctx.strokeStyle = "rgba(174, 214, 241, 0.45)";
      ctx.lineWidth = 1.0;
      this.rainDrops.forEach(r => {
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - 2, r.y + r.length);
        ctx.stroke();
      });
    }

    // 12. Draw weather snow overlay
    if (this.currentWeather === "snow") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      this.snowFlakes.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.restore(); // Restore screen shake translation matrix
  }

  drawHotAirBalloon(ctx, x, y, size, floatPhase) {
    ctx.save();
    // Apply subtle vertical floating animation
    const offsetY = Math.sin(floatPhase) * 6;
    ctx.translate(x, y + offsetY);

    // 1. Balloon Envelope (Teardrop shape pointing down)
    ctx.beginPath();
    ctx.arc(0, -size * 0.4, size * 0.45, 0.15 * Math.PI, 0.85 * Math.PI, true);
    ctx.lineTo(-size * 0.16, 0);
    ctx.lineTo(size * 0.16, 0);
    ctx.closePath();

    // Main color: Red/Orange
    ctx.fillStyle = "#e64a19";
    ctx.fill();

    // Side stripes (White)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.85);
    ctx.quadraticCurveTo(-size * 0.18, -size * 0.4, -size * 0.07, 0);
    ctx.lineTo(size * 0.07, 0);
    ctx.quadraticCurveTo(size * 0.18, -size * 0.4, 0, -size * 0.85);
    ctx.closePath();
    ctx.fill();

    // 2. Basket Cords (Thin lines)
    ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(-size * 0.1, 0);
    ctx.lineTo(-size * 0.08, size * 0.16);
    ctx.moveTo(size * 0.1, 0);
    ctx.lineTo(size * 0.08, size * 0.16);
    ctx.stroke();

    // 3. Basket (Small brown square)
    ctx.fillStyle = "#8d6e63";
    ctx.strokeStyle = "#5d4037";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.rect(-size * 0.1, size * 0.16, size * 0.2, size * 0.14);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawSlingshot(ctx, drawBackBandOnly) {
    const sling = this.currentLevelConfig.sling;
    const scrollSlingX = sling.x - this.cameraX;

    if (drawBackBandOnly) {
      // Draw back wood post
      ctx.fillStyle = "#8B5A2B";
      ctx.strokeStyle = "#5C2E0B";
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.rect(scrollSlingX - 6, sling.y, 12, 100);
      ctx.fill();
      ctx.stroke();

      // Slingshot left prong
      ctx.beginPath();
      ctx.moveTo(scrollSlingX - 6, sling.y);
      ctx.lineTo(scrollSlingX - 20, sling.y - 40);
      ctx.lineTo(scrollSlingX - 10, sling.y - 45);
      ctx.lineTo(scrollSlingX, sling.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw rubber band behind the bird
      if (this.isDraggingSling && this.activeBird) {
        const birdPos = this.activeBird.body.position;
        ctx.strokeStyle = "#3E2723";
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(scrollSlingX - 15, sling.y - 40);
        ctx.lineTo(birdPos.x - this.cameraX - this.activeBird.radius * 0.5, birdPos.y);
        ctx.stroke();
      }
    } else {
      // Draw front prong
      ctx.fillStyle = "#A0522D";
      ctx.strokeStyle = "#5C2E0B";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(scrollSlingX, sling.y);
      ctx.lineTo(scrollSlingX + 20, sling.y - 40);
      ctx.lineTo(scrollSlingX + 10, sling.y - 45);
      ctx.lineTo(scrollSlingX - 6, sling.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw front rubber band in front of the bird
      if (this.isDraggingSling && this.activeBird) {
        const birdPos = this.activeBird.body.position;
        ctx.strokeStyle = "#5D4037";
        ctx.lineWidth = 4.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(scrollSlingX + 15, sling.y - 40);
        ctx.lineTo(birdPos.x - this.cameraX - this.activeBird.radius * 0.5, birdPos.y);
        ctx.stroke();

        // Draw leather pouch holding bird
        ctx.fillStyle = "#3E2723";
        ctx.strokeStyle = "#1A0F0D";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(birdPos.x - this.cameraX - this.activeBird.radius * 0.8, birdPos.y - 6, 8, 12);
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  drawTrajectory(ctx) {
    const sling = this.currentLevelConfig.sling;
    const birdPos = this.activeBird.body.position;

    // Physics pull vectors
    const pullX = sling.x - birdPos.x;
    const pullY = sling.y - birdPos.y;

    const vx = pullX * this.launchMultiplier;
    const vy = pullY * this.launchMultiplier;

    // Matter.js gravity acceleration constant in pixels/sec^2
    const gravityY = 1.0;
    const pointsCount = 30; // More dots for longer range

    ctx.fillStyle = "rgba(255, 112, 0, 0.85)"; // High-contrast orange-red trajectory line
    for (let i = 1; i <= pointsCount; i++) {
      const t = i * 0.075; // time increments (seconds)

      const x = birdPos.x + vx * t * 60;
      const y = birdPos.y + vy * t * 60 + 0.5 * gravityY * 1000 * t * t;

      // Stop drawing if trajectory plunges below the ground
      if (y > this.height - 30) break;

      // Fade out dots as they go further
      const opacity = 1.0 - (i / pointsCount);
      ctx.fillStyle = `rgba(255, 112, 0, ${opacity * 0.85})`;

      ctx.beginPath();
      ctx.arc(x - this.cameraX, y, 4.5 - (i * 0.12), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawParticles(ctx) {
    this.particles.forEach(p => {
      ctx.save();
      if (p.type === "debris") {
        ctx.fillStyle = p.color;
        ctx.translate(p.x - this.cameraX, p.y);
        ctx.rotate(p.rotation);
        // Draw little angular chips
        ctx.beginPath();
        ctx.moveTo(-p.radius, -p.radius);
        ctx.lineTo(p.radius * 0.8, -p.radius * 1.2);
        ctx.lineTo(p.radius, p.radius);
        ctx.lineTo(-p.radius * 1.1, p.radius * 0.7);
        ctx.closePath();
        ctx.globalAlpha = p.life;
        ctx.fill();
      } else if (p.type === "fire") {
        // glowing hot fire particles
        const red = Math.floor(255);
        const green = Math.floor(100 + p.life * 155);
        const blue = Math.floor(p.life * 50);
        ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x - this.cameraX, p.y, p.radius * p.life, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === "smoke") {
        ctx.fillStyle = p.color || `rgba(200, 200, 200, ${p.life * 0.4})`;
        ctx.beginPath();
        ctx.arc(p.x - this.cameraX, p.y, p.radius * (1.5 - p.life * 0.5), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === "score") {
        // Floating point popup
        ctx.fillStyle = `rgba(255, 215, 0, ${p.life})`;
        ctx.strokeStyle = `rgba(0, 0, 0, ${p.life * 0.7})`;
        ctx.lineWidth = 2.5;
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.strokeText(p.text, p.x - this.cameraX, p.y);
        ctx.fillText(p.text, p.x - this.cameraX, p.y);
      } else if (p.type === "shockwave") {
        ctx.strokeStyle = `rgba(255, 235, 59, ${p.life * 0.5})`;
        ctx.lineWidth = 4 * p.life;
        ctx.beginPath();
        ctx.arc(p.x - this.cameraX, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  animateCountUp(elementId, start, end, duration, formatFn) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      const easeProgress = progress * (2 - progress); // quadratic ease out
      const current = Math.floor(start + (end - start) * easeProgress);

      el.innerText = formatFn ? formatFn(current) : current;

      if (progress < 1.0) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }

  onBlockDestroyed() {
    SaveManager.incrementStat("blocksDestroyed");
    const state = SaveManager.load();
    const totalDestroyed = state.stats ? state.stats.blocksDestroyed : 0;
    if (totalDestroyed >= 100) {
      this.unlockAchievement("destroy100", "Kẻ Hủy Diệt Khối", "Tích lũy phá hủy thành công 100 khối vật liệu!");
    }
  }

  onPigKilled(type) {
    this.pigsKilled++;
    this.pigsKilledInCurrentTurn++;

    // First Blood achievement
    this.unlockAchievement("firstBlood", "Chiến Tích Đầu Tiên", "Tiêu diệt chú heo đầu tiên trong trò chơi!");

    // Triple Kill achievement
    if (this.pigsKilledInCurrentTurn >= 3) {
      this.unlockAchievement("tripleKill", "Triple Kill!", "Hạ gục liên tiếp 3 chú heo trong một lượt bắn!");
    }

    // King Slayer achievement
    if (type === "king") {
      this.unlockAchievement("kingSlayer", "Kẻ Diệt Vua", "Đánh bại Vua Heo Boss tối thượng!");
    }
  }

  unlockAchievement(key, name, desc) {
    const newlyUnlocked = SaveManager.unlockAchievement(key);
    if (newlyUnlocked) {
      // Play achievement jingle
      try {
        AudioSynth.play("win");
      } catch (e) {}

      // Create toast notification banner
      const toast = document.createElement("div");
      toast.className = "achievement-toast";
      toast.innerHTML = `
        <div class="achievement-icon">🏆</div>
        <div class="achievement-details">
          <div class="achievement-title">${name}</div>
          <div class="achievement-desc">${desc}</div>
        </div>
      `;
      document.getElementById("gameContainer").appendChild(toast);

      // Force layout calculation to trigger CSS transition
      toast.offsetHeight;
      toast.classList.add("show");

      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => {
          toast.remove();
        }, 500);
      }, 4000);
    }
  }

  renderAchievements() {
    const list = document.getElementById("achievementsList");
    if (!list) return;
    list.innerHTML = "";

    const state = SaveManager.load();
    const achievements = state.achievements || {};

    const gallery = [
      { key: "firstBlood", name: "Chiến Tích Đầu Tiên", desc: "Hạ gục chú heo đầu tiên trong trò chơi.", icon: "💥" },
      { key: "destroy100", name: "Kẻ Hủy Diệt Khối", desc: "Tích lũy phá hủy 100 khối vật liệu.", icon: "🪵" },
      { key: "tripleKill", name: "Đại Sát Thủ (Triple)", desc: "Tiêu diệt 3 chú heo trong cùng một lượt bắn.", icon: "🎯" },
      { key: "kingSlayer", name: "Kẻ Diệt Vua", desc: "Hạ gục Vua Heo Boss tại Level 10.", icon: "👑" },
      { key: "threeStarsMaster", name: "Bậc Thầy 3 Sao", desc: "Đạt đánh giá 3 sao ở bất kỳ màn chơi nào.", icon: "⭐" },
      { key: "unlockGreen", name: "Mở Khóa Big Red", desc: "Chiêu mộ thành công Người khổng lồ Big Red.", icon: "🔴" },
      { key: "unlockOrange", name: "Mở Khóa Chim Cam", desc: "Chiêu mộ thành công Chim Phình To.", icon: "🎈" },
      { key: "unlockPurple", name: "Mở Khóa Chim Tím", desc: "Chiêu mộ thành công Chim Laser.", icon: "⚡" }
    ];

    gallery.forEach(ach => {
      const isUnlocked = achievements[ach.key] === true;
      const card = document.createElement("div");
      card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
      card.innerHTML = `
        <div class="achievement-card-icon">${isUnlocked ? ach.icon : '🔒'}</div>
        <div class="achievement-card-info">
          <div class="achievement-card-name">${ach.name}</div>
          <div class="achievement-card-desc">${isUnlocked ? ach.desc : 'Đang khóa (Chưa đạt điều kiện)'}</div>
        </div>
      `;
      list.appendChild(card);
    });
  }
}

// Utility to get current timestamp in seconds
function timestampToSec() {
  return performance.now() / 1000;
}

// Instantiate and export global controller
export const Game = new GameController();

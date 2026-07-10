const SAVE_KEY = 'angryBirdSave';
const CURRENT_VERSION = 2;

export const SaveManager = {
  getInitialState() {
    return {
      version: CURRENT_VERSION,
      currentLevel: 1,
      totalStars: 0,
      totalScore: 0,
      levels: Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        unlocked: i === 0,
        completed: false,
        stars: 0,
        bestScore: 0
      })),
      settings: {
        music: true,
        sound: true
      },
      achievements: {
        firstBlood: false,
        destroy100: false,
        tripleKill: false,
        kingSlayer: false,
        threeStarsMaster: false,
        unlockGreen: false,
        unlockOrange: false,
        unlockPurple: false
      },
      stats: {
        blocksDestroyed: 0
      }
    };
  },

  load() {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (!saved) {
        const initial = this.getInitialState();
        this.save(initial);
        return initial;
      }
      const parsed = JSON.parse(saved);
      
      // Defensive checks to ensure structure compliance and prevent crash loops
      const initial = this.getInitialState();
      let updated = false;

      if (!parsed.levels || !Array.isArray(parsed.levels)) {
        parsed.levels = initial.levels;
        updated = true;
      } else if (parsed.levels.length < initial.levels.length) {
        const existingLevels = parsed.levels;
        parsed.levels = initial.levels.map(initLvl => {
          const existing = existingLevels.find(l => l.id === initLvl.id);
          return existing ? { ...initLvl, ...existing } : initLvl;
        });
        updated = true;
      }

      if (!parsed.settings) {
        parsed.settings = initial.settings;
        updated = true;
      } else {
        const before = JSON.stringify(parsed.settings);
        parsed.settings = { ...initial.settings, ...parsed.settings };
        if (JSON.stringify(parsed.settings) !== before) updated = true;
      }

      if (!parsed.achievements) {
        parsed.achievements = initial.achievements;
        updated = true;
      } else {
        const before = JSON.stringify(parsed.achievements);
        parsed.achievements = { ...initial.achievements, ...parsed.achievements };
        if (JSON.stringify(parsed.achievements) !== before) updated = true;
      }

      if (!parsed.stats) {
        parsed.stats = initial.stats;
        updated = true;
      } else {
        const before = JSON.stringify(parsed.stats);
        parsed.stats = { ...initial.stats, ...parsed.stats };
        if (JSON.stringify(parsed.stats) !== before) updated = true;
      }
      
      // Handle version upgrades/migration if needed
      if (!parsed.version || parsed.version < CURRENT_VERSION) {
        parsed.version = CURRENT_VERSION;
        // Merge with initial structure to make sure new fields aren't missing
        parsed.levels = initial.levels.map(initLvl => {
          const existing = parsed.levels ? parsed.levels.find(l => l.id === initLvl.id) : null;
          return existing ? { ...initLvl, ...existing } : initLvl;
        });
        parsed.settings = { ...initial.settings, ...parsed.settings };
        parsed.achievements = { ...initial.achievements, ...parsed.achievements };
        parsed.stats = { ...initial.stats, ...parsed.stats };
        updated = true;
      }

      if (updated) {
        this.save(parsed);
      }
      return parsed;
    } catch (e) {
      console.error("Failed to load save state, resetting...", e);
      const initial = this.getInitialState();
      this.save(initial);
      return initial;
    }
  },

  save(state) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to write save state", e);
    }
  },

  reset() {
    const initial = this.getInitialState();
    this.save(initial);
    return initial;
  },

  unlockLevel(levelId, stars, score) {
    const state = this.load();
    const currentLvlIdx = levelId - 1;
    
    // Update completed level metrics
    const levelRecord = state.levels[currentLvlIdx];
    if (levelRecord) {
      levelRecord.completed = true;
      if (stars > levelRecord.stars) {
        levelRecord.stars = stars;
      }
      if (score > levelRecord.bestScore) {
        levelRecord.bestScore = score;
      }
    }

    // Unlock the next level
    if (levelId < state.levels.length) {
      const nextLvlRecord = state.levels[levelId];
      if (nextLvlRecord) {
        nextLvlRecord.unlocked = true;
      }
      if (state.currentLevel === levelId) {
        state.currentLevel = levelId + 1;
      }
    }

    // Recalculate totals
    state.totalStars = state.levels.reduce((acc, lvl) => acc + lvl.stars, 0);
    state.totalScore = state.levels.reduce((acc, lvl) => acc + lvl.bestScore, 0);

    this.save(state);
    return state;
  },

  updateSetting(key, value) {
    const state = this.load();
    if (!state.settings) {
      state.settings = { music: true, sound: true };
    }
    state.settings[key] = value;
    this.save(state);
    return state;
  },

  unlockAchievement(key) {
    const state = this.load();
    if (!state.achievements) {
      state.achievements = this.getInitialState().achievements;
    }
    if (!state.achievements[key]) {
      state.achievements[key] = true;
      this.save(state);
      return true; // Newly unlocked
    }
    return false; // Already unlocked
  },

  incrementStat(key, amount = 1) {
    const state = this.load();
    if (!state.stats) {
      state.stats = this.getInitialState().stats;
    }
    state.stats[key] = (state.stats[key] || 0) + amount;
    this.save(state);
    return state.stats[key];
  }
};

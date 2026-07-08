const SAVE_KEY = 'angryBirdSave';
const CURRENT_VERSION = 1;

export const SaveManager = {
  getInitialState() {
    return {
      version: CURRENT_VERSION,
      currentLevel: 1,
      totalStars: 0,
      totalScore: 0,
      levels: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        unlocked: i === 0,
        completed: false,
        stars: 0,
        bestScore: 0
      })),
      settings: {
        music: true,
        sound: true
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
      }
      if (!parsed.settings) {
        parsed.settings = initial.settings;
        updated = true;
      }
      
      // Handle version upgrades/migration if needed
      if (!parsed.version || parsed.version < CURRENT_VERSION) {
        parsed.version = CURRENT_VERSION;
        // Merge with initial structure to make sure new fields aren't missing
        parsed.levels = initial.levels.map(initLvl => {
          const existing = parsed.levels.find(l => l.id === initLvl.id);
          return existing ? { ...initLvl, ...existing } : initLvl;
        });
        parsed.settings = { ...initial.settings, ...parsed.settings };
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
    if (levelId < 10) {
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
  }
};

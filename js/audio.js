import { SaveManager } from './saveManager.js';

let audioCtx = null;
let bgmInterval = null;
let bgmNodes = [];
let bgmSequenceStep = 0;

function initAudio() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(err => {
        console.warn("AudioContext resume failed:", err);
      });
    }
  } catch (e) {
    console.warn("Web Audio API not supported or blocked in this browser:", e);
  }
}

export const AudioSynth = {
  play(type) {
    const settings = SaveManager.load().settings;
    if (!settings || !settings.sound) return;
    
    initAudio();
    if (!audioCtx || audioCtx.state === 'suspended') return;

    try {
      switch (type) {
        case 'stretch':
          this.playStretch();
          break;
        case 'launch':
          this.playLaunch();
          break;
        case 'glass':
          this.playGlass();
          break;
        case 'wood':
          this.playWood();
          break;
        case 'stone':
          this.playStone();
          break;
        case 'pig':
          this.playPig();
          break;
        case 'tnt':
        case 'explode':
          this.playExplode();
          break;
        case 'blue_split':
          this.playBlueSplit();
          break;
        case 'yellow_boost':
          this.playYellowBoost();
          break;
        case 'win':
          this.playWin();
          break;
        case 'lose':
          this.playLose();
          break;
      }
    } catch (e) {
      console.warn("Failed to play synthesized sound", e);
    }
  },

  playStretch() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(55, audioCtx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);
  },

  playLaunch() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(750, audioCtx.currentTime + 0.22);

    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.22);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.22);
  },

  playGlass() {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1900, now);
    osc.frequency.setValueAtTime(2200, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.start();
    osc.stop(now + 0.12);
  },

  playWood() {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.start();
    osc.stop(now + 0.1);
  },

  playStone() {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(15, now + 0.18);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, now);
    
    osc.disconnect(gain);
    osc.connect(filter);
    filter.connect(gain);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.start();
    osc.stop(now + 0.18);
  },

  playPig() {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(850, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.start();
    osc.stop(now + 0.15);
  },

  playExplode() {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(75, now);
    osc.frequency.linearRampToValueAtTime(15, now + 0.45);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(110, now);

    osc.disconnect(gain);
    osc.connect(filter);
    filter.connect(gain);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.start();
    osc.stop(now + 0.5);

    // Noise crackle component
    const bufferSize = audioCtx.sampleRate * 0.35;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(350, now);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.25, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    noise.start(now);
    noise.stop(now + 0.35);
  },

  playBlueSplit() {
    const now = audioCtx.currentTime;
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.05;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(550, t);
      osc.frequency.exponentialRampToValueAtTime(1100, t + 0.07);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);

      osc.start(t);
      osc.stop(t + 0.07);
    }
  },

  playYellowBoost() {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.18);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(750, now);
    filter.Q.setValueAtTime(2.5, now);

    osc.disconnect(gain);
    osc.connect(filter);
    filter.connect(gain);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.start();
    osc.stop(now + 0.2);
  },

  playWin() {
    const now = audioCtx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.07;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

      osc.start(t);
      osc.stop(t + 0.25);
    });
  },

  playLose() {
    const now = audioCtx.currentTime;
    const notes = [440.00, 415.30, 349.23, 329.63]; // A4, Ab4, F4, E4
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.13;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq * 0.75, t + 0.22);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

      osc.start(t);
      osc.stop(t + 0.22);
    });
  },

  startMusic() {
    const settings = SaveManager.load().settings;
    if (!settings || !settings.music) {
      this.stopMusic();
      return;
    }

    initAudio();
    if (!audioCtx || audioCtx.state === 'suspended') return;

    if (bgmInterval) return;

    const chords = [
      [220.00, 261.63, 329.63], // Am (A3, C4, E4)
      [174.61, 220.00, 261.63], // F (F3, A3, C4)
      [261.63, 329.63, 392.00], // C (C4, E4, G4)
      [196.00, 246.94, 293.66]  // G (G3, B3, D4)
    ];

    const melody = [
      [440, 523, 659, 784],
      [349, 440, 523, 587],
      [523, 659, 784, 987],
      [392, 494, 587, 698]
    ];

    const tempo = 0.35;
    bgmSequenceStep = 0;

    const playStep = () => {
      try {
        if (!audioCtx || audioCtx.state === 'suspended') return;
        const now = audioCtx.currentTime;
        const chordIdx = Math.floor(bgmSequenceStep / 8) % chords.length;
        const noteIdx = bgmSequenceStep % 8;

        // Play root note on beats 0 and 4
        if (noteIdx === 0 || noteIdx === 4) {
          const rootFreq = chords[chordIdx][0];
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(rootFreq, now);
          
          gain.gain.setValueAtTime(0.03, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + tempo * 2.2);
          osc.start(now);
          osc.stop(now + tempo * 2.2);
          bgmNodes.push({ osc, gain });
        }

        // Play arpeggiated note
        if (noteIdx % 2 === 0) {
          const chordNotes = chords[chordIdx];
          const melNotes = melody[chordIdx];
          let note;
          if (noteIdx === 0) note = chordNotes[1];
          else if (noteIdx === 2) note = chordNotes[2];
          else if (noteIdx === 4) note = melNotes[0];
          else note = melNotes[noteIdx / 2];

          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(note, now);
          
          gain.gain.setValueAtTime(0.015, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + tempo * 1.2);
          osc.start(now);
          osc.stop(now + tempo * 1.2);
          bgmNodes.push({ osc, gain });
        }

        // Keep node clean up
        if (bgmNodes.length > 20) {
          bgmNodes = bgmNodes.slice(-10);
        }

        bgmSequenceStep++;
      } catch (e) {
        console.warn("BGM tick exception", e);
      }
    };

    playStep();
    bgmInterval = setInterval(playStep, tempo * 1000);
  },

  stopMusic() {
    if (bgmInterval) {
      clearInterval(bgmInterval);
      bgmInterval = null;
    }
    bgmNodes.forEach(node => {
      try {
        node.osc.stop();
      } catch (e) {}
    });
    bgmNodes = [];
  },

  toggleMusic() {
    const settings = SaveManager.load().settings;
    if (settings && settings.music) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }
};

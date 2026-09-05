// Synthesized Web Audio effects for Missão Quitério game
let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export const isSoundEnabled = () => soundEnabled;
export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
};

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!soundEnabled) return null;
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
};

export const playCorrectSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.25);
    });
  } catch {
    // Audio safe fallback
  }
};

/**
 * Plays the iconic "wah-wah-wah-waaaah" (Sad Trombone / Trompete Triste de Erro)
 * Matching the exact 4-note comic fail sound effect:
 * Note 1: D4 (~293.7 Hz) with plunger "wah" mute scoop
 * Note 2: C#4 (~277.2 Hz) with plunger "wah" mute scoop
 * Note 3: C4 (~261.6 Hz) with plunger "wah" mute scoop
 * Note 4: B3 (~246.9 Hz) sliding down into a sad, wobbling glissando to ~205 Hz (G#3)
 */
export const playSadTromboneSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const t0 = ctx.currentTime;

    // 4 notes: [freq, startOffset, duration, isFinalSlide, endFreq]
    const notesConfig = [
      { freq: 293.66, start: 0.0, dur: 0.36 }, // D4
      { freq: 277.18, start: 0.44, dur: 0.36 }, // C#4
      { freq: 261.63, start: 0.88, dur: 0.36 }, // C4
      { freq: 246.94, start: 1.34, dur: 1.8, isSlide: true, endFreq: 207.65 }, // B3 -> G#3 (sad slide)
    ];

    notesConfig.forEach((note) => {
      const noteStart = t0 + note.start;
      const noteDur = note.dur;

      // Primary horn oscillator (sawtooth for brass harmonics)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';

      // Secondary oscillator (slightly detuned sawtooth for brass acoustic thickness)
      const osc2 = ctx.createOscillator();
      osc2.type = 'sawtooth';
      osc2.detune.setValueAtTime(6, noteStart); // +6 cents

      // Frequency and portamento/pitch bend
      if (note.isSlide) {
        // Starts at B3, holds briefly, then slides down to G#3
        osc1.frequency.setValueAtTime(note.freq, noteStart);
        osc2.frequency.setValueAtTime(note.freq, noteStart);

        // Slide begins after 0.25s
        osc1.frequency.setValueAtTime(note.freq, noteStart + 0.25);
        osc2.frequency.setValueAtTime(note.freq, noteStart + 0.25);

        osc1.frequency.exponentialRampToValueAtTime(note.endFreq || 205, noteStart + noteDur);
        osc2.frequency.exponentialRampToValueAtTime(note.endFreq || 205, noteStart + noteDur);

        // Expressive vibrato / wobble for the comic sad trombone
        const vibrato = ctx.createOscillator();
        const vibratoGain = ctx.createGain();
        vibrato.frequency.setValueAtTime(5.5, noteStart); // 5.5 Hz vibrato
        vibratoGain.gain.setValueAtTime(0, noteStart);
        vibratoGain.gain.linearRampToValueAtTime(8.0, noteStart + 0.4); // kicks in as the note slides
        vibratoGain.gain.linearRampToValueAtTime(14.0, noteStart + noteDur * 0.8);

        vibrato.connect(osc1.frequency);
        vibrato.connect(osc2.frequency);

        vibrato.start(noteStart);
        vibrato.stop(noteStart + noteDur + 0.05);
      } else {
        // Slight initial pitch scoop (~12 Hz lower to target) like a brass player's embouchure
        osc1.frequency.setValueAtTime(note.freq - 14, noteStart);
        osc1.frequency.exponentialRampToValueAtTime(note.freq, noteStart + 0.06);
        osc2.frequency.setValueAtTime(note.freq - 14, noteStart);
        osc2.frequency.exponentialRampToValueAtTime(note.freq, noteStart + 0.06);
      }

      // Plunger Mute Formant Filter (the "wah" effect)
      // Simulates opening and closing a plunger/cup mute over the brass bell
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(3.4, noteStart);

      if (note.isSlide) {
        filter.frequency.setValueAtTime(380, noteStart);
        filter.frequency.exponentialRampToValueAtTime(1500, noteStart + 0.14); // "waaah"
        filter.frequency.exponentialRampToValueAtTime(500, noteStart + noteDur * 0.6);
        filter.frequency.exponentialRampToValueAtTime(300, noteStart + noteDur);
      } else {
        filter.frequency.setValueAtTime(380, noteStart);
        filter.frequency.exponentialRampToValueAtTime(1450, noteStart + 0.12); // open
        filter.frequency.exponentialRampToValueAtTime(580, noteStart + noteDur); // close
      }

      // Gain Envelope for articulation
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.001, noteStart);
      gainNode.gain.linearRampToValueAtTime(0.24, noteStart + 0.04);

      if (note.isSlide) {
        gainNode.gain.setValueAtTime(0.24, noteStart + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDur);
      } else {
        gainNode.gain.setValueAtTime(0.22, noteStart + noteDur * 0.7);
        gainNode.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDur);
      }

      // Connect nodes
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(filter);
      filter.connect(ctx.destination);

      // Start & Stop
      osc1.start(noteStart);
      osc2.start(noteStart);
      osc1.stop(noteStart + noteDur + 0.05);
      osc2.stop(noteStart + noteDur + 0.05);
    });
  } catch {
    // Audio safe fallback
  }
};

export const playWrongSound = () => {
  playSadTromboneSound();
};

export const playTickSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // Audio safe fallback
  }
};

export const playCatMeowSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const t = ctx.currentTime;
    const duration = 0.58;

    // Main vocal oscillator (warm triangle wave for vocal harmonics)
    const osc = ctx.createOscillator();
    osc.type = 'triangle';

    // Second overtone oscillator for realistic feline throat resonance
    const overtone = ctx.createOscillator();
    overtone.type = 'sine';

    // Vibrato LFO (slight waver in cat's meow)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(6.0, t); // 6 Hz vibrato
    lfoGain.gain.setValueAtTime(14, t); // depth of vibrato
    lfo.connect(osc.frequency);

    // Formant vocal filter (simulates cat throat & mouth cavity)
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(2.2, t);
    filter.frequency.setValueAtTime(900, t);
    filter.frequency.exponentialRampToValueAtTime(1750, t + 0.14);
    filter.frequency.exponentialRampToValueAtTime(850, t + duration);

    // Frequency trajectory for "M-I-A-U":
    // Starts at ~420Hz ("m"), rises fast to ~820Hz ("ia"), holds, then falls to ~400Hz ("u")
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(840, t + 0.12);
    osc.frequency.linearRampToValueAtTime(760, t + 0.28);
    osc.frequency.exponentialRampToValueAtTime(390, t + duration);

    overtone.frequency.setValueAtTime(840, t);
    overtone.frequency.exponentialRampToValueAtTime(1680, t + 0.12);
    overtone.frequency.linearRampToValueAtTime(1520, t + 0.28);
    overtone.frequency.exponentialRampToValueAtTime(780, t + duration);

    // Gain envelope for natural cat meow attack and decay
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0.001, t);
    mainGain.gain.linearRampToValueAtTime(0.28, t + 0.07);
    mainGain.gain.setValueAtTime(0.25, t + 0.24);
    mainGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    const overtoneGain = ctx.createGain();
    overtoneGain.gain.setValueAtTime(0.001, t);
    overtoneGain.gain.linearRampToValueAtTime(0.08, t + 0.08);
    overtoneGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    // Routing
    osc.connect(mainGain);
    overtone.connect(overtoneGain);
    mainGain.connect(filter);
    overtoneGain.connect(filter);
    filter.connect(ctx.destination);

    // Start audio nodes
    lfo.start(t);
    osc.start(t);
    overtone.start(t);

    lfo.stop(t + duration);
    osc.stop(t + duration);
    overtone.stop(t + duration);
  } catch {
    // Audio safe fallback
  }
};

export const playCelebrationSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const melody = [
      { f: 523.25, t: 0.0, d: 0.12 }, // C5
      { f: 659.25, t: 0.12, d: 0.12 }, // E5
      { f: 783.99, t: 0.24, d: 0.12 }, // G5
      { f: 1046.5, t: 0.36, d: 0.3 }, // C6
      { f: 880.0, t: 0.68, d: 0.15 }, // A5
      { f: 1046.5, t: 0.85, d: 0.45 }, // C6
    ];
    melody.forEach((item) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.f, ctx.currentTime + item.t);

      gain.gain.setValueAtTime(0.22, ctx.currentTime + item.t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + item.t + item.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + item.t);
      osc.stop(ctx.currentTime + item.t + item.d);
    });
  } catch {
    // Audio safe fallback
  }
};

/**
 * Plays a realistic mechanical camera shutter click sound
 */
export const playCameraShutterSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const t = ctx.currentTime;
    
    // First click (shutter opening)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1200, t);
    osc1.frequency.exponentialRampToValueAtTime(300, t + 0.04);
    gain1.gain.setValueAtTime(0.3, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.04);

    // Second click (shutter closing - 55ms later)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(900, t + 0.055);
    osc2.frequency.exponentialRampToValueAtTime(150, t + 0.1);
    gain2.gain.setValueAtTime(0.35, t + 0.055);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t + 0.055);
    osc2.stop(t + 0.1);
  } catch {
    // Fallback safe
  }
};


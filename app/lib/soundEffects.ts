class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isInitialized = false;

  private init = () => {
    if (this.isInitialized || typeof window === 'undefined') return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.2; // Master volume
      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  private playTone = (freq: number, type: OscillatorType, duration: number, vol = 0.5, slideFreq?: number) => {
    if (!this.ctx || !this.masterGain) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    if (slideFreq) {
      osc.frequency.exponentialRampToValueAtTime(slideFreq, this.ctx.currentTime + duration);
    }

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  private playNoise = (duration: number, vol = 0.5, isMetallic = false) => {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = isMetallic ? 'bandpass' : 'highpass';
    filter.frequency.value = isMetallic ? 2000 : 8000;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
  }

  // Common UI Sounds
  hover = () => {
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.playTone(800, 'sine', 0.05, 0.1);
    this.playTone(1200, 'sine', 0.05, 0.05);
  }

  click = () => {
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.playTone(400, 'square', 0.1, 0.2, 100);
    this.playNoise(0.05, 0.1, true);
  }

  select = () => {
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.playTone(600, 'triangle', 0.2, 0.3, 1200);
    this.playTone(900, 'sine', 0.3, 0.2);
  }

  open = () => {
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.playTone(100, 'sawtooth', 0.3, 0.1, 800);
    this.playNoise(0.3, 0.05, true);
  }

  close = () => {
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.playTone(800, 'sawtooth', 0.2, 0.1, 100);
    this.playNoise(0.2, 0.05, true);
  }

  scan = () => {
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            this.playTone(1500 + Math.random() * 1000, 'square', 0.05, 0.05);
        }, i * 60);
    }
  }

  error = () => {
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.playTone(150, 'sawtooth', 0.3, 0.3, 100);
    this.playTone(140, 'sawtooth', 0.3, 0.3, 90);
  }

  private humOsc: OscillatorNode | null = null;
  private humGain: GainNode | null = null;
  private humFilter: BiquadFilterNode | null = null;

  updateHarmonicHum = (coherence: number) => {
    this.init();
    if (!this.ctx || !this.masterGain || this.ctx.state !== 'running') return;

    if (!this.humOsc) {
      this.humOsc = this.ctx.createOscillator();
      this.humGain = this.ctx.createGain();
      this.humFilter = this.ctx.createBiquadFilter();

      this.humOsc.type = 'sine';
      this.humOsc.frequency.setValueAtTime(174, this.ctx.currentTime); // Grounding frequency base

      this.humFilter.type = 'lowpass';
      this.humFilter.frequency.setValueAtTime(1000, this.ctx.currentTime);
      this.humFilter.Q.value = 5;

      this.humGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.humGain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 1);

      this.humOsc.connect(this.humFilter);
      this.humFilter.connect(this.humGain);
      this.humGain.connect(this.masterGain);

      this.humOsc.start();
    }

    // Dynamic updates based on coherence
    const now = this.ctx.currentTime;
    const baseFreq = 174 + (coherence * 354); // Scale between 174Hz and 528Hz (Healing/Coherence)
    this.humOsc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.5);
    
    if (this.humFilter) {
      this.humFilter.frequency.exponentialRampToValueAtTime(500 + (coherence * 1500), now + 0.5);
    }
    
    if (this.humGain) {
      const targetGain = 0.02 + (coherence * 0.08); // Louder when more coherent
      this.humGain.gain.linearRampToValueAtTime(targetGain, now + 0.5);
    }
  }

  stopHarmonicHum = () => {
    if (this.humGain && this.ctx) {
      this.humGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);
      setTimeout(() => {
        if (this.humOsc) {
          this.humOsc.stop();
          this.humOsc = null;
        }
        this.humGain = null;
        this.humFilter = null;
      }, 1100);
    }
  }

  // --- SECTION-SPECIFIC SOUNDS ---

  // Astrology / Celestial (Ethereal, Orbital, Resonance)
  astrologyHover = () => {
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.playTone(432, 'sine', 0.1, 0.15); // 432Hz tuning vibe
  }
  
  astrologyClick = () => {
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.playTone(528, 'sine', 0.3, 0.2, 852); // Solfeggio ascension
    this.playTone(852, 'sine', 0.4, 0.1);
  }

  // Numerology (Crisp, Calculation, Digital Blips)
  numerologyHover = () => {
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.playTone(2000, 'square', 0.02, 0.05);
    setTimeout(() => this.playTone(2400, 'square', 0.02, 0.05), 30);
  }

  numerologyClick = () => {
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            this.playTone(3000 + (i * 500), 'square', 0.03, 0.1);
        }, i * 40);
    }
  }

  // Kabbalah / Mystical (Deep, Crystalline, Harmonic)
  mysticHover = () => {
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.playTone(300, 'triangle', 0.2, 0.15); // Deep resonance
  }

  mysticClick = () => {
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.playTone(256, 'triangle', 0.5, 0.2, 512); // Octave jump
    this.playNoise(0.5, 0.05, true); // Metallic shimmer
  }

  // Neural / AI (Sci-fi, Cyberpunk, Fluid synch)
  neuralHover = () => {
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.playTone(800 + Math.random() * 400, 'sawtooth', 0.05, 0.05, 600);
  }

  neuralClick = () => {
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.playTone(400, 'sawtooth', 0.2, 0.15, 1200); // Zap up
    setTimeout(() => this.playTone(1200, 'square', 0.1, 0.1), 100);
  }

  // Mechanical / Robotics (Heavy servos, ratchets)
  mechHover = () => {
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.playNoise(0.03, 0.2); // short click
  }

  mechClick = () => {
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.playTone(100, 'square', 0.1, 0.3, 50); // Heavy clunk
    this.playNoise(0.1, 0.2, true); // Metallic scrape
    setTimeout(() => this.playTone(150, 'sawtooth', 0.05, 0.1), 100); // Latch
  }

  magic = () => {
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.playTone(852, 'sine', 0.5, 0.2, 963);
    this.playNoise(0.5, 0.05, true);
  }

  success = () => {
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.playTone(432, 'triangle', 0.2, 0.2, 528);
    setTimeout(() => this.playTone(528, 'triangle', 0.4, 0.2), 200);
  }

  tick = () => {
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.playTone(1200, 'sine', 0.02, 0.05);
  }
}

export const soundEngine = new SoundEngine();

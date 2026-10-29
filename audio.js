/**
 * ========================================================
 * 奇門遁甲 · 術士道術音效合成與靈氛引擎 (Web Audio API)
 * 完全以原生程式合成，無需外部音訊檔案，保證零延遲、離線即播
 * 支援：起局重擊、陣盤展開、八方鳴響、法術爆發與空靈道門梵音環境聲
 * ========================================================
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.ambientEnabled = false;
    this.masterGain = null;
    this.ambientGain = null;
    this.ambientNodes = [];
  }

  // 使用者初次點擊時初始化 AudioContext (符合瀏覽器自動播放規範)
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.45;
      this.masterGain.connect(this.ctx.destination);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.value = 0.0;
      this.ambientGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // 道門空靈冥想梵音 (Ambient Drone & Singing Bowl Resonance)
  toggleAmbient() {
    this.init();
    this.ambientEnabled = !this.ambientEnabled;
    if (this.ambientEnabled) {
      this.startAmbient();
    } else {
      this.stopAmbient();
    }
    return this.ambientEnabled;
  }

  startAmbient() {
    if (!this.ctx) this.init();
    this.stopAmbient(); // 先停止已存在的

    const now = this.ctx.currentTime;
    this.ambientGain.gain.cancelScheduledValues(now);
    this.ambientGain.gain.setValueAtTime(0.001, now);
    this.ambientGain.gain.linearRampToValueAtTime(0.22, now + 2.5);

    // 108Hz 道家神聖和弦基頻 (108Hz, 162Hz, 216Hz, 324Hz)
    const freqs = [108, 162, 216, 324];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 2.8, now);
      filter.Q.value = 3.0;

      // 溫和緩慢呼吸的 LFO 顫音
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 0.12 + idx * 0.04; // 極慢呼吸
      lfoGain.gain.value = 0.06;
      lfo.connect(gain.gain);

      gain.gain.setValueAtTime(0.12 / (idx + 1), now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);

      osc.start(now);
      lfo.start(now);

      this.ambientNodes.push(osc, lfo, gain, filter);
    });
  }

  stopAmbient() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.ambientGain) {
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.001, now + 1.2);
    }
    setTimeout(() => {
      this.ambientNodes.forEach(node => {
        try { node.stop(); node.disconnect(); } catch (e) {}
      });
      this.ambientNodes = [];
    }, 1300);
  }

  // 1. 踏定中宮 · 震地低音衝擊 (Sub-bass Drop + Ground Stomp)
  playStomp() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    // 低頻衝擊波震盪 (Sine sweep)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.45);

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.55);

    // 氣勁爆散噪音 (Burst Noise)
    this.playNoiseBurst(0.4, 300, 50);
  }

  // 2. 奇門陣盤層層擴散嗡鳴 (Array Ring Expansion Chime)
  playRingExpand(index = 0) {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    // 基頻隨展開層數升高 (太極 -> 八卦 -> 八門 -> 九星 -> 八神)
    const baseFreqs = [220, 277.18, 329.63, 440, 554.37, 659.25, 880];
    const freq = baseFreqs[index % baseFreqs.length];

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.3);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, now);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 1.2, now);
    filter.Q.value = 4.0;

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.6);
    osc2.stop(now + 0.6);
  }

  // 3. 撥動四盤齒輪流轉 (Disk Shift / Meridian Rotation)
  playDiskSpin() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.6);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.value = 5.0;

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.65);
  }

  // 4. 宮位鎖定神韻聲 (Palace Lock Resonance)
  playPalaceLock() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.3, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.9);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.9);
    });
  }

  // 5.「亂金柝」時間遲滯時鐘回聲 (Time Distortion Chime)
  playLuanJinTuo() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    [0, 0.12, 0.28, 0.48].forEach((delay, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200 - i * 180, now + delay);
      gain.gain.setValueAtTime(0.35, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + delay);
      osc.stop(now + delay + 0.4);
    });

    const deepOsc = this.ctx.createOscillator();
    const deepGain = this.ctx.createGain();
    deepOsc.type = 'triangle';
    deepOsc.frequency.setValueAtTime(60, now);
    deepGain.gain.setValueAtTime(0.4, now);
    deepGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    deepOsc.connect(deepGain);
    deepGain.connect(this.masterGain);
    deepOsc.start(now);
    deepOsc.stop(now + 1.2);
  }

  // 6.「坤字·土河車」地脈咆哮 (Earth Eruption)
  playTuHeChe() {
    if (!this.enabled) return;
    this.init();
    this.playNoiseBurst(0.9, 120, 30);
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(70, now);
    osc.frequency.linearRampToValueAtTime(45, now + 0.8);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.85);
  }

  // 7.「離字·煉獄火流星」赤炎爆破 (Fire Burst)
  playHuoLiuXing() {
    if (!this.enabled) return;
    this.init();
    this.playNoiseBurst(0.7, 1200, 200);

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.6);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.6);
  }

  // 8.「震字·雷霆霹靂」驚雷炸裂 (Thunder Bolt)
  playThunder() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    this.playNoiseBurst(0.5, 4500, 800);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.5);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.55);
  }

  // 9.「巽字·風繩 / 聽風」呼嘯颶風 (Wind Swoosh)
  playWind() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.8;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 0.35);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.75);
    filter.Q.value = 6.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.8);
  }

  // 輔助：白噪音突波
  playNoiseBurst(duration, startFreq, endFreq) {
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(startFreq, now);
    filter.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + duration);
  }

  // 10. 道門清磬 · 頌缽長鳴 (Sacred Daoist Singing Bowl / Chime)
  playSingingBowl() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    // 頌缽諧波群 (216Hz 基頻與泛音)
    const partials = [
      { f: 216, gain: 0.35, decay: 4.5 },
      { f: 217.4, gain: 0.22, decay: 4.2 }, // 雙頻差拍顫音
      { f: 432, gain: 0.28, decay: 3.8 },
      { f: 864, gain: 0.15, decay: 2.8 },
      { f: 1296, gain: 0.08, decay: 2.0 },
      { f: 1728, gain: 0.04, decay: 1.5 }
    ];

    partials.forEach(p => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.f, now);

      gain.gain.setValueAtTime(p.gain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + p.decay);
    });
  }

  // 11. 玄門木魚清音 (Daoist Resonant Wooden Fish)
  playMuYu() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.12);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(520, now);
    filter.Q.value = 8.0;

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // 12. 青銅風鈴八方神韻 (Pentatonic Wind Chime Cluster)
  playWindChime() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const chimeFreqs = [1046.5, 1174.6, 1318.5, 1567.9, 1760.0, 2093.0];

    chimeFreqs.forEach((freq, idx) => {
      const delay = idx * 0.06 + Math.random() * 0.04;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.18, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.6);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + delay);
      osc.stop(now + delay + 1.6);
    });
  }
}

// 建立全域音效單例
window.soundEngine = new SoundEngine();

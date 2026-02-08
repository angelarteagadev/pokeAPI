
class SoundService {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createOscillator(freq: number, type: OscillatorType = 'square', duration: number = 0.1, volume: number = 0.1) {
    this.initCtx();
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx!.destination);

    osc.start();
    osc.stop(this.ctx!.currentTime + duration);
  }

  playPowerOn() {
    this.initCtx();
    const now = this.ctx!.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
      setTimeout(() => this.createOscillator(freq, 'square', 0.15, 0.05), i * 60);
    });
  }

  playPowerOff() {
    this.initCtx();
    [880, 659.25, 440].forEach((freq, i) => {
      setTimeout(() => this.createOscillator(freq, 'sawtooth', 0.2, 0.05), i * 80);
    });
  }

  playNavigate() {
    this.createOscillator(600, 'square', 0.05, 0.03);
  }

  playSelect() {
    this.createOscillator(800, 'square', 0.08, 0.04);
    setTimeout(() => this.createOscillator(1200, 'square', 0.08, 0.04), 50);
  }

  playRelease() {
    this.initCtx();
    const duration = 0.5;
    const now = this.ctx!.currentTime;
    
    // Noise for disintegration effect
    const bufferSize = this.ctx!.sampleRate * duration;
    const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx!.createBufferSource();
    noise.buffer = buffer;
    
    const noiseGain = this.ctx!.createGain();
    noiseGain.gain.setValueAtTime(0.1, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    
    noise.connect(noiseGain);
    noiseGain.connect(this.ctx!.destination);
    
    // Falling tone
    const osc = this.ctx!.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + duration);
    
    const oscGain = this.ctx!.createGain();
    oscGain.gain.setValueAtTime(0.05, now);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    
    osc.connect(oscGain);
    oscGain.connect(this.ctx!.destination);
    
    noise.start();
    osc.start();
    noise.stop(now + duration);
    osc.stop(now + duration);
  }

  playError() {
    this.createOscillator(150, 'sawtooth', 0.3, 0.1);
  }
}

export const soundService = new SoundService();

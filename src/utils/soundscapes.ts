// Web Audio API ambient soundscape generator for Irada (Night Rain, Winter Wind, Aurora Hum)

class SoundscapeEngine {
  private ctx: AudioContext | null = null
  private isPlaying = false

  // Volumes (0 to 1)
  private rainVol = 0.4
  private windVol = 0.3
  private auroraVol = 0.5

  // Gain nodes
  private masterGain: GainNode | null = null
  private rainGain: GainNode | null = null
  private windGain: GainNode | null = null
  private auroraGain: GainNode | null = null

  // Nodes for rain
  private rainSource: AudioBufferSourceNode | null = null

  // Nodes for wind
  private windSource: AudioBufferSourceNode | null = null
  private windFilter: BiquadFilterNode | null = null

  // Nodes for aurora hum
  private auroraOscs: OscillatorNode[] = []

  private listeners: Set<(state: SoundscapeState) => void> = new Set()

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioCtx()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime)
      this.masterGain.connect(this.ctx.destination)

      this.rainGain = this.ctx.createGain()
      this.rainGain.gain.setValueAtTime(this.rainVol, this.ctx.currentTime)
      this.rainGain.connect(this.masterGain)

      this.windGain = this.ctx.createGain()
      this.windGain.gain.setValueAtTime(this.windVol, this.ctx.currentTime)
      this.windGain.connect(this.masterGain)

      this.auroraGain = this.ctx.createGain()
      this.auroraGain.gain.setValueAtTime(this.auroraVol, this.ctx.currentTime)
      this.auroraGain.connect(this.masterGain)
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  // Create pink/brown noise buffer for natural rain & wind
  private createNoiseBuffer(seconds: number = 5): AudioBuffer {
    if (!this.ctx) throw new Error('No context')
    const bufferSize = this.ctx.sampleRate * seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const output = buffer.getChannelData(0)
    let lastOut = 0.0

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      output[i] = (lastOut + 0.02 * white) / 1.02 // Brownian / pinkish noise
      lastOut = output[i]
      output[i] *= 3.5
    }
    return buffer
  }

  private startRain() {
    if (!this.ctx || !this.rainGain) return
    const noise = this.createNoiseBuffer(5)
    this.rainSource = this.ctx.createBufferSource()
    this.rainSource.buffer = noise
    this.rainSource.loop = true

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime)

    this.rainSource.connect(filter)
    filter.connect(this.rainGain)
    this.rainSource.start()
  }

  private startWind() {
    if (!this.ctx || !this.windGain) return
    const noise = this.createNoiseBuffer(6)
    this.windSource = this.ctx.createBufferSource()
    this.windSource.buffer = noise
    this.windSource.loop = true

    this.windFilter = this.ctx.createBiquadFilter()
    this.windFilter.type = 'bandpass'
    this.windFilter.frequency.setValueAtTime(350, this.ctx.currentTime)
    this.windFilter.Q.setValueAtTime(3.0, this.ctx.currentTime)

    // Gentle wind lfo
    const lfo = this.ctx.createOscillator()
    lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime)
    const lfoGain = this.ctx.createGain()
    lfoGain.gain.setValueAtTime(150, this.ctx.currentTime)
    lfo.connect(lfoGain)
    lfoGain.connect(this.windFilter.frequency)
    lfo.start()

    this.windSource.connect(this.windFilter)
    this.windFilter.connect(this.windGain)
    this.windSource.start()
  }

  private startAurora() {
    if (!this.ctx || !this.auroraGain) return
    // Peaceful harmonic drone chords (A2=110Hz, E3=165Hz, C#4=277Hz, A4=440Hz)
    const freqs = [110, 164.8, 220, 277.2]
    this.auroraOscs = freqs.map((freq) => {
      const osc = this.ctx!.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime)

      // Slight detune for ethereal shimmer
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, this.ctx!.currentTime)

      const oscGain = this.ctx!.createGain()
      oscGain.gain.setValueAtTime(0.25, this.ctx!.currentTime)
      osc.connect(oscGain)
      oscGain.connect(this.auroraGain!)
      osc.start()
      return osc
    })
  }

  private stopAll() {
    try {
      if (this.rainSource) {
        this.rainSource.stop()
        this.rainSource.disconnect()
        this.rainSource = null
      }
      if (this.windSource) {
        this.windSource.stop()
        this.windSource.disconnect()
        this.windSource = null
      }
      this.auroraOscs.forEach((osc) => {
        try {
          osc.stop()
          osc.disconnect()
        } catch {
          // ignore
        }
      })
      this.auroraOscs = []
    } catch {
      // ignore
    }
  }

  public toggle() {
    this.initContext()
    if (this.isPlaying) {
      this.stopAll()
      this.isPlaying = false
    } else {
      this.startRain()
      this.startWind()
      this.startAurora()
      this.isPlaying = true
    }
    this.notify()
  }

  public setRain(val: number) {
    this.rainVol = Math.max(0, Math.min(1, val))
    if (this.rainGain && this.ctx) {
      this.rainGain.gain.setValueAtTime(this.rainVol, this.ctx.currentTime)
    }
    this.notify()
  }

  public setWind(val: number) {
    this.windVol = Math.max(0, Math.min(1, val))
    if (this.windGain && this.ctx) {
      this.windGain.gain.setValueAtTime(this.windVol, this.ctx.currentTime)
    }
    this.notify()
  }

  public setAurora(val: number) {
    this.auroraVol = Math.max(0, Math.min(1, val))
    if (this.auroraGain && this.ctx) {
      this.auroraGain.gain.setValueAtTime(this.auroraVol, this.ctx.currentTime)
    }
    this.notify()
  }

  public getState(): SoundscapeState {
    return {
      isPlaying: this.isPlaying,
      rain: this.rainVol,
      wind: this.windVol,
      aurora: this.auroraVol,
    }
  }

  public subscribe(cb: (state: SoundscapeState) => void) {
    this.listeners.add(cb)
    cb(this.getState())
    return () => {
      this.listeners.delete(cb)
    }
  }

  private notify() {
    const s = this.getState()
    this.listeners.forEach((cb) => cb(s))
  }
}

export interface SoundscapeState {
  isPlaying: boolean
  rain: number
  wind: number
  aurora: number
}

export const soundscapes = new SoundscapeEngine()


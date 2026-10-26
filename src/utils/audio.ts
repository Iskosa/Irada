// Synthesized chime using Web Audio API (zero external asset dependencies)
export function playChime(
  type: 'complete' | 'timer-finish' | 'click' | 'reminder' | 'streak' = 'click'
) {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    if (type === 'complete') {
      const now = ctx.currentTime
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(523.25, now) // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15) // E5

      osc2.type = 'triangle'
      osc2.frequency.setValueAtTime(659.25, now + 0.15)
      osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.3) // C6

      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now + 0.15)
      osc1.stop(now + 0.15)
      osc2.stop(now + 0.45)
    } else if (type === 'streak') {
      // Duolingo-style victorious fanfaric chime: C5 -> E5 -> G5 -> C6 with warm harmonics
      const notes = [523.25, 659.25, 783.99, 1046.5]
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const start = ctx.currentTime + idx * 0.1

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, start)

        gain.gain.setValueAtTime(0.2, start)
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(start)
        osc.stop(start + 0.5)
      })
    } else if (type === 'reminder') {
      // Harmonious celestial bell for timebox hour arrival (A4 -> C#5 -> E5 -> A5)
      const freqs = [440.0, 554.37, 659.25, 880.0]
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const start = ctx.currentTime + i * 0.08

        osc.type = 'sine'
        osc.frequency.setValueAtTime(f, start)

        gain.gain.setValueAtTime(0.18, start)
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.7)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(start)
        osc.stop(start + 0.7)
      })
    } else if (type === 'timer-finish') {
      const notes = [587.33, 739.99, 880.0, 1174.66] // D5, F#5, A5, D6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const start = ctx.currentTime + idx * 0.12

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, start)

        gain.gain.setValueAtTime(0.2, start)
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(start)
        osc.stop(start + 0.4)
      })
    } else {
      // Subtle click
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const now = ctx.currentTime

      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, now)
      gain.gain.setValueAtTime(0.05, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.05)
    }
  } catch {
    // Ignore audio errors on autoplay-restricted environments
  }
}


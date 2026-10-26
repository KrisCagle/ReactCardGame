// Synthesized sound effects (Web Audio API). Every sound is built from
// oscillators and filtered noise, so there are no audio files to load.
// Browsers block audio until the player interacts, so the AudioContext is
// created lazily on the first sound (which always follows a click or key).
import { readStorage, writeStorage } from '../storage/saveStorage'

const SETTINGS_KEY = 'react-card-game:audio'
const DEFAULT_SETTINGS = { muted: false, volume: 0.6 }

const loadSettings = () => {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(readStorage(SETTINGS_KEY) ?? '{}') }
  } catch {
    return DEFAULT_SETTINGS
  }
}

let settings = loadSettings()
const listeners = new Set()
let audio = null

// --- Settings store (read in React with useSyncExternalStore) ---

export const subscribeAudioSettings = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const getAudioSettings = () => settings

export const setAudioSettings = (patch) => {
  settings = { ...settings, ...patch }
  writeStorage(SETTINGS_KEY, JSON.stringify(settings))
  if (audio) audio.master.gain.value = settings.volume
  listeners.forEach((listener) => listener())
}

// --- Audio graph ---

const getAudio = () => {
  if (typeof window === 'undefined') return null
  if (!audio) {
    const Context = window.AudioContext ?? window.webkitAudioContext
    if (!Context) return null
    const context = new Context()
    const master = context.createGain()
    master.gain.value = settings.volume
    master.connect(context.destination)
    audio = { context, master, noise: null }
  }
  if (audio.context.state === 'suspended') audio.context.resume()
  return audio
}

const noiseBuffer = ({ context }) => {
  if (!audio.noise) {
    const buffer = context.createBuffer(1, context.sampleRate, context.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1
    audio.noise = buffer
  }
  return audio.noise
}

// A short enveloped oscillator, optionally sliding from `freq` to `to`.
const tone = (a, { freq, to, type = 'sine', start = 0, duration = 0.15, gain = 0.3, attack = 0.005 }) => {
  const { context, master } = a
  const t = context.currentTime + start
  const osc = context.createOscillator()
  const env = context.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + duration)
  env.gain.setValueAtTime(0.0001, t)
  env.gain.exponentialRampToValueAtTime(gain, t + attack)
  env.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.connect(env).connect(master)
  osc.start(t)
  osc.stop(t + duration + 0.05)
}

// Filtered white noise: hits, whooshes, crackles.
const noise = (a, { start = 0, duration = 0.15, gain = 0.3, filter = 1200, to, type = 'lowpass' }) => {
  const { context, master } = a
  const t = context.currentTime + start
  const source = context.createBufferSource()
  const biquad = context.createBiquadFilter()
  const env = context.createGain()
  source.buffer = noiseBuffer(a)
  biquad.type = type
  biquad.frequency.setValueAtTime(filter, t)
  if (to) biquad.frequency.exponentialRampToValueAtTime(to, t + duration)
  env.gain.setValueAtTime(gain, t)
  env.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  source.connect(biquad).connect(env).connect(master)
  source.start(t)
  source.stop(t + duration + 0.05)
}

const notes = (a, frequencies, { type = 'triangle', step = 0.08, duration = 0.25, gain = 0.22 } = {}) =>
  frequencies.forEach((freq, index) => tone(a, { freq, type, start: index * step, duration, gain }))

export const sounds = {
  click: (a) => tone(a, { freq: 900, type: 'square', duration: 0.04, gain: 0.05 }),
  card: (a) => noise(a, { duration: 0.14, gain: 0.22, filter: 3200, to: 700, type: 'bandpass' }),
  hit: (a) => {
    noise(a, { duration: 0.18, gain: 0.5, filter: 1000 })
    tone(a, { freq: 150, to: 55, type: 'triangle', duration: 0.2, gain: 0.5 })
  },
  hurt: (a) => {
    noise(a, { duration: 0.28, gain: 0.45, filter: 600 })
    tone(a, { freq: 95, to: 42, type: 'sawtooth', duration: 0.28, gain: 0.22 })
  },
  block: (a) => {
    tone(a, { freq: 880, to: 620, type: 'triangle', duration: 0.2, gain: 0.22 })
    tone(a, { freq: 1480, type: 'sine', start: 0.015, duration: 0.14, gain: 0.08 })
  },
  blocked: (a) => {
    noise(a, { duration: 0.1, gain: 0.25, filter: 4000, type: 'highpass' })
    tone(a, { freq: 520, to: 380, type: 'square', duration: 0.12, gain: 0.08 })
  },
  heal: (a) => notes(a, [523, 659, 784], { type: 'sine', gain: 0.16 }),
  buff: (a) => tone(a, { freq: 280, to: 620, type: 'sawtooth', duration: 0.3, gain: 0.1 }),
  debuff: (a) => tone(a, { freq: 520, to: 180, type: 'square', duration: 0.32, gain: 0.07 }),
  potion: (a) => [0, 1, 2, 3].forEach((i) => tone(a, { freq: 400 + i * 160, to: 700 + i * 160, start: i * 0.05, duration: 0.07, gain: 0.12 })),
  coin: (a) => {
    tone(a, { freq: 988, type: 'square', duration: 0.07, gain: 0.07 })
    tone(a, { freq: 1319, type: 'square', start: 0.07, duration: 0.18, gain: 0.07 })
  },
  turn: (a) => {
    tone(a, { freq: 196, type: 'sine', duration: 0.9, gain: 0.16, attack: 0.02 })
    tone(a, { freq: 294, type: 'sine', duration: 0.7, gain: 0.08, attack: 0.02 })
  },
  step: (a) => noise(a, { duration: 0.09, gain: 0.2, filter: 500 }),
  fire: (a) => [0, 0.12, 0.3].forEach((start) => noise(a, { start, duration: 0.08, gain: 0.12, filter: 2500, type: 'bandpass' })),
  mystery: (a) => notes(a, [440, 415, 554], { type: 'sine', step: 0.14, duration: 0.5, gain: 0.1 }),
  win: (a) => notes(a, [392, 523, 659, 784], { step: 0.09, duration: 0.35 }),
  victory: (a) => notes(a, [262, 330, 392, 523, 659, 784, 1047], { step: 0.11, duration: 0.6, gain: 0.2 }),
  defeat: (a) => {
    notes(a, [330, 294, 262, 196], { type: 'sawtooth', step: 0.22, duration: 0.7, gain: 0.08 })
    noise(a, { start: 0.1, duration: 1.2, gain: 0.15, filter: 300 })
  },
}

export const playSound = (name) => {
  if (settings.muted || !sounds[name]) return
  const a = getAudio()
  if (a) sounds[name](a)
}

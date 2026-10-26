import { useEffect, useRef, useSyncExternalStore } from 'react'
import { soundsForTransition } from './gameSounds'
import { getAudioSettings, playSound, setAudioSettings, subscribeAudioSettings } from './sfx'

// Plays sounds for each game state change.
export function useGameAudio(state) {
  const previous = useRef(state)
  useEffect(() => {
    soundsForTransition(previous.current, state).forEach(playSound)
    previous.current = state
  }, [state])
}

export function useAudioSettings() {
  const settings = useSyncExternalStore(subscribeAudioSettings, getAudioSettings)
  return {
    ...settings,
    toggleMute: () => setAudioSettings({ muted: !settings.muted }),
    setVolume: (volume) => setAudioSettings({ volume }),
  }
}

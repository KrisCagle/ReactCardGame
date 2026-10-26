import { Icon } from '../../art/icons'
import { useAudioSettings } from '../../audio/useGameAudio'

export function SoundControls() {
  const { muted, volume, toggleMute, setVolume } = useAudioSettings()
  return (
    <span className="sound-controls">
      <button aria-label={muted ? 'Unmute sound' : 'Mute sound'} aria-pressed={muted} className="sound-toggle" onClick={toggleMute} title={muted ? 'Sound off' : 'Sound on'} type="button">
        <Icon name={muted ? 'speakerOff' : 'speaker'} size={18} />
      </button>
      <input
        aria-label="Volume"
        className="volume-slider"
        disabled={muted}
        max="1"
        min="0"
        onChange={(event) => setVolume(Number(event.target.value))}
        step="0.05"
        type="range"
        value={volume}
      />
    </span>
  )
}

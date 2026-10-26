import { Backdrop } from '../../art/Backdrop'
import { TopBar } from './TopBar'

// Shared layout for non-combat screens: backdrop, top bar (once a run has a
// character), and a centered content panel.
export function ScreenFrame({ run, eyebrow, title, message, children, className = '', onDiscardPotion, wide = false }) {
  return (
    <main className={`screen frame-screen ${className}`}>
      <Backdrop act={run?.character ? run.act : 'menu'} />
      {run?.character && <TopBar onDiscardPotion={onDiscardPotion} run={run} />}
      <section className={`frame-panel panel ${wide ? 'wide' : ''}`}>
        <header className="frame-header">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          {message && <p className="muted">{message}</p>}
        </header>
        {children}
      </section>
    </main>
  )
}

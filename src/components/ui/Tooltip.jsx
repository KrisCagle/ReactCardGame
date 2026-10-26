// Hover / focus tooltip. CSS handles showing it, so it works with keyboard
// focus too (the trigger is focusable when it isn't already a button).
export function Tooltip({ title, text, children, side = 'top', as = 'span', className = '', focusable = true }) {
  const Tag = as
  return (
    <Tag className={`tip tip-${side} ${className}`} tabIndex={focusable ? 0 : undefined}>
      {children}
      <span className="tip-panel" role="tooltip">
        {title && <strong>{title}</strong>}
        {text && <span>{text}</span>}
      </span>
    </Tag>
  )
}

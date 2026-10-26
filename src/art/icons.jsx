// Small hand-drawn SVG icon set. Every icon inherits currentColor, so CSS decides the color.
import { iconPaths } from './iconPaths'

export function Icon({ name, size = 24, className = '', title }) {
  return (
    <svg
      aria-hidden={title ? undefined : 'true'}
      className={`icon icon-${name} ${className}`}
      fill="currentColor"
      height={size}
      role={title ? 'img' : undefined}
      viewBox="0 0 24 24"
      width={size}
    >
      {title && <title>{title}</title>}
      {iconPaths[name] ?? iconPaths.star}
    </svg>
  )
}

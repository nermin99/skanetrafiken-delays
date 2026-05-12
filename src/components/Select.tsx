import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export type SelectOption<T extends string> = {
  value: T
  label: string
  disabled?: boolean
}

/**
 * Custom listbox-style dropdown. Unlike a native `<select>`, the popup is plain
 * markup, so it follows the app's dark-mode styling. Supports mouse and keyboard
 * (Enter/Space/Arrows/Home/End/Escape) and closes on outside click or blur.
 */
export function Select<T extends string>({
  value,
  onChange,
  options,
  className = '',
  buttonClassName = '',
  'aria-label': ariaLabel,
}: {
  value: T
  onChange: (value: T) => void
  options: readonly SelectOption<T>[]
  className?: string
  buttonClassName?: string
  'aria-label'?: string
}) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(() => options.findIndex((o) => o.value === value))
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listboxId = useId()

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    listRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open || activeIndex < 0) return
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  function openMenu() {
    const start = options.findIndex((o) => o.value === value)
    setActiveIndex(start >= 0 ? start : firstEnabled(options, 0, 1))
    setOpen(true)
  }

  function commit(index: number) {
    const option = options[index]
    if (!option || option.disabled) return
    onChange(option.value)
    setOpen(false)
    buttonRef.current?.focus()
  }

  function onButtonKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openMenu()
    }
  }

  function onListKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        break
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => firstEnabled(options, i + 1, 1, i))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => firstEnabled(options, i - 1, -1, i))
        break
      case 'Home':
        e.preventDefault()
        setActiveIndex(firstEnabled(options, 0, 1))
        break
      case 'End':
        e.preventDefault()
        setActiveIndex(firstEnabled(options, options.length - 1, -1))
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        commit(activeIndex)
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onButtonKeyDown}
        className={`flex w-full items-center justify-between gap-2 ${buttonClassName}`}
      >
        <span className="truncate">{selected?.label ?? value}</span>
        <ChevronDown size={16} aria-hidden className="shrink-0 text-zinc-400 dark:text-zinc-500" />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          onKeyDown={onListKeyDown}
          onBlur={(e) => {
            if (!rootRef.current?.contains(e.relatedTarget as Node)) setOpen(false)
          }}
          className="absolute z-20 mt-1 max-h-60 w-full min-w-max overflow-auto rounded-lg border border-zinc-200 bg-white text-sm shadow-lg outline-none dark:border-zinc-700 dark:bg-zinc-800"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value
            const isActive = index === activeIndex
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled}
                onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                // Select on mousedown (and keep the list focused) so the choice lands
                // before any blur/outside-click handling can interfere.
                onMouseDown={(e) => {
                  e.preventDefault()
                  commit(index)
                }}
                className={[
                  'flex cursor-pointer items-center gap-2 px-3 py-1.5',
                  option.disabled
                    ? 'cursor-not-allowed text-zinc-400 dark:text-zinc-600'
                    : isActive
                      ? 'bg-brand text-white'
                      : 'text-zinc-700 dark:text-zinc-200',
                ].join(' ')}
              >
                <Check
                  size={14}
                  aria-hidden
                  className={isSelected ? (isActive ? 'text-white' : 'text-brand') : 'invisible'}
                />
                <span className="truncate">{option.label}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/** Index of the first non-disabled option scanning from `from` in `step` direction; falls back to `fallback`. */
function firstEnabled<T extends string>(
  options: readonly SelectOption<T>[],
  from: number,
  step: 1 | -1,
  fallback = -1
): number {
  for (let i = from; i >= 0 && i < options.length; i += step) {
    if (!options[i].disabled) return i
  }
  return fallback
}

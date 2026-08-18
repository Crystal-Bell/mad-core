'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * A useState replacement that transparently persists to localStorage.
 *
 * Hydration strategy: we start from `initialValue` on both server and first
 * client render (so SSR markup matches), then read localStorage in a layout-
 * phase effect on mount. Writes are gated until that read has happened, which
 * prevents the initial value from clobbering previously-saved state.
 */
export function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)
  const hydrated = useRef(false)

  // Read persisted value once, before any write can occur.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw !== null) {
        setValue(JSON.parse(raw) as T)
      }
    } catch {
      /* ignore malformed storage */
    } finally {
      hydrated.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // Persist on change, but never before hydration has completed.
  useEffect(() => {
    if (!hydrated.current) return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage full / unavailable */
    }
  }, [key, value])

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  }, [key])

  return [value, setValue, clear] as const
}

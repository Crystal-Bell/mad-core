'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * A useState replacement that transparently persists to localStorage.
 *
 * Hydration strategy: the first client render uses `initialValue` (so SSR
 * markup matches), then a mount effect reads localStorage and, if a saved
 * value exists, swaps it in. Writes are gated behind a `ready` flag that is
 * only flipped true AFTER the read effect has run, so the initial value can
 * never clobber previously-saved state — even if `value` changes in the same
 * commit as hydration.
 */
export function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)
  const [ready, setReady] = useState(false)
  const keyRef = useRef(key)
  keyRef.current = key

  // Read persisted value once on mount, then unlock writes.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw !== null) {
        setValue(JSON.parse(raw) as T)
      }
    } catch {
      /* ignore malformed storage */
    }
    setReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // Persist on change, but never before the initial read has completed.
  useEffect(() => {
    if (!ready) return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage full / unavailable */
    }
  }, [key, value, ready])

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(keyRef.current)
    } catch {
      /* ignore */
    }
  }, [])

  return [value, setValue, clear] as const
}

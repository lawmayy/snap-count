"use client"

import { useState, useEffect } from "react"

/**
 * A typed localStorage hook that:
 *  • reads once during initial render (lazy init)
 *  • persists every time the setter is called
 *  • avoids infinite render loops
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  // Lazy-init read
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null ? (JSON.parse(stored) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })

  // Wrapped setter that also writes to localStorage
  const setStoredValue: typeof setValue = (valOrFn) => {
    setValue((prev) => {
      const newVal = valOrFn instanceof Function ? valOrFn(prev) : valOrFn
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(newVal))
        }
      } catch {
        /* ignore write errors (e.g., quota exceeded) */
      }
      return newVal
    })
  }

  // If the key itself changes, migrate the value
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key)
      if (stored !== null) {
        setValue(JSON.parse(stored))
      } else {
        window.localStorage.setItem(key, JSON.stringify(defaultValue))
      }
    } catch {
      /* ignore read/write errors */
    }
    // Run only when `key` changes
  }, [key])

  return [value, setStoredValue] as const
}

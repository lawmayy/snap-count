"use client"

import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, defaultValue: T) {
  // Initialize with default value to match server render
  const [value, setValue] = useState<T>(defaultValue)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage after hydration
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key)
      if (stored !== null) {
        setValue(JSON.parse(stored))
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
    } finally {
      setIsLoaded(true)
    }
  }, [key])

  // Wrapped setter that also writes to localStorage
  const setStoredValue = (newValue: T | ((val: T) => T)) => {
    setValue((prev) => {
      const valueToStore = newValue instanceof Function ? newValue(prev) : newValue

      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }

      return valueToStore
    })
  }

  return [value, setStoredValue, isLoaded] as const
}

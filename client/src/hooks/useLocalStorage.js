import { useEffect, useState } from 'react'
import { readJSON, writeJSON } from '../data/storage'

// Works like useState, but the value is also saved to localStorage and
// restored the next time the app opens. Two components using the same key stay in step.
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readJSON(key, initialValue))

  useEffect(() => {
    writeJSON(key, value)
  }, [key, value])

  useEffect(() => {
    const onChange = (event) => {
      if (event.detail !== key) return
      const next = readJSON(key, initialValue)
      setValue((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
    }
    window.addEventListener('tt:ls', onChange)
    return () => window.removeEventListener('tt:ls', onChange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return [value, setValue]
}

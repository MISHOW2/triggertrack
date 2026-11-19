import { useEffect, useState } from 'react'
import { readJSON, writeJSON } from '../data/storage'

// Works like useState, but the value is also saved to localStorage and
// restored the next time the app opens.
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readJSON(key, initialValue))

  useEffect(() => {
    writeJSON(key, value)
  }, [key, value])

  return [value, setValue]
}

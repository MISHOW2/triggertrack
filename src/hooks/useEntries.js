import useLocalStorage from './useLocalStorage'
import { KEYS, newId } from '../data/storage'

// All logged entries (meals, wake-ups, symptom episodes) plus add / update / delete.
// Entries are kept newest-first.
export default function useEntries() {
  const [entries, setEntries] = useLocalStorage(KEYS.entries, [])

  const sortNewestFirst = (list) => [...list].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const addEntry = (entry) => setEntries((prev) => sortNewestFirst([...prev, { id: newId(), ...entry }]))

  const updateEntry = (id, changes) =>
    setEntries((prev) => sortNewestFirst(prev.map((e) => (e.id === id ? { ...e, ...changes } : e))))

  const deleteEntry = (id) => setEntries((prev) => prev.filter((e) => e.id !== id))

  const addMany = (list) => setEntries((prev) => sortNewestFirst([...prev, ...list]))

  const removeWhere = (predicate) => setEntries((prev) => prev.filter((e) => !predicate(e)))

  const clearAll = () => setEntries([])

  return { entries, addEntry, updateEntry, deleteEntry, addMany, removeWhere, clearAll }
}

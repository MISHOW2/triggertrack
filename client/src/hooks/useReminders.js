import { useEffect, useMemo, useState } from 'react'
import useLocalStorage from './useLocalStorage'
import { KEYS } from '../data/storage'
import { isSameDay } from '../utils/dateUtils'

export const DEFAULT_REMINDERS = {
  meals: { on: false, time: '13:00' },
  bedtime: { on: false, time: '21:30' },
  medication: { on: false, time: '07:30' },
  weekly: { on: false, time: '18:00', day: 0 }, // 0 = Sunday
  wake: { on: false },
  quiet: { start: '22:00', end: '07:00' },
}

export const REMINDER_COPY = {
  meals: { title: 'Log meals', text: "You haven't logged a meal yet today." },
  bedtime: { title: 'Bedtime log', text: 'Time to log how you feel before sleep.' },
  medication: { title: 'Medication', text: 'Time to log your morning dose.' },
  weekly: { title: 'Weekly questionnaire', text: 'Your weekly check-in is ready.' },
  wake: { title: 'Wake-up log', text: 'Log how you felt when you woke up.' },
}

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function inQuietHours(now, { start, end }) {
  const n = now.getHours() * 60 + now.getMinutes()
  const s = toMinutes(start)
  const e = toMinutes(end)
  return s <= e ? n >= s && n < e : n >= s || n < e
}

// Reminders that are due right now while the app is open.
// A web app cannot wake the phone in the background, so these show as a nudge on Home
// (and as a system notification if the person allowed them).
// One nudge per reminder per day; a missed day carries no penalty.
export default function useReminders(entries, medLogs) {
  const [settings] = useLocalStorage(KEYS.reminders, DEFAULT_REMINDERS)
  const [done, setDone] = useLocalStorage(KEYS.remindersDone, {})
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const due = useMemo(() => {
    const now = new Date()
    const cfg = { ...DEFAULT_REMINDERS, ...settings }
    if (inQuietHours(now, cfg.quiet)) return []
    const minutes = now.getHours() * 60 + now.getMinutes()
    const todayKey = now.toDateString()
    const todays = entries.filter((e) => isSameDay(e.timestamp, now))
    const list = []
    const pending = (id) => done[id] !== todayKey

    if (cfg.meals.on && pending('meals') && minutes >= toMinutes(cfg.meals.time) && !todays.some((e) => e.type === 'meal')) list.push('meals')
    if (cfg.bedtime.on && pending('bedtime') && minutes >= toMinutes(cfg.bedtime.time) && !todays.some((e) => e.type === 'bedtime')) list.push('bedtime')
    if (cfg.medication.on && pending('medication') && minutes >= toMinutes(cfg.medication.time) && !medLogs.some((l) => isSameDay(l.timestamp, now))) list.push('medication')
    if (cfg.weekly.on && pending('weekly') && now.getDay() === cfg.weekly.day && minutes >= toMinutes(cfg.weekly.time)) list.push('weekly')
    if (cfg.wake.on && pending('wake') && minutes < 11 * 60 && !todays.some((e) => e.type === 'wake')) list.push('wake')
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, entries, medLogs, done, tick])

  // System notification for the first due reminder, once, if permitted
  useEffect(() => {
    if (due.length === 0 || typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    const id = due[0]
    try {
      new Notification(`TriggerTrack · ${REMINDER_COPY[id].title}`, { body: REMINDER_COPY[id].text, icon: '/icons/icon-192.png', tag: id })
    } catch {
      // Some mobile browsers only allow notifications from a service worker. The Home nudge still shows.
    }
  }, [due])

  const dismiss = (id) => setDone((prev) => ({ ...prev, [id]: new Date().toDateString() }))
  return { due, dismiss }
}

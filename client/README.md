# TriggerTrack

Personal reflux / LPR tracker: log meals (with trigger tags), wake-ups, and symptom episodes (with a live timer), then see patterns in Insights. Built with React + Vite + Tailwind as an installable web app (PWA). Entries are saved on the phone first (IndexedDB), so logging works offline. Optional cloud sync is built behind a stand-in remote (`src/data/remote.js`) until a backend exists. Videos contact YouTube only when you tap play.

## Run it

```bash
npm install
npm run dev        # development, opens on http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build (needed to test install / offline)
```

## Use it on your phone

1. Deploy the `dist/` folder (Netlify, Vercel, GitHub Pages, any static host). It must be served over HTTPS.
2. Open the site on your phone.
   - Android (Chrome): menu > "Install app" / "Add to Home screen".
   - iPhone (Safari): Share > "Add to Home Screen".

Until sync is connected to a real backend, data is stored per device and per browser. Use Settings > Your data > Export to back it up.

## Project layout

```
src/
  App.jsx                 screen switching, theme, running timer
  components/             NavBar, Modal, EntryCard, TagButton, SeverityPicker...
  screens/                Home, Log (MealForm, WakeForm, BedtimeForm, SymptomTimer, SymptomForm), History, Insights, Videos, Settings
  hooks/                  useLocalStorage, useEntries (IndexedDB), useReminders
  context/SyncContext     consent, online state, outbox sync engine
  data/db.js              IndexedDB (Dexie): diary entries
  data/storage.js         localStorage for small settings and collections (+ export, sample data)
  data/remote.js          the ONLY file that talks to a server (stub for now)
  utils/                  constants, dateUtils, insights, videoList (curated videos)
```

## Things to know

- The Videos screen starts with an empty curated catalog in `src/utils/videoList.js`. Add reviewed YouTube video IDs with a title, channel, channel key, and topic; optional thumbnails must be local files under `public/`. Videos are not loaded until someone taps Play; follows and saved videos stay on that device. See [the video-library system-design decision](docs/system-design-decisions.md).
- Bedtime entries record the time, pre-sleep symptoms, stress/relaxation, digestion/fullness, and an optional note. They remain on this device with the other tracker data.
- The symptom timer saves its start time, so it stays correct if the phone locks or you close the app.
- Insights counts, for each trigger tag, how many meals were followed by a symptom episode within 4 hours (`TRIGGER_WINDOW_HOURS` in `src/utils/constants.js`). It is a clue, not proof.
- Edit the trigger / symptom lists in `src/utils/constants.js`.
- Not medical advice.

## Front-end phases (what is built)

- **Offline-first storage:** entries live in IndexedDB; old localStorage entries migrate once on first load.
- **Sync (Phase 2):** per-entry status, offline banner on Home, Sync details screen, soft deletes. `src/data/remote.js` is a stand-in that always succeeds, so nothing leaves the phone until you replace it.
- **Privacy (Phase 3):** consent screen (versioned), plain-language policy draft (needs legal review), Your data (export, clear this phone, delete account).
- **Backlog features:** medication log, doctor report (downloadable PDF), insights confidence + time of day + safe foods, reminders, weekly questionnaire (9-item RSI, wording in `src/utils/questionnaire.js`).
- **Beta:** welcome screen, feedback queue, sleep import (manual entry works; Health Connect needs the Android app, see `src/data/sleepSource.js`).

### To connect a real backend
Replace the three functions in `src/data/remote.js` (`push`, `deleteAccount`, `sendFeedback`) and set `isMockRemote = false`. Screens and the sync engine do not change. Reminders on a PWA only show while the app is open; background notifications need the Capacitor app.

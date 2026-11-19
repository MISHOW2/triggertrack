# TriggerTrack

Personal reflux / LPR tracker: log meals (with trigger tags), wake-ups, and symptom episodes (with a live timer), then see patterns in Insights. Built with React + Vite + Tailwind as an installable web app (PWA). All data stays in your browser (localStorage). Nothing is sent anywhere.

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

Data is stored per device and per browser. Use Settings > Export to back it up.

## Project layout

```
src/
  App.jsx                 screen switching, theme, running timer
  components/             NavBar, Modal, EntryCard, TagButton, SeverityPicker...
  screens/                Home, Log (MealForm, WakeForm, SymptomTimer, SymptomForm), History, Insights, Videos, Settings
  hooks/                  useLocalStorage, useEntries
  data/storage.js         the ONLY file that touches localStorage (+ export, sample data)
  utils/                  constants, dateUtils, insights, videoList (curated videos)
```

## Things to know

- The Videos screen starts with an empty curated catalog in `src/utils/videoList.js`. Add reviewed YouTube video IDs with a title, channel, and stable channel key. Videos are not loaded until someone taps Play; channel follows stay on that device. See [the video-library system-design decision](docs/system-design-decisions.md).
- The symptom timer saves its start time, so it stays correct if the phone locks or you close the app.
- Insights counts, for each trigger tag, how many meals were followed by a symptom episode within 4 hours (`TRIGGER_WINDOW_HOURS` in `src/utils/constants.js`). It is a clue, not proof.
- Edit the trigger / symptom lists in `src/utils/constants.js`.
- Not medical advice.

# TriggerTrack

TriggerTrack is a personal reflux/LPR diary for meals, wake-ups, and symptom episodes. It is an installable, offline-capable Progressive Web App built with React, Vite, Tailwind CSS, and IndexedDB.

## Local-only data

- Diary entries and the running symptom timer are stored on this device.
- There are no accounts, login, cloud sync, analytics, advertising, or tracking SDKs.
- Logging and reviewing entries do not require a network connection.
- Deleting the app or clearing its browser/app data deletes the local diary. Use **Settings → Your data → Export** to make a backup.
- Exported JSON files contain health information. Keep them private.
- Insights are observational clues, not proof, diagnosis, or medical advice.
- Feedback opens the user's own email app. Do not include health details.

The app does not need the API in `../server` to run. That API is separate and is not connected to the local-only PWA.

## Run locally

From this directory:

```bash
npm install
npm run dev
npm run build
npm run preview
```

`npm run build` writes the production PWA to `dist/`. `npm run preview` serves that build locally for a final check; browser install prompts require HTTPS or localhost.

## Install on a phone

1. Push changes to `local-only-v1`; GitHub Actions builds and deploys `client/dist` to GitHub Pages.
2. The project Pages URL is `https://mishow2.github.io/triggertrack/`. GitHub Pages must be enabled for the repository with **Settings → Pages → Build and deployment → GitHub Actions**.
3. Open the HTTPS URL on the phone and allow the app to load once.
4. Install it:
   - Android: Chrome menu → **Install app** or **Add to Home screen**.
   - iPhone: Safari Share menu → **Add to Home Screen**.
5. Open the installed app and verify logging and history work, then enable airplane mode and verify the core diary still opens.

The service worker caches the built app for offline use. The initial install requires a network connection.

## Project layout

```text
src/
  App.jsx                 Screen switching, theme, and running timer
  components/             Navigation, entry cards, forms, and controls
  screens/                Welcome, logging, history, insights, settings, and data
  hooks/                  Local settings and IndexedDB entries
  data/db.js              IndexedDB database
  data/storage.js         Local settings, data export, and backup import
  utils/                  Constants, date helpers, and observational insights
public/privacy-policy.html Public privacy-policy page for static hosting
```

## Notes

- The symptom timer stores its start timestamp, so it survives app closure.
- Food clues count logged meals in the four hours before symptom episodes. They are shown only after a minimum amount of data and are not evidence of cause.
- Optional features outside the v1 diary are not exposed in the interface.

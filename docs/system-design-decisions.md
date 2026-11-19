# System design decision: curated video library

**Status:** Accepted

**Scope:** Current client-only PWA; no accounts, API, or API key.

## Context

The existing system design prioritizes offline use, local data, and privacy. It does not cover videos. Unreviewed health content could undermine user trust, so the app should not invent or automatically fetch recommendations.

## Options

1. Add no video feature.
2. Maintain a manually curated video list, load a video only after an explicit play action, and keep channel follows on-device.
3. Fetch video metadata and synchronize follows through a service.

## Decision

Use option 2. Keep the catalog empty until videos are reviewed. Store entries in `src/utils/videoList.js` with `id` (YouTube video ID), `title`, `channel`, and a stable `channelKey`. Warn at startup about missing or duplicate IDs and missing display fields.

The Videos screen makes no video-provider request before Play. Playback uses YouTube's privacy-enhanced embed; the provider may receive connection details after playback starts. Do not add analytics or tracking scripts. Follow state remains in local storage and does not sync. Keep the educational-content and not-medical-advice notice visible.

## Backlog and gate

Updated backlog order:

1. Doctor report: a one-page summary to print or save as a PDF.
2. Curated video library (manually reviewed videos; local-only in the current app).
3. Medication log and remaining bedtime details, such as bed position. A basic bedtime check-in is now available locally.
4. Reminders for logging and medication.
5. Smarter insights.
6. Periodic symptom questionnaire.
7. Sleep data import.

The current hand-curated, device-local implementation does not add a backend. Defer syncing follows and fetching titles through an API until Phase 2 and its preceding roadmap gates are met.

## Bedtime check-in

The local bedtime entry records its timestamp, pre-sleep symptoms and severity, a stress/relaxation level, a digestion/fullness state, and an optional note. These are self-reported observations, not diagnoses or evidence that a specific factor caused symptoms.

## Revisit when

Reconsider this choice if users need follows across devices, the curated list becomes difficult to keep accurate, or an API can be introduced without compromising privacy, offline behavior, or editorial review.

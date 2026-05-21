# ER Threadkeeper
Local-first, mobile-first PWA for room/cue-based ER cognitive threads.

## Run locally
- npm install
- npm run dev
- npm run build
- npm run preview

## Deploy to Vercel
1. Push repo to Git provider.
2. Import project in Vercel.
3. Framework preset: Vite.
4. Build command: `npm run build`; output: `dist`.

## Notes
- Alerts are progressive enhancement only: "Alerts when supported by your device/browser."
- Mobile browsers may limit background notifications/vibration/timers.
- No backend, no auth, localStorage persistence only.

## Admin and customization
- Open hamburger menu (☰) and choose **Admin**.
- Edit/add/delete/reset predefined quick tasks there.
- Acuity labels are in `src/components/SwagSelector.tsx`.
- Info source pills per case are in `src/components/PatientCaseCard.tsx`.

## Testing notifications on phone
1. Install PWA from browser menu.
2. Open app and tap **Enable alerts**.
3. Add a thread with a reminder.
4. Keep app foregrounded first; then test background behavior (device/browser dependent).

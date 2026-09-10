# VALAM Farmer Web App + Backend

This package keeps the existing VALAM UI intact and adds a local backend for authentication and persistent farmer data.

## Requirements
- Node.js 18+
- npm

## Run on your desktop

Terminal 1:
```bash
npm install
npm run dev:backend
```

Terminal 2:
```bash
npm install
npm run dev
```

Open the Vite URL shown in Terminal 2 (normally `http://localhost:8443`).

## Local OTP
Use **123456** for the local OTP. The backend stores users and their state in `server-data/db.json`.

## Behaviour
- Existing UI/screens/styles are preserved.
- The demo number `9876543210` loads the original demo data so the visual demo remains the same.
- Other new farmer numbers start without a fabricated soil profile or health score. The farmer can complete the Farm Profile screen.
- Farm profile, ledger, alerts, bundle, enquiries, activity and upcoming events are persisted through the backend.
- Backend health check: `GET /api/health`.

## Production note
This is a hackathon/local backend. OTP delivery is intentionally local and uses a fixed development OTP. Replace it with an SMS provider and proper session/JWT authentication before production use.

## Windows / VS Code setup

1. Open this folder in VS Code.
2. In Terminal run `npm install`.
3. Terminal 1: `npm run dev:backend`
4. Terminal 2: `npm run dev`
5. Open the localhost URL printed by Vite (normally http://localhost:5173).

The Vite configuration is standalone and does not require the original Figma Make `.figma/make/site.json` file.

# KisanBot — AI Crop Advisor for Kerala Farmers

An AI-powered web app where farmers describe a crop problem and receive:
- Instant diagnosis (disease/pest name + cause)
- Severity level (low / medium / high)
- Step-by-step treatment
- Local remedy using materials available at home
- Prevention advice for next season
- Summary in their preferred language (English, Malayalam, Hindi, Tamil)
- Links to nearest Krishi Bhavan and agri-supply stores
- A community heatmap showing crop issues by district

---

## Project Structure

```
kisanbot/
├── client/          ← React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── DiagnoseForm.jsx
│   │   │   └── ResultCard.jsx
│   │   ├── pages/
│   │   │   ├── DiagnosePage.jsx
│   │   │   └── HeatmapPage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── server/          ← Express.js backend
    ├── index.js     ← Routes
    ├── gemini.js    ← Gemini AI integration
    ├── firestore.js ← Firebase database
    └── package.json
```

---

## Setup — Step by Step

### 1. Get your Gemini API key

1. Go to https://aistudio.google.com
2. Click "Get API key" → Create API key
3. Copy the key — you'll need it in step 3

### 2. Set up Firebase Firestore

1. Go to https://console.firebase.google.com
2. Create a new project (e.g. "kisanbot")
3. In the left sidebar → Build → Firestore Database → Create database
4. Choose "Start in test mode" → pick a region (asia-south1 for India)
5. Go to Project Settings (gear icon) → Service Accounts
6. Click "Generate new private key" → Download the JSON file
7. You'll need `project_id`, `client_email`, and `private_key` from this file

### 3. Configure the backend

```bash
cd server
npm install
cp .env.example .env
```

Open `.env` and fill in your values:
```
GEMINI_API_KEY=AIza...your_key...
FIREBASE_PROJECT_ID=kisanbot-xxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@kisanbot-xxxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

> **Important for FIREBASE_PRIVATE_KEY**: Open the downloaded JSON file, copy the `private_key` value exactly as-is (including `\n` characters), wrap it in double quotes in .env.

### 4. Configure and run the frontend

```bash
cd client
npm install
cp .env.example .env
# .env already has VITE_API_URL=http://localhost:5000 — no change needed for local dev
```

### 5. Run everything

Open two terminals:

**Terminal 1 — backend:**
```bash
cd server
npm run dev
# Server running on http://localhost:5000
```

**Terminal 2 — frontend:**
```bash
cd client
npm run dev
# App running on http://localhost:5173
```

Open http://localhost:5173 — the app is live!

---

## How the AI diagnosis works

The core is one well-crafted Gemini prompt in `server/gemini.js`. It:
- Receives crop type, district, season, and the farmer's description
- Instructs Gemini to respond as structured JSON only
- Parses the response and returns it to the frontend

The prompt uses `temperature: 0.2` (low) for consistent, factual medical-style advice.

---

## Deploying (Week 4)

### Deploy backend to Render

1. Push your code to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo, set root directory to `server`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add all your `.env` variables under "Environment"
7. Copy the Render URL (e.g. `https://kisanbot.onrender.com`)

### Deploy frontend to Vercel

1. Go to https://vercel.com → New Project
2. Connect GitHub repo, set root directory to `client`
3. Add environment variable: `VITE_API_URL=https://your-app-name.onrender.com`
4. Deploy — done!

---

## Firestore rules (before going live)

In Firebase Console → Firestore → Rules, replace the default with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reports/{doc} {
      allow read: if true;            // anyone can read community data
      allow write: if false;          // only server (admin SDK) can write
    }
  }
}
```

---

## Extending the project

- **Photo upload**: Add a file input and send the image as base64 to Gemini's vision model for visual diagnosis
- **Voice input**: Use the Web Speech API for farmers who prefer speaking over typing
- **Offline mode**: Cache recent diagnoses in localStorage for areas with poor connectivity
- **SMS alerts**: Use Twilio to send outbreak alerts to farmers in affected districts
- **Weather integration**: Pull weather data (rainfall, humidity) and include it in the Gemini prompt for more accurate seasonal advice

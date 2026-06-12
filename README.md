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

## Features

**Photo Upload** — Farmers can upload a photo of the affected crop. The image is sent to Gemini's vision model for visual diagnosis, no text description needed.

**Voice Input** — Farmers can speak their problem instead of typing. Supports English, Malayalam, Hindi, and Tamil — voice is automatically converted to text and used for diagnosis. Designed for low-literacy users and those who prefer speaking over typing.

**Weather-Based Advice** — Live weather data (rainfall, humidity, temperature) is pulled for the farmer's district and factored into the Gemini prompt for seasonally accurate recommendations.

**Offline Save** — Recent diagnoses are cached in localStorage so farmers can review them even in areas with poor connectivity.

**WhatsApp Share** — One tap sends the diagnosis summary via WhatsApp, useful for sharing advice with family members, local dealers, or extension officers.

**Community Heatmap** — A district-level map of Kerala showing active crop issues reported by the community, powered by Firebase Firestore.

> **Note on API usage:** This project uses the Gemini 2.5 Flash model which has a daily request limit on the free tier (500 requests/day, 10 requests/minute). If you hit the limit, wait for the quota to reset at midnight Pacific Time (~12:30 PM IST) or check your usage at https://ai.dev/rate-limit.

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

## Setup — Step by Step

### 1. Get your Gemini API key
Go to https://aistudio.google.com
Click "Get API key" → Create API key
Copy the key — you'll need it in step 3

### 2. Set up Firebase Firestore
Go to https://console.firebase.google.com
Create a new project (e.g. "kisanbot")
In the left sidebar → Build → Firestore Database → Create database
Choose "Start in test mode" → pick a region (asia-south1 for India)
Go to Project Settings (gear icon) → Service Accounts
Click "Generate new private key" → Download the JSON file
You'll need project_id, client_email, and private_key from this file

### 3. Configure the backend
```
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

> **Important for FIREBASE_PRIVATE_KEY:** Open the downloaded JSON file, copy the `private_key` value exactly as-is (including `\n` characters), wrap it in double quotes in `.env`.

### 4. Configure and run the frontend
```
cd client
npm install
cp .env.example .env
# .env already has VITE_API_URL=http://localhost:5000 — no change needed for local dev
```

### 5. Run everything

Open two terminals:

**Terminal 1 — backend:**
```
cd server
npm run dev
# Server running on http://localhost:5000
```

**Terminal 2 — frontend:**
```
cd client
npm run dev
# App running on http://localhost:5173
```

Open http://localhost:5173 — the app is live!

## How the AI diagnosis works

The core is one well-crafted Gemini prompt in `server/gemini.js`. It:

- Receives crop type, district, season, weather data, and the farmer's description (or image)
- Instructs Gemini to respond as structured JSON only
- Parses the response and returns it to the frontend

The prompt uses `temperature: 0.2` (low) for consistent, factual medical-style advice.

## Firestore Rules

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

PROJECT CREATED BY ABEL SHIJO

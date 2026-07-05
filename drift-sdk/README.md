# 🛡️ Driftly AI SDK

### Real-time API Drift Monitoring & Intelligent Impact Analysis

**Driftly** is a high-performance, drop-in SDK that monitors your frontend API calls for structural drifts. If an API response changes unexpectedly in production, Driftly detects it, analyzes the impact using **Gemini AI**, and alerts your team via **Slack, Telegram, or WhatsApp** before your users report a crash.

---

## ⚡ Key Features
- **Zero-Config Monitoring**: Just wrap your fetch, and Driftly does the rest.
- **Smart Baselining**: Automatically learns your API structure from the first request.
- **AI Impact Analysis**: Uses Gemini AI to predict how drifts will affect your UI.
- **Multi-Channel Alerts**: Instant notifications on Slack, Telegram, and WhatsApp.
- **Schema-Agnostic**: Works with any JSON-based REST API.

---

## 📦 Installation

```bash
npm install driftly-sdk
```

---

## 🚀 Quick Start

1. Go to the live **[Driftly Dashboard](https://driftly-steel.vercel.app/)** to get your **Project API Key**.
2. Initialize the SDK at the root of your application (e.g., `main.tsx`, `App.tsx`, `_app.tsx` or `layout.tsx`).

```typescript
import { initDriftly } from 'driftly-sdk';

initDriftly({
  monitorUrl: 'https://driftly-steel.vercel.app/api/monitor', // Live Dashboard endpoint
  apiKey: 'YOUR_PROJECT_API_KEY',                            // Found in your Dashboard settings
  serviceName: 'Frontend-Main-App',
  enabled: true,                                               // Toggle monitoring on/off
  debug: true
});
```

That's it! Driftly will now intercept all global `fetch` calls, compare them with learned baselines, and report any drifts to your dashboard.

---

## 🛠️ Configuration Options

| Option | Type | Description |
| :--- | :--- | :--- |
| `monitorUrl` | `string` | The endpoint of your Driftly Dashboard API. |
| `apiKey` | `string` | Found in your Dashboard Project Settings. |
| `serviceName` | `string` | Identifier for the app sending reports. |
| `enabled` | `boolean` | Toggle monitoring on/off (Default: `true`). |
| `debug` | `boolean` | Enable verbose logging in the console (Default: `false`). |
| `excludeUrls` | `string[]` | Patterns to exclude from monitoring. |
| `onDrift` | `(drift) => void`| Callback triggered when a drift is detected locally. |

---

## 🧠 AI-Powered Insights
When a `BREAKING` drift is detected (fields removed or types changed), Driftly pairs the report with **Gemini AI** to send your team insights like:

> "🚨 **BREAKING DRIFT**: Field `user.email` removed from `/api/profile`. \n**Gemini Analysis**: This will cause a 'Cannot read property email of undefined' crash in the Profile component. Immediate action recommended."

---

## 🛡️ License
ISC © [Sajid Bhatti](https://github.com/sajidsmile143)

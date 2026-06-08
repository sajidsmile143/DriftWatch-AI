# 🛡️ Driftly AI

**"The Microservices Killer" — Real-time API Drift Detection & Prevention.**

Jab bare projects mein APIs change hoti hain, to frontend break ho jata hai aur kisi ko pata nahi chalta jab tak user report na kare. **Driftly** is problem ka jad se khatma karta hai.

Dashboard features:
- **Zero-Day Crash Prevention**: Detects schema mismatches in real-time.
- **WhatsApp Notifications**: Immediate alerts for breaking changes delivered to your pocket.
- **Auto-Generated Documentation**: Live API specs and mocks without Swagger.
- **AI-Powered Impact Analysis**: Understand *why* a change will break your UI.

---

## 🚀 How it Works?

1. **The SDK**: A lightweight wrapper for `fetch` that intercepts API responses.
2. **The Monitor**: A central dashboard that establishes a "Gold Standard" baseline for every API.
3. **The Engine**: Compares every request against the baseline. If a key is missing or a type changes, it triggers an alert.

## 📦 Features

### 1. Real-time Monitoring & Diff
Visualize the exact difference between **Expected** vs **Actual** JSON schemas.

### 2. WhatsApp Alerts
Configure your phone number in the settings to receive instant alerts when a `BREAKING` drift is detected.

### 3. Live API Specification
Forget manual documentation. Driftly captures live traffic and generates a documentation page for all your services with one-click Mocks.

---

## 🛠️ Quick Start

### 1. Installation

```bash
# Install the SDK
npm install @sajidsmile/driftly
```

### 2. Basic Setup (SDK)

```javascript
import { initDriftly } from "@sajidsmile/driftly";

initDriftly({
  monitorUrl: "https://your-driftly-dashboard.vercel.app/api/monitor",
  serviceName: "My-Frontend-App"
});
```

---

## 🎨 Tech Stack

- **Frontend/Dashboard**: Next.js 15 (App Router), Tailwind CSS v4, Framer Motion.
- **SDK**: TypeScript Fetch Interceptor.
- **AI**: Gemini 1.5 Pro Impact Analysis Engine.
- **Alerts**: WhatsApp Gateway Integration.

---

## 💖 Support the project
If this tool saved your production app from a crash, give it a ⭐ on GitHub! (Driftly)

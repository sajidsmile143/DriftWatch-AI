/**
 * Driftly - Real-world API Drift Simulation
 * This script simulates a frontend application communicating with a backend API.
 * It demonstrates establishing a baseline and detecting a breaking change.
 */

// Since we are running in Node.js, we simulate the browser environment for the SDK
if (typeof window === "undefined") {
  global.window = {
    fetch: async () => ({} as Response),
    dispatchEvent: (event: any) => console.log(`🔔 [Browser Event] Dispatched: ${event.type}`)
  } as any;
}

const { initDriftly } = require("./drift-sdk/dist/index.js");

// Define state for our mock backend API responses
let callCount = 0;
const REAL_API_URL = "https://api.mycommerce.com/api/v1/user/profile";

// Mock the original fetch to return different payloads on subsequent calls
const originalFetchMock = async (url: string, options?: any) => {
  callCount++;
  
  if (callCount === 1) {
    // Call 1: Normal API response (establishing baseline)
    return {
      ok: true,
      status: 200,
      clone: () => ({
        json: async () => ({
          userId: 99,
          username: "john_doe",
          email: "john@example.com",
          is_active: true
        })
      }),
      json: async () => ({
        userId: 99,
        username: "john_doe",
        email: "john@example.com",
        is_active: true
      })
    } as any;
  } else {
    // Call 2: Breaking API response (backend changed keys and removed fields)
    return {
      ok: true,
      status: 200,
      clone: () => ({
        json: async () => ({
          id: 99,               // userId renamed to id
          username: "john_doe",
          is_active: true       // email field is removed!
        })
      }),
      json: async () => ({
        id: 99,
        username: "john_doe",
        is_active: true
      })
    } as any;
  }
};

// Override the window fetch mock with our custom handler
global.window.fetch = originalFetchMock;

async function runRealLifeDemo() {
  console.log("🚀 STARTING REAL-WORLD DRIFT SIMULATION...");
  
  // 1. Initialize Driftly SDK
  initDriftly({
    monitorUrl: "http://localhost:3000/api/monitor",
    apiKey: "pk_uclvq2g8k9",
    serviceName: "E-Commerce-Frontend",
    debug: true,
    enabled: true
  });

  console.log("\n📡 [App UI] Fetching user profile for the first time...");
  // This first call will capture the API spec and save it to the DB as baseline
  await window.fetch(REAL_API_URL);
  
  console.log("⏳ Waiting 2 seconds for baseline establishment...");
  await new Promise(r => setTimeout(r, 2000));

  console.log("\n⚠️  [Backend Update] Backend team rolls out an update, changing the schema...");
  console.log("📡 [App UI] Fetching user profile for the second time...");
  
  // This second call will be intercepted, compared against baseline, fail, and trigger alerts
  await window.fetch(REAL_API_URL);

  console.log("\n⏳ Waiting 5 seconds for drift detection and WhatsApp alert processing...");
  await new Promise(r => setTimeout(r, 5000));
  
  console.log("\n🏁 Simulation complete! Check your WhatsApp and the Overview Dashboard.");
}

runRealLifeDemo().catch(console.error);

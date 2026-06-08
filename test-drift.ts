/**
 * DriftWatch Demo Script
 * This script simulates the SDK sending data to your local DriftWatch server.
 */

async function runDemo() {
  const MONITOR_API = "http://localhost:3000/api/monitor";
  const API_KEY = "pk_uclvq2g8k9";
  
  console.log("🚀 Starting Driftly Demo...");

  // 1. Establish Baseline
  console.log("\n1. Establishing Baseline for /api/user...");
  const res1 = await fetch(MONITOR_API, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "x-driftly-api-key": API_KEY
    },
    body: JSON.stringify({
      url: "https://api.myapp.com/api/user",
      serviceName: "User-Service",
      body: { id: 1, name: "Antigravity", email: "ai@test.com" }
    })
  });
  const data1 = await res1.json();
  console.log("✅ Baseline set status:", data1.status || data1.error);

  // Wait a bit
  await new Promise(r => setTimeout(r, 1000));

  // 2. Simulate Breaking Drift (Removed 'email')
  console.log("\n2. Simulating BREAKING DRIFT (Backend removed 'email')...");
  const res2 = await fetch(MONITOR_API, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "x-driftly-api-key": API_KEY
    },
    body: JSON.stringify({
      url: "https://api.myapp.com/api/user",
      serviceName: "User-Service",
      body: { id: 1, name: "Antigravity" } // 'email' is missing!
    })
  });
  const data2 = await res2.json();
  console.log("🚨 Result:", data2.status || data2.error, "-", data2.message);

  // 3. Simulate Safe Change (New field 'image_url')
  console.log("\n3. Simulating SAFE CHANGE (Backend added 'image_url')...");
  const res3 = await fetch(MONITOR_API, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "x-driftly-api-key": API_KEY
    },
    body: JSON.stringify({
      url: "https://api.myapp.com/api/user",
      serviceName: "User-Service",
      body: { id: 1, name: "Antigravity", email: "ai@test.com", image_url: "http://logo.png" }
    })
  });
  const data3 = await res3.json();
  console.log("✅ Result:", data3.status || data3.error, "-", data3.message);

  console.log("\n🏁 Demo complete! Go to the 'Drifts' tab in your dashboard to see the reports.");
}

runDemo().catch(console.error);

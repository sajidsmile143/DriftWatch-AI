/**
 * Driftly Integration Test
 * This script uses the COMPILED SDK to verify the wrapper logic.
 */

const { initDriftly } = require("./drift-sdk/dist/index.js");

// Mock window.fetch for Node environment simulation
if (typeof window === "undefined") {
    global.window = {
        fetch: async (url, options) => {
            console.log(`🌐 Original Fetch called for: ${url}`);
            return {
                ok: true,
                status: 200,
                clone: () => ({
                    json: async () => ({ id: 1, name: "Integration Test", status: "Active" })
                }),
                json: async () => ({ id: 1, name: "Integration Test", status: "Active" })
            };
        },
        dispatchEvent: (event) => console.log(`🔔 Global Event Dispatched: ${event.type}`)
    };
}

async function runTest() {
    console.log("🚀 Initializing Driftly SDK...");
    
    initDriftly({
        monitorUrl: "http://localhost:3000/api/monitor",
        serviceName: "Integration-Test-Suite",
        debug: true,
        enabled: true
    });

    console.log("\n📡 Triggering a Fetch call...");
    // This call should be intercepted by Driftly and reported to the monitor
    try {
        await window.fetch("https://api.example.com/status");
        console.log("✅ Fetch call finished.");
    } catch (e) {
        console.error("❌ Fetch failed:", e);
    }

    console.log("\n⏳ Waiting 2 seconds for background reporting...");
    await new Promise(r => setTimeout(r, 2000));
    
    console.log("\n🏁 Integration test script finished. Check local dashboard for 'Integration-Test-Suite' entry.");
}

runTest().catch(console.error);

/**
 * DRIFTLY AI - SaaS SIMULATOR
 * This script simulates a breaking API change for verification.
 */

async function simulateDrift() {
    // 1. UPDATE THESE VALUES
    const API_KEY = "pk_uclvq2g8k9"; // Normalized Key
    const DEV_PORT = "3000"; // Port your server is running on
    
    const BASE_URL = `http://localhost:${DEV_PORT}/api/monitor`;

    console.log("🚀 STARTING SAAS DRIFT SIMULATION...");

    // Sample Payload: BREAKING Drift Simulation (Removed 'email' field)
    const payload = {
        serviceName: "Production-Auth",
        url: "/api/v1/login",
        method: "GET",
        body: { 
            username: "sajid_bhatti", 
            // email is MISSING! (Breaking)
            role: "admin",
            metadata: { lastLogin: "2024-04-15" }
        },
        timestamp: Date.now()
    };

    try {
        console.log(`📡 Sending report to ${BASE_URL}...`);
        
        const response = await fetch(BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-driftly-api-key": API_KEY
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log("✅ SIMULATION SUCCESSFUL!");
            console.log("📈 Report saved to DB. Now refresh your Dashboard UI.");
            console.log("Report ID:", result.report?.id);
        } else {
            console.error("❌ SIMULATION FAILED:", result.error);
        }
    } catch (error) {
        console.error("💥 CONNECTION ERROR:", error.message);
    }
}

simulateDrift();

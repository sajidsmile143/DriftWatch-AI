/**
 * List Available Models for the Key
 */

async function listModels() {
    const apiKey = "AIzaSyDACQOocNMXWtcYwqIme8oyytYsbp6gB-o";
    console.log("🔍 Fetching available models for this key...");

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await res.json();
        
        if (data.error) {
            console.log("❌ Error:", data.error.message);
        } else {
            console.log("✅ Models found!");
            const modelNames = data.models.map(m => m.name);
            console.log("Available Models:", modelNames.slice(0, 10)); // Show first 10
        }
    } catch (error) {
        console.log("❌ Connection Error:", error);
    }
}

listModels();

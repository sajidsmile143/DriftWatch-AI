/**
 * Quick AI Key Validator
 */

async function testGemini() {
    const apiKey = "AIzaSyATwa9a4TIAMKwAQWbrANNzC_KJvdQ7YLc";
    console.log("🔍 Testing FRESH Gemini AI Key (New Email)...");

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Respond with 'ACTIVE' if you work." }] }]
            })
        });

        const data = await res.json();
        
        if (data.error) {
            console.log("❌ Error:", data.error.message);
        } else {
            console.log("✅ FRESH AI KEY IS WORKING!");
            console.log("Response:", data.candidates?.[0]?.content?.parts?.[0]?.text);
        }
    } catch (error) {
        console.log("❌ Connection Error:", error);
    }
}

testGemini();


async function verifyKey() {
  const apiKey = "AIzaSyBUFUvrKHoIHz9GZEYDpPQ2UyMfJp8Tmec";
  console.log("🔍 Verifying Gemini Key...");
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    
    if (data.error) {
      console.error("❌ API Error:", data.error.message);
      return;
    }

    console.log("✅ Key is valid!");
    console.log("Available Models:");
    data.models.forEach((m: any) => {
      if (m.supportedGenerationMethods.includes("generateContent")) {
        console.log(` - ${m.name}`);
      }
    });
  } catch (err) {
    console.error("❌ Fetch Error:", err);
  }
}

verifyKey();

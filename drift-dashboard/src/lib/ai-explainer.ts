/**
 * AI Impact Analysis
 * Calls Gemini API to explain the impact of the schema change on the frontend.
 */

export async function explainDriftImpact(
  serviceName: string, 
  diff: { expected: Record<string, string>; received: Record<string, any> },
  apiKey?: string
) {
  if (!apiKey) {
    return basicAnalysis(diff);
  }

  try {
    const prompt = `Analyze this API Drift for service "${serviceName}".
    
Expected Schema: ${JSON.stringify(diff.expected)}
Actual Response Schema: ${JSON.stringify((diff.received || (diff as any).actual || {}))}

Please provide a "Kamal" (Premium) analysis:
1. Identify if it is a BREAKING, WARNING, or SAFE change.
2. Explain specifically which frontend code patterns (e.g., .map(), destructuring) will fail.
3. Suggest a 1-line fix.
Keep it concise, developer-friendly, and insightful.`;

    const cleanKey = apiKey.trim();
    
    // Check if it's a Groq Key
    if (cleanKey.startsWith("gsk_")) {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${cleanKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }]
        })
      });

      const groqData = await groqRes.json();
      return groqData.choices?.[0]?.message?.content || basicAnalysis(diff);
    }

    // Default to Gemini
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${cleanKey}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await res.json();
    
    if (data.error) {
      return basicAnalysis(diff);
    }
    
    return data.candidates?.[0]?.content?.parts?.[0]?.text || basicAnalysis(diff);
    
  } catch (error) {
    return basicAnalysis(diff);
  }

}

function basicAnalysis(diff: { expected: Record<string, string>; received: Record<string, any> }) {
  const missingKeys = Object.keys(diff.expected).filter(k => !(k in (diff.received || (diff as any).actual || {})));
  const typeMismatches = Object.keys(diff.expected).filter(k => 
    k in (diff.received || (diff as any).actual || {}) && diff.expected[k] !== (diff.received || (diff as any).actual || {})[k]
  );
  
  let analysis = "🛡️ **Smart Audit Analysis:**\n\n";

  if (missingKeys.length > 0) {
    analysis += `⚠️ **CRITICAL:** Missing fields detected: [${missingKeys.join(", ")}].\n`;
    analysis += `• **Impact:** UI components using destructuring (e.g., \`const { ${missingKeys[0]} } = data\`) will receive \`undefined\`, potentially leading to "Cannot read property of undefined" crashes.\n`;
    analysis += `• **Recommendation:** Check your API response mapping or add null-checks (Optional Chaining \`?.\`) in your components.\n\n`;
  }

  if (typeMismatches.length > 0) {
    analysis += `🔸 **WARNING:** Type Mismatch on '${typeMismatches[0]}'.\n`;
    analysis += `• **Expected:** ${diff.expected[typeMismatches[0]]} | **Received:** ${(diff.received || (diff as any).actual || {})[typeMismatches[0]]}\n`;
    analysis += `• **Impact:** Functional logic like \`.filter()\` or string methods might throw runtime errors if the type is unexpected.\n\n`;
  }

  if (missingKeys.length === 0 && typeMismatches.length === 0) {
    analysis += `✅ **SAFE:** No breaking changes detected. New fields were added which are safe for backward compatibility.`;
  }

  return analysis;
}

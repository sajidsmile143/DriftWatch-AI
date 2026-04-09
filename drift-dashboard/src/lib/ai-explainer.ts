/**
 * AI Impact Analysis
 * Calls Gemini API to explain the impact of the schema change on the frontend.
 */

export async function explainDriftImpact(
  serviceName: string, 
  diff: { expected: Record<string, string>; actual: Record<string, string> },
  apiKey?: string
) {
  if (!apiKey) {
    return basicAnalysis(diff);
  }

  try {
    const prompt = `Analyze this API Drift for service "${serviceName}".
    
Expected Schema: ${JSON.stringify(diff.expected)}
Actual Response Schema: ${JSON.stringify(diff.actual)}

Please provide a "Kamal" (Premium) analysis:
1. Identify if it is a BREAKING, WARNING, or SAFE change.
2. Explain specifically which frontend code patterns (e.g., .map(), destructuring) will fail.
3. Suggest a 1-line fix.
Keep it concise, developer-friendly, and insightful.`;

    const cleanKey = apiKey.trim();
    
    // Using gemini-2.0-flash which is verified to be available for this key
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${cleanKey}`, {
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
      console.error("Gemini API Error:", data.error.message);
      return `AI Error: ${data.error.message}. Showing basic analysis: \n\n${basicAnalysis(diff)}`;
    }
    
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "AI was unable to analyze this drift.";
    
  } catch (error) {
    console.error("Gemini API Utility Error:", error);
    return basicAnalysis(diff);
  }
}

function basicAnalysis(diff: { expected: Record<string, string>; actual: Record<string, string> }) {
  const missingKeys = Object.keys(diff.expected).filter(k => !(k in diff.actual));
  
  if (missingKeys.length > 0) {
    return `🛡️ DriftWatch Basic Analysis: Removing the fields [${missingKeys.join(", ")}] will likely cause a crash in your UI components that rely on these properties. Specifically, if you are mapping over this data, 'undefined' errors are imminent.`;
  }

  const typeMismatches = Object.keys(diff.expected).filter(k => 
    k in diff.actual && diff.expected[k] !== diff.actual[k]
  );

  if (typeMismatches.length > 0) {
    return `🛡️ DriftWatch Basic Analysis: Type mismatch on '${typeMismatches[0]}'. Your frontend expects a '${diff.expected[typeMismatches[0]]}' but the backend is now sending a '${diff.actual[typeMismatches[0]]}'.`;
  }

  return "🛡️ DriftWatch Basic Analysis: This change appears to be non-breaking (Safe). New fields were added which won't affect existing logic.";
}

import { NextRequest, NextResponse } from "next/server";
import { store } from "../../../lib/store";
import { extractSchema, compareSchemas } from "../../../lib/detector";
import { sendWhatsAppDriftAlert, sendSlackDriftAlert } from "../../../lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { url, method, body, serviceName } = data;

    if (!url || !body) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const actualSchema = extractSchema(body);
    const baseline = store.getBaseline(url);

    if (!baseline) {
      // First time seeing this API, set it as baseline
      store.setBaseline(url, {
        url,
        method: method || "GET",
        schema: actualSchema,
        timestamp: Date.now()
      });

      return NextResponse.json({ status: "BASELINE_SET", message: "Baseline established." });
    }

    // Compare with baseline
    const drift = compareSchemas(baseline.schema, actualSchema);

    if (drift) {
      store.addReport({
        id: Math.random().toString(36).substr(2, 9),
        serviceName: serviceName || "Unknown Service",
        endpoint: url,
        type: drift.type,
        message: drift.message,
        diff: drift.diff,
        timestamp: Date.now()
      });

      // Notifications logic
      const settings = store.getSettings();
      
      if (drift.type === "BREAKING") {
        // WhatsApp
        if (settings.whatsappNumber && settings.whatsappApiKey) {
          sendWhatsAppDriftAlert(
            settings.whatsappNumber,
            settings.whatsappApiKey,
            serviceName || "Unknown",
            drift.message
          );
        }
        
        // Slack
        if (settings.slackWebhook) {
          sendSlackDriftAlert(
            settings.slackWebhook,
            serviceName || "Unknown",
            drift.message
          );
        }
      }

      return NextResponse.json({ 
        status: "DRIFT_DETECTED", 
        type: drift.type,
        message: drift.message 
      });
    }

    return NextResponse.json({ status: "OK", message: "No drift detected." });

  } catch (error) {
    console.error("Monitor API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  const reports = store.getReports();
  return NextResponse.json(reports);
}

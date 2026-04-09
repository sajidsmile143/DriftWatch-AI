/**
 * Notifications Utility
 * Handles WhatsApp (via CallMeBot) and Slack (via Webhooks).
 */

export async function sendWhatsAppDriftAlert(phone: string, apiKey: string, service: string, driftMessage: string) {
  try {
    const text = encodeURIComponent(`⚠️ *DriftWatch Alert* ⚠️\n\n*Service:* ${service}\n*Status:* BREAKING\n*Drift:* ${driftMessage}\n\nCheck dashboard: http://localhost:3000/drifts`);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${text}&apikey=${apiKey}`;
    const res = await fetch(url);
    return res.ok;
  } catch (error) {
    console.error("WhatsApp Error:", error);
    return false;
  }
}

export async function sendSlackDriftAlert(webhookUrl: string, service: string, driftMessage: string) {
  try {
    const payload = {
      text: `⚠️ *API Drift Detected*`,
      attachments: [
        {
          color: "#ff0000",
          title: `Service: ${service}`,
          text: driftMessage,
          fields: [
            { title: "Status", value: "BREAKING", short: true },
            { title: "Dashboard", value: "http://localhost:3000/drifts", short: true }
          ],
          footer: "DriftWatch AI",
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (error) {
    console.error("Slack Error:", error);
    return false;
  }
}

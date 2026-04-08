/**
 * DriftWatch SDK
 * Real-time API drift monitoring wrapper for fetch.
 */

type DriftConfig = {
  monitorUrl: string;
  serviceName?: string;
  enabled?: boolean;
};

export function initDriftWatch(config: DriftConfig) {
  if (typeof window === "undefined" || config.enabled === false) return;

  const originalFetch = window.fetch;
  const monitorUrl = config.monitorUrl;
  const serviceName = config.serviceName || "Frontend-App";

  console.log("🛡️ DriftWatch initialized. Monitoring APIs...");

  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    
    // We clone the response to avoid interfering with the original consumer
    const clonedResponse = response.clone();
    
    // Asynchronous reporting so we don't block the main thread
    clonedResponse.json().then(body => {
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
      
      // Don't monitor calls to the monitor server itself to avoid infinite loops
      if (url.includes(monitorUrl)) return;

      reportDrift(monitorUrl, {
        url,
        method: (args[1]?.method || "GET") as string,
        body,
        serviceName
      });
    }).catch(() => {
      // Not a JSON response, skip reporting
    });

    return response;
  };
}

async function reportDrift(target: string, data: any) {
  try {
    const res = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    const result = await res.json();
    if (result.status === "DRIFT_DETECTED") {
      console.warn("⚠️ [DriftWatch] API Drift Detected!", result.message);
      
      // Optional: Visual toast or custom event can be triggered here
      const event = new CustomEvent("api-drift", { detail: result });
      window.dispatchEvent(event);
    }
  } catch (err) {
    // Fail silently in production
    console.error("[DriftWatch] Failed to report drift:", err);
  }
}

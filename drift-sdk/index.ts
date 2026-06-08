/**
 * Driftly SDK
 * Real-time API drift monitoring wrapper for fetch.
 */

type DriftConfig = {
  monitorUrl: string;
  apiKey: string; // The Project's unique identity key
  serviceName?: string;
  enabled?: boolean;
  debug?: boolean;
  excludeUrls?: (string | RegExp)[];
  onDrift?: (drift: any) => void;
};

export function initDriftly(config: DriftConfig) {
  // Ensure we only run in the browser and when enabled
  if (typeof window === "undefined" || config.enabled === false) return;

  const originalFetch = window.fetch;
  const monitorUrl = config.monitorUrl;
  const serviceName = config.serviceName || "Frontend-App";
  const debug = config.debug || false;

  if (debug) console.log("🛡️ Driftly initialized. Monitoring APIs...");

  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      
      // Get URL from arguments
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;

      // Filter out monitor URL and excluded URLs
      if (url.includes(monitorUrl)) return response;
      if (config.excludeUrls?.some(pattern => 
        typeof pattern === 'string' ? url.includes(pattern) : pattern.test(url)
      )) {
        return response;
      }

      // We clone the response to avoid interfering with the original consumer
      const clonedResponse = response.clone();
      
      // Asynchronous reporting so we don't block the main thread
      clonedResponse.json().then(body => {
        reportDrift(monitorUrl, {
          url,
          method: (args[1]?.method || "GET") as string,
          body,
          serviceName
        }, config);
      }).catch(() => {
        // Not a JSON response or failed to parse, skip reporting
      });

      return response;
    } catch (error) {
      // In case original fetch fails (network error), we still want to throw
      // but we shouldn't break the wrapper logic.
      throw error;
    }
  };
}

async function reportDrift(target: string, data: any, config: DriftConfig) {
  try {
    const res = await fetch(target, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-driftly-api-key": config.apiKey 
      },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) throw new Error(`Monitor responded with ${res.status}`);

    const result = await res.json();
    if (result.status === "BREAKING" || result.status === "MODIFIED") {
      if (config.debug) console.warn(`⚠️ [Driftly] ${result.status} Drift Detected!`, result.message);
      
      // Trigger custom callback if provided
      if (config.onDrift) config.onDrift(result);

      // Dispatch global event
      const event = new CustomEvent("api-drift", { detail: result });
      window.dispatchEvent(event);
    }
  } catch (err) {
    if (config.debug) console.error("[Driftly] Failed to report drift:", err);
  }

}

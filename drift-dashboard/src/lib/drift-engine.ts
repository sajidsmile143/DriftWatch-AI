/**
 * Driftly Engine
 * Compares two JSON objects and detects structural drifts.
 */

export type DriftType = "STABLE" | "BREAKING" | "MODIFIED";

export interface DriftResult {
  type: DriftType;
  message: string;
  diff: {
    added: string[];
    removed: string[];
    changed: string[];
    expected: any;
    received: any;
  };
}

export function analyzeDrift(baseline: any, current: any): DriftResult {
  const diff = {
    added: [] as string[],
    removed: [] as string[],
    changed: [] as string[],
    expected: baseline,
    received: current,
  };

  const baselineKeys = Object.keys(baseline || {});
  const currentKeys = Object.keys(current || {});

  // 1. Detect removals (BREAKING)
  baselineKeys.forEach(key => {
    if (!(key in current)) {
      diff.removed.push(key);
    } else if (typeof baseline[key] !== typeof current[key]) {
      diff.changed.push(`${key} (Type changed from ${typeof baseline[key]} to ${typeof current[key]})`);
    }
    // Recursive check for nested objects could go here
  });

  // 2. Detect additions
  currentKeys.forEach(key => {
    if (!(key in baseline)) {
      diff.added.push(key);
    }
  });

  let type: DriftType = "STABLE";
  let message = "No structural changes detected.";

  if (diff.removed.length > 0 || diff.changed.length > 0) {
    type = "BREAKING";
    message = `🚨 CRITICAL: Missing or modified fields detected: ${[...diff.removed, ...diff.changed].join(", ")}`;
  } else if (diff.added.length > 0) {
    type = "MODIFIED";
    message = `✨ INFO: New fields added: ${diff.added.join(", ")}`;
  }

  return { type, message, diff };
}

export type JsonSchema = Record<string, string>;

/**
 * Extracts a simplified schema from a JSON object.
 * Example: { "id": 1, "name": "John" } -> { "id": "number", "name": "string" }
 */
export function extractSchema(json: Record<string, unknown>): JsonSchema {
  if (typeof json !== "object" || json === null) return {};
  
  const schema: JsonSchema = {};
  
  for (const key in json) {
    const value = json[key];
    if (Array.isArray(value)) {
      schema[key] = "array";
    } else {
      schema[key] = typeof value;
    }
  }
  
  return schema;
}

export type DriftResult = {
  type: "BREAKING" | "WARNING" | "SAFE";
  message: string;
  diff: {
    expected: JsonSchema;
    actual: JsonSchema;
  };
};

/**
 * Compares two schemas and returns a drift result.
 */
export function compareSchemas(baseline: JsonSchema, actual: JsonSchema): DriftResult | null {
  const missingKeys = Object.keys(baseline).filter(key => !(key in actual));
  const newKeys = Object.keys(actual).filter(key => !(key in baseline));
  const typeMismatches = Object.keys(baseline).filter(key => 
    key in actual && baseline[key] !== actual[key]
  );

  if (missingKeys.length > 0) {
    return {
      type: "BREAKING",
      message: `Breaking change: Missing keys [${missingKeys.join(", ")}]`,
      diff: { expected: baseline, actual }
    };
  }

  if (typeMismatches.length > 0) {
    return {
      type: "BREAKING",
      message: `Type mismatch detected on keys: [${typeMismatches.join(", ")}]`,
      diff: { expected: baseline, actual }
    };
  }

  if (newKeys.length > 0) {
    return {
      type: "SAFE",
      message: `Schema updated: New keys added [${newKeys.join(", ")}]`,
      diff: { expected: baseline, actual }
    };
  }

  return null; // No drift
}

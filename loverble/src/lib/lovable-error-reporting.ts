export function reportLovableError(error: Error, context?: Record<string, unknown>) {
  console.error("[Smart Algos]", error, context);
}

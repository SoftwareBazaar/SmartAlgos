let lastError: Error | undefined;

export function captureError(error: Error) {
  lastError = error;
}

export function consumeLastCapturedError() {
  const e = lastError;
  lastError = undefined;
  return e;
}

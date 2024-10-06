export function info(message: string) {
  const ts = new Date().toISOString();
  console.info(`[${ts}] - ${message}`);
}

export function error(message: string, error: unknown) {
  const ts = new Date().toISOString();
  console.error(`[${ts}] - ${message}`, error);
}

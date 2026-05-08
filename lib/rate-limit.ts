const store = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  ip: string,
  limit = 3,
  windowMs = 60 * 60 * 1000,
): boolean {
  const now = Date.now();
  const record = store.get(ip);

  if (!record || now > record.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) return false;

  record.count++;
  return true;
}

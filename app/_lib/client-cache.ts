type CacheEntry = { value: unknown; expiresAt: number };

const clientCache = new Map<string, CacheEntry>();

export function getClientCache<T>(key: string): T | null {
  const entry = clientCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    clientCache.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setClientCache<T>(key: string, value: T, ttlMs = 60_000) {
  clientCache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

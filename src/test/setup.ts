import '@testing-library/jest-dom'

/**
 * Node ≥22's built-in global `localStorage` (stable, no flag needed as of this repo's
 * Node version) shadows jsdom's own implementation and is a no-op stub without
 * `--localstorage-file` — every read/write throws "is not a function". Since that
 * global is installed before jsdom's environment setup runs, `window.localStorage`
 * inherits the same broken stub. Replace it with a real in-memory Storage so code
 * under test (e.g. src/saas/store.ts, src/saas/i18n.tsx) that reads/writes
 * localStorage works the same as it does in a real browser.
 */
class MemoryStorage implements Storage {
  private map = new Map<string, string>()
  get length() {
    return this.map.size
  }
  clear() {
    this.map.clear()
  }
  getItem(key: string) {
    return this.map.has(key) ? this.map.get(key)! : null
  }
  key(index: number) {
    return [...this.map.keys()][index] ?? null
  }
  removeItem(key: string) {
    this.map.delete(key)
  }
  setItem(key: string, value: string) {
    this.map.set(key, String(value))
  }
}

const memoryStorage = new MemoryStorage()
for (const target of [globalThis, window] as const) {
  Object.defineProperty(target, 'localStorage', { value: memoryStorage, writable: true, configurable: true })
}

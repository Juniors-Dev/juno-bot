// utils/cache/TtlCache.js
export class TtlCache {
  constructor({ ttlMs = 86_400_000, maxSize = 10_000, cloneOnGet = false } = {}) {
    this.ttlMs = ttlMs;
    this.maxSize = maxSize;
    this.cloneOnGet = cloneOnGet;
    this.store = new Map(); // key -> { value, expiresAt }
    this.inFlight = new Map(); // key -> Promise
  }

  _now() {
    return Date.now();
  }

  _isExpired(entry) {
    return entry.expiresAt <= this._now();
  }

  _trimIfNeeded() {
    if (this.store.size <= this.maxSize) return;

    const overflow = this.store.size - this.maxSize;
    let removed = 0;

    // map maintains insertion order so oldest go first
    for (const key of this.store.keys()) {
      this.store.delete(key);
      if (++removed >= overflow) break;
    }
  }

  // optional cloning of values to prevent by reference mutations.
  _clone(value) {
    if (!this.cloneOnGet) return value;
    return structuredClone(value);
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (this._isExpired(entry)) {
      this.store.delete(key);
      return undefined;
    }

    return this._clone(entry.value);
  }

  set(key, value) {
    this.store.set(key, {
      value,
      expiresAt: this._now() + this.ttlMs,
    });

    this._pruneIfNeeded();
  }

  del(key) {
    this.store.delete(key);
    this.inFlight.delete(key);
  }

  clear() {
    this.store.clear();
    this.inFlight.clear();
  }

  invalidatePrefix(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        this.inFlight.delete(key);
      }
    }
  }

  async getOrSet(key, fetchFn) {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    if (this.inFlight.has(key)) {
      return this.inFlight.get(key);
    }

    const promise = (async () => {
      try {
        const value = await fetchFn();
        this.set(key, value);
        return this._clone(value);
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }
}

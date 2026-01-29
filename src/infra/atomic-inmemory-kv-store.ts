import lock from "../lib/lock.js";
import type { KeyValueStore } from "./key-value-store.js";

type Entry = {
	value: unknown;
	expiresAt: number | null;
};

export class AtomicInMemoryKVStore implements KeyValueStore<Entry> {
	private store = new Map<string, Entry>();
	private lock = lock;

	private isExpired(entry: Entry): boolean {
		return entry.expiresAt !== null && entry.expiresAt <= Date.now();
	}

	async get<T>(key: string): Promise<T | null> {
		return this.lock.withLock(() => {
			const entry = this.store.get(key);
			if (!entry) return null;

			if (this.isExpired(entry)) {
				this.store.delete(key);
				return null;
			}

			return entry.value as T;
		});
	}

	async set<T>(
		key: string,
		value: T,
		options?: { ttlMs?: number },
	): Promise<void> {
		return this.lock.withLock(() => {
			const expiresAt =
				options?.ttlMs != null ? Date.now() + options.ttlMs : null;

			this.store.set(key, { value, expiresAt });
		});
	}

	async delete(key: string): Promise<boolean> {
		return this.lock.withLock(() => {
			return this.store.delete(key);
		});
	}

	async has(key: string): Promise<boolean> {
		return this.lock.withLock(() => {
			const entry = this.store.get(key);
			if (!entry) return false;

			if (this.isExpired(entry)) {
				this.store.delete(key);
				return false;
			}

			return true;
		});
	}

	/**
	 * Atomic update helper (preferred over external CAS loops)
	 */
	async update<T>(
		key: string,
		fn: (current: T | null) => T,
		options?: { ttlMs?: number },
	): Promise<T> {
		return this.lock.withLock(() => {
			const entry = this.store.get(key);
			const current =
				entry && !this.isExpired(entry) ? (entry.value as T) : null;

			const next = fn(current);
			const expiresAt =
				options?.ttlMs != null ? Date.now() + options.ttlMs : null;

			this.store.set(key, { value: next, expiresAt });
			return next;
		});
	}
}

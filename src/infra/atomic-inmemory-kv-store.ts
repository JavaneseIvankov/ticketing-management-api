import lock from "../lib/lock.js";
import type { AtomicKeyValueStore } from "./key-value-store.js";

type Entry = {
	value: unknown;
	expiresAt: number | null;
};

export class AtomicInMemoryKVStore implements AtomicKeyValueStore<unknown> {
	private store = new Map<string, Entry>();
	private lock = lock;

	private isExpired(entry: Entry): boolean {
		return entry.expiresAt !== null && entry.expiresAt <= Date.now();
	}

	private getEntry(key: string): Entry | null {
		const entry = this.store.get(key);
		if (!entry) return null;

		if (this.isExpired(entry)) {
			this.store.delete(key);
			return null;
		}

		return entry;
	}

	async get<T>(key: string): Promise<T | null> {
		return this.lock.withLock(() => {
			const entry = this.getEntry(key);
			return entry ? (entry.value as T) : null;
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

	async trySet<T>(
		key: string,
		value: T,
		options?: { ttlMs?: number },
	): Promise<boolean> {
		return this.lock.withLock(() => {
			const existing = this.getEntry(key);
			if (existing) return false;

			const expiresAt =
				options?.ttlMs != null ? Date.now() + options.ttlMs : null;

			this.store.set(key, { value, expiresAt });
			return true;
		});
	}

	async delete(key: string): Promise<boolean> {
		return this.lock.withLock(() => {
			return this.store.delete(key);
		});
	}

	async has(key: string): Promise<boolean> {
		return this.lock.withLock(() => {
			return this.getEntry(key) !== null;
		});
	}
}

export interface KeyValueStore<V> {
	get(key: string): Promise<V | null>;
	set(key: string, value: V, options?: { ttlMs?: number }): Promise<void>;
	delete(key: string): Promise<boolean>;
	has(key: string): Promise<boolean>;
}

export interface AtomicKeyValueStore<V> extends KeyValueStore<V> {
	/**
	 * Sets the value for the given key only if the key does not already exist.
	 */
	trySet(key: string, value: V, options?: { ttlMs?: number }): Promise<boolean>;
}

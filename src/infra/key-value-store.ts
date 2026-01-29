export interface KeyValueStore<V> {
	get(key: string): Promise<V | null>;
	set(key: string, value: V, options?: { ttlMs?: number }): Promise<void>;
	delete(key: string): Promise<boolean>;
	has(key: string): Promise<boolean>;
}

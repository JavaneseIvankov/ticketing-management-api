/**
 * Promise-based lock implementation for atomic operations
 */
class PromiseLock {
	private locked = false;
	private waitQueue: Array<() => void> = [];

	/**
	 * Acquire lock - waits until lock is available
	 */
	async acquire(): Promise<void> {
		while (this.locked) {
			await new Promise<void>((resolve) => {
				this.waitQueue.push(resolve);
			});
		}
		this.locked = true;
	}

	/**
	 * Release lock - grants access to next waiting promise
	 */
	release(): void {
		const next = this.waitQueue.shift();
		if (next) {
			// Grant lock to next in queue
			next();
		} else {
			// No one waiting, unlock
			this.locked = false;
		}
	}

	/**
	 * Execute function with automatic lock management
	 */
	async withLock<T>(fn: () => T | Promise<T>): Promise<T> {
		await this.acquire();
		try {
			return await fn();
		} finally {
			this.release();
		}
	}
}

const lock = new PromiseLock();
export default lock;

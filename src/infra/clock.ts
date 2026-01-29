export interface IClock {
	now(): number; // epoch ms
}

export function createSystemClock(): IClock {
	return {
		now() {
			return Date.now();
		},
	};
}

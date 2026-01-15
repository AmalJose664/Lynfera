export const FREE_ALLOWED_COMBINATIONS = [
	{ interval: 1, intervalUnit: "HOUR", range: 1, rangeUnit: "HOUR" },
	{ interval: 1, intervalUnit: "HOUR", range: 24, rangeUnit: "HOUR" },
	{ interval: 1, intervalUnit: "DAY", range: 7, rangeUnit: "DAY" },
	{ interval: 1, intervalUnit: "DAY", range: 30, rangeUnit: "DAY" },
] as const;

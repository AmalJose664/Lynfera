export interface ILogs {
	event_id: string;
	level: string;
	message: string;
	timestamp: Date | string;
	deployment_id: string;
	project_id: string;
	stream: string;
}

// Table query

/**
 * 
 *
 * 
 *  CREATE TABLE  log_events
(
	event_id UUID DEFAULT generateUUIDv4(),
	deployment_id String,
	project_id String,
	log String CODEC(ZSTD(6)),
	info String,
	sequence Int16,
	report_time DateTime64(3, 'UTC'),
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(report_time)
ORDER BY (deployment_id, report_time, sequence)
TTL
	toDateTime(report_time) + INTERVAL 25 DAY,
	toDateTime(report_time) + INTERVAL 5 DAY DELETE WHERE info = 'decor'
SETTINGS index_granularity = 8192;
 * 
 *
 *  
*/

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
	log String,
	info String,
	sequence Int16,
	report_time DateTime64(3, 'UTC'),
)
ENGINE = MergeTree
ORDER BY (report_time, project_id)

 * 
 *
 *  
*/

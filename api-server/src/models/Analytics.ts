export interface IAnalytics {
	projectId: string;
	path: string;
	statusCode: number;
	responseTime: number;
	responseSize: number;
	ip: string;
	uaBrowser?: string;
	uaOs?: string;
	referer?: string;
	timestamp: number;
}
export interface BufferAnalytics {
	project_id: string;
	path: string;
	status_code: number;
	response_time: number;
	response_size: number;
	ip: string;
	ua_browser: string | null;
	ua_os: string | null;
	referer: null | string;
	timestamp: number;
}

/**
 * 
 * 
 * 
CREATE TABLE analytics (
	project_id String,
	path String,
	status_code UInt16,
	response_time Float32,
	response_size UInt32,
	ip IPv6,
	ua_os LowCardinality(Nullable(String)),
	ua_browser LowCardinality(Nullable(String)),
	referer Nullable(String),
	timestamp DateTime64(3, 'UTC'),
	date Date MATERIALIZED toDate(timestamp)
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (project_id, timestamp, path)
TTL date + INTERVAL 30 DAY
SETTINGS index_granularity = 8192;

CREATE INDEX idx_status_code ON analytics(status_code) TYPE minmax GRANULARITY 4;

 */

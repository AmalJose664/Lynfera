export interface IAnalytics {
	projectId: string;
	subdomain: string;
	path: string;
	statusCode: number;
	responseTime: number;
	requestSize: number;
	responseSize: number;
	ip: string;
	uaBrowser?: string;
	uaOs?: string;
	isMobile?: boolean;
	isBot?: boolean;
	referer?: string;
	timestamp: number;
}
export interface BufferAnalytics {
	project_id: string;
	subdomain: string;
	path: string;
	status_code: number;
	response_time: number;
	request_size: number;
	response_size: number;
	ip: string;
	ua_browser: string | null;
	ua_os: string | null;
	is_mobile: 1 | 0;
	is_bot: 1 | 0;
	referer: null | string;
	timestamp: number;
}

/**
 * 
 * 
 * 
create table analytics(
	project_id String,
	subdomain LowCardinality(String),
	path String,
	status_code UInt16,
	response_time Float32,
	request_size UInt32,
	response_size UInt32,
	ip IPv6,
	ua_browser LowCardinality(Nullable(String)),
	ua_os LowCardinality(Nullable(String)),
	is_mobile UInt8,
	is_bot UInt8,
	referer Nullable(String),
	timestamp DateTime64(3, 'UTC'), 
	date Date MATERIALIZED toDate(timestamp)
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY(project_id, timestamp, path)
TTL date + INTERVAL 30 DAY
SETTINGS index_granularity = 8192;

CREATE INDEX idx_status_code ON analytics(status_code) TYPE minmax GRANULARITY 4;
CREATE INDEX idx_browser ON analytics(ua_browser) TYPE bloom_filter GRANULARITY 1;


 */

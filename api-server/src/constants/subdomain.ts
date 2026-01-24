export const DEPLOYMENT_ID_LENGTH = 10;
export const DEPLOYMENT_SEPARATOR_LENGTH = 4;
export const MAX_SUBDOMAIN_LENGTH = 61;


export const BRAND_PROTECTION_REGEX = /\blynf[eia]?r[eao]?[a-z0-9-]*/i;

export const RESERVED_SUBDOMAINS = new Set([
	"app", "dashboard", "console", "panel", "system", "status", "health", "metrics",
	"monitor", "logs", "account", "accounts", "user", "users", "profile", "settings",
	"security", "verify", "verification", "reset", "password", "oauth", "sso",
	"portal", "home", "main", "official", "platform", "core", "base", "hub",
	"invite", "join", "member", "members", "vip", "premium", "pro", "plus",

	"api", "cdn", "assets", "static", "files", "media", "img", "css", "lib",
	"dev", "develop", "developer", "developers", "staging", "stage", "preview",
	"test", "testing", "sandbox", "demo", "example", "examples", "lab", "labs",
	"ns1", "ns2", "dns", "proxy", "gateway", "tunnel", "git", "svn", "ssh",
	"cluster", "node", "k8s", "docker", "registry", "vault", "secret", "secrets",
	"config", "deploy", "build", "cicd", "lambda", "serverless", "hook", "hooks",

	"admin", "administrator", "root", "master", "default", "global", "sudo",
	"auth", "login", "logout", "signin", "signup", "register", "internal", "ops",
	"devops", "security", "exploit", "hacker", "phish", "malware", "virus",
	"bypass", "crack", "null", "undefined", "void", "anon", "anonymous",

	"billing", "bill", "payments", "pay", "checkout", "pricing", "plans", "plan",
	"invoice", "invoices", "subscription", "subscriptions", "refund", "tax",
	"legal", "tos", "privacy", "abuse", "compliance", "terms", "policy",
	"well-known", "report", "trust", "claim", "partner", "affiliate", "reseller",
	"enterprise", "corp", "venture", "sales", "promo", "deal", "offer",

	"help", "support", "contact", "ticket", "wiki", "docs", "learn", "guide",
	"blog", "news", "press", "community", "jobs", "careers", "marketing",
	"shop", "store", "cart", "search", "video", "images", "forum", "chat", "feed",
	"stream", "live", "social", "robots", "sitemap", "crawler", "spider",

	"mail", "email", "smtp", "imap", "pop", "webmail", "ftp", "mta", "relay",
	"www", "www2", "host", "localhost", "broadcast", "webmaster", "postmaster",

	"google", "bing", "yahoo", "facebook", "meta", "twitter", "discord", "github",
	"gitlab", "bitbucket", "vercel", "netlify", "cloudflare", "aws", "azure",
	"heroku", "digitalocean", "supabase", "firebase", "apple", "icloud", "microsoft"
]);

export const ADDITIONAL_RESERVED_SUBDOMAINS = new Set([

	"backup", "backups", "archive", "archives", "cache", "redis", "memcache",
	"database", "postgres", "mysql", "mongo", "elasticsearch", "elastic",
	"queue", "worker", "workers", "cron", "scheduler", "task", "tasks",
	"websocket", "wss", "socket", "sockets", "realtime",
	"storage", "bucket", "blob", "object", "artifacts", "artifact",
	"edge", "origin", "balancer", "firewall", "waf", "ddos",
	"ipv4", "ipv6", "tcp", "udp", "http", "https", "ssl", "tls", "cert",
	"endpoint", "endpoints", "graphql", "rest", "grpc", "webhook", "webhooks",

	"analytics", "stats", "statistics", "tracking", "track", "trace", "tracing",
	"sentry", "bugsnag", "datadog", "newrelic", "grafana", "prometheus",
	"alert", "alerts", "notification", "notifications", "notify", "incident",
	"uptime", "downtime", "performance", "perf", "speed", "benchmark",
	"audit", "audits", "telemetry", "observability", "apm",

	"production", "prod", "preprod", "pre-prod", "uat",
	"canary", "blue", "green", "rollback", "release", "releases", "version",
	"alpha", "beta", "stable", "latest", "edge-deploy",

	"identity", "idp", "saml", "ldap", "okta", "auth0", "cognito",
	"session", "sessions", "token", "tokens", "jwt", "refresh", "access",
	"permission", "permissions", "role", "roles", "group", "groups", "team", "teams",
	"org", "organization", "organizations", "tenant", "tenants", "workspace",
	"invite-user", "onboard", "onboarding", "offboard",

	"order", "orders", "customer", "customers", "client", "clients", "vendor",
	"purchase", "transaction", "transactions", "wallet", "balance", "credit",
	"discount", "coupon", "coupons", "voucher", "vouchers", "gift", "giftcard",
	"product", "products", "catalog", "inventory", "quote", "quotes",

	"upload", "uploads", "download", "downloads", "share", "sharing", "public",
	"private", "draft", "drafts", "publish", "editor", "edit", "preview-app",
	"comment", "comments", "review", "reviews", "rating", "ratings", "feedback",
	"message", "messages", "inbox", "outbox", "notification-center", "alert-center",
	"newsletter", "subscribe", "unsubscribe", "campaign", "campaigns",

	"documentation", "doc", "readme", "changelog", "release-notes", "api-docs",
	"reference", "tutorial", "tutorials", "workshop", "training", "course",
	"academy", "university", "edu", "education", "knowledge", "faq",

	"gdpr", "ccpa", "hipaa", "pci", "soc2", "iso", "compliance-report",
	"vulnerability", "cve", "security-txt", "pgp", "gpg", "keybase",
	"audit-log", "access-log", "activity", "consent", "cookie", "cookies",
	"dpo", "dmca", "copyright", "trademark", "patent", "ip-rights",

	"127-0-0-1", "0-0-0-0", "loopback", "local",
	"internal-api", "private-api", "protected", "restricted", "blacklist",
	"whitelist", "allowlist", "denylist", "quarantine", "blocked",

	"status-page", "ping", "healthcheck", "readiness", "liveness", "probe",
	"service", "services", "microservice", "function", "functions", "lambda-fn",
	"event", "events", "stream-api", "pub", "sub", "pubsub", "mqtt", "amqp",

	"warehouse", "datawarehouse", "datalake", "etl", "pipeline", "pipelines",
	"business-intelligence", "reports", "dashboard-analytics",
	"insight", "insights", "metric", "kpi", "visualization", "chart", "charts",

	"integration", "integrations", "connector", "connectors", "plugin", "plugins",
	"extension", "extensions", "addon", "addons", "app-store", "marketplace",
	"zapier", "ifttt", "n8n", "make", "integromat", "automation", "workflow",

	"mobile", "ios", "android", "app-download", "apk", "ipa", "testflight",
	"play", "appstore", "native", "hybrid", "pwa", "electron", "desktop",

	"abuse-report", "spam", "fraud", "scam", "fake", "impersonate", "clone",
	"mirror", "copy", "replica", "backup-mirror", "test-user", "dummy",
	"placeholder", "reserved", "blocked-user", "suspended", "banned", "deleted",

	"rss", "atom", "feed-rss", "amp", "manifest", "service-worker",
	"opensearch", "humans", "ads", "adsense", "adserver", "advertising",

	"i18n", "l10n", "locale", "locales", "lang", "language", "translate",
	"translation", "asia", "apac", "emea",

	"sandbox-user", "staging-user", "test-account", "demo-account", "guest",
	"trial", "free", "starter", "professional", "business", "unlimited",
	"coming-soon", "under-construction", "maintenance", "offline", "emergency"
]);



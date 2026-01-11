import { readFileSync } from "fs";
import { redisService } from "../../cache/redis.js";
import { exemptedRegex, MAX_CACHE_LIMIT_MB } from "../../constants/proxyCacheValues.js";
import { RequestWithProject } from "../../middleware/projectFinder.js";
import { IAnalytics } from "../../models/Analytics.js";
import { analyticsService } from "../../service/analytics.service.js";
import parseUA from "../../utils/uaParser.js";
import { IncomingMessage, ServerResponse } from "http";


export const onProxyRes = async (proxyRes: IncomingMessage, req: RequestWithProject, res: ServerResponse) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	const requestSize = parseInt(req.headers['content-length'] || '0', 10);
	const size = proxyRes.headers["x-file-size"] as string

	const responseSize = parseInt(size || proxyRes.headers['content-length'] || '0', 10);
	// const { path: path1, baseUrl, url, originalUrl } = req
	// console.log({ path1, baseUrl, url, originalUrl })
	let path = req.originalUrl.includes("?") ? req.originalUrl.split("?")[0] : req.originalUrl
	if (exemptedRegex.some((e_path: RegExp) => e_path.test(req.path))) {
		path = "/"
	}
	if (responseSize && responseSize > MAX_CACHE_LIMIT_MB) {
		res.setHeader(
			'Cache-Control',
			'no-store, no-cache, must-revalidate, proxy-revalidate'
		);
		res.setHeader('Pragma', 'no-cache');
		res.setHeader('Expires', '0');
		delete proxyRes.headers.etag;
		delete proxyRes.headers['last-modified'];
	}
	const endTime = performance.now();
	const startTime = (req as any).startTime || endTime;
	const responseTime = (endTime - startTime).toFixed(2);
	const ua = parseUA(req.headers['user-agent'] || "")
	// const toCache = {
	// 	projectId: req.project?._id,
	// 	responseSize,
	// 	responseTime,
	// }
	// await redisService.set(req.project?.subdomain + req.path as string, toCache, 1200)
	const data: IAnalytics = {
		projectId: req.project?._id || "",
		subdomain: req.project?.subdomain || "",
		timestamp: new Date().getTime(),
		path,
		requestSize,
		responseSize,
		responseTime: parseFloat(responseTime),
		ip: req.socket.remoteAddress || "0.0.0.0",
		statusCode: proxyRes.statusCode || res.statusCode || 0,
		uaBrowser: ua.browser,
		uaOs: ua.os,
		isMobile: ua.isMobile,
		isBot: (req as any).isBot,
		referer: req.headers['referer'] || ""
	}
	// console.log(data, "--- --`Levele data")
	analyticsService.sendAnalytics(data)
	if (proxyRes.statusCode === 404) {
		res.writeHead(404, { 'Content-Type': 'text/html' });
		res.end(readFileSync('src/views/path404.html'));
		return;
	}

}
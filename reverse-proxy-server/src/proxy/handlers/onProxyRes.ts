import { readFileSync } from "fs";
import { redisService } from "../../cache/redis.js";
import { exemptedRegex, MAX_CACHE_LIMIT_MB } from "../../constants/proxyCacheValues.js";
import { RequestWithProject } from "../../middleware/projectFinder.js";
import { IAnalytics } from "../../models/Analytics.js";
import { analyticsService } from "../../service/analytics.service.js";
import parseUA from "../../utils/uaParser.js";
import { IncomingMessage, ServerResponse } from "http";


export const onProxyRes = (proxyRes: IncomingMessage, req: RequestWithProject, res: ServerResponse) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	const size = proxyRes.headers["x-file-size"] as string

	const responseSize1 = proxyRes.headers['content-length']
	const responseSize2 = proxyRes.headers['x-original-size'] as string


	const responseSize = parseInt(responseSize1 || responseSize2 || size || "10", 10);


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

	const data: IAnalytics = {
		projectId: req.project?._id || "",
		timestamp: new Date().getTime(),
		path,
		responseSize,
		responseTime: parseFloat(responseTime),
		ip: req.socket.remoteAddress || "0.0.0.0",
		statusCode: proxyRes.statusCode || res.statusCode || 404,
		uaBrowser: ua.browser,
		uaOs: ua.os,
		referer: req.headers['referer'] || ""
	}
	// console.log(data.ip, "--- --`Levele data", req.ip, req.ips, req.socket.remoteAddress)
	console.log({
		ip: req.ip,
		ips: req.ips,
		remoteAddress: req.socket.remoteAddress,
		xForwardedFor: req.headers['x-forwarded-for'],
		xRealIp: req.headers['x-real-ip']
	});
	analyticsService.sendAnalytics(data)
	if (proxyRes.statusCode === 404) {
		res.writeHead(404, { 'Content-Type': 'text/html' });
		res.end(readFileSync('src/views/path404.html'));
		return;
	}

}
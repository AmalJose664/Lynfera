import { Request, Response, NextFunction } from "express"
import { redisService } from "../cache/redis.js"
import { ICacheAnalytics } from "../interfaces/cache/IRedis.js"
import { IAnalytics } from "../models/Analytics.js"
import parseUA from "../utils/uaParser.js"
import { isbot } from "isbot"
import { analyticsService } from "../service/analytics.service.js"
import { varyResponseTimeHuman } from "../utils/variateResponse.js"
import { GetObjectCommand, GetObjectCommandOutput, NoSuchKey, S3ServiceException } from "@aws-sdk/client-s3";
import { Readable } from 'stream';
import { STORAGE_FILES_PATH } from "../constants/paths.js"
import AppError from "../utils/AppError.js"
import { s3Client } from "../config/storage.config.js"



export const downloadFilesCloud = async (req: Request, res: Response, next: NextFunction) => {
	console.log("file download request")
	const { deploymentId, projectId } = req.params;
	const { filePath } = req.query as { filePath: string };
	if (!filePath) {
		res.status(404).json({ error: "Empty file path , => " + filePath })
		return
	}
	try {
		const fileKey = `${STORAGE_FILES_PATH}/${projectId}/${deploymentId}/${filePath}`

		console.log('Trying to download file', fileKey);

		const getCommand = new GetObjectCommand({
			Bucket: "lynfera",
			Key: fileKey,
		});
		const file = await s3Client.send(getCommand);
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${fileKey.split('/').pop()}"`
		);
		res.setHeader("Content-Type", file.ContentType || "application/octet-stream");

		const stream: GetObjectCommandOutput['Body'] = file.Body;

		if (!stream) {
			return res.status(404).json({ error: 'File not found' });
		}

		if (stream instanceof Readable || 'pipe' in stream) {
			(stream as Readable).pipe(res);
		} else {
			const chunks: Uint8Array[] = [];
			for await (const chunk of stream as AsyncIterable<Uint8Array>) {
				chunks.push(chunk);
			}
			res.send(Buffer.concat(chunks));
		}
	} catch (error) {
		if (error instanceof NoSuchKey) {
			console.error(
				`Error from Storage while getting object "${filePath}". No such file exists.`,
			);
			next(new AppError(`Error from Storage while getting object "${filePath}". No such file exists.`, 404));
			return
		}
		if (error instanceof S3ServiceException) {
			console.error(
				`Error from S3 while getting object`,
			);
			next(new AppError(`Error from S3 while getting object`, 500));
			return
		}
		next(error);
	}


}
export const trackCacheAnalytics = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const ownDomain = process.env.OWN_DOMAIN
		const path = req.header("X-Original-URI")
		const ip = req.header("X-Real-IP")
		const host = req.header("X-Host") || ""
		const uaAgent = req.header("X-Ua-Agent")

		const slug = host.split('.')[0];
		if (!slug || slug === ownDomain || slug === 'www') {
			res.status(400).json({});
			return;
		}

		const cacheKey = slug + path
		const cache = await redisService.get<ICacheAnalytics | null>(cacheKey)
		if (!cache || !path) {
			res.json({})
			return
		}
		const { projectId, responseSize, responseTime } = cache
		if (!projectId) {
			res.json({})
			return
		}
		const ua = parseUA(uaAgent || "")
		const isBot = isbot(uaAgent)
		const data: IAnalytics = {
			projectId,
			subdomain: req.project?.subdomain || "",
			timestamp: new Date().getTime(),
			path,
			requestSize: 10,
			responseSize,
			responseTime: varyResponseTimeHuman(Number(responseTime)),
			ip: ip || "0.0.0.0",
			statusCode: 304,
			uaBrowser: ua.browser,
			uaOs: ua.os,
			isMobile: ua.isMobile,
			isBot,
			referer: req.headers['referer'] || ""
		}
		// console.log(JSON.stringify(data))
		analyticsService.sendAnalytics(data)
		res.json({})
	} catch (error) {
		next(error)
	}

}
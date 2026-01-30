import { FREE_ALLOWED_COMBINATIONS } from "@/constants/analytics.js";
import { QueryOptions } from "@/interfaces/repository/IAnalyticsRepository.js";
import AppError from "./AppError.js";

type TimesFieldTypes = "5m" | "15m" | "1h" | "1d" | "7d" | "30d";
type RangeFieldsTypes = "1h" | "24h" | "7d" | "30d";

/**
 * 				interval >>---->  |--------------------- | --------------------- | -------------------- | ---------------------|
 * 								   _______interval_______ _______interval_______ _______interval_______ _______interval________
 *
 * 				range	 >>---->  |--------------------------------------------------------------------------------------------|
 *
 * 				Basic range Interval understanding......
 */

const intervalMap: Record<TimesFieldTypes, number> = {
	"5m": 5,
	"15m": 15,
	"1h": 1,
	"1d": 1,
	"7d": 7,
	"30d": 30,
};

const rangeMap: Record<RangeFieldsTypes, number> = {
	"1h": 1,
	"24h": 24,
	"7d": 7,
	"30d": 30,
};

export const getRange = (range?: string): number => {
	return rangeMap[range as RangeFieldsTypes] || 1;
};

export const formatInterval = (interval: "5m" | "15m" | "1h" | "1d"): string => {
	return `${intervalMap[interval]} ${getUnit(interval)}`;
};

export const getInterval = (interval: string): number => {
	return intervalMap[interval as TimesFieldTypes] || 1;
};

export const getUnit = (string: string): string => {
	const normalized = string.toLowerCase().trim();

	if (normalized.endsWith("m")) return "MINUTE";
	if (normalized.endsWith("h")) return "HOUR";
	if (normalized.endsWith("d")) return "DAY";
	if (normalized.endsWith("mo") || normalized.includes("month")) return "MONTH";
	if (normalized.endsWith("w")) return "WEEK";

	return "DAY";
};

export const fillEmptyQueries = (range?: string, interval?: string) => {
	if (!range && !interval) {
		return ["24h", "1h"];
	}
	if (range && !interval) {
		return [range, range.includes("h") ? "1h" : "1d"];
	}
	if (!range && interval) {
		return [interval.includes("h") ? "24h" : "7d", interval];
	}
	return [range, interval] as [string, string];
};

export function validateFreeAnalyticsParams(params: QueryOptions, range: string | undefined, interval?: string | undefined) {
	const allowed = !params.interval ? true : FREE_ALLOWED_COMBINATIONS.some(
		(rule) =>
			rule.interval === params.interval &&
			rule.intervalUnit === params.intervalUnit &&
			rule.range === params.range &&
			rule.rangeUnit === params.rangeUnit,
	);
	console.log(params, " <---------------------------<<<", allowed)


	if (params.range === 1 && params.rangeUnit === "MONTH") {
		throw new AppError(`More interval and range requires Pro plan  => [Range = ${range}] ${interval ? ', [Interval = ${interval}]' : ''}`, 400);
	}
	if ((params.range === 7 || params.range === 30) && params.rangeUnit === "DAY") {
		throw new AppError(`More interval and range requires Pro plan  => [Range = ${range}] ${interval ? ', [Interval = ${interval}]' : ''}`, 400);
	}

	if (!allowed) {
		throw new AppError(`Advanced analytics require Pro plan  => [Range = ${range}], ${interval ? ', [Interval = ${interval}]' : ''}`, 400);
	}
}

import type { BaseQueryFn } from "@reduxjs/toolkit/query"
import type { AxiosError, AxiosRequestConfig } from "axios"
import axiosInstance, { globalConfig, RetryConfig as WithRetryConfig } from "@/lib/axios"


export const axiosBaseQuery = (
	{ baseUrl }: { baseUrl?: string } = { baseUrl: "" }
): BaseQueryFn<{
	url: string,
	method: AxiosRequestConfig['method'],
	data?: AxiosRequestConfig['data'],
	params?: AxiosRequestConfig['params'],
	retry?: number,
	retryDelay?: number,
}, unknown, unknown> =>
	async ({ url, method, data, params, retry, retryDelay }) => {
		try {
			const safeRetryTimes = retry ? (retry > 5 ? 5 : retry) : 2
			const config: WithRetryConfig = {
				// ...globalConfig,
				url: baseUrl + url, // fll here
				method,
				data,
				params,
				retry: safeRetryTimes,
				retryDelay: retryDelay || 1000
			};
			const result = await axiosInstance(config)
			return { data: result.data };
		} catch (axiosError) {
			const err = axiosError as AxiosError
			return {
				error: {
					status: err.response?.status,
					data: err.response?.data || err.message
				}
			}
		}
	}


import axios, { AxiosRequestConfig } from "axios";
import { setCookie } from "cookies-next/client";

const axiosInstance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_SERVER_ENDPOINT,
	timeout: 10000,
	withCredentials: true,
});

let isRefreshing = false;
let failedQueue: {
	resolve: (value?: unknown) => void;
	reject: (reason: Error) => void
}[] = []

const processQueue = (error: Error | null, token: string | null = null) => {
	failedQueue.forEach((promise) => {
		if (error) {
			promise.reject(error);
		} else {
			promise.resolve(token);
		}
	});
	failedQueue = [];
};

// axiosInstance.interceptors.request.use(async (config) => {
// 	await new Promise((res) => setTimeout(res, 2000)) // delay for loading animation
// 	return config
// })
export interface RetryConfig extends AxiosRequestConfig {
	retry: number;
	retryDelay: number;
}

export const globalConfig: RetryConfig = {
	retry: 2,
	retryDelay: 1000,
};
axiosInstance.interceptors.response.use((response) => response,
	async (error) => {
		const status = error.response?.status;
		const method = (error.config.method || "get").toLowerCase();

		const shouldRetry = method === "get" && (!error.response || status >= 500 || status === 429);
		const originalRequest = error.config;
		if (status === 401 && !originalRequest._retry) {
			if (isRefreshing) {

				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject })
				}).then((token) => {

					return axiosInstance(originalRequest)
				}).catch((err) => {
					return Promise.reject(err)
				})
			}

			originalRequest._retry = true
			isRefreshing = true

			try {
				const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_SERVER_ENDPOINT}/auth/refresh`,
					null,
					{ withCredentials: true })
				setCookie("Is_Authenticated_Client", "true", { maxAge: 60 * 60 * 6, httpOnly: false })
				processQueue(null, data.accessToken)
				isRefreshing = false

				return axiosInstance(originalRequest)

			} catch (refreshError) {
				processQueue(
					refreshError instanceof Error ? refreshError : new Error(String(refreshError)),
					null
				);
				isRefreshing = false;
				// window.location.href = '/login';

				return Promise.reject(refreshError);
			}
		}
		if (!shouldRetry) {
			return Promise.reject(error);
		}
		if (!originalRequest || !originalRequest.retry) {
			return Promise.reject(error);
		}
		console.log("Error, Retrying request " + originalRequest.url)

		let retryAfterMs = originalRequest.retryDelay || 1000;

		originalRequest.retry -= 1
		const delayRetryRequest = new Promise<void>((resolve) => {
			setTimeout(() => {
				console.log("retry the request", originalRequest.url);
				resolve()
			}, retryAfterMs)
		})
		return delayRetryRequest.then(() => axiosInstance(originalRequest))
		return Promise.reject(error)
	}
)

export default axiosInstance

import axios from "axios";

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

axiosInstance.interceptors.response.use((response) => response,
	async (error) => {
		if (!error.response) {
			return Promise.reject(error)
		}
		const originalRequest = error.config;
		if (error.response.status === 401 && !originalRequest._retry) {
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
		return Promise.reject(error)
	}
)

export default axiosInstance
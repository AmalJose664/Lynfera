import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import axiosInstance from "../axios"

export const connectGithub = async (router: AppRouterInstance) => {
	try {

		const response = await axiosInstance.get("/webhook/connect-github", {
			headers: {
				"X-redirect-path": location.pathname
			}
		}) as { data: { url: string } }
		const data = response.data
		window.location.href = data.url

	} catch (error: any) {
		console.log("ERRRORR")
		if (error.status === 401) {
			router.push("/login?commonError=Please login/signup via github to add github integration")
			return
		}
	}

}
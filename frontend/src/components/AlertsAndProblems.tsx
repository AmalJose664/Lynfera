"use client"

import { useGetServerNotificationsQuery } from "@/store/services/authApi"
import { useEffect, useState } from "react"
import { CiWarning } from "react-icons/ci"
import { IoClose } from "react-icons/io5"
import { MdCheckCircleOutline, MdErrorOutline, MdInfoOutline } from "react-icons/md"

const AlertsAndProblems = () => {

	const [showAlert, setShowAlert] = useState(false)
	const { data, isLoading } = useGetServerNotificationsQuery(undefined,)

	useEffect(() => {
		if (!data) return
		const alreadySeen = sessionStorage.getItem("banner-shown-" + data.id)
		setShowAlert(!alreadySeen)
	}, [data])

	const closeBannerFn = () => {
		sessionStorage.setItem("banner-shown-" + data?.id, "true")
		setShowAlert(false)
	}
	const allowedPages = ["/projects", "/deployments", "/resources"]
	const isAllowedPage = allowedPages.some(page => window.location.pathname.startsWith(page))
	if (isLoading || !showAlert || !data || !isAllowedPage) return null
	const style = config[data.type || "NEUTRAL"];
	return (
		<div className={`w-full border-b border-t shadow-sm transition-all duration-300 ${style.container}`}>
			<div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between flex-wrap gap-2">

					<div className="flex flex-1 items-center gap-3 min-w-0">
						<span className={`flex p-1.5 rounded-lg shadow-inner ${style.iconBg}`}>
							{style.icon}
						</span>

						<p>
							<span className="font-medium text-primary text-sm md:text-base truncate">{data.message}</span>
						</p>
						<br />
						{data.smallText && (
							<span className="font-bold mr-1 text-primary text-xs truncate">{data.smallText}: </span>
						)}
					</div>

					<div className="order-3 flex-shrink-0 w-auto">
						<button
							type="button"
							onClick={closeBannerFn}
							className={`-mr-1 flex rounded-md p-2 focus:outline-none transition-colors ${style.hover}`}
							aria-label="Dismiss"
						>
							<IoClose className="h-5 w-5 text-primary" />
						</button>
					</div>

				</div>
			</div>
		</div>
	)
}
export default AlertsAndProblems

const config = {
	ERROR: {
		container: "dark:bg-red-900/30 bg-red-300/30 border-red-600/20",
		iconBg: "dark:bg-red-800/70 bg-red-500/30",
		hover: "hover:bg-red-600",
		icon: <MdErrorOutline className="h-4 w-4 text-primary" />,
	},
	NEUTRAL: {
		container: "dark:bg-blue-900/30 bg-blue-200/30 border-blue-600/20",
		iconBg: "dark:bg-blue-900/60 bg-blue-500/30",
		hover: "hover:bg-blue-600",
		icon: <MdInfoOutline className="h-4 w-4 text-primary" />,
	},
	SUCCESS: {
		container: "dark:bg-emerald-900/30 bg-emerald-300/30 border-emerald-600/20",
		iconBg: "dark:bg-emerald-600/50 bg-emerald-400/60",
		hover: "hover:bg-emerald-600",
		icon: <MdCheckCircleOutline className="h-4 w-4 text-primary" />,
	},
	WARNING: {
		container: "dark:bg-amber-900/50 bg-amber-200/30 border-amber-600/20",
		iconBg: "dark:bg-amber-700/80 bg-amber-400/60",
		hover: "hover:bg-amber-600",
		icon: <CiWarning className="h-4 w-4 text-primary" />,
	}
};
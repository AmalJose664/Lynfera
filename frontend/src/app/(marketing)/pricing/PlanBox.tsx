"use client"
import { Button } from "@/components/ui/button"
import { getPlanFeatures, IPlans, PLANS } from "@/config/plan"
import { cn } from "@/lib/utils"
import { IoCubeSharp } from "react-icons/io5"
import { useGetUserDetailedQuery } from "@/store/services/authApi"
import { useRouter } from "next/navigation"
import axiosInstance from "@/lib/axios"
const PlanBox = () => {
	const { data: user } = useGetUserDetailedQuery()
	const userPlan = PLANS[user?.plan as keyof IPlans] || PLANS.FREE
	const router = useRouter()

	const handleClick = (action: "MANAGE" | keyof IPlans) => {
		if (!user) {
			return router.push("/login")
		}
		if (action === "MANAGE") {
			return router.push("/user/plan#manage")
		}
		if (action === "PRO" && userPlan.name === PLANS.FREE.name) {
			return upgrade()
		}
		return router.push("/projects")


	}
	const upgrade = async () => {
		try {
			const response = await axiosInstance.post("/billing/checkout")
			const url = response.data.url
			window.location.href = url;
		} catch (error) {
			console.log(error)
		}
	}
	return (
		<div className="flex items-end justify-center gap-20">
			{Object.keys(PLANS).map(((plan: string, i) => {
				const currentPlan = PLANS[plan as keyof IPlans]
				const isFree = plan === "FREE"
				const isUserFreePlan = userPlan.name === "FREE"
				return (
					<div key={i} className={cn(
						"group relative bg-white dark:bg-neutral-900 rounded-2xl w-80 border-2 transition-all duration-300 overflow-hidden",
						!isFree
							? "border-yellow-400/50 dark:border-yellow-500/50 shadow-lg shadow-yellow-500/10"
							: "border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 shadow-sm hover:shadow-md"
					)}>
						{!isFree && (
							<div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-orange-500/5 pointer-events-none"></div>
						)}

						<div className="relative p-6 flex flex-col h-full">

							<div className="flex items-start justify-between mb-6">
								<div className={cn(
									"p-3 rounded-xl",
									!isFree
										? "bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/30"
										: "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-800 dark:to-neutral-900"
								)}>
									<IoCubeSharp size={24} className={cn(!isFree ? "text-white" : "text-less", "rotate-z-180")} />
								</div>
								{userPlan.slug === currentPlan.slug && (
									<span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
										Active
									</span>
								)}
							</div>

							<div className="mb-6">
								<h3 className="text-2xl font-bold text-primary mb-1">
									{plan}
								</h3>
								<p className="text-sm text-less">
									{currentPlan.slug}
								</p>
							</div>

							<div className="mb-6">
								{currentPlan.pricePerMonth > 0 ? (
									<div className="flex items-baseline gap-1">
										<span className="text-4xl font-bold text-primary">
											${currentPlan.pricePerMonth}
										</span>
										<span className="text-sm text-less">
											/month
										</span>
									</div>
								) : (
									<div className="flex items-baseline gap-2">
										<span className="text-4xl font-bold text-primary">
											Free
										</span>
										<span className="text-sm text-less">
											forever
										</span>
									</div>
								)}
							</div>
							<div className="border-t my-6"></div>
							<div className="flex-1 space-y-3 mb-6">
								{getPlanFeatures(currentPlan).map((f, index) => {
									const Icon = f.Icon;
									return (
										<div
											key={`feat:${index}`}
											className="flex items-start gap-3 text-sm group/feature"
										>
											<div className={cn(
												"flex-shrink-0 mt-0.5 p-1 rounded-md",
												!isFree
													? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
													: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
											)}>
												<Icon size={14} />
											</div>
											<span className="text-less leading-relaxed">
												{f.text}
											</span>
										</div>
									)
								})}
							</div>
							<Button onClick={() =>
								handleClick(isFree ? "FREE" : (isUserFreePlan ? "PRO" : "MANAGE"))
							}
								variant={!isFree ? "default" : "outline"}
								className={cn(
									"w-full font-semibold transition-all duration-300",
									!isFree && "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/40"
								)}
							>
								{isFree ? "Get Started" : (isUserFreePlan ? "Upgrade Now" : "Manage Plan")}
							</Button>
						</div>
					</div>
				)
			}))}
		</div>
	)
}
export default PlanBox
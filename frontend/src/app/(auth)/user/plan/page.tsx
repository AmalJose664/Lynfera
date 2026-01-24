"use client"
import { useGetUserDetailedQuery } from "@/store/services/authApi"
import { getPlanFeatures, IPlans, PLANS } from '@/config/plan';
import ErrorComponent from '@/components/ErrorComponent';
import BackButton from "@/components/BackButton";
import { cn } from "@/lib/utils";
import { IoCubeSharp } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/Toasts";

const page = () => {
	const { data: user, error, isError, refetch } = useGetUserDetailedQuery()
	const router = useRouter()

	const plan = user?.plan || "FREE"
	const currentPlan = PLANS[plan]
	const userPlan = PLANS[user?.plan as keyof IPlans] || PLANS.FREE

	if (error || isError) {
		return <ErrorComponent error={error} id={""} field="User" />
	}
	const isFree = plan === "FREE"
	const cancelSubscription = async () => {
		try {
			const response = await axiosInstance.post("/billing/cancel")
			if (response.status === 200) {
				showToast.success("Plan change request sent !!")
				await refetch()
			}

		} catch (error) {
			console.log(error)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">

			<div className="sticky top-0 z-10 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-neutral-800">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
					<BackButton />
				</div>
			</div>

			<div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

				<div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
					<div className="relative h-32 bg-gradient-to-r dark:from-neutral-950 from-neutral-50 via-neutral-100 dark:via-neutral-900 dark:to-neutral-950 to-neutral-50 ">
						<div className="absolute inset-0"></div>
					</div>
					<div className="px-6 sm:px-8 pb-8">
						<div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-12">
							<div className="relative">
								<img
									src={user?.profileImage}
									alt={user?.name || "User Avatar"}
									className="w-24 h-24 rounded-2xl border-4 border-secondary shadow-xl"
								/>
								<div className={cn(
									"absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-primary",
									!isFree ? "bg-yellow-400" : "bg-emerald-400"
								)}></div>
							</div>

							<div className="flex-1 mt-4 sm:mt-0">
								<h1 className="text-3xl relative sm:text-4xl font-bold text-primary mb-1">
									{user?.name}
								</h1>
								<p className="text-sm flex items-center gap-2">
									<span className={cn(
										"px-3 py-1 rounded-full text-xs font-semibold",
										!isFree
											? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
											: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
									)}>
										{plan} Plan
									</span>
								</p>
							</div>
						</div>
					</div>
				</div>

				<div>
					<div className="mb-6">
						<h2 className="text-2xl font-bold text-primary mb-1">
							Current Plan
						</h2>
						<p className="text-sm text-less">
							Manage your subscription and view plan details
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

						<div className={cn(
							"group relative bg-white dark:bg-neutral-900 rounded-2xl border-2 transition-all duration-300 overflow-hidden",
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
								{isFree &&
									<Button
										onClick={() => router.push("/pricing")}
									>
										Upgrade Plan
									</Button>
								}
							</div>
						</div>
					</div>
					<div className="mt-4" id="manage">
						{!isFree &&
							<Button className="bg-secondary border border-red-400 text-red-400 transition-colors !duration-200 "
								onClick={cancelSubscription}
							>
								Cancel Subscription
							</Button>
						}
					</div>
				</div>
			</div>
		</div>
	)
}

export default page
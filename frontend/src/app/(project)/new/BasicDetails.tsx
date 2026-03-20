
'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Adjust path based on your setup
import { Input } from "@/components/ui/input"
import { ProjectFormInput, ProjectProvider } from "@/types/Project"
import { Controller, UseFormReturn } from "react-hook-form"

import { LuGithub, LuLink, LuPlug } from "react-icons/lu";
import { IoIosGitBranch, IoLogoGithub } from "react-icons/io";
import { TbListDetails } from "react-icons/tb";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetUserGthbInstalionsQuery, useGetUserGthbReposQuery } from "@/store/services/authApi";
import { formatDate } from "@/lib/moreUtils/combined";
import { GithubRepoResponse } from "@/types/User";
import { Suspense, useEffect, useState } from "react";
import { LinkComponent } from "@/components/docs/HelperComponents";
import { connectGithub } from "@/lib/moreUtils/gh";
import LoadingSpinner, { LoadingSpinner3, LoadingSpinnerPageSuspense } from "@/components/LoadingSpinner";
import { useAppDispatch, useAppSelector } from "@/store/store";

export function BaseSettings({ form, branches }: {
	form: UseFormReturn<ProjectFormInput>
	branches: string[]
}) {
	return (
		<Suspense fallback={<LoadingSpinnerPageSuspense />}>
			<BaseSettingsContent form={form} branches={branches} />
		</Suspense>
	)
}


function BaseSettingsContent({ form, branches }: {
	form: UseFormReturn<ProjectFormInput>
	branches: string[]
}) {
	const { register, formState: { errors }, setValue, resetField } = form
	const router = useRouter()
	const params = useSearchParams()
	const serverMessage = params.get("message")
	const status = params.get("success")
	const [selectedRepo, setSelectedRepo] = useState(-1)
	const tab = params.get("tab")
	const [repoTab, setRepoTab] = useState<string>(tab || "public-url")
	const [manual, setManual] = useState(false)

	const { branchesLoading } = useAppSelector(s => s.project);
	const { data: ids } = useGetUserGthbInstalionsQuery()
	const { data: repos, error: repoError, isError, isLoading: reposLoading } = useGetUserGthbReposQuery(undefined, { skip: !ids?.githubInstallationId })

	useEffect(() => {
		if (selectedRepo === -1) {
			setValue("isPrivate", false)
			resetField("ghRepoId")
			resetField("provider")
		}
	}, [selectedRepo])

	useEffect(() => {
		if (repoTab === "public-url") {
			console.log("reseting values")
			setValue("isPrivate", false)
			setValue("ghRepoId", undefined)
			setValue("provider", ProjectProvider.MANUAL)
			console.log("after reset values ", form.getValues("ghRepoId"), form.getValues("provider"))
		}
	}, [repoTab])


	const selectGhRepo = (repo: GithubRepoResponse, index: number) => {
		setSelectedRepo(index)
		setValue("provider", ProjectProvider.GITHUB)
		setValue("ghRepoId", repo.id)
		setValue("isPrivate", repo.private)
		setValue("name", repo.name)
		setValue("repoURL", repo.html_url)
	}
	const userAppConnected = !!ids?.githubInstallationId
	return (
		<div className="dark:bg-background bg-white border  rounded-md p-6 backdrop-blur-sm space-y-5">
			<div className="flex items-center gap-3 mb-2">
				<div className="p-2 border rounded-lg">
					<TbListDetails size={18} />
				</div>
				<h2 className="text-lg font-bold">Project Details</h2>
			</div>

			<div className="mb-3 px-3 py-2">
				<Tabs defaultValue={tab || "public-url"} value={repoTab} onValueChange={setRepoTab} className="w-full">
					{(selectedRepo !== -1) ? (
						<div className="mb-3 py-2">
							<label className="flex items-center gap-2 mb-1 font-medium  text-sm" htmlFor="repoURL">
								<LuGithub /> <span className="text-primary">Repo Selected</span>
								<button className="ml-auto border px-2 py-1 rounded-md" onClick={() => setSelectedRepo(-1)}>Edit</button>
							</label>
							<Input
								type="url" readOnly {...register("repoURL")}
								className="text-primary dark:placeholder:text-[#474747] placeholder:text-[#bdbdbd]"
							/>
							{errors.repoURL && (
								<p className="text-sm text-red-500 mt-1">{errors.repoURL.message}</p>
							)}
						</div>
					) : (<div>
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="public-url" className="flex items-center gap-2">
								<LuLink className="w-4 h-4" /> Public URL
							</TabsTrigger>
							<TabsTrigger value="provider" className="flex items-center gap-2">
								<LuPlug className="w-4 h-4" /> {userAppConnected ? "Provider" : "Connect Provider"}
							</TabsTrigger>

						</TabsList>

						<TabsContent value="public-url" className="mt-4">
							<label className="flex items-center gap-2 mb-1 font-medium text-sm" htmlFor="repoURL">
								<LuGithub /> <span className="text-primary">Public Git url</span>
							</label>

							<Input
								{...register("repoURL")}
								type="url"
								placeholder="https://github.com/user/repo..."
								className="text-primary dark:placeholder:text-[#474747] placeholder:text-[#bdbdbd]"
							/>

							{errors.repoURL && (
								<p className="text-sm text-red-500 mt-1">{errors.repoURL.message}</p>
							)}

							<p className="text-xs text-gray-500 mt-2">
								The git repository containing your project code
							</p>
						</TabsContent>

						<TabsContent value="provider" className="mt-0">
							{userAppConnected && <div className="flex justify-end mr-8 gap-8 mt-2">
								<LinkComponent
									href={`https://github.com/settings/installations/${ids.githubInstallationId}`}
									newPage
									className="text-xs  underline underline-offset-4 opacity-80"
								>
									Configure App
								</LinkComponent>
								<LinkComponent
									href={"/user#github"}
									className="text-xs  underline hover:text-red-400! underline-offset-4 opacity-80"
								>
									Remove App
								</LinkComponent>
							</div>}
							<div className="w-full max-w-3xl mx-auto">
								{userAppConnected ? (
									<div className="flex flex-col border-t max-h-80 overflow-y-scroll [&::-webkit-scrollbar]:w-1.5
										[&::-webkit-scrollbar-track]:bg-transparent
										[&::-webkit-scrollbar-thumb]:bg-primary/20
										[&::-webkit-scrollbar-thumb]:rounded-full
										hover:[&::-webkit-scrollbar-thumb]:bg-primary/40
										transition-colors">

										{repos && repos.length > 0 ? (
											repos.map((repo, i) => (
												<div
													key={repo.id}
													className="flex items-center justify-between py-5 px-2 border-b bg-white dark:bg-background rounded-md"
												>
													<div className="flex items-center gap-4">
														<IoLogoGithub size={20} className="text-primary opacity-60" />
														<div className="flex flex-col">
															<span className="text-sm font-medium text-primary">
																{repo.full_name}
															</span>
															<span className="text-xs text-primary opacity-40">
																Updated {formatDate(new Date(repo.pushAt), true)}
															</span>
														</div>
														{repo.private && (<div>
															<span className="text-xs border rounded-full px-2.5 py-1 border-sky-400/70 text-sky-400">
																private
															</span>
														</div>)}
													</div>


													<div className="flex items-center gap-6">

														<LinkComponent
															href={repo.html_url}
															newPage
															className="text-xs text-primary opacity-40 hover:opacity-100 transition-opacity underline underline-offset-4"
														>
															View Repository
														</LinkComponent>

														<button
															type="button"
															onClick={() => selectGhRepo(repo, i)}
															className="px-4 py-1.5 text-xs font-medium border text-primary bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 rounded-md transition-all active:scale-95"
														>
															Import
														</button>
													</div>
												</div>
											))
										) : (
											<>
												{isError && <div className="py-3 text-center">
													<p className="text-sm text-primary opacity-40">{(repoError as any).data.message}</p>
												</div>}
												<div className="py-3 text-center">
													<p className="text-sm text-primary opacity-40">{reposLoading ? "Loading.." : "No repositories found"}.</p>
												</div>
											</>
										)}
									</div>
								) : (
									<div className="flex flex-col justify-around items-center mt-4">
										<p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
											Connect your account to import repositories directly.
										</p>
										{serverMessage && <div>
											<p className="text-red-400 text-sm mt-2">{serverMessage}</p>
										</div>}
										<button onClick={() => connectGithub(router)}
											type="button"
											className="flex items-center gap-2 bg-black w-40 text-white dark:bg-white dark:text-black px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
										>
											<LuGithub className="w-4 h-4" />
											Connect GitHub
										</button>
									</div>
								)}
							</div>
						</TabsContent>
					</div>)}

				</Tabs>
			</div>

			<div className="mb-3 px-3 py-2">
				<label className="block mb-1 font-medium text-sm" htmlFor="">Project Name</label>
				<Input {...register("name")} placeholder="My frontend..." className="text-primary dark:placeholder:text-[#474747] placeholder:text-[#bdbdbd]" />
				{errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
				<p className="text-xs text-gray-500 mt-2">
					This will be used as your project identifier
				</p>
			</div>

			<div className="mb-3 px-3 py-2">
				<div className="flex justify-between">

					<label className="flex items-center gap-2  mb-1 font-medium text-sm" htmlFor="">
						<IoIosGitBranch />{" "}<span className="text-primary">Branch</span>
						{branchesLoading && <LoadingSpinner size={"sm"} className="dark:border-zinc-700 border-zinc-300" />}
					</label>
					<button type="button"
						className="border float-end mb-2 px-3 py-2 rounded-md text-xs"
						onClick={() => setManual(!manual)}
					>{manual ? "Select branch" : "Enter Branch Manually"}</button>
				</div>
				{manual ? (
					<div>
						<Input {...register("branch")} placeholder="main" className="text-primary dark:placeholder:text-[#474747] placeholder:text-[#bdbdbd]" />
					</div>
				) : (

					<Controller
						control={form.control}
						name="branch"
						render={({ field }) => (
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<SelectTrigger className="w-full text-primary dark:placeholder:text-[#474747] placeholder:text-[#bdbdbd]">
									<SelectValue placeholder="main" />
								</SelectTrigger>
								<SelectContent className={branches.length ? "h-90" : "h-20"}>
									{branches.length
										? branches.map((branch, index) => (
											<SelectItem key={index} value={branch}>
												{branch}
											</SelectItem>
										))
										: <SelectItem value="main">main</SelectItem>
									}
								</SelectContent>
							</Select>
						)}
					/>
				)}
				{errors.branch && <p className="text-sm text-red-500 mt-1">{errors.branch.message}</p>}
			</div>
		</div>
	)
}


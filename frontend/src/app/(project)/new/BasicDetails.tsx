
'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Adjust path based on your setup
import { Input } from "@/components/ui/input"
import { ProjectFormInput } from "@/types/Project"
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
import axiosInstance from "@/lib/axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetUserGthbInstalionsQuery, useGetUserGthbReposQuery } from "@/store/services/authApi";
import { formatDate } from "@/lib/moreUtils/combined";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { GithubRepoResponse } from "@/types/User";
import { useState } from "react";
import OptionsComponent from "@/components/OptionsComponent";



export function BaseSettings({ form, branches }: {
	form: UseFormReturn<ProjectFormInput>
	branches: string[]
}) {
	const { register, formState: { errors }, setValue } = form
	const router = useRouter()
	const params = useSearchParams()
	const serverMessage = params.get("message")
	const status = params.get("success")
	const [selectedRepo, setSelectedRepo] = useState(-1)

	const tab = params.get("tab")
	const { data: ids, error, isLoading } = useGetUserGthbInstalionsQuery()
	const { data: repos, error: repoError, isLoading: reposLoading } = useGetUserGthbReposQuery(undefined, { skip: !ids?.githubInstallationId })
	const connectGithub = async () => {
		try {

			const response = await axiosInstance.get("/webhook/connect-github", {
				headers: {
					"X-redirect-path": "/new"
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
	const selectGhRepo = (repo: GithubRepoResponse, index: number) => {
		setSelectedRepo(index)
		setValue("name", repo.name)
		setValue("repoURL", repo.html_url)
		setValue("isPrivate", repo.private)
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

			<div className="mb-3 py-2">
				<Tabs defaultValue={tab || "public-url"} className="w-full">
					{(selectedRepo !== -1) ? (
						<div className="mb-3 px-3 py-2">
							<label className="flex items-center gap-2 mb-1 font-medium  text-sm" htmlFor="repoURL">
								<LuGithub /> <span className="text-primary">Repo Selected</span>
								<button className="ml-auto border px-2 py-1 rounded-md" onClick={() => setSelectedRepo(-1)}>Edit</button>
							</label>
							<Input
								type="url" readOnly {...register("repoURL")}
								className="text-primary dark:placeholder:text-[#474747] placeholder:text-[#bdbdbd]"
							/>
						</div>
					) : (<div>
						<TabsList className="grid w-full grid-cols-2 mb-4">
							<TabsTrigger value="public-url" className="flex items-center gap-2">
								<LuLink className="w-4 h-4" /> Public URL
							</TabsTrigger>
							<TabsTrigger value="provider" className="flex items-center gap-2">
								<LuPlug className="w-4 h-4" /> {userAppConnected ? "Provider" : "Connect Provider"}
							</TabsTrigger>
						</TabsList>

						<TabsContent value="public-url" className="mt-0">
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
													</div>


													<div className="flex items-center gap-6">

														<a
															href={repo.html_url}
															target="_blank"
															rel="noopener noreferrer"
															className="text-xs text-primary opacity-40 hover:opacity-100 transition-opacity underline underline-offset-4"
														>
															View Repository
														</a>

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
											<div className="py-12 text-center">
												<p className="text-sm text-primary opacity-40">{reposLoading ? "Loading.." : "No repositories found"}.</p>
											</div>
										)}
									</div>
								) : (
									<>
										<p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
											Connect your account to import repositories directly.
										</p>
										{serverMessage && <div>
											<p className="text-red-400 text-sm mt-2">{serverMessage}</p>
										</div>}
										<button onClick={connectGithub}
											type="button"
											className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
										>
											<LuGithub className="w-4 h-4" />
											Connect GitHub
										</button>
									</>
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
				<label className="flex items-center gap-2  mb-1 font-medium text-sm" htmlFor="">
					<IoIosGitBranch />{" "}<span className="text-primary">Branch</span>
				</label>

				<Controller
					control={form.control}
					name="branch"
					render={({ field }) => (
						<Select onValueChange={field.onChange} defaultValue={field.value}>
							<SelectTrigger className="w-full text-primary dark:placeholder:text-[#474747] placeholder:text-[#bdbdbd]">
								<SelectValue placeholder="main" />
							</SelectTrigger>
							<SelectContent className={branches.length ? "h-96" : "h-20"}>
								{branches
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
				{errors.branch && <p className="text-sm text-red-500 mt-1">{errors.branch.message}</p>}
			</div>
		</div>
	)
}


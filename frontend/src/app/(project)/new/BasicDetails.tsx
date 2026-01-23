
'use client'

import { Input } from "@/components/ui/input"
import { ProjectFormInput } from "@/types/Project"
import { Controller, UseFormReturn } from "react-hook-form"

import { LuGithub } from "react-icons/lu";
import { IoIosGitBranch } from "react-icons/io";
import { TbListDetails } from "react-icons/tb";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"


export function BaseSettings({ form, branches }: {
	form: UseFormReturn<ProjectFormInput>
	branches: string[]
}) {
	const { register, formState: { errors } } = form

	return (
		<div className="dark:bg-background bg-white border  rounded-md p-6 backdrop-blur-sm space-y-5">
			<div className="flex items-center gap-3 mb-2">
				<div className="p-2 border rounded-lg">
					<TbListDetails size={18} />
				</div>
				<h2 className="text-lg font-bold">Project Details</h2>
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
					< LuGithub />{" "}<span className="text-primary">Public Git url </span>
				</label>

				<Input {...register("repoURL")}
					placeholder="https://github.com/user/repo"
					className="text-primary dark:placeholder:text-[#474747] placeholder:text-[#bdbdbd]"
				/>

				{errors.repoURL && <p className="text-sm text-red-500 mt-1">{errors.repoURL.message}</p>}
				<p className="text-xs text-gray-500 mt-2">
					The git repository containing your project code
				</p>
			</div>

			<div className="mb-3 px-3 py-2 relative">
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
							<SelectContent className="h-96">
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


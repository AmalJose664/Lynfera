'use client'

import { ProjectFormInput } from "@/types/Project"
import { useForm, } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod';
import { ProjectFormSchema } from "@/lib/schema/project";
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react";

import { MdKeyboardArrowRight } from "react-icons/md";
import { CiSettings } from "react-icons/ci";

import { useCreateProjectMutation } from "@/store/services/projectsApi";
import { useRouter } from "next/navigation";
import { BaseSettings } from "./BasicDetails";
import { AdvancedSettings } from "./AdvancedDetails";
import { ConfigPreview } from "./ConfigPreview";
import { getBranches, repoCheck } from "@/lib/moreUtils/form";
import { IoIosCube } from "react-icons/io";
import BackButton from "@/components/BackButton";
import { showToast } from "@/components/Toasts";
import { LinkComponent } from "@/components/docs/HelperComponents";


function ProjectForm() {
	const router = useRouter()
	const form = useForm<ProjectFormInput>({

		defaultValues: {
			name: '',
			repoURL: '',
			branch: "",
			installCommand: "install",
			buildCommand: "build",
			rootDir: "/",
			outputDirectory: 'dist'
		},

		resolver: zodResolver(ProjectFormSchema)
	})
	const [createProject, { isLoading, isSuccess }] = useCreateProjectMutation()

	const [showAdvanced, setShowAdvanced] = useState(false)
	const [branches, setBranches] = useState<string[] | undefined>()


	const { handleSubmit, formState,
		watch
	} = form
	const { errors,
		isSubmitting,
	} = formState

	const repoUrl = watch("repoURL")

	useEffect(() => {
		getBranches(form.getValues("repoURL"), setBranches)
	}, [repoUrl])



	const onSubmit = async (data: ProjectFormInput) => {
		const repoExists = await repoCheck(data.repoURL)
		if (!repoExists) {
			form.setFocus("repoURL")
			form.setError("repoURL", { message: "Git repo not found", type: "manual", })
			return
		} else {
			form.clearErrors("repoURL")
		}
		try {
			const result = await createProject(data).unwrap()
			router.push(`/projects/${result._id}`)

		} catch (error: any) {
			if (error.status === 401) {
				router.push("/login")
			}
			console.log("Error!", error)
			if (error.status === 400) {
				return showToast.error("Error on creating project, ", error.data.message || error.message)
			}
			showToast.error("Error", "Error on creating project")
		}

	}

	return (
		<div className="min-h-screen bg-linear-to-br from-background dark:via-neutral-800 via-neutral-100 to-background text-primary pb-24">
			<header className="border-b border-gray-800/50 backdrop-blur-xl  sticky top-0 z-10">
				<div className="max-w-7xl mx-auto px-8 py-2">
					<div className="flex items-center gap-4">
						<BackButton />
						<div>
							<h1 className="text-2xl flex gap-2 items-center font-bold">Create New Project <IoIosCube /></h1>
							<p className="text-sm text-gray-400 mt-1">Deploy your application in minutes</p>
						</div>
					</div>
				</div>
			</header>

			<main className="max-w-[1320px] mx-auto py-3">
				<div className="flex flex-col lg:flex-row gap-12 lg:items-start sm:items-center">
					<form
						className="mt-6 border p-2 rounded-md border-blue-600/30 flex-[10%]"
						noValidate
						onSubmit={handleSubmit(onSubmit)}
					// transition={{ duration: 0.4, ease: "easeInOut" }}
					>
						<BaseSettings form={form} branches={branches || []} />

						<div className="px-4 my-4 group transition-all duration-200 w-fit">
							<span title="Show Advanced" className="transition-all duration-200 cursor-pointer hover:underline flex items-center gap-2 "
								onClick={() => setShowAdvanced(!showAdvanced)}
							>
								<CiSettings
									className="size-5 group-hover:translate-x-2 transition-all duration-200 group-hover:rotate-45" /> Advanced Settings <MdKeyboardArrowRight
									className="inline duration-200" style={{ transform: `rotateZ(${showAdvanced ? "90" : "0"}deg)` }} />
							</span>
						</div>
						<AnimatePresence mode="sync" >
							{showAdvanced && (
								<AdvancedSettings form={form} />
							)}
						</AnimatePresence>
						<div className="mb-4">
							<button
								type="submit"
								disabled={isSubmitting}
								className="disabled:cursor-not-allowed! w-full dark:bg-background bg-white  py-2 hover:bg-neutral-800 hover:text-white hover:dark:bg-neutral-200 hover:dark:text-black rounded font-semibold border !duration-100 transition"
							>
								{(isSubmitting || isLoading) ? "Loading..." : "Deploy"}
							</button>
						</div>
						<div>
							<LinkComponent
								href="/docs/getting-started#start-project" className="text-xs text-blue-300/80!">Learn more</LinkComponent>
						</div>
					</form>



					{/* ----------------------------------------------------------------------- */}



					<ConfigPreview form={form} />
				</div>
			</main>
		</div>
	);
}


export default ProjectForm
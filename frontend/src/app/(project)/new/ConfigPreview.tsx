'use client'

import { ProjectFormInput } from "@/types/Project"
import { UseFormReturn } from "react-hook-form"

import { LuFolderTree, LuGithub, LuRocket } from "react-icons/lu";
import { FiTerminal } from "react-icons/fi";
import { IoIosGitBranch } from "react-icons/io";
import { VscFileCode } from "react-icons/vsc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LiaWrenchSolid } from "react-icons/lia";

export function ConfigPreview({ form }: { form: UseFormReturn<ProjectFormInput> }) {
	const data = form.watch()
	const timeline = [
		{
			icon: VscFileCode, title: "Project Name", desc: data.name || "...",
			hasValue: data.name
		},
		{
			icon: LuGithub, title: "Repository", desc: `${data.repoURL || "----"}`,
			hasValue: data.repoURL
		},
		{
			icon: IoIosGitBranch, title: "Branch", desc: `${data.branch || ""}`,
			hasValue: data.branch
		},
		{
			icon: LuFolderTree, title: "Directories", desc: `Root: ${data.rootDir}, Output: ${(data.rootDir || "").replace(/\/$/, "")}/${(data.outputDirectory || "").replace(/^\//, "")}`,
			hasValue: data.rootDir && data.outputDirectory
		},
		{
			icon: FiTerminal, title: "Install", desc: data.installCommand,
			hasValue: data.installCommand
		},
		{
			icon: LiaWrenchSolid, title: "Build", desc: data.buildCommand,
			hasValue: data.buildCommand
		},
		{
			icon: LuRocket,
			title: "Ready to Deploy",
			desc: "Your project is configured for deployment.",
			hasValue: form.formState.isValid,
		},
	]

	return (
		<div className="flex-1 lg:sticky lg:top-32 ">
			<div className="relative overflow-hidden rounded-md border border-blue-600/30  backdrop-blur-sm p-2">

				<Card className="dark:bg-background bg-white">
					<CardHeader>
						<CardTitle>Configuration Preview</CardTitle>
						<CardDescription>Your deployment and project options.</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="relative pl-6">

							<div className="absolute left-[40px] top-2 bottom-5 w-0.5 bg-blue-600/90 -translate-x-1/2"></div>

							{timeline.map((item, index) => (
								<div key={index} className="flex items-start gap-6 mb-8 last:mb-0">
									<div className="relative z-10">
										<div
											className={cn(
												"flex items-center justify-center w-8 h-8 border border-blue-600 rounded-full transition-colors duration-300",
												item.hasValue
													? "bg-primary"
													: "bg-background"
											)}
										>
											<item.icon
												className={cn(
													"w-4 h-4 transition-colors duration-300",
													item.hasValue
														? "text-primary-foreground"
														: "text-muted-foreground"
												)}
											/>
										</div>
									</div>
									<div>
										<h4
											className={cn(
												"font-semibold transition-colors duration-300",
												!item.hasValue && "text-muted-foreground"
											)}
										>
											{item.title}
										</h4>
										<p className="text-sm text-muted-foreground font-mono break-all">
											{item.desc}
										</p>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
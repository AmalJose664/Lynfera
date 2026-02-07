import Navbar from "@/components/Navbar"
import { ProjectPageContainer } from "./ProjectPageContainer"
import EnsureAuth from "@/components/EnsureAuth";

export default async function Page({
	params, searchParams
}: {
	params: { id: string }, searchParams: { [key: string]: string | string[] | undefined };
}) {
	const { id } = await params
	const { tab } = await searchParams
	const filteredTab = ["overview", "deployments", "monitoring", "settings", "files"].includes((tab as string) || "") ? tab : ""
	return (
		<div className="min-h-screen flex flex-col overflow-x-clip">

			<Navbar className="" />
			<EnsureAuth>
				<main className="flex-1">
					<ProjectPageContainer projectId={id as string} tab={filteredTab as string} />
				</main>
			</EnsureAuth>
		</div>
	)
}
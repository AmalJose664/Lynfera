import { Button } from "@/components/ui/button"
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty"
import { LuFolderCode } from "react-icons/lu";
import { HiMiniArrowUpRight } from "react-icons/hi2";
import Link from "next/link";
import { IoIosCube } from "react-icons/io";
const ProjectEmptyState = () => {
	return (
		<div className="mt-6 flex items-center justify-center relative">
			<Empty className="z-10 mt-5">
				<EmptyHeader>
					<EmptyMedia variant="default">
						<LuFolderCode />
					</EmptyMedia>
					<EmptyTitle className="text-primary">No Projects Yet</EmptyTitle>
					<EmptyDescription>
						You haven&apos;t created any projects yet. Get started by creating
						your first project.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<div className="flex gap-2">
						<Link href={'/new'} className=""><Button>Create Project</Button></Link>
						<Link href={'/new'} className="">
							<Button variant="outline">Import Project</Button>
						</Link>
					</div>
				</EmptyContent>
				<Button
					variant="link"
					asChild
					className="text-muted-foreground"
					size="sm"
				>
					<Link href="/docs/getting-started#gs-projects-deployment">
						Learn More <HiMiniArrowUpRight />
					</Link>
				</Button>
			</Empty>
			<div className="absolute -top-8">
				<IoIosCube size={650} className="dark:text-neutral-900/50 text-neutral-200" />
			</div>
		</div>
	)
}
export default ProjectEmptyState
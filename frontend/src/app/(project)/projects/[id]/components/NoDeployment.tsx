import LoadingSpinner, { LoadingSpinner3 } from "@/components/LoadingSpinner"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import Link from "next/link"
import { BsFillCloudPlusFill } from "react-icons/bs"
import { HiMiniArrowUpRight } from "react-icons/hi2"
import { IoMdCloudDone } from "react-icons/io"


interface NoDeploymentProps {
	buttonAction: () => void
	titleText: string
	descriptionText: string
	buttonState?: boolean;
	buttonText: string
	learnMoreUrl: string
	buttonIcon: React.ReactNode
}

const NoDeployment = ({ buttonAction, buttonState, buttonText, descriptionText, learnMoreUrl, titleText, buttonIcon }: NoDeploymentProps) => {
	return (
		<div className="border rounded-md  flex items-center justify-center mb-4 relative">
			<Empty className="z-10 mt-5">
				<EmptyHeader>
					<EmptyMedia variant="default">
						<BsFillCloudPlusFill />
					</EmptyMedia>
					<EmptyTitle className="text-primary">{titleText}</EmptyTitle>
					<EmptyDescription>
						{descriptionText}
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<div className="flex gap-2">
						<Button disabled={buttonState} className="disabled:opacity-50!" onClick={buttonAction}>
							{buttonState ? (
								<LoadingSpinner3 isLoading={buttonState} />
							) : (
								<>
									{buttonText}
									{buttonIcon}
								</>
							)}
						</Button>
					</div>
				</EmptyContent>
				<Button
					variant="link"
					asChild
					className="text-muted-foreground"
					size="sm"
				>
					<Link href={"/docs/build-deploy#Deploys"}>
						Learn More <HiMiniArrowUpRight />
					</Link>
				</Button>
			</Empty>
			<div className="absolute">
				<IoMdCloudDone size={450} className="dark:text-neutral-900/50 text-neutral-200" />
			</div>
		</div>
	)
}
export default NoDeployment
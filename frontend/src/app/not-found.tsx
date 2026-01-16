import BackButton from "@/components/BackButton"
import Navbar from "@/components/Navbar"

const notFound = () => {

	return (
		<div className="min-h-screen bg-background text-primary ">
			<Navbar className="" showOtherLinks />
			<div className="min-h-[calc(100vh-6rem)] flex w-full items-center justify-between text-center">
				<div className="flex-1">
					<p>Page not found 404</p>
					<div className="flex items-center gap-4 w-full mt-4 justify-center">
						<BackButton /> Go back
					</div>
				</div>
			</div>
		</div>
	)
}
export default notFound
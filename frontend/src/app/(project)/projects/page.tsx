import Navbar from "@/components/Navbar"
import ProjectContent from "./ProjectsPageContent"
import { SITE_NAME } from "@/config/constants";
import EnsureAuth from "@/components/EnsureAuth";
export const metadata = {
	title: "Projects | " + SITE_NAME,
	description:
		"User Projects page",
};
const page = () => {
	return (
		<div>
			<Navbar className="" />
			<EnsureAuth>
				<ProjectContent />
			</EnsureAuth>
		</div>
	)
}
export default page
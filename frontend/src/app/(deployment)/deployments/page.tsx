import Navbar from "@/components/Navbar"
import AllDeployments from "./AllDeployments"
import { SITE_NAME } from "@/config/constants";
import EnsureAuth from "@/components/EnsureAuth";

export const metadata = {
	title: "Deployments | " + SITE_NAME,
	description:
		"User Desployments",
};

const page = () => {
	return (
		<div>
			<Navbar className="" />
			<EnsureAuth>
				<AllDeployments />
			</EnsureAuth>
		</div>
	)
}
export default page

import Navbar from "@/components/Navbar"
import UsagePage from "./UsageContent"
import EnsureAuth from "@/components/EnsureAuth"

const page = () => {
	return (
		<div>
			<Navbar className="" />
			<EnsureAuth>
				<UsagePage />
			</EnsureAuth>
		</div>
	)
}
export default page


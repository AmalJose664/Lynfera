import { SITE_NAME } from "@/config/constants";
import ProfileContent from "./ProfileContent"
import EnsureAuth from "@/components/EnsureAuth";
export const metadata = {
	title: "User | " + SITE_NAME,
	description:
		"User page",
};
const page = () => {
	return (
		<EnsureAuth >
			<ProfileContent />
		</EnsureAuth>
	)
}
export default page
import { LinkComponent } from "@/components/docs/HelperComponents";
import { SITE_NAME } from "@/config/constants";
import { FaBookOpen } from "react-icons/fa";
import { IoIosCube } from "react-icons/io";
import { VscGraph } from "react-icons/vsc";


export const metadata = {
	title: "Documentation | " + SITE_NAME,
	description:
		"Technical specifications and guidelines for deploying static applications.",
};
const page = () => {
	return (
		<div className="flex items-center justify-around w-full">
			<LinkComponent href="/docs/getting-started" className="rounded-md px-4 py-3 dark:bg-accent bg-white border flex gap-3 items-center ">Start with Reading Docs <FaBookOpen /> </LinkComponent>
			<LinkComponent href="/new" className="rounded-md px-4 py-3 dark:bg-accent bg-white border flex gap-3 items-center ">Start a new Project <IoIosCube /></LinkComponent>
			<LinkComponent href="/resources" className="rounded-md px-4 py-3 dark:bg-accent bg-white border flex gap-3 items-center ">View My Resources <VscGraph /></LinkComponent>
		</div>
	)
}
export default page
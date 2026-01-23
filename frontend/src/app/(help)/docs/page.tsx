import { LinkComponent } from "@/components/docs/HelperComponents";
import { SITE_NAME } from "@/config/constants";


export const metadata = {
	title: "Documentation | " + SITE_NAME,
	description:
		"Technical specifications and guidelines for deploying static applications.",
};
const page = () => {
	return (
		<div className="flex items-center justify-around w-full">
			<LinkComponent href="/docs/getting-started" className="rounded-md px-4 py-3 bg-accent ">Start with Reading Docs</LinkComponent>
			<LinkComponent href="/new" className="rounded-md px-4 py-3 bg-accent ">Start a new Project</LinkComponent>
			<LinkComponent href="/resources" className="rounded-md px-4 py-3 bg-accent ">View My Resources</LinkComponent>
		</div>
	)
}
export default page
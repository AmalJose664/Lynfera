import { IoIosCube, IoMdCloudDone } from "react-icons/io"

export const LINKS = {
	REPO: "https://github.com/AmalJose664/Deployment-site",
}
export const SITE_NAME = "Lynfera"


export const navbarLinks = [
	{ name: "Projects", url: "/projects", isOtherLink: false, Icon: IoIosCube },
	{ name: "Deployments", url: "/deployments", isOtherLink: false, Icon: IoMdCloudDone },
	{ name: "Pricing", url: "/pricing", isOtherLink: true, Icon: '' },
	{ name: "Product", url: "/product", isOtherLink: true, Icon: '' },
	{ name: "Resources", url: "/resources", isOtherLink: false, Icon: '' },
	{ name: "Docs", url: "/docs", isOtherLink: false, Icon: '' },
	{ name: "Showcase", url: "/showcase", isOtherLink: true, hidden: true, Icon: '' },
]
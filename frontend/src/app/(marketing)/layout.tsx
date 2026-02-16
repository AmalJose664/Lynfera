import { Footer } from "@/components/GlobalFooter"
import Navbar from "@/components/Navbar"

export default function BillingLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return <div>
		<Navbar className="" />
		{children}
		<Footer />
	</div>
}
'use client'
import { useRouter } from "next/navigation"
import { TiArrowLeft } from "react-icons/ti"

const BackButton = ({ specificUrl }: { specificUrl?: string }) => {
	const router = useRouter()
	return (
		<button
			onClick={() => specificUrl ? router.push(specificUrl) : router.back()}
			className="border dark:bg-transparent bg-white p-2 dark:hover:bg-zinc-800 hover:bg-zinc-200 rounded-lg transition-colors group"
		>
			<TiArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
		</button>
	)
}
export default BackButton
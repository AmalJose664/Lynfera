import { Suspense } from "react";
import AuthSuccessComp from "./AuthSuccess";
import LoadingSpinner from "@/components/LoadingSpinner";
const page = () => {
	return (
		<Suspense fallback={<div className="min-h-screen w-full justify-around flex items-center"><LoadingSpinner /></div>}>
			<AuthSuccessComp />
		</Suspense>
	)
}
export default page
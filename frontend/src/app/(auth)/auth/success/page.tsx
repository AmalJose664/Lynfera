import { Suspense } from "react";
import AuthSuccessComp from "./AuthSuccess";
const page = () => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<AuthSuccessComp />
		</Suspense>
	)
}
export default page
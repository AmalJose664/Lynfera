
import { redirect } from "next/navigation";

import PaymentSuccess from "@/app/(marketing)/payment-success/PaymentSuccess";
export const metadata = {
	title: "Payment Verfiy",
	description:
		"Verify your payment",
};
export default async function SuccessPage({ searchParams }: any) {
	const { session_id: sessionId } = await searchParams;

	if (!sessionId) {
		redirect("/");
	}

	return <PaymentSuccess sessionId={sessionId} />;
}

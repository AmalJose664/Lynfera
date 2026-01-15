"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

type PaymentDetails = {
	customerName?: string;
	amountPaid?: string;
	currency?: string;
	valid: boolean;
};
interface ErrorResponse {
	message?: string;
	error?: string;
	statusCode?: number;
}
export default function PaymentSuccess({ sessionId }: { sessionId: string }) {
	const [data, setData] = useState<PaymentDetails | null>(null);
	const [error, setError] = useState<ErrorResponse | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	useEffect(() => {
		async function fetchSession() {
			try {
				setError(null);
				const res = await axiosInstance.get(`/billing/retrieve?session_id=${sessionId}`);
				setData(res.data);

			} catch (err) {
				const error = err as AxiosError<ErrorResponse>;
				if (error.response) {
					const errorMessage = error.response.data?.message || ""
						|| error.response.data?.error || ""
						|| `Error: ${error.response.status} ${error.response.statusText}`;

					setError({ message: errorMessage });
					console.log('API Error:', {
						status: error.response.status,
						data: error.response.data
					});
				} else if (error.request) {
					setError({ message: 'Unable to reach the server. Please try again.' });
					console.log('Network Error:', error.message);
				} else {
					setError({ message: error.message || 'An unexpected error occurred' });
					console.log('Error:', error.message);
				}
			} finally {
				setIsLoading(false)
			}
		}
		fetchSession();
	}, [sessionId]);

	if (isLoading) return (
		<div className="flex items-center justify-around gap-2 flex-col mt-40">

			<div className="flex items-center gap-2 my-4 flex-col">
				<p className="text-less text-sm">Loading ...</p>
				<LoadingSpinner />
			</div>
		</div>
	);
	if (error) {
		return (
			<div className="flex items-center justify-around gap-2 flex-col mt-40">
				<h2>Error</h2>
				<p>{error.message}</p>

				<div className="flex items-center gap-2 my-4 flex-col">
					<p className="text-less text-sm">Report this problem </p>
					<Link href={"mailto:renderstest446446@gmail.com"} className="underline text-less text-xs">
						renderstest446446@gmail.com
					</Link>
				</div>
				<Button variant={"outline"} onClick={() => window.location.href = '/pricing'}>
					Return to Pricing
				</Button>
			</div>
		);
	}
	if (!data?.valid) {
		return (
			<div style={{ textAlign: "center", padding: "50px" }}>
				<h1>⚠️ Payment Not Found</h1>
				<p>We could not verify your payment.</p>
				<a href="/">Return Home</a>
			</div>
		);
	}
	return (
		<main style={{ textAlign: "center", padding: "50px" }}>
			<h1>🎉 Payment Successful!</h1>
			<p>Thank you for your purchase.</p>

			<div style={{ marginTop: "20px" }}>
				<p>
					<strong>Customer:</strong> {data.customerName ?? "Guest"}
				</p>
				<p>
					<strong>Amount Paid:</strong> {data.amountPaid} {data.currency}
				</p>
			</div>

			<a href="/" style={{ marginTop: "30px", display: "inline-block" }}>
				Return Home
			</a>
		</main>
	);
}

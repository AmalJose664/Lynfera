"use client";
import React from "react";

type GoogleLoginButtonProps = React.PropsWithChildren<{
	className?: string;
}>;
export function GoogleLoginButton({ className, children, ...props }: GoogleLoginButtonProps) {
	const handleLogin = () => {
		localStorage.setItem("provider_last_used", "GOOGLE")
		window.location.href = process.env.NEXT_PUBLIC_API_SERVER_ENDPOINT + "/auth/google";
	};
	return (
		<button {...props}
			type="button"
			onClick={handleLogin}
			className={className}
		>
			{children}
		</button>
	);
}

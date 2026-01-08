import { useEffect, useState } from "react";

export function useIsDesktop(breakpoint = 768) {
	const [isDesktop, setIsDesktop] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			setIsDesktop(window.innerWidth >= breakpoint);
		};

		handleResize();
		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, [breakpoint]);

	return isDesktop;
}
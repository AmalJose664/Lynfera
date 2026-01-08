'use client'
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const ProjectTabs = ({ tab, setTab }: { tab: string, setTab: (state: string) => void }) => {
	const overviewRef = useRef<HTMLButtonElement>(null);
	const deploymentsRef = useRef<HTMLButtonElement>(null);
	const monitoringRef = useRef<HTMLButtonElement>(null);
	const settingsRef = useRef<HTMLButtonElement>(null);
	const filesRef = useRef<HTMLButtonElement>(null);

	const tabs = useMemo(() => [
		{ title: "overview", ref: overviewRef },
		{ title: "deployments", ref: deploymentsRef },
		{ title: "monitoring", ref: monitoringRef },
		{ title: "settings", ref: settingsRef },
		{ title: "files", ref: filesRef }
	], []);
	const [distance, setDistance] = useState(0)
	const [width, setWidth] = useState(70)
	const updateIndicator = useCallback((tabTitle: string) => {
		const index = tabs.findIndex(t => t.title === tabTitle);
		if (index === -1) return;

		const button = tabs[index].ref.current;
		if (button) {
			const rect = button.getBoundingClientRect();
			const parentRect = button.parentElement?.getBoundingClientRect();
			if (parentRect) {
				setDistance(rect.left - parentRect.left);
				setWidth(rect.width);
			}
		}
	}, [tabs]);
	useEffect(() => {
		updateIndicator(tab);
	}, [tab, updateIndicator]);

	return (
		<nav className="ml-0 md:ml-6 flex gap-6 duration-300 relative w-full md:w-auto">
			<TabsList className="flex items-center gap-4 bg-background min-w-max">
				{tabs.map((tabVal,) => (
					<TabsTrigger
						key={tabVal.title}
						value={tabVal.title}
						ref={tabVal.ref}
						onClick={() => setTab(tabVal.title)}
						className={`text-sm border pb-1 transition-all text-primary whitespace-nowrap`}
					>
						{tabVal.title[0].toUpperCase() + tabVal.title.slice(1)}
					</TabsTrigger>
				))}
			</TabsList>
			<div
				className="bg-primary h-0.5 absolute -bottom-1 transition-all duration-300 ease-out"
				style={{
					transform: `translateX(${distance}px)`,
					width: `${width}px`,
					opacity: 1
				}}
			/>
		</nav>




	)
}

export default ProjectTabs

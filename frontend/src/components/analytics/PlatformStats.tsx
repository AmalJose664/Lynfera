"use client"

import { Pie, PieChart, LabelList } from "recharts"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { useGetPlatformStatsQuery } from "@/store/services/analyticsApi"
import { useState } from "react"
import { BLUE_COLORS } from "@/lib/moreUtils/combined"
import { PLANS } from "@/config/plan"

const chartConfig = {
} satisfies ChartConfig


export default function PlatformStats({ projectId, userPlan }: { projectId: string, userPlan: string }) {
	const [range, setRange] = useState("1d")
	const { data, isLoading, error, isError } = useGetPlatformStatsQuery({ projectId, range, limit: 50 })
	const isPremiumUser = userPlan === PLANS.PRO.name
	const browserData = data?.browserStats.map((item, index) => ({
		...item,
		fill: BLUE_COLORS[index % BLUE_COLORS.length],
	})) || []
	const osData = data?.osStats.map((item, index) => ({
		...item,
		fill: BLUE_COLORS[index % BLUE_COLORS.length],
	})) || []


	if (isLoading) {
		return (
			<Card>
				<CardContent className="flex h-[400px] items-center justify-center">
					<p className="text-muted-foreground">Loading data...</p>
				</CardContent>
			</Card>
		)
	}
	return (
		<Card className="dark:bg-background w-full">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
				<div className="space-y-1">
					<CardTitle>Platform Distribution</CardTitle>
				</div>
				<Select value={range} onValueChange={setRange}>
					<SelectTrigger className="w-[140px]">
						<SelectValue placeholder="Select interval" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="1h">Last Hour</SelectItem>
						<SelectItem value="1d">Last 24h</SelectItem>
						<SelectItem value="7d" disabled={!isPremiumUser}>Last 7 Days {!isPremiumUser && <p className="text-xs inline">(Pro user)</p>}</SelectItem>
						<SelectItem value="30d" disabled={!isPremiumUser}>Last 30 Days {!isPremiumUser && <p className="text-xs inline">(Pro user)</p>}</SelectItem>
					</SelectContent>
				</Select>
			</CardHeader>
			<CardContent>
				{isError || !data ? (
					<div className="dark:bg-background flex-col flex h-[400px] items-center justify-center">
						<p className="text-destructive">
							{(error as any)?.message || (error as { data?: { message?: string } })?.data?.message}
						</p>
						<p className="text-muted-foreground">No page data available</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-fit md:w-5xl">
						<div className="flex flex-col items-center border rounded-md pt-2">
							<h4 className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wider">Browser</h4>
							<ChartWidget data={browserData} dataKey="percentage" nameKey="uaBrowser" />
						</div>
						<div className="flex flex-col items-center border rounded-md pt-2">
							<h4 className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wider">OS</h4>
							<ChartWidget data={osData} dataKey="percentage" nameKey="uaOs" />
						</div>
					</div>)}
			</CardContent>
		</Card>
	)
}

function ChartWidget({ data, dataKey, nameKey }: { data: any[], dataKey: string, nameKey: string }) {
	if (data.length === 0) {
		return <div className="flex h-[250px] items-center justify-center text-muted-foreground text-sm">No data available</div>
	}

	return (
		<ChartContainer config={chartConfig} className="w-full aspect-square max-h-[250px]">
			<PieChart>
				<ChartTooltip
					content={
						<ChartTooltipContent
							className="dark:border-zinc-700"
							hideLabel
							formatter={(value, name, props) => (
								<div className="flex flex-col gap-1">
									<div className="text-xs font-bold">{props.payload[nameKey]}</div>
									<div className="text-xs">{Number(value).toFixed(2)}%</div>
									<div className="text-[10px] text-muted-foreground">{props.payload.users} Requests</div>
								</div>
							)}
						/>
					}
				/>
				<Pie data={data} dataKey={dataKey} nameKey={nameKey} innerRadius={45} outerRadius={100} paddingAngle={0}>
					<LabelList dataKey={nameKey} className="fill-foreground text-[10px]" position="outside" stroke="none" />
				</Pie>
			</PieChart>
		</ChartContainer>
	)
}


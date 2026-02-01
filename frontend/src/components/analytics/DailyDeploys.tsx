import React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
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


const chartConfig2 = {
	count: {
		label: "Builds",
		color: "var(--primary)",
	},
} satisfies ChartConfig

function ChartDailyDeploys({ deploys, todaysDeploys }: { deploys: { _id: string, count: number }[], todaysDeploys: number }) {
	const todaysDate = new Date().toISOString().slice(0, 10)
	const deploysWithDailyDeploys = deploys.map((d) => {
		const { _id, count } = d
		if (_id === todaysDate) {
			return { _id, count: Math.max(count, todaysDeploys) }
		}
		return d
	})
	const total = React.useMemo(
		() => deploysWithDailyDeploys.reduce((acc, curr) => acc + curr.count, 0),
		[deploysWithDailyDeploys]
	)
	return (
		<Card className="dark:bg-background bg-white border-t rounded-none">
			<CardHeader>
				<CardTitle>Number of builds per day</CardTitle>
				<CardDescription>
					<div className="flex items-center gap-4">
						<span className="text-sm">
							From {new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleDateString("en-GB")}  to {new Date().toLocaleDateString("en-GB")}
						</span>
						<span className="text-sm">
							Total builds: {total}
						</span>
					</div>
				</CardDescription>
			</CardHeader>
			<CardContent className="px-2 sm:p-6">
				<ChartContainer
					config={chartConfig2}
					className="aspect-auto h-[280px] w-full"
				>
					<BarChart
						accessibilityLayer
						data={deploysWithDailyDeploys}
						margin={{
							left: 0,
							right: 0,
						}}
					>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="_id"
							className="text-[11px]"
							tickLine={!false}
							axisLine={false}
							tickMargin={10}
							minTickGap={1}
							tickFormatter={(value) => {
								const date = new Date(value)
								return date.toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
								})
							}}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									className="w-[150px] border rounded-sm dark:border-neutral-700 border-neutral-300"
									labelFormatter={(value) => {
										return new Date(value).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
											year: "numeric",
										})
									}}
								/>
							}
						/>
						<Bar dataKey="count" fill="var(--color-count)" />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
export default ChartDailyDeploys
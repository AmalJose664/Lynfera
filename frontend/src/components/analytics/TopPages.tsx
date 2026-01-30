import { useState } from "react"
import { ImFileText2 } from "react-icons/im";
import { Bar, BarChart, XAxis, YAxis } from "recharts"
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
import { useGetTopPagesQuery } from "@/store/services/analyticsApi"
import { PLANS } from "@/config/plan";

const chartConfig = {
	requests: {
		label: "Requests",
		color: "hsl(var(--chart-1))",
	},
} satisfies ChartConfig

export default function TopPagesChart({ projectId, userPlan }: { projectId: string, userPlan: string }) {
	const [range, setRange] = useState("1d")
	const [limit, setLimit] = useState("10")

	const { data: topPagesData, isLoading: loading, error, isError } = useGetTopPagesQuery({
		projectId, range,
		limit: parseInt(limit),
	})
	const isPremiumUser = userPlan === PLANS.PRO.name
	if (loading) {
		return (
			<Card>
				<CardContent className="flex h-[400px] items-center justify-center">
					<p className="text-muted-foreground">Loading data...</p>
				</CardContent>
			</Card>
		)
	}



	return (
		<Card className="dark:bg-background">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<ImFileText2 className="h-5 w-5" />
							Top Pages
						</CardTitle>
						<CardDescription>Most visited pages by request count</CardDescription>
					</div>
					<div className="flex gap-2">
						<Select value={range} onValueChange={setRange}>
							<SelectTrigger className="w-[120px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent className="dark:bg-background">
								<SelectItem value="1h">Last Hour</SelectItem>
								<SelectItem value="1d">Last 24h</SelectItem>
								<SelectItem value="7d" disabled={!isPremiumUser}>Last 7 Days {!isPremiumUser && <p className="text-xs inline">(Pro user)</p>}</SelectItem>
								<SelectItem value="30d" disabled={!isPremiumUser}>Last 30 Days {!isPremiumUser && <p className="text-xs inline">(Pro user)</p>}</SelectItem>
							</SelectContent>
						</Select>
						<Select value={limit} onValueChange={setLimit}>
							<SelectTrigger className="w-[100px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent className="dark:bg-background">
								<SelectItem value="5">Top 5</SelectItem>
								<SelectItem value="10">Top 10</SelectItem>
								<SelectItem value="20">Top 20</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{isError || !topPagesData || topPagesData.length === 0 ? (
					<div className="dark:bg-background flex-col flex h-[400px] items-center justify-center">
						<p className="text-destructive">
							{(error as any)?.message || (error as { data?: { message?: string } })?.data?.message}
						</p>
						<p className="text-muted-foreground">No page data available</p>
					</div>
				) : (
					<ChartContainer config={chartConfig} className="h-[300px] w-full">
						<BarChart
							accessibilityLayer
							data={topPagesData.slice(0, parseInt(limit))}
							layout="vertical"
							margin={{
								left: 0,
							}}
						>
							<XAxis type="number" dataKey="requests" hide />
							<YAxis
								dataKey="path"
								type="category"
								tickLine={false}
								tickMargin={10}
								axisLine={false}
								width={150}
								tickFormatter={(value) => {

									if (value.length > 25) {
										return "..." + value.slice(-22)
									}
									return value
								}}
							/>
							<ChartTooltip
								cursor={false}
								content={
									<ChartTooltipContent className="dark:border-zinc-700 border-zinc-300"
										hideLabel
										formatter={(value, name, props) => (
											<div className="flex flex-col gap-1">
												<div className="text-xs font-medium">{props.payload.path}</div>
												<div className="flex items-center gap-2">
													<span className="font-bold">{value}</span>
													<span className="text-muted-foreground">requests</span>
												</div>
											</div>
										)}
									/>
								}
							/>
							<Bar
								dataKey="requests"
								fill="var(--color-blue-400)"
								radius={[0, 4, 4, 0]}
							/>
						</BarChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	)
}
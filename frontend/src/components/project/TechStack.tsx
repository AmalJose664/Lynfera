import { getStatusBg, isStatusFailure } from "@/lib/moreUtils/combined"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { JSX } from "react"
import { FaAngular, FaReact, FaVuejs } from "react-icons/fa"
import { IoIosCube } from "react-icons/io"
import { SiSolid, SiSvelte, SiVite } from "react-icons/si"

const TechStack = ({ stack, link, status, name }: { stack: string, link: string, name: string, status: string }) => {
	const projectNA = isStatusFailure(status)
	const stacks: Record<string, JSX.Element> = {
		react: (
			<div className={cn(
				projectNA ? "border-red-500" : "border-zinc-800",
				"group relative aspect-video overflow-hidden rounded-xl border bg-zinc-950 transition-all duration-300 hover:border-[#61dafb]/60"
			)}>

				<div className="absolute inset-0 opacity-[0.15] [background-image:linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
				<FaReact className="absolute -bottom-8 -right-8 size-32 text-[#61dafb] opacity-[0.7] transition-all duration-700 group-hover:opacity-[0.08] group-hover:rotate-12" />
				<div className="relative flex h-full flex-col p-6">
					<div className="flex items-center gap-3">
						<div className="h-8 w-[2px] bg-[#61dafb] shadow-[0_0_8px_#61dafb]" />
						<div>
							<span className="block text-[13px] font-black uppercase tracking-widest text-[#61dafb]/80">
								React
							</span>
							<h4 className="text-xl font-bold text-zinc-100 group-hover:text-white transition-colors">
								{name}
							</h4>
						</div>
					</div>

					<div className="mt-auto flex items-center justify-between">
						<div className="flex gap-1">
							{[1, 2, 3, 4, 5, 6, 7, 8, 9, 13, 52, 72].map((i) => (
								<div key={i} className="h-1 w-4 rounded-full bg-zinc-800 group-hover:bg-[#61dafb]/30 transition-colors" />
							))}
						</div>
						<FaReact className="size-4 text-zinc-600 group-hover:text-[#61dafb] group-hover:animate-spin-slow transition-colors" />
					</div>
				</div>
				<LinkOverlay link={link} />
			</div>),
		vite: (<>
			<div className={cn(
				projectNA ? "border-red-500" : "border-transparent",

				"group relative aspect-video overflow-hidden rounded-xl border bg-[#05050a] transition-all duration-500 hover:shadow-[0_0_10px_-3px_#646cff80]"
			)}>

				<div className="absolute inset-[-50%] animate-[spin_6s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_340deg,#646cff_360deg)] opacity-0 transition-opacity duration-500 group-hover:opacity-30" />

				<div className="absolute inset-[1px] rounded-[11px] bg-[#05050a]/95 backdrop-blur-sm" />

				<div className="absolute inset-0 flex items-center justify-center z-10">
					<div className="relative">
						<div className="absolute inset-0 rounded-full bg-[#646cff] blur-xl opacity-20 group-hover:opacity-60 group-hover:scale-150 transition-all duration-500" />


						<SiVite className="relative size-16 text-white drop-shadow-[0_0_15px_rgba(100,108,255,0.5)] transition-all duration-300 group-hover:scale-110 group-hover:text-[#ffc517] group-hover:drop-shadow-[0_0_25px_rgba(255,197,23,0.6)]" />

						<div className="absolute -top-2 -right-2 h-1.5 w-1.5 rounded-full bg-[#ffc517] opacity-0 shadow-[0_0_10px_#ffc517] transition-all duration-300 group-hover:opacity-100 group-hover:-translate-y-2 group-hover:translate-x-2" />
						<div className="absolute -bottom-1 -left-1 h-1 w-1 rounded-full bg-[#ffc517] opacity-0 shadow-[0_0_10px_#ffc517] transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-2 group-hover:-translate-x-2" />
					</div>
				</div>

				<div className="absolute bottom-4 left-4 z-20">
					<h4 className="font-bold text-white tracking-wider group-hover:text-[#a5aaff] transition-colors">
						VITE APP
					</h4>
					<div className="h-[2px] w-0 bg-gradient-to-r from-[#646cff] to-[#ffc517] transition-all duration-300 group-hover:w-full" />
				</div>

				<div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
					<span className="text-[9px] font-mono text-[#ffc517]">{name}</span>
					<div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ffc517]" />
				</div>

				<LinkOverlay link={link} />
			</div>
		</>),
		angular: (<>
			<div className={cn(
				projectNA ? "border-red-500" : "border-white/10",
				"group relative aspect-video overflow-hidden rounded-md bg-black bg-[radial-gradient(circle_at_10%_10%,rgba(221,0,49,0.15)_0%,transparent_50%)] border transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#dd0031]/20"
			)}>
				<div
					className="absolute inset-0 opacity-[0.03] transition-opacity duration-500 group-hover:opacity-[0.07]"
					style={{
						backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cpath fill='%23dd0031' fill-opacity='1' d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.32v12.86l11 6.35 11-6.35V17.32L14 10.97 3 17.32z'/%3E%3C/svg%3E")`,
						backgroundSize: '28px 49px'
					}}
				/>
				<div className="absolute inset-0 opacity-20 transition-opacity duration-500 group-hover:opacity-40">
					<div className="absolute -left-[10%] -top-[10%] h-[60%] w-[60%] rounded-full bg-[#dd0031] blur-[100px]" />
					<div className="absolute -right-[5%] bottom-0 h-[40%] w-[40%] rounded-full bg-[#dd0031]/50 blur-[80px]" />
				</div>

				<div className="relative flex h-full flex-col p-8 z-10">
					<div className="flex items-start justify-between">
						<div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-md">
							<span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/70">
								angular
							</span>
						</div>
					</div>
					<div className="flex flex-1 flex-col items-center justify-center space-y-4">
						<div className="relative">
							<div className="absolute inset-0 scale-150 bg-[#dd0031] opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-40" />
							<FaAngular className="relative size-16 text-white transition-transform duration-500 group-hover:scale-110" />
						</div>

						<div className="text-center">
							<h4 className="text-xl font-black tracking-tighter text-white">
								{name}
							</h4>
						</div>
					</div>
					<div className="mt-auto flex items-center gap-4 text-white/20">
						<div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
						<div className="flex gap-1">
							<div className="h-1 w-1 rounded-full bg-white/40 group-hover:w-5 transition-all duration-300" />
							<div className="h-1 w-4 rounded-full bg-[#dd0031] group-hover:w-10 transition-all duration-300" />
							<div className="h-1 w-1 rounded-full bg-white/40 group-hover:w-5 transition-all duration-300" />
						</div>
						<div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
					</div>
				</div>
				<div className="absolute -right-4 -top-4 h-24 w-24 bg-[#dd0031]/10 blur-3xl" />

				<LinkOverlay link={link} />
			</div>
		</>),
		vuejs: (<>
			<div className={cn(
				projectNA ? "border-red-500" : "border-emerald-900/50",
				"group relative aspect-video overflow-hidden rounded-2xl border bg-[#051e15] transition-all duration-500 hover:border-[#42b883]/50"
			)}>

				<div className="absolute bottom-0 left-0 h-[120%] w-[120%] -translate-x-1/4 translate-y-1/4 rounded-[100%] bg-gradient-to-tr from-[#42b883]/20 to-transparent blur-md transition-transform duration-700 group-hover:translate-y-1/6 group-hover:rotate-12" />
				<div className="absolute bottom-0 right-0 h-[100%] w-[100%] translate-x-1/3 translate-y-1/3 rounded-[100%] bg-gradient-to-tl from-[#35495e]/30 to-transparent blur-md transition-transform duration-700 delay-100 group-hover:translate-y-1/4" />

				<div className="relative flex h-full flex-col justify-between p-6 z-10">
					<div className="flex items-center gap-3 self-start rounded-full bg-[#42b883]/10 pr-4 pl-2 py-1.5 ring-1 ring-[#42b883]/20 backdrop-blur-md transition-all group-hover:bg-[#42b883]/20">
						<FaVuejs className="size-5 text-[#42b883]" />
						<span className="text-xs font-bold text-[#42b883]">Vue.js</span>
					</div>
					<FaVuejs size={280} className="text-[#42b883] absolute z-2 opacity-10 -top-8 right-11" />
					<div className="ml-2 relative z-20">
						<h4 className="text-xl font-bold text-white group-hover:translate-x-2 transition-transform">
							VUE JS
						</h4>
						<p className="text-sm text-emerald-400/70">{name}</p>
					</div>
				</div>
				<LinkOverlay link={link} />
			</div>
		</>),

		solid: (<>
			<div className={cn(
				projectNA ? "border-red-500" : "border-slate-800",
				"group relative aspect-video overflow-hidden rounded-xl border bg-slate-950 transition-all duration-500"
			)}>
				<div className="absolute -right-20 -top-20 h-64 w-64 rotate-45 bg-gradient-to-br from-[#2c4f7c]/20 to-blue-200/10 blur-sm transition-transform duration-700 group-hover:rotate-[60deg] group-hover:scale-110"></div>
				<div className="absolute -left-20 -bottom-20 h-64 w-64 rotate-12 bg-gradient-to-tr from-[#446b9e]/10 to-transparent blur-sm transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110"></div>

				<div className="relative flex h-full flex-col p-6 z-10 bg-gradient-to-b from-transparent to-[#0f172a]/80">
					<div className="h-1 w-12 bg-[#446b9e] mb-auto transition-all duration-500 group-hover:w-24 group-hover:bg-[#2c4f7c]" />

					<div className="flex items-end justify-between">
						<div>
							<h4 className="text-xl font-bold text-white mb-1">
								SolidJS
							</h4>
							<p className="text-[10px] uppercase tracking-wider text-slate-400 group-hover:text-[#446b9e] transition-colors">
								{name}
							</p>
						</div>
						<SiSolid className="size-12 text-[#446b9e] opacity-30 -rotate-12 transition-all duration-500 group-hover:opacity-100 group-hover:rotate-0 group-hover:text-white" />
					</div>
				</div>
				<LinkOverlay link={link} />
			</div>
		</>),
		svelte: (<>
			<div className={cn(
				projectNA ? "border-red-500" : "border-orange-900/40",
				"group relative aspect-video overflow-hidden rounded-xl border bg-[#0f0500] transition-all duration-500 hover:border-[#ff3e00]/60"
			)}>
				<div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ff3e00 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>

				<div className="absolute top-1/2 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#ff3e00]/40 to-transparent transition-all duration-700 group-hover:via-[#ff3e00]" />
				<div className="absolute left-1/3 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-[#ff3e00]/20 to-transparent transition-all duration-700 group-hover:via-[#ff3e00]/60" />

				<div className="relative flex h-full flex-col justify-between p-6 z-10">
					<div className="flex items-start justify-between">

						<div className="rounded-md bg-orange-500/10 p-2 ring-1 ring-orange-500/30 backdrop-blur-md transition-all group-hover:bg-[#ff3e00]/20 group-hover:ring-[#ff3e00] group-hover:shadow-[0_0_15px_#ff3e0030]">
							<SiSvelte className="size-6 text-[#ff3e00]" />
						</div>
						<span className="text-[10px] font-bold uppercase tracking-widest text-orange-700 group-hover:text-orange-500">Cybernetic</span>
					</div>

					<div>
						<h4 className="text-xl font-bold text-white group-hover:text-orange-100 transition-colors">
							Svelte
						</h4>
						<p className="text-sm text-orange-500/70 truncate">{name}</p>
					</div>
				</div>
				<LinkOverlay link={link} />
			</div>
		</>),
	}


	return stacks[stack] || (<div className={cn(
		projectNA ? "ring ring-red-500" : "border-white/20",
		"group relative aspect-video overflow-hidden rounded-lg border bg-black transition-all duration-500 hover:border-white"
	)}>
		<div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
		<div className="relative flex h-full flex-col justify-between p-5 z-10">
			<div className="flex justify-between items-start">
				<div className={cn(getStatusBg(status)[1], "flex items-center gap-2 px-2 py-1 rounded-sm")}>
					<IoIosCube className="size-4 text-black rotate-z-180" />
					<span className="text-[10px] font-bold uppercase text-black tracking-widest">{status}</span>
				</div>
				<IoIosCube size={200} className="text-zinc-400/10 z-10 rotate-z-180 absolute right-[23%]" />
				<div className="h-2 w-2 rounded-full bg-zinc-800  ring-1 ring-white/30 transition-all group-hover:bg-white group-hover:ring-white" />
			</div>
			<div className="relative z-30">
				<p className="font-mono text-[10px] text-zinc-400 mb-1 group-hover:text-white transition-colors">Framework Preview</p>
				<h4 className="text-2xl font-extrabold tracking-tighter text-white leading-none">
					{name}
				</h4>
			</div>
		</div>
		<LinkOverlay link={link} />
	</div>)


}
export default TechStack
const LinkOverlay = ({ link, blur = 1 }: { link: string, blur?: number }) => {
	return (
		<Link
			href={link}
			target="_blank"
			style={{ backdropFilter: `blur(${blur}px)` }}
			className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/20 opacity-0 transition-all duration-300 group-hover:opacity-100"
		>
			<div className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-white ring-1 ring-white/20">
				VISIT
			</div>
		</Link>
	)
}
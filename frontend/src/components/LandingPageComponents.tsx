"use client";
import { motion } from "framer-motion";
import {
	SiReact, SiVuedotjs, SiSvelte,
	SiAngular, SiVite,
	SiSolid
} from "react-icons/si";

const frameworks = [
	{ name: "React", Icon: SiReact, color: "hover:text-[#61DAFB]", border: "hover:border-[#61DAFB]/50" },
	{ name: "Vue", Icon: SiVuedotjs, color: "hover:text-[#42b883]", border: "hover:border-[#42b883]/50" },
	{ name: "Svelte", Icon: SiSvelte, color: "hover:text-[#FF3E00]", border: "hover:border-[#FF3E00]/50" },
	{ name: "Angular", Icon: SiAngular, color: "hover:text-[#DD0031]", border: "hover:border-[#DD0031]/50" },
	{ name: "Solid", Icon: SiSolid, color: "hover:text-[#2c4f7c]", border: "hover:border-[#2c4f7c]/50" },
	{ name: "Vite", Icon: SiVite, color: "hover:text-[#646CFF]", border: "hover:border-[#646CFF]/50" },
];

export const FrameworkGrid = () => {
	return (
		<div className="flex flex-wrap justify-center gap-4 md:gap-8 items-center">
			{frameworks.map((fw, i) => (
				<motion.div
					key={fw.name}
					initial={{ y: 40, opacity: 0 }}
					whileInView={{ y: 0, opacity: 1 }}
					viewport={{ once: true }}
					transition={{
						type: "spring",
						stiffness: 100,
						damping: 15,
						delay: i * 0.1,
					}}
					whileHover={{ y: -5 }}
					className={`
            group relative flex items-center gap-3 px-6 py-3 
            border bg-white dark:bg-black
            transition-all duration-300 ease-out
            ${fw.color} ${fw.border}
            hover:bg-zinc-900/50 hover:shadow-[0_0_30px_-10px_rgba(255,255,255,0.1)]
          `}
				>
					<div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-current pointer-events-none" />

					<fw.Icon className="text-xl md:text-2xl text-zinc-600 group-hover:text-inherit transition-colors duration-300" />

					<span className="text-sm md:text-base font-bold tracking-tight text-zinc-500 group-hover:text-white transition-colors duration-300">
						{fw.name}
					</span>
				</motion.div>
			))}
		</div>
	);
};

import {
	RiGlobalLine, RiStackLine,
	RiShieldCheckLine, RiHistoryLine, RiCommandLine
} from "react-icons/ri";

const features = [
	{
		title: "Global Storage Network",
		desc: "Your content is cached and served to regions worldwide, ensuring low latency for every user.",
		icon: RiGlobalLine,
		className: "md:col-span-2",
		label: "NODE_DISTRIBUTION"
	},
	{
		title: "Manual Deploy",
		desc: "Full control over every push. Direct command-line integration for precision releases.",
		icon: RiCommandLine,
		label: "CLI_CORE"
	},
	{
		title: "Agnostic Tech",
		desc: "Zero-config support for Vue, Svelte, Solid and static sites.",
		icon: RiStackLine,
		label: "COMPAT_LAYER"
	},
	{
		title: "DDoS Protection",
		desc: "Enterprise-grade security baked in. SSL is automatic and free forever. 24/7 mitigation active.",
		icon: RiShieldCheckLine,
		className: "md:col-span-2",
		label: "SEC_SHIELD"
	},
	{
		title: "Instant Rollbacks",
		desc: "Mistake in production? Rollback to any previous deployment state in a single click.",
		icon: RiHistoryLine,
		label: "VERSION_CTRL",
		className: "md:col-span-2"
	},
	{
		title: "Custom Build Settings",
		desc: "Define custom ENV Variables to control build behaviour.",
		icon: RiCommandLine,
		label: "CLI_CORE"
	},
];

export const BentoGrid = () => {

	return (
		<div
			className="grid grid-cols-1 md:grid-cols-3 gap-[2px]  border dark:border-zinc-800 border-zinc-300 
			dark:bg-black dark:hover:bg-white hover:bg-black bg-white transition-colors duration-500">
			{features.map((f, i) => (
				<motion.div
					key={f.title + i}
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ delay: i * 0.1 }}
					className={`group relative bg-background p-8 md:p-10 overflow-hidden ${f.className || ""} `}
				>
					<div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-700 group-hover:border-white transition-colors" />
					<div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-700 group-hover:border-white transition-colors" />

					<div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
						<f.icon size={160} />
					</div>
					<div className="relative z-10 space-y-4">
						<div className="flex items-center justify-between">
							<div className="p-3 bg-white dark:bg-black border group-hover:border-zinc-500 transition-colors">
								<f.icon className="text-2xl text-primary" />
							</div>
							<span className="text-[10px] font-mono text-zinc-600 tracking-widest">{f.label}</span>
						</div>

						<div>
							<h3 className="text-xl font-bold text-primary mb-3 tracking-tight">
								{f.title}
							</h3>
							<p className="text-zinc-500 text-sm leading-relaxed max-w-[280px]">
								{f.desc}
							</p>
						</div>
					</div>

					<motion.div
						initial={{ x: "-100%" }}
						whileHover={{ x: "100%" }}
						transition={{ duration: 0.5, ease: "linear" }}
						className="absolute top-0 left-0 w-full h-[1px] bg-white/20 z-20 pointer-events-none"
					/>
				</motion.div>
			))}
		</div>
	);
};


import { RiTerminalLine, RiShieldLine, RiPulseLine } from "react-icons/ri";

const metrics = [
	{
		title: "Atomic Builds",
		desc: "Immutable deployment artifacts generated from enhanced container environments.",
		icon: RiTerminalLine,
		progress: 45,
		label: "------------------------------------------------------------------------------"
	},
	{
		title: "Seamless Switching",
		desc: "Instantly toggle between deployments. Zero-downtime cutovers guaranteed.",
		icon: RiStackLine,
		progress: 72,
		label: "------------------------------------------------------------------------------"
	},
	{
		title: "Deployment Core",
		desc: "Consistent outputs across all environments for predictable behavior.",
		icon: RiShieldLine,
		progress: 100,
		label: "------------------------------------------------------------------------------"
	}
];

export const InfraGrid = () => {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border dark:border-zinc-800 border-zinc-200 divide-y md:divide-y-0 md:divide-x 
		dark:divide-zinc-800 divide-zinc-200 dark:bg-black bg-white">
			{metrics.map((item, i) => (
				<motion.div
					key={item.title}
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: (i * 0.6) + .1 }}
					className="p-10 group dark:hover:bg-zinc-900/30 hover:bg-zinc-100/30 transition-colors relative"
				>
					<div className="mb-8">
						<item.icon className="text-2xl text-zinc-500  group-hover:text-primary transition-colors" />
					</div>

					<h3 className="text-lg font-bold text-primary mb-4 tracking-tight uppercase">{item.title}</h3>
					<p className="text-zinc-500 text-sm leading-relaxed mb-10 h-20">
						{item.desc}
					</p>

					<div className="relative h-px w-full dark:bg-zinc-800 bg-neutral-300">
						<motion.div
							initial={{ width: 0 }}
							whileInView={{ width: `${item.progress}%` }}
							transition={{ duration: 1.5, delay: 0.5 + i * 0.1 }}
							className="absolute inset-y-0 left-0 dark:bg-white bg-black"
						/>
						<span className="absolute -top-6 right-0 font-mono text-[10px] text-zinc-700 uppercase tracking-widest">
							{item.label}
						</span>
					</div>
				</motion.div>
			))}

			{/* Special Live Metrics Card */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ delay: 0.4 }}
				className="p-10 dark:bg-zinc-950 bg-white relative overflow-hidden"
			>
				<div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:10px_10px]" />

				<div className="relative z-10 space-y-8">
					<div className="flex items-center gap-2 mb-2">
						<RiPulseLine className="text-emerald-500 animate-pulse" />
						<span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">Live_Telemetry</span>
					</div>

					{[
						{ label: "Uptime", val: "99.999%", p: "w-[99.9%]", color: "bg-emerald-500" },
						{ label: "Latency", val: "12ms", p: "w-[15%]", color: "bg-zinc-400" },
						{ label: "Throughput", val: "4.2TB/s", p: "w-[85%]", color: "bg-zinc-400" }
					].map((stat, idx) => (
						<div key={idx} className="space-y-2">
							<div className="flex justify-between font-mono text-[10px] text-zinc-500 uppercase">
								<span>{stat.label}</span>
								<span className="text-zinc-300">{stat.val}</span>
							</div>
							<div className="h-1 dark:bg-zinc-900 bg-zinc-300 overflow-hidden">
								<motion.div
									initial={{ x: "-100%" }}
									whileInView={{ x: "0%" }}
									transition={{ duration: 1, delay: 0.8 + idx * 0.1 }}
									className={`h-full ${stat.p} ${stat.color}`}
								/>
							</div>
						</div>
					))}
				</div>
			</motion.div>
		</div>
	);
};


import { RiSendPlaneFill, RiArrowRightUpLine } from "react-icons/ri";

export const CTAAction = ({ siteName }: { siteName: string }) => {
	return (
		<div className="flex flex-col items-center">
			<motion.div
				initial={{ y: 40, opacity: 0 }}
				whileInView={{ y: 0, opacity: 1 }}
				viewport={{ once: true }}
				transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
				className="w-full max-w-xl"
			>
				<button className="group relative w-full bg-white text-black py-8 px-12 overflow-hidden transition-all duration-500 hover:bg-zinc-200">
					{/* Animated Background Text */}
					<span className="absolute -left-4 top-1/2 -translate-y-1/2 text-8xl font-black text-black/[0.03] pointer-events-none select-none group-hover:left-0 transition-all duration-700">
						EXECUTE
					</span>

					<div className="relative z-10 flex items-center justify-between">
						<div className="flex flex-col items-start text-left">
							<span className="text-[10px] font-mono tracking-[0.3em] uppercase mb-1 opacity-50">System.Initialize()</span>
							<span className="text-2xl font-black tracking-tighter uppercase">Start Deploying Free</span>
						</div>
						<RiSendPlaneFill className="text-3xl group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" />
					</div>

					{/* Border Animation */}
					<div className="absolute inset-0 border-2 border-transparent group-hover:border-black/10 transition-colors" />
				</button>

				<div className="mt-8 flex justify-between items-center px-2">
					<div className="flex items-center gap-4">
						<span className="h-px w-8 bg-zinc-800" />
						<span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
							Join 1,000+ Architects
						</span>
					</div>
					<a href="#" className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 hover:text-white transition-colors uppercase tracking-widest group">
						Documentation <RiArrowRightUpLine className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
					</a>
				</div>
			</motion.div>
		</div>
	);
};
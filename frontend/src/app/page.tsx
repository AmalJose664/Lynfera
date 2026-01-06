import { Footer } from '@/components/GlobalFooter';
import Navbar from '@/components/Navbar';
import RightFadeComponent from '@/components/RightFadeComponent';
import TitleWithLogo from '@/components/TitleWithLogo';
import StatusIcon from '@/components/ui/StatusIcon';
import { SITE_NAME } from '@/config/constants';
import { TargetAndTransition } from 'motion/react';
import * as motion from "motion/react-client"

import Link from 'next/link';
import { IconType } from 'react-icons';
import { BsCpu, BsTerminalFill } from 'react-icons/bs';
import { FaCode, FaDatabase, FaGithub, FaGlobeAmericas } from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';
import { GoZap } from 'react-icons/go';
import { IoIosGitBranch } from 'react-icons/io';
import { IoLayers } from 'react-icons/io5';
import { MdKeyboardCommandKey, MdOutlineCheckCircle, MdOutlineShield } from 'react-icons/md';


export default function Home() {
	return (
		<div className="min-h-screen bg-background text-primary selection:bg-purple-500/30">
			<Navbar className="" showOtherLinks />
			<Hero />
			<Hero2 />
			<Frameworks />
			<Features />
			<CodeSection />
			<BottomBoxes />
			<CTA />
			<Footer />
		</div>
	);
}

const Hero = () => {
	return (
		<div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden ">
			{/* Background Gradients */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-purple-900/20 to-transparent blur-3xl -z-10" />
			<div className="absolute top-20 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -z-10" />
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
				<div className='flex items-center justify-center gap-6 w-full mb-20'>
					<TitleWithLogo useSvg logoClassName='text-3xl' svgClassName='size-9' />
				</div>
			</div>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center ">

				<h1 className="text-5xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b dark:from-white from-zinc-950 to-gray-400 tracking-tight mb-8 max-w-4xl mx-auto leading-tight">
					Develop. Preview. <br />
					<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
						Ship at warp speed.
					</span>
				</h1>

				<p className="text-xl text-less max-w-2xl mx-auto mb-10 leading-relaxed">
					The frontend cloud for React, Vue, and Svelte.
					Instant deployments, automatic scaling,  built for the modern web.
				</p>

				<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
					<Link href={"/signup"} className="w-full sm:w-auto px-8 py-3.5 dark:bg-white bg-black dark:text-black text-white  border rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2">
						Get Started
					</Link>
					<Link href={"/new"} className="w-full sm:w-auto px-8 py-3.5 dark:bg-white bg-black dark:text-black text-white border rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2">
						<FaGithub size={20} />
						Import from GitHub
					</Link>
				</div>

				<div className="relative max-w-4xl mx-auto rounded-xl border border-white/10 bg-black/50 backdrop-blur-md shadow-2xl shadow-purple-900/20 ">
					<div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 dark:bg-background bg-white">
						<div className="w-3 h-3 rounded-full bg-red-500" />
						<div className="w-3 h-3 rounded-full bg-yellow-500" />
						<div className="w-3 h-3 rounded-full bg-green-500" />
						<div className="ml-4 text-xs text-gray-500 font-mono flex items-center gap-2">
							<MdKeyboardCommandKey size={12} /> {SITE_NAME} new — deploy
						</div>
					</div>
					<div className="p-6 text-left font-mono text-sm sm:text-base dark:bg-background bg-white border-t border-primary">
						<div className="space-y-2">
							<div className="flex gap-2">
								<span className="text-green-400">➜</span>
								<span className="text-blue-400">~</span>
								<span className="text-less"> {SITE_NAME} new  deploy</span>
							</div>
							<div className="text-gray-500">Initialized empty Git repository in .git/</div>
							<div className="text-less flex items-center gap-2">
								<motion.span
									initial={{ scale: 0 }}
									whileInView={{ scale: 1 }}
									viewport={{ once: true }}
									transition={{
										delay: 0.6,
										type: "spring",
										stiffness: 200,
										damping: 15,
									}}
									className="text-purple-400 inline-block"
								>
									✔
								</motion.span>

								<motion.span
									initial={{ x: 600, opacity: 0 }}
									whileInView={{ x: 0, opacity: 1 }}
									viewport={{ once: true }}
									transition={{
										delay: 0.55,
										duration: 1,
										ease: "easeOut",
									}}
								>
									Building project...
								</motion.span>
							</div>

							<div className="text-less flex items-center gap-2">
								<motion.span
									initial={{ scale: 0 }}
									whileInView={{ scale: 1 }}
									viewport={{ once: true }}
									transition={{
										delay: 0.6,
										type: "spring",
										stiffness: 200,
										damping: 15,
									}}
									className="text-purple-400 inline-block"
								>
									✔
								</motion.span>

								<motion.span
									initial={{ x: 600, opacity: 0 }}
									whileInView={{ x: 0, opacity: 1 }}
									viewport={{ once: true }}
									transition={{
										delay: 0.65,
										duration: 1,
										ease: "easeOut",
									}}
								>
									Optimizing assets...
								</motion.span>
							</div>

							<div className="text-less flex items-center gap-2">
								<motion.span
									initial={{ scale: 0 }}
									whileInView={{ scale: 1 }}
									viewport={{ once: true }}
									transition={{
										delay: 0.6,
										type: "spring",
										stiffness: 200,
										damping: 15,
									}}
									className="text-purple-400 inline-block"
								>
									✔
								</motion.span>
								<motion.span
									initial={{ x: 600, opacity: 0 }}
									whileInView={{ x: 0, opacity: 1 }}
									viewport={{ once: true }}
									transition={{
										delay: 0.75,
										duration: 1,
										ease: "easeOut",
									}}
								>
									Uploading to Servers...
								</motion.span>
							</div>
							<motion.div initial={{ y: 100, opacity: 0 }}
								whileInView={{ y: 0, opacity: 1 }}
								viewport={{ once: true, amount: .5 }}
								transition={{
									delay: 0.1,
									duration: .4,
									ease: "easeInOut",
								}} className="mt-4 p-3 bg-white/5 border border-white/10 rounded border-l-4 border-l-green-500">
								<div className="text-green-400 font-bold mb-1">Deployment Complete! 🚀</div>
								<div className="text-gray-400">
									Preview: <Link href="#" className="text-blue-400 hover:underline">https://{SITE_NAME.toLowerCase()}-app-xi82.{SITE_NAME.toLowerCase()}.app</Link>
								</div>
							</motion.div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const Hero2 = () => {
	return (
		<main className="max-w-[1400px] mx-auto pt-24 pb-32 px-6 lg:px-12 relative">
			<div className="grid lg:grid-cols-12 gap-16 items-center">

				<div className="lg:col-span-7 relative z-10 ">
					<motion.h1 initial={{ y: -100, opacity: 0 }} whileInView={{ x: 0, y: 0, opacity: 1 }}
						viewport={{ once: true, amount: 0.3 }} transition={{
							duration: .7, delay: .2,
							ease: [0.25, 0.1, 0.25, 1],
						}} className="text-2xl lg:text-5xl font-bold mb-8 leading-tight text-primary">
						A platform built for <span className="text-sky-500">Frontend Performance.</span>
					</motion.h1>
					<motion.p initial={{ y: 100, opacity: 0 }} whileInView={{ x: 0, y: 0, opacity: 1 }}
						viewport={{ once: true, amount: 0.3 }} transition={{
							duration: .7, delay: .2,
							ease: [0.25, 0.1, 0.25, 1],
						}} className="text-xl text-less max-w-2xl mb-12 leading-relaxed">
						Fast hosting, smooth builds, and everything your app needs to run worldwide.
					</motion.p>
				</div>

				<div className="lg:col-span-5 relative h-[500px] hidden lg:block">
					<div className="w-full h-full bg-slate-90/50 border border-neutral-800 relative overflow-hidden p-8 backdrop-blur-sm">
						<div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[2rem_2rem]"></div>

						<motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }}
							viewport={{ once: true, amount: 0.1 }} transition={{
								duration: 1.3, delay: .0,
								ease: [0.25, 0.1, 0.25, 1],
							}} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-slate-950 border-2 border-slate-700 flex items-center justify-center  z-20 shadow-2xl">
							<div className="absolute inset-2 bg-blue-500/5 border border-blue-500/20 animate-pulse"></div>
							<BsCpu className="w-24 h-24 text-slate-600" />
							<div className="absolute top-0 left-1/2 w-[2px] h-full bg-linear-to-b from-transparent via-blue-500/50 to-transparent -z-10"></div>
							<div className="absolute top-1/2 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-blue-500/50 to-transparent -z-10"></div>
						</motion.div>
						<motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }}
							viewport={{ once: true, amount: 0.1 }} transition={{
								duration: 1.3, delay: .2,
								ease: [0.25, 0.1, 0.25, 1],
							}} className="absolute top-16 left-16 w-16 h-16 bg-slate-950 border border-slate-700 flex flex-col items-center justify-center z-10">
							<FaGlobeAmericas className="w-6 h-6 text-slate-500 mb-1" />
							<span className="text-[10px] font-mono uppercase text-slate-500">Edge</span>
						</motion.div>
						<svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
							<line x1="96" y1="96" x2="50%" y2="50%" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
							<line x1="calc(100% - 96px)" y1="calc(100% - 96px)" x2="50%" y2="50%" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
						</svg>

						<motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }}
							viewport={{ once: true, amount: 0.3 }} transition={{
								duration: .7, delay: .2,
								ease: [0.25, 0.1, 0.25, 1],
							}} className="absolute bottom-16 right-16 w-16 h-16 bg-slate-950 border border-slate-700 flex flex-col items-center justify-center z-10">
							<FaDatabase className="w-6 h-6 text-slate-500 mb-1" />
							<span className="text-[10px] font-mono uppercase text-slate-500">Store</span>
						</motion.div>
					</div>
				</div>
			</div>
		</main>
	)
}

const FeatureCard = ({ icon: Icon, title, description, animationObj, className = "" }: {
	icon: IconType, title: string, description: string, animationObj: TargetAndTransition, className?: string
}) => (
	<motion.div initial={animationObj} whileInView={{ x: 0, y: 0, opacity: 1 }}
		viewport={{ once: true, amount: 0.3 }} transition={{
			duration: .7, delay: .2,
			ease: [0.25, 0.1, 0.25, 1],
		}}
		// animate={{ x: 0, y: 0, opacity: 1 }}
		className={`p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors group ${className}`}>
		<div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
			<Icon className="text-purple-400" size={24} />
		</div>
		<h3 className="text-xl font-bold text-primary mb-2">{title}</h3>
		<p className="text-less leading-relaxed">{description}</p>
	</motion.div>
);

const Features = () => {
	return (
		<section className="py-24 bg-background relative overflow-hidden">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-16">
					<h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
						Everything you need to <br />
						<span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-500">
							scale your frontend
						</span>
					</h2>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* Bento Grid Layout */}
					<FeatureCard
						icon={FaGlobeAmericas}
						animationObj={{ y: -100, opacity: 0 }}
						title="Global Storage Network"
						description="Your content is cached and served to regions worldwide, ensuring low latency for every user."
						className="md:col-span-2 bg-linear-to-br from-white/5 to-purple-900/10"
					/>
					<FeatureCard
						icon={IoIosGitBranch}
						animationObj={{ x: 200, opacity: 0 }}
						title="Manual Deploy"
						description="Unfortunately you have to deploy manully for each git push :( ."
					/>
					<FeatureCard
						icon={IoLayers}
						title="Framework Agnostic"
						animationObj={{ x: -200, opacity: 0 }}
						description="Zero-config support for Vue, Svelte and static sites."
					/>
					<FeatureCard
						icon={MdOutlineShield}
						title="DDoS Protection"
						animationObj={{ y: 200, opacity: 0 }}
						description="Enterprise-grade security baked in. SSL is automatic and free forever."
						className="md:col-span-2 from-white/5 to-blue-900/10"
					/>
					<FeatureCard
						icon={GoZap}
						title="Instant Rollbacks"
						animationObj={{ x: -200, y: 100, opacity: 0 }}
						description="Mistake in production? Rollback to any previous deployment in one click."
					/>
				</div>
			</div>
		</section>
	);
};

const Frameworks = () => {
	const frameworks = [
		{ name: "React", color: "hover:text-blue-400" },
		{ name: "Vue", color: "hover:text-green-400" },
		{ name: "Svelte", color: "hover:text-orange-400" },
		{ name: "Angular", color: "hover:text-red-500" },
		{ name: "solid", color: "hover:text-orange-400" },
		{ name: "vite", color: "hover:text-purple-400" },
	];

	return (
		<section className="py-20 border-t border-b dark:bg-background bg-white ">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
				<p className="text-sm font-semibold text-less uppercase tracking-wider mb-8">
					Works with your favorite tools
				</p>
				<div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-70">
					{frameworks.map((fw, i) => (

						<motion.div initial={{ y: -100, opacity: 0, scale: .8 }} whileInView={{ x: 0, y: 0, opacity: 1, scale: 1 }}
							viewport={{ once: true, amount: 0.3 }}
							transition={{
								type: "spring",
								stiffness: 120,
								damping: 18,
								mass: 0.6,
								delay: 0.3 * i,
							}}
							key={fw.name} className={`text-2xl font-bold rounded-md text-less border hover:border-white border-transparent px-4 py-2 transition-colors cursor-default ${fw.color}`}>
							{fw.name}
						</motion.div>

					))}
				</div>
			</div>
		</section>
	);
};

const CodeSection = () => {
	return (
		<section className="py-24 relative overflow-hidden">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
					<div>
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-sm text-purple-400 mb-6">
							<FaCode size={16} />
							<span>Developer Experience</span>
						</div>
						<h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6">
							Preview every commit. <br />
							Collaborate instantly.
						</h2>

						<ul className="space-y-4">
							{[
								"Automatic HTTPS for every deployment",
								"Instant cache invalidation",
								"Serverless Functions not built-in"
							].map((item, i) => (
								<RightFadeComponent key={i} inView delay={.2 * i}>
									<li className="flex items-center gap-3 text-less">
										<MdOutlineCheckCircle className="text-green-500" size={20} />
										{item}
									</li>
								</RightFadeComponent>
							))}
						</ul>
					</div>

					<div className="relative">
						<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -z-10" />

						<div className="rounded-xl border border-white/10 bg-[#0d1117] overflow-hidden shadow-2xl">
							<div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
								<div className="flex items-center gap-2">
									<FaGithub size={16} className="text-gray-400" />
									<span className="text-sm text-gray-300 font-mono">{SITE_NAME}/website</span>
								</div>
								<div className="text-xs text-gray-500">Pull Request #42</div>
							</div>

							<div className="p-4 space-y-4">
								<div className="flex gap-3">
									<div className="mt-1">
										<div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs text-primary font-bold">
											{SITE_NAME.slice(0, 1)}
										</div>
									</div>
									<RightFadeComponent inView delay={.2} className='flex-1'>
										<div className="bg-white/5 rounded-lg p-3 border flex items-center gap-4 border-white/10">
											<p className="text-sm text-white">
												Install Complete
											</p>
											<StatusIcon status='READY' />
										</div>
									</RightFadeComponent>
								</div>
								<div className="flex gap-3">
									<div className="mt-1">
										<div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs text-primary font-bold">
											{SITE_NAME.slice(0, 1)}
										</div>
									</div>
									<RightFadeComponent inView delay={.4} className='flex-1'>
										<div className="bg-white/5 rounded-lg p-3 border flex items-center gap-4 border-white/10">
											<p className="text-sm text-white">
												Build Complete
											</p>
											<StatusIcon status='READY' />
										</div>
									</RightFadeComponent>
								</div>

								<div className="flex gap-3">
									<div className="mt-1">
										<div className="w-8 h-8 rounded-lg bg-linear-to-tr from-blue-500 to-purple-600 flex items-center justify-center">
											<span className="text-white font-bold text-xs">{SITE_NAME.slice(0, 1)}</span>
										</div>
									</div>

									<RightFadeComponent inView delay={.6} className='flex-1'>
										<div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
											<div className="p-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
												<span className="text-sm font-bold text-white">{SITE_NAME}</span>
												<span className="text-xs text-gray-500">Just now</span>
											</div>
											<div className="p-3">
												<p className="text-sm text-gray-300 mb-3">
													Deployment successful! Here is your preview:
												</p>
												<div className="flex items-center gap-3 p-2 bg-black/30 rounded border border-white/10 group cursor-pointer hover:border-blue-500/50 transition-colors">
													<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
													<span className="text-sm text-blue-400 font-mono truncate">
														git-hero-update-{SITE_NAME.toLowerCase()}.app
													</span>
													<FiArrowRight size={14} className="ml-auto text-less group-hover:text-blue-400" />
												</div>
											</div>
										</div>
									</RightFadeComponent>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};


const BottomBoxes = () => {
	return (
		<section className="border-t h-screen flex items-center border-slate-800 dark:bg-slate-900/30 bg-slate-100 relative">
			<div className="max-w-[1400px] mx-auto overflow-y-hidden">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-800 border rounded-md border-slate-800">


					<motion.div initial={{ y: -100, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
						viewport={{ once: true, amount: 0.1 }} transition={{
							duration: .7, delay: 0,
							ease: [0.25, 0.1, 0.25, 1],
						}} className="p-8 lg:p-12 bg-slate-950/50 hover:bg-slate-900 transition-colors group">
						<div className="mb-6">
							<BsTerminalFill className="w-8 h-8 dark:text-slate-500 text-slate-900 group-hover:text-blue-500 transition-colors" />

						</div>
						<h3 className="text-xl font-bold mb-4 text-slate-200">Atomic Builds</h3>
						<p className="text-slate-400 leading-relaxed mb-8">
							Immutable deployment artifacts generated from enhanced container environments. Zero-downtime cutovers guaranteed.
						</p>
						<div className="h-1 w-full bg-slate-800 relative overflow-hidden">
							<div className="absolute inset-y-0 left-0 w-1/3 bg-blue-600/50"></div>
						</div>
					</motion.div>

					<motion.div initial={{ y: -100, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
						viewport={{ once: true, amount: 0.1 }} transition={{
							duration: .7, delay: .4,
							ease: [0.25, 0.1, 0.25, 1],
						}} className="p-8 lg:p-12 bg-slate-950/50 hover:bg-slate-900 transition-colors group">
						<div className="mb-6">
							<IoLayers className="w-8 h-8 dark:text-slate-500 text-slate-900 group-hover:text-blue-500 transition-colors" strokeWidth={1.5} />
						</div>
						<h3 className="text-xl font-bold mb-4 text-slate-200">Seamless Deployment Switching</h3>
						<p className="text-slate-400 leading-relaxed mb-8">
							Switch versions effortlessly whenever you need, Instantly switch between deployments with a single click.
						</p>
						<div className="h-1 w-full bg-slate-800 relative overflow-hidden">
							<div className="absolute inset-y-0 left-0 w-2/3 bg-blue-600/50"></div>
						</div>
					</motion.div>

					<motion.div initial={{ y: -100, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
						viewport={{ once: true, amount: 0.1 }} transition={{
							duration: .7, delay: .8,
							ease: [0.25, 0.1, 0.25, 1],
						}} className="p-8 lg:p-12 bg-slate-950/50 hover:bg-slate-900 transition-colors group">
						<div className="mb-6">
							<MdOutlineShield className="w-8 h-8 dark:text-slate-500 text-slate-900 group-hover:text-blue-500 transition-colors" strokeWidth={1.5} />
						</div>
						<h3 className="text-xl font-bold mb-4 text-slate-200">Deployment-focused</h3>
						<p className="text-slate-400 leading-relaxed mb-8">
							Atomic builds across all environments. Ensures consistent outputs and predictable deployment behavior.
						</p>
						<div className="h-1 w-full bg-slate-800 relative overflow-hidden">
							<div className="absolute inset-y-0 left-0 w-full bg-blue-600/50"></div>
						</div>
					</motion.div>

					<motion.div initial={{ y: -100, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
						viewport={{ once: true, amount: 0.1 }} transition={{
							duration: .7, delay: 1,
							ease: [0.25, 0.1, 0.25, 1],
						}} className="p-8 lg:p-12 bg-slate-950 relative overflow-hidden">
						<div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] bg-size-[16px_16px]"></div>
						<h3 className="font-mono uppercase text-sm text-blue-500 mb-6 tracking-wider">Live Metrics</h3>
						<div className="space-y-6 font-mono">
							<div>
								<div className="flex justify-between text-sm text-slate-500 mb-1"><span>Uptime</span><span>99.999%</span></div>
								<div className="h-2 bg-slate-800"><motion.div initial={{ width: "0%" }} whileInView={{ width: "99%" }}
									viewport={{ once: true, amount: 0.1 }} transition={{
										duration: .7, delay: 1.3,
										ease: [0.25, 0.1, 0.25, 1],
									}} className="h-full  bg-blue-500"></motion.div></div>
							</div>
							<div>
								<div className="flex justify-between text-sm text-slate-500 mb-1"><span>Avg Latency</span><span>42ms</span></div>
								<div className="h-2 bg-slate-800"><motion.div initial={{ width: "0%" }} whileInView={{ width: "30%" }}
									viewport={{ once: true, amount: 0.1 }} transition={{
										duration: .7, delay: 1.34,
										ease: [0.25, 0.1, 0.25, 1],
									}} className="h-full  bg-slate-400"></motion.div></div>
							</div>
							<div>
								<div className="flex justify-between text-sm text-slate-500 mb-1"><span>Requests/sec</span><span>2.1M</span></div>
								<div className="h-2 bg-slate-800"><motion.div initial={{ width: "0%" }} whileInView={{ width: "80%" }}
									viewport={{ once: true, amount: 0.1 }} transition={{
										duration: .7, delay: 1.39,
										ease: [0.25, 0.1, 0.25, 1],
									}} className="h-full  bg-slate-400"></motion.div></div>
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	)
}

const CTA = () => {
	return (
		<section className="py-24 relative overflow-hidden">
			<div className="absolute inset-0 bg-linear-to-b from-transparent to-purple-900/20 pointer-events-none" />
			<div className="max-w-4xl mx-auto px-4 text-center relative z-10">
				<h2 className="text-4xl sm:text-5xl font-bold text-primary mb-8 tracking-tight">
					Ready to launch?
				</h2>
				<p className="text-xl text-less mb-10 max-w-2xl mx-auto">
					Join 1+ developers building the future of the web with {SITE_NAME}.
					Start for free, scale when you need to.
				</p>
				<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
					<Link href="/new" className="w-full border sm:w-auto px-8 py-4 bg-background text-primary rounded-full font-bold text-lg hover:bg-secondary transition-colors">
						Start Deploying Free
					</Link>

				</div>
			</div>
		</section>
	);
};



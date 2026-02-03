import { Footer } from '@/components/GlobalFooter';
import Navbar from '@/components/Navbar';
import RightFadeComponent, { VerticalFadeComponent } from '@/components/RightFadeComponent';
import TitleWithLogo from '@/components/TitleWithLogo';
import { SITE_NAME } from '@/config/constants';
import { delay, TargetAndTransition, Variants } from 'motion/react';
import * as motion from "motion/react-client"

import Link from 'next/link';
import { BsActivity, BsCpu } from 'react-icons/bs';
import { FaDatabase, FaGithub, FaGlobeAmericas } from 'react-icons/fa';
import { RiTerminalBoxLine, RiCheckFill, RiExternalLinkLine, RiCommandFill } from 'react-icons/ri';
import { BentoGrid, FrameworkGrid, InfraGrid, } from "../components/LandingPageComponents";
import { IoPaperPlaneOutline } from 'react-icons/io5';


export default function Home() {
	return (
		<div className="min-h-screen bg-background text-primary selection:bg-primary/30">
			<Navbar className="" showOtherLinks />
			<Hero />
			<Hero2 />
			<Frameworks />
			<Features />
			<BottomBoxes />
			<CTA />
			<Footer />
		</div>
	);
}

const Hero = () => {
	return (
		<div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
			{/* Background Gradients */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-purple-900/20 to-transparent blur-3xl -z-10" />
			<div className="absolute top-20 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -z-10" />
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
				<VerticalFadeComponent className='flex items-center justify-center gap-6 w-full mb-16'>
					<TitleWithLogo useSvg logoClassName='text-3xl' svgClassName='size-9' />
				</VerticalFadeComponent>
			</div>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center ">
				<motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{
					duration: 0.6,
					delay: .1,
					ease: [0.22, 1, 0.36, 1],
				}}>

					<h2 className="text-5xl mb-8 md:text-7xl font-black tracking-tighter text-primary leading-[1.2]">
						Develop. Preview. <br />
						<span className="text-transparent" style={{ WebkitTextStroke: '1px #979797' }}>Ship at warp speed.</span>
					</h2>
				</motion.div>

				<VerticalFadeComponent delay={.3} distance={24}>
					<p className="text-xl text-less max-w-2xl mx-auto mb-10 leading-relaxed">
						The frontend cloud for React, Vue, and Svelte.
						Instant deployments, automatic scaling,  built for the modern web.
					</p>

				</VerticalFadeComponent>
				<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
					<RightFadeComponent delay={.8} left distance={60} duration={.6}>
						<Link href={"/signup"} className="w-full sm:w-auto px-8 py-3.5 dark:bg-white bg-black dark:text-black text-white  border rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
							Get Started
						</Link>
					</RightFadeComponent>
					<RightFadeComponent delay={.6} left distance={60} duration={.6}>

						<Link href={"/new"} className="w-full sm:w-auto px-8 py-3.5 dark:bg-white bg-black dark:text-black text-white border rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
							<FaGithub size={20} />
							Import from GitHub
						</Link>
					</RightFadeComponent>
				</div>

				<div className="max-w-4xl mx-auto border dark:border-zinc-800 border-zinc-200 bg-background 
				dark:shadow-[20px_20px_0px_rgba(39,39,42,0.5)] shadow-[20px_20px_0px_rgba(216,216,213,0.5)] mt-60">
					<div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 dark:bg-zinc-950 bg-zinc-50">
						<div className="flex items-center gap-4">
							<div className="flex gap-1.5">
								<div className="w-2.5 h-2.5 bg-less" />
								<div className="w-2.5 h-2.5 bg-less" />
								<div className="w-2.5 h-2.5 bg-less" />
							</div>
							<div className="text-[10px] font-mono text-zinc-500 flex items-center gap-2 uppercase tracking-widest">
								<RiCommandFill size={12} /> {SITE_NAME} // deploy_log
							</div>
						</div>
					</div>
					<div className="p-8 font-mono text-sm relative">
						<div className="absolute inset-0 opacity-[0.02] pointer-events-none"
							style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '20px 20px' }}
						/>

						<div className="space-y-4 relative z-10">
							<div className="flex gap-3">
								<span className="text-emerald-500">➜</span>
								<span className="text-zinc-600">~</span>
								<span className="text-primary font-bold">{SITE_NAME.toLowerCase()} deploy </span>
							</div>

							<div className="space-y-2 text-zinc-400">
								<div className="flex items-center gap-3">
									<motion.span initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: .6, delay: .1 }}>
										<RiCheckFill className="text-emerald-500" />
									</motion.span>
									<RightFadeComponent left duration={.6} delay={.2} inView><span>Analyzing build manifest...</span></RightFadeComponent>

								</div>
								<div className="flex items-center gap-3">
									<motion.span initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: .6, delay: .1 }}>
										<RiCheckFill className="text-emerald-500" />
									</motion.span>
									<RightFadeComponent left duration={.6} delay={.4} inView><span>Optimizing edge assets [242 files]</span></RightFadeComponent>
								</div>
								<div className="flex items-center gap-3">
									<motion.span initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: .6, delay: .1 }}>
										<RiCheckFill className="text-emerald-500" />
									</motion.span>
									<RightFadeComponent left duration={.6} delay={.5} inView><span>Compressing global cache layers</span></RightFadeComponent>

								</div>
							</div>

							<VerticalFadeComponent top duration={.6} delay={.3} inView className="mt-10 p-6 border border-emerald-900/30 dark:bg-emerald-950/10 bg-emerald-50/10 relative group">
								<div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />

								<div className="flex items-start justify-between">
									<div>
										<div className="text-emerald-500 font-bold mb-2 flex items-center gap-2">
											DEPLOYMENT_COMPLETE
										</div>
										<a href="#" className="inline-flex items-center gap-2 text-primary hover:text-emerald-400 transition-colors border-b border-zinc-800 pb-1">
											https://subdomain.{SITE_NAME}.app <RiExternalLinkLine />
										</a>
									</div>
									<RiTerminalBoxLine className="text-4xl text-emerald-950" />
								</div>
							</VerticalFadeComponent>


							<div className="flex gap-2">
								<span className="text-emerald-500">➜</span>
								<span className="text-zinc-600">~</span>
								<span className="w-2 h-5 bg-primary animate-pulse" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const Hero2 = () => {

	return (
		<main className="relative min-h-screen bg-white dark:bg-zinc-950 overflow-hidden">
			<div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
				style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%23000' fill-rule='evenodd'/%3E%3C/svg%3E")` }}
			/>

			<div className="max-w-[1400px] mx-auto pt-32 pb-32 px-6 lg:px-12 relative z-10">
				<div className="grid lg:grid-cols-12 gap-12 items-center">

					<RightFadeComponent left inView duration={.6} delay={.1} className="lg:col-span-6">
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 mb-6 bg-zinc-50 dark:bg-zinc-900/50">
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-40 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-50"></span>
							</span>
						</div>

						<h1 className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[0.9] text-zinc-900 dark:text-white mb-8">
							Fast by <br />
							<span className="text-transparent bg-clip-text bg-linear-to-r from-zinc-400 via-zinc-900 to-zinc-400 dark:from-zinc-500 dark:via-white dark:to-zinc-500">
								Default.
							</span>
						</h1>

						<motion.p initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: .6, delay: .2 }} className="text-lg text-zinc-600 dark:text-zinc-400 max-w-lg mb-10 leading-relaxed">
							Ship frontend experiences that feel instant. Our edge network compresses time, so your users don't have to wait.
						</motion.p>

						<motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: .6, delay: .4 }} className="flex flex-wrap gap-4">
							<Link href={"/new"} className="px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:scale-105 transition-transform">
								Start Deploying
							</Link>
							<Link href={"/docs"} className=" px-8 py-4 border bg-secondary  text-zinc-900 dark:text-white font-semibold rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
								Documentation
							</Link>
						</motion.div>
					</RightFadeComponent>

					<RightFadeComponent duration={.6} inView delay={.2} className="lg:col-span-6 relative">
						<motion.div
							className="relative aspect-square lg:aspect-video w-full"
						>
							<div className="absolute inset-0 bg-white dark:bg-zinc-900 border  shadow-2xl overflow-hidden">
								<div className="h-8 border-b  flex items-center px-4 gap-1.5">
									<div className="w-2 h-2 rounded-full bg-less" />
									<div className="w-2 h-2 rounded-full bg-less" />
									<div className="w-2 h-2 rounded-full bg-less" />
								</div>

								<div className="p-8 grid grid-cols-2 gap-8">
									<div className="space-y-6">
										<div className="h-2 w-24 bg-zinc-100 dark:bg-zinc-800 rounded" />
										<RightFadeComponent left inView duration={.6} delay={.3} className="h-12 w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 flex items-center px-4">
											<BsActivity className="w-4 h-4 text-zinc-400 mr-3" />
											<div className="h-1 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
												<motion.div
													initial={{ width: 0 }}
													animate={{ width: "85%" }}
													transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
													className="h-full bg-zinc-900 dark:bg-white"
												/>
											</div>
										</RightFadeComponent>
										<div className="grid grid-cols-2 gap-4">
											<RightFadeComponent left delay={.4} inView duration={.6} className="p-4 border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
												<span className="block text-[10px] uppercase text-zinc-500 mb-1">Latency</span>
												<span className="text-xl font-mono font-bold text-zinc-900 dark:text-white">14ms</span>
											</RightFadeComponent>
											<RightFadeComponent left delay={.6} inView duration={.6} className="p-4 border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
												<span className="block text-[10px] uppercase text-zinc-500 mb-1">Uptime</span>
												<span className="text-xl font-mono font-bold text-zinc-900 dark:text-white">99.9%</span>
											</RightFadeComponent>
										</div>
									</div>

									<RightFadeComponent delay={.3} inView duration={.6} className="relative flex items-center justify-center border-l border-zinc-100 dark:border-zinc-800">
										<motion.div
											animate={{ rotate: 360 }}
											transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
											className="w-32 h-32 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-full flex items-center justify-center"
										>
											<BsCpu className="w-10 h-10 text-zinc-900 dark:text-white" />
										</motion.div>
									</RightFadeComponent>
								</div>
							</div>

							<motion.div
								animate={{ y: [0, -20, 0] }}
								transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
								className="absolute -top-6 -right-6 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl hidden lg:block"
							>
								<FaGlobeAmericas className="w-6 h-6 text-zinc-900 dark:text-white" />
							</motion.div>

							<motion.div
								animate={{ y: [0, 20, 0] }}
								transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
								className="absolute -bottom-10 -left-6 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl hidden lg:block"
							>
								<FaDatabase className="w-6 h-6 text-zinc-900 dark:text-white" />
							</motion.div>
						</motion.div>
					</RightFadeComponent>

				</div>
			</div>
		</main>

	);
}


const Features = () => {
	return (
		<section className="py-24 dark:bg-background bg-white relative">

			<div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
				<div className="mb-20">
					<RightFadeComponent left duration={.6} inView className="flex items-center gap-4 mb-6">
						<div className="h-px w-12 bg-white" />
						<span className="text-xs font-bold tracking-[0.5em] uppercase text-zinc-500">Capabilities</span>
					</RightFadeComponent>

					<RightFadeComponent left duration={.6} inView delay={.24}>
						<h2 className="text-5xl md:text-7xl font-black tracking-tighter text-primary leading-[0.9]">
							BUILT FOR <br />
							<span className="text-transparent" style={{ WebkitTextStroke: '1px #52525b' }}>SCALE.</span>
						</h2>
					</RightFadeComponent>
				</div>
				<BentoGrid />
			</div>
		</section>
	);
};

const Frameworks = () => {
	return (
		<section className="relative py-32 bg-background overflow-hidden border-t sm:min-h-[90vh] md:min-h-screen">
			<div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
				<span className="text-[15vw] font-black text-neutral-500/10 tracking-tighter">
					PLUGINS
				</span>
			</div>

			<div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
				<div className="flex flex-col items-center">

					<div className="mb-16 text-center">
						<VerticalFadeComponent top duration={.6} inView>
							<h2 className="text-zinc-500 font-mono text-xs tracking-[0.5em] uppercase mb-4">
								Frameworks
							</h2>
						</VerticalFadeComponent>
						<div className="h-px w-12 bg-zinc-800 mx-auto mb-6" />
						<div >
							<VerticalFadeComponent top duration={.6} inView delay={.3}>
								<p className="text-2xl md:text-4xl font-light text-primary tracking-tight">
									Seamlessly integrates with <br />
								</p>
							</VerticalFadeComponent>
							<VerticalFadeComponent top duration={.6} inView delay={.5}>

								<span className="text-2xl md:text-4xl text-primary tracking-tight font-bold italic">modern standards.</span>
							</VerticalFadeComponent>
						</div>
					</div>
					<FrameworkGrid />
				</div>
			</div>
		</section>

	);
};


const BottomBoxes = () => {
	return (
		<section className="dark:bg-background bg-white py-24 border-t ">
			<div className="max-w-[1400px] mx-auto px-6 lg:px-12">
				<InfraGrid />
			</div>
		</section>
	);
}

const CTA = () => {
	return (

		< section className="py-32 relative overflow-hidden bg-background" >
			< div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

			< div className="absolute inset-0 opacity-[0.03] [mask-image:radial-gradient(ellipse_at_center,black,transparent)] bg-[grid-line:white_1px] bg-[size:40px_40px]" />

			<div className="max-w-4xl mx-auto px-6 text-center relative z-10">
				<VerticalFadeComponent duration={.9} inView distance={100} top>
					<h2 className="text-2xl md:text-4xl font-black text-primary mb-6 tracking-tighter uppercase italic">
						Ready to launch?
					</h2>
				</VerticalFadeComponent>
				<VerticalFadeComponent duration={.9} top inView distance={100} delay={.1}>
					<p className="text-lg md:text-xl text-less mb-12 max-w-xl mx-auto font-medium leading-relaxed">
						Join 1+ developers building the future of the web with <span className="text-primary">{SITE_NAME}</span>.
						<br className="hidden md:block" /> Start for free, scale when you need to.
					</p>
				</VerticalFadeComponent>

				<div className="flex justify-center">
					<VerticalFadeComponent duration={.9} inView distance={100} delay={.2}>
						<Link
							href="/new"
							className="group relative inline-flex items-center justify-center px-10 py-5 bg-white border text-black rounded-xl font-bold text-xl transition-all duration-300 hover:bg-neutral-200 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
						>
							Start Deploying Free
							<IoPaperPlaneOutline className='ml-4' />
						</Link>
					</VerticalFadeComponent>
				</div>
			</div>
			<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
		</section >
	);
};



import React from 'react';
import { FiExternalLink, FiGithub, FiPlus, FiUser } from 'react-icons/fi';
import { BsArrowRight } from 'react-icons/bs';
import { SITE_NAME } from '@/config/constants';
import { Button } from '@/components/ui/button';

const ProjectShowcaseV2 = () => {
	const projects = [
		{
			title: "First Lynfera Project",
			createdBy: "Amal Jose",
			tags: ["Vite", "react"],
			userAvatr: "https://avatars.githubusercontent.com/u/181984974?v=4",
			link: "https://3d-project.lynfera.qzz.io",
			image: "https://res.cloudinary.com/dsxuskwiy/image/upload/v1771247342/preview_first_lynfera_kaquhl.webp"
		},
		{
			title: "Lynfera Root Site",
			createdBy: "Amal Jose",
			tags: ["Vite", "react"],
			link: "https://lynfera.qzz.io",
			userAvatr: "https://avatars.githubusercontent.com/u/181984974?v=4",
			image: "https://res.cloudinary.com/dsxuskwiy/image/upload/v1771247085/preview_j7jsg3.webp"
		}
	];

	return (
		<div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
			<main className="max-w-7xl mx-auto px-6 py-20">
				<div className="pl-6 mb-28 flex items-center w-full flex-col">
					<div className="text-center space-y-2 mb-6">
						<h1 className="text-3xl font-bold tracking-tight">
							Project <span className="text-primary">Showcase</span>
						</h1>
						<p className="text-muted-foreground text-base max-w-2xl mx-auto">
							See what others are building with {SITE_NAME}
						</p>
					</div>
					<div className='relative group'>
						<div
							className="absolute -top-16 left-1/2 -translate-x-1/2 w-44 px-3 py-2 text-sm text-secondary 
								bg-accent-foreground border rounded-md shadow-md 
								opacity-0 invisible
								group-hover:opacity-100 group-hover:visible
								transition-opacity duration-200
								delay-500
								pointer-events-none
								">This feature is currently disabled.
						</div>
						<Button variant={"outline"} className='duration-200! dark:bg-white bg-neutral-950 group cursor-not-allowed!' >
							<span
								className="relative flex items-center gap-2 dark:text-black text-white group-hover:text-primary!">
								<FiPlus className="text-lg" />
								Showcase Your Project
							</span>
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
					{projects.map((project, index) => (
						<div
							key={index}
							className="group flex flex-col bg-card border border-border overflow-hidden rounded-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 ease-out"
						>
							<div className="relative aspect-video bg-muted overflow-hidden">
								{project.image ? (
									<img
										src={project.image}
										alt={project.title}
										className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-background italic text-muted-foreground/30 text-sm">
										Screenshot Placeholder
									</div>
								)}

								<a
									href={project.link} target='_blank'
									className="absolute inset-0 bg-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]"
								>
									<span className="border bg-background text-primary px-4 py-2 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform">
										<FiExternalLink />
									</span>
								</a>
							</div>

							<div className="p-6">
								<div className="flex justify-between items-start mb-4">
									<div>
										<h3 className="text-xl mb-1 group-hover:text-primary transition-colors">
											{project.title}
										</h3>
										<div className="flex items-center gap-1.5 text-muted-foreground text-sm tracking-wider font-semibold mt-2">
											<img className='h-5 w-5 rounded-full' src={project.userAvatr} alt="" />
											<span>{project.createdBy}</span>
										</div>
									</div>
								</div>

								<div className="flex flex-wrap gap-2 mt-auto">
									{project.tags.map((tag) => (
										<span
											key={tag}
											className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-border text-muted-foreground group-hover:border-primary/30 transition-colors"
										>
											#{tag}
										</span>
									))}
								</div>
							</div>
						</div>
					))}
				</div>
			</main>
		</div>
	);
};

export default ProjectShowcaseV2;
import { toast } from "sonner";
type ToastType = "success" | "error" | "info" | "message" | "warning";

import { RxCheckCircled, RxCross2 } from "react-icons/rx";
import { BsInfoSquare } from "react-icons/bs";
import { TiMessages } from "react-icons/ti";
import { BiSolidError } from "react-icons/bi";
import { ReactElement } from "react";
import { MdError, MdOutlineError } from "react-icons/md";
import { IoIosArrowRoundForward, IoIosCloud } from "react-icons/io";

const themeConfigOr = {
	success: {
		icon: <RxCheckCircled className="text-emerald-500" />,
		label: "Success",
		bg: "bg-emerald-500/5",
		text: "text-emerald-700 dark:text-emerald-400",
		border: "dark:border-zinc-700 border-zinc-200 ",
	},
	error: {
		icon: <MdError className="text-rose-500" />,
		label: "Error",
		bg: "bg-rose-500/5",
		text: "text-rose-700 dark:text-rose-400",
		border: "dark:border-red-500/60 border-red-400 ",
	},
	info: {
		icon: <BsInfoSquare className="text-sky-500" />,
		label: "Notice",
		bg: "bg-sky-500/5",
		text: "text-sky-700 dark:text-sky-400",
		border: "dark:border-zinc-700 border-zinc-200 ",
	},
	warning: {
		icon: <BiSolidError className="text-amber-500" />,
		label: "warning",
		bg: "bg-amber-500/5",
		text: "text-amber-700 dark:text-amber-400",
		border: "dark:border-amber-500/60 border-amber-400 ",
	},
	message: {
		icon: <TiMessages className="text-primary" />,
		label: "Message",
		bg: "bg-white",
		text: "text-neutral-700 dark:text-neutral-300",
		border: "dark:border-zinc-700 border-zinc-200 ",
	},
};

export const OrbitalPillToast = ({ t, message, description, type, CustomIcon }: {
	t: string | number, message: string, description?: string, type: ToastType,
	CustomIcon?: ReactElement
}) => {
	const theme = themeConfigOr[type];
	return (
		<div className={`group flex min-w-[336px] items-center gap-3 rounded-md border 
      ${theme.bg} p-1.5 pl-2 pr-3 shadow-lg backdrop-blur-xl transition-all 
      hover:shadow-xl ${theme.border} dark:bg-zinc-900/60`}>
			<div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full 
        shadow-sm transition-transform group-hover:scale-110 `}>
				<span className="text-base">{theme.icon}</span>
			</div>
			<div className="flex flex-1 flex-col gap-2 overflow-hidden py-1 pb-3">
				<div className="flex items-center gap-2.5">
					<span className={`text-[9px] font-bold uppercase tracking-widest ${theme.text}`}>
						{theme.label}
					</span>
					{description && <div className="h-3 w-[1px] bg-zinc-300 dark:bg-zinc-700" />}
					<h3 className={`truncate text-[14px] font-semibold ${theme.text}`}>
						{description ? message : ""}
					</h3>
					{CustomIcon}
				</div>
				{(description || message) && (
					<p className="text-[13.5px] text-primary">
						{description ? description : message}
					</p>
				)}
			</div>

			<button
				onClick={() => toast.dismiss(t)}
				className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-black/5 hover:text-zinc-600 dark:hover:bg-white/5 dark:hover:text-zinc-200"
			>
				<RxCross2 size={14} />
			</button>
		</div>
	);
};


export const showToast = {
	message: (message: string, description?: string, CustomIcon?: ReactElement) => {
		return toast.custom((t) => (
			<OrbitalPillToast t={t} type="message" message={message} description={description} CustomIcon={CustomIcon} />
		));
	},
	success: (message: string, description?: string, CustomIcon?: ReactElement) => {
		return toast.custom((t) => (
			<OrbitalPillToast t={t} type="success" message={message} description={description} CustomIcon={CustomIcon} />
		));
	},
	error: (message: string, description?: string, CustomIcon?: ReactElement) => {
		return toast.custom((t) => (
			<OrbitalPillToast t={t} type="error" message={message} description={description} CustomIcon={CustomIcon} />
		));
	},
	warning: (message: string, description?: string, CustomIcon?: ReactElement) => {
		return toast.custom((t) => (
			<OrbitalPillToast t={t} type="warning" message={message} description={description} CustomIcon={CustomIcon} />
		));
	},
	info: (message: string, description?: string, CustomIcon?: ReactElement) => {
		return toast.custom((t) => (
			<OrbitalPillToast t={t} type="info" message={message} description={description} CustomIcon={CustomIcon} />
		));
	},
};
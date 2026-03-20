import clsx from "clsx";
import { GoCheckCircleFill, GoXCircleFill } from "react-icons/go";
import { IoAlertCircleSharp } from "react-icons/io5";
import { FaRegCirclePause } from "react-icons/fa6";

const StatusIcon = ({ status, className }: { status: string, className?: string }) => {

	switch (status) {
		case 'READY':
			return <GoCheckCircleFill className={clsx("text-emerald-500", className)} size={18} />;
		case 'FAILED':
			return <GoXCircleFill className={clsx("text-red-500", className)} size={18} />;
		case 'CANCELLED':
			return <GoXCircleFill className={clsx("text-red-500", className)} size={18} />;
		case 'BUILDING':
			return <IoAlertCircleSharp className={clsx("text-amber-500 round-animation", className)} size={20} />;
		case 'QUEUED':
			// return <MdTableRows className={clsx("text-amber-300  round-animation", className)} size={18} />;

			return <AnimationQueued />;
		case 'NOT_STARTED':
			return <FaRegCirclePause className={clsx("dark:text-neutral-300 text-neutral-300", className)} size={18} />;
		default:
			return null;
	}
};
export default StatusIcon

const AnimationQueued = () => {
	return (
		<div className="container_queued_animation"><div className="line_queued_animation"></div></div>

	)
}
export const AnimationBuild = () => {
	return (
		<div className="container_animtation_progress ml-6">
			<div className="dot_animtation_progress"></div>
			<div className="dot_animtation_progress"></div>
			<div className="dot_animtation_progress"></div>
			<div className="dot_animtation_progress"></div>
		</div>

	)
}


"use client"
import { List, AutoSizer } from 'react-virtualized';
import type { ListRowRenderer, List as ListType } from 'react-virtualized';
import { Log } from "@/types/Log";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { Input } from './ui/input';


import { MdFileDownload, MdTerminal } from "react-icons/md";
import { GoTrash } from "react-icons/go";
import { IoCalendarSharp, IoCloseSharp, IoSearch } from "react-icons/io5";
import { LuRotateCw } from "react-icons/lu";
import { IoIosCube, IoMdCloudDone } from 'react-icons/io';
import { PiHashFill } from "react-icons/pi";

import { ansiConverter } from '@/lib/moreUtils/ansiToHtml';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { clearLogs } from '@/store/slices/logSlice';
import { formatLogTime, getLevelColor } from '@/lib/moreUtils/combined';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { AiOutlineNumber } from 'react-icons/ai';
import { IconType } from "react-icons";

interface LogsComponentProps {
	deploymentId: string,
	refetch: () => void,
	deploymentSpecificLogs?: Log[]
}

export function Logs({ deploymentId, refetch, deploymentSpecificLogs }: LogsComponentProps) {
	const dispatch = useDispatch()

	const logs = useSelector((state: RootState) => state.logs)


	const [filter, setFilter] = useState('all');
	const [selectedLog, setSelectedLog] = useState<number | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [autoScroll, setAutoScroll] = useState(true);
	const listRef = useRef<ListType>(null);

	const currentUsingLogs = deploymentSpecificLogs && deploymentSpecificLogs.length !== 0 ? deploymentSpecificLogs : logs

	useEffect(() => {
		if (autoScroll && listRef.current && filteredLogs.length > 0) {
			listRef.current.scrollToRow(filteredLogs.length - 1);
		}
	}, [logs, autoScroll]);


	const filteredLogs = currentUsingLogs.filter(log => {

		if (!log) return false
		const matchesFilter = filter === 'all' || log.level === filter;
		const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
			new Date(log.timestamp).toLocaleString().includes(searchTerm);
		return matchesFilter && matchesSearch;
	});


	const downloadLogs = () => {
		if (currentUsingLogs.length === 0) {
			toast.info("No logs found to download")
			return
		}
		const logText = (currentUsingLogs).map(log =>
			`[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`
		).join('\n');

		const blob = new Blob([logText], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `deployment-logs-${Date.now()}.txt`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const clearLog = () => {
		dispatch(clearLogs())
	};


	const getFilterCount = (level: string) => {
		if (level === 'all') return currentUsingLogs.length;
		return currentUsingLogs.filter(log => log.level === level).length;
	};

	const rowRenderer: ListRowRenderer = ({ index, key, style }) => {
		const log = filteredLogs[index];
		const htmlMessage = ansiConverter.toHtml(log.message);
		return (
			<div
				key={key}
				style={style}
				onClick={() => setSelectedLog(index)}
				className={cn("px-2 py-0.5 dark:hover:bg-neutral-800 hover:bg-neutral-300 active:bg-blue-100",
					log.level === "ERROR" && "border-l-2 border-l-red-500/50",
					log.level === "SUCCESS" && "border-l-2 border-l-green-500",
					log.level === "WARN" && "border-l-2 border-l-orange-300/50",
					(selectedLog && selectedLog === index) && "border-y border-primary dark:bg-zinc-600 bg-zinc-300"
				)}
			>
				<div className="flex items-start gap-2 dark:text-xs text-sm font-mono">
					<span className="text-primary shrink-0 mt-[2px]">
						{formatLogTime(log.timestamp)}
					</span>
					<span className={`${getLevelColor(log.level)} uppercase shrink-0 w-16 mt-[2px]`}>
						{log.level}
					</span>
					<span className="dark:text-neutral-200 text-zinc-900   flex-1 break-words leading-relaxed whitespace-nowrap overflow-hidden text-ellipsis "
						dangerouslySetInnerHTML={{ __html: htmlMessage }}>
						{/* {log.message} */}
					</span>
				</div>
			</div>
		);
	};

	return (
		<div className="dark:bg-neutral-950 bg-neutral-200 text-zinc-100 p-1 rounded-md">
			<div className="max-w-full mx-auto relative overflow-y-hidden">
				<SingleLogView selectedLog={selectedLog} setSelectedLog={setSelectedLog} log={filteredLogs[selectedLog || 0]} total={filteredLogs.length} />
				<div className="dark:bg-neutral-950 bg-white border ">
					{/* Header */}
					<div className="border-b  px-3 py-2">
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-2">
								<MdTerminal className="w-4 h-4 text-gray-600" />
								<span className="text-sm font-medium text-gray-400">Logs</span>
							</div>
							<div className="flex gap-1">
								<button
									onClick={refetch}
									className="px-2 py-1 text-xs dark:bg-zinc-900 !duration-200 border rounded-xs  dark:hover:bg-gray-800 hover:bg-gray-200 text-less  flex items-center gap-1"
									title="Refetch Logs"
								>
									<LuRotateCw className="w-3 h-3" />
								</button>
								<button
									onClick={downloadLogs}
									className="px-2 py-1 text-xs dark:bg-zinc-900 !duration-200 border rounded-xs  dark:hover:bg-gray-800 hover:bg-gray-200 text-less "
									title="Download"
								>
									<MdFileDownload className="w-3 h-3" />
								</button>
								<button
									onClick={clearLog}
									className="px-2 py-1 text-xs dark:bg-zinc-900 !duration-200 border rounded-xs  dark:hover:bg-gray-800 hover:bg-gray-200 text-less "
									title="Clear"
								>
									<GoTrash className="w-3 h-3" />
								</button>
							</div>
						</div>

						{/* Filters */}
						<div className="flex gap-2 items-center text-xs">
							<div className="flex gap-1">
								{['all', 'INFO', 'SUCCESS', 'WARN', 'ERROR'].map(level => (
									<button
										key={level}
										onClick={() => setFilter(level)}
										className={`px-2 py-0.5 ${filter === level
											? 'dark:bg-neutral-800 border dark:border-neutral-100 border-neutral-900 bg-gray-400 rounded-sm text-some-less'
											: 'dark:bg-neutral-900 bg-gray-100 text-gray-600 hover:text-gray-900 dark:hover:text-gray-300'
											}`}
									>
										{level} ({getFilterCount(level)})
									</button>
								))}
							</div>

							<div className="flex-1 min-w-48">
								<div className="relative">
									<IoSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-600" />
									<Input
										type="text"
										placeholder="Search..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="w-full h-6 pl-7 pr-2 py-0.5  border border-gray-400 dark:border-gray-800 text-xs text-gray-400 focus:outline-none focus:border-gray-700"
									/>
								</div>
							</div>

							<label className="flex items-center gap-1 text-gray-600 cursor-pointer">
								<input
									type="checkbox"
									checked={autoScroll}
									onChange={(e) => setAutoScroll(e.target.checked)}
									className="w-3 h-3"
								/>
								<span>auto</span>
							</label>
						</div>
					</div>

					<div className="dark:bg-neutral-950 bg-white logs-container-build " style={{ height: '420px' }}>
						{filteredLogs.length === 0 ? (
							<div className="flex items-center justify-center h-full text-gray-700">
								<div className="text-center text-xs">
									<MdTerminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
									<p>No logs</p>
								</div>
							</div>
						) : (
							<AutoSizer>
								{({ height, width }: { height: number, width: number }) => (
									<List
										ref={listRef}
										width={width}
										height={height}
										rowCount={filteredLogs.length}
										rowHeight={24}
										rowRenderer={rowRenderer}
										overscanRowCount={10} className='logs-container-build'
									/>
								)}
							</AutoSizer>
						)}
					</div>

					<div className="border-t  px-3 py-1 dark:bg-neutral-950 bg-white">
						<div className="flex justify-between text-xs text-gray-700">
							<span>{filteredLogs.length} / {currentUsingLogs.length}</span>
							<span>virtualized</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}


const SingleLogView = ({ selectedLog, setSelectedLog, log, total }: { selectedLog: number | null, setSelectedLog: Dispatch<SetStateAction<number | null>>, log: Log, total: number }) => {

	// ai generated  log ui box
	if (!log) {
		return ""
	}
	const increaseLog = () => {
		setSelectedLog((prev) => prev !== null && prev + 1 <= total ? prev + 1 : null)
	}
	const decreaseLog = () => {
		setSelectedLog((prev) => prev !== null && prev - 1 >= 0 ? prev - 1 : null)
	}
	const htmlMessage = ansiConverter.toHtml(log.message || "");
	return (
		<AnimatePresence>
			{selectedLog !== null && (
				(
					<div className="absolute inset-0 z-50 flex flex-col justify-end">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setSelectedLog(null)}
							className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
						/>

						<motion.div
							initial={{ y: "100%" }}
							animate={{ y: 0 }}
							exit={{ y: "100%" }}
							transition={{ type: "spring", damping: 25, stiffness: 300 }}
							className="relative z-10 w-full h-[75%] flex flex-col bg-white dark:bg-background border-t dark:border-zinc-800 border-zinc-200 shadow-2xl rounded-t-xl"
						>
							<div className="flex items-center justify-between px-5 py-3 border-b dark:border-zinc-800 border-zinc-200 shrink-0">
								<div className="flex items-center gap-2">
									<span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Log Details</span>
									<span className={`${getLevelColor(log.level)} px-2 py-0.5 text-[10px] uppercase font-bold tracking-wide rounded-sm`}>
										{log.level}
									</span>
								</div>
								<div className='flex items-center gap-4'>
									<button onClick={decreaseLog} className="text-less hover:text-accent-foreground transition-colors">
										<FiArrowLeft className="w-4 h-4" />
									</button>
									<button onClick={increaseLog}
										className="text-less hover:text-accent-foreground transition-colors">
										<FiArrowRight className="w-4 h-4" />
									</button>
									<button onClick={() => setSelectedLog(null)} className="text-less hover:text-accent-foreground transition-colors">
										<IoCloseSharp className="w-4 h-4" />
									</button>
								</div>
							</div>
							<div className="flex-1 overflow-y-auto p-5">
								<div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6">
									<MetaItem label="Log No." value={selectedLog + 1 + ""} icon={AiOutlineNumber} />
									<MetaItem label="Timestamp" value={formatLogTime(log.timestamp)} icon={IoCalendarSharp} />
									<MetaItem label="Event ID" value={log.event_id} icon={PiHashFill} mono />
									<MetaItem label="Deployment" value={log.deployment_id} icon={IoMdCloudDone} mono />
									<MetaItem label="Project ID" value={log.project_id} icon={IoIosCube} mono />
								</div>
								<div className="flex flex-col gap-2">
									<span className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1">
										<MdTerminal className="size-4" /> MESSAGE payload
									</span>
									<div
										dangerouslySetInnerHTML={{ __html: htmlMessage }}
										className="bg-zinc-100 dark:bg-zinc-900 border rounded p-3 font-mono text-xs leading-5 text-some-less break-all whitespace-pre-wrap">
									</div>
								</div>
							</div>
						</motion.div>
					</div>
				)
			)}
		</AnimatePresence>
	)
}


const MetaItem = ({ label, value, icon: Icon, mono }: { label: string, value: string, icon: IconType, mono?: boolean }) => (
	<div className="flex flex-col gap-1 border px-4 py-2 rounded-md">
		<span className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 uppercase">
			<Icon className="size-4 opacity-70" /> {label}
		</span>
		<span className={`text-sm text-primary truncate ${mono ? 'font-mono text-xs' : ''}`}>
			{value}
		</span>
	</div>
);

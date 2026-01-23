import { formatBytes, generateRepoUrls } from "@/lib/moreUtils/combined"
import { useGetDeploymentFilesQuery } from "@/store/services/deploymentApi"

import { FaFolder, FaRegFileAlt, FaDownload } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";
import { CiFolderOn } from "react-icons/ci";

import { memo, useCallback, useMemo, useState } from "react"
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import { TabFilesError, TabFilesLoading, TabFilesNoDeployment } from "@/components/project/TabFilesComponents";
import { cn } from "@/lib/utils";
import { LinkComponent } from "./docs/HelperComponents";
import { Deployment } from "@/types/Deployment";

interface FilesProps {
	projectId: string,
	projectRepo: string,
	deploymentId?: string
	commit?: Deployment['commit'],
	children: React.ReactNode
}
type InputFile = {
	name: string;
	size: number;
};
type FileEntry = {
	name: string;
	size: number;
	fullPath: string;
};
type FileTreeNode = {
	name: string;
	children: Record<string, FileTreeNode>;
	files: FileEntry[];
};
type FileTreeNodeProps = {
	node: FileTreeNode
	depth?: number
	downloadFile: (path: string) => void
}




const FilesComponent = ({ projectId, projectRepo, deploymentId, children, commit }: FilesProps) => {
	const { data: filesData, isLoading, error, isError } = useGetDeploymentFilesQuery({ id: deploymentId || "", params: {} }, {
		skip: !deploymentId
	})


	const files = filesData?.fileStructure?.files || []
	const root = useMemo(() => buildFileTree(files || []), [files]);
	const downloadFile = useCallback(
		async (path: string) => {
			try {
				const protocol = window.location.protocol
				const url = `${protocol}//${process.env.NEXT_PUBLIC_PROXY_SERVER}/extras/download-file/${projectId}/${deploymentId}?filePath=${encodeURIComponent(path)}`
				console.log(url)
				const result = await axios({ url, method: "GET", responseType: 'blob' })
				const fileUrl = window.URL.createObjectURL(result.data);
				const a = document.createElement('a');
				a.href = fileUrl;
				a.download = path.split('/').pop() || 'file';
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				window.URL.revokeObjectURL(fileUrl);

			} catch (error) {
				toast.error("Error on downloading file, file=" + path)
				console.warn("error on downloading file  ", error, path)
			}
		}, [projectId, deploymentId]
	)
	const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');


	if (isLoading) {
		return <TabFilesLoading />
	}
	if (error || isError) {
		return <TabFilesError error={error} />
	}
	if (!deploymentId) {
		return <TabFilesNoDeployment />
	}

	return (
		<div className="">
			<div className="px-6 flex items-center gap-4 py-4 border rounded-md p-4 mb-4 pb-4 bg-neutral-50/50 dark:bg-neutral-900/50">
				<h4 className="font-semibold text-primary">
					Source Files
				</h4>
				<LinkComponent newPage href={commit ? generateRepoUrls(projectRepo, { commitSha: commit.id, tree: true }).tree || projectRepo : projectRepo}>
					view
				</LinkComponent>
			</div>
			<div className="flex items-center justify-between mb-4 pb-4 border rounded-md p-4">
				<div>
					{children}
					<p className="text-sm text-neutral-400">
						{files.length} files • {formatBytes(filesData?.fileStructure?.totalSize || 0)}
					</p>
				</div>

				<div className="flex gap-2 border dark:border-neutral-700 border-neutral-300 rounded p-1">
					<button
						onClick={() => setViewMode('tree')}
						className={`px-3 py-1 text-sm rounded transition ${viewMode === 'tree'
							? 'dark:bg-neutral-700 bg-neutral-300 text-primary'
							: 'text-neutral-400 dark:hover:text-neutral-200 hover:text-neutral-800'
							}`}
					>
						Tree
					</button>
					<button
						onClick={() => setViewMode('list')}
						className={`px-3 py-1 text-sm rounded transition ${viewMode === 'list'
							? 'dark:bg-neutral-700 bg-neutral-300 text-primary'
							: 'text-neutral-400 dark:hover:text-neutral-200 hover:text-neutral-800'
							}`}
					>
						List
					</button>
				</div>
			</div>

			<div className="border rounded-md">
				{viewMode === 'tree' ? (
					<FileTreeNode node={root} downloadFile={downloadFile} />
				) : (
					<div className="space-y-1">
						{files.map((file, index) => (
							<div
								key={index}
								className="flex items-center justify-between gap-4 py-1 px-3 hover:bg-secondary rounded"
							>
								<div className="flex items-center gap-2 flex-1 min-w-0">
									<FaRegFileAlt size={16} className="text-less shrink-0" />
									{file.name.split("/").map((part, i, arr) => {
										const isLast = i === arr.length - 1
										return (
											<span key={i}
												className={cn("text-some-less text-sm truncate max-w-11/12", isLast ? "text-some-less" : "text-blue-500")}
											>{part}{!isLast && " /"}
											</span>
										)
									})}

								</div>
								<span className="text-neutral-500 text-xs shrink-0">
									{formatBytes(file.size)}
								</span>
								<Button onClick={() => downloadFile(file.name)} variant={"outline"} className="text-neutral-500 text-xs">
									<FaDownload className="size-3" />
								</Button>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
export default FilesComponent

const FileTreeNode = memo(({ node, depth = 0, downloadFile }: FileTreeNodeProps) => {
	const [isOpen, setIsOpen] = useState(depth === 0);

	return (
		<div>
			{node.name !== 'root' && (
				<button
					className="flex w-full items-center gap-2 py-1.5 px-2 hover:bg-secondary duration-0! rounded cursor-pointer"
					style={{ paddingLeft: `${depth * 20 + 8}px` }}
					onClick={() => setIsOpen(!isOpen)}
				>
					<span className="text-primary">
						<FiChevronRight size={16} className="transition-all duration-200" style={{ transform: `rotate(${isOpen ? "90" : "0"}deg)` }} />
					</span>
					{isOpen ? <CiFolderOn size={16} className="text-blue-500" /> : <FaFolder size={16} className="text-blue-500" />}

					<span className="text-some-less text-sm">{node.name}</span>
				</button>
			)}

			{isOpen && (
				<>
					{Object.values(node.children).map((child: any) => (
						<FileTreeNode key={child.name} node={child} depth={depth + 1} downloadFile={downloadFile} />
					))}

					{node.files && node.files.map((file: any) => (
						<div
							key={file.fullPath}
							className="flex items-center justify-between gap-2 py-1 px-2 hover:bg-secondary rounded"
							style={{ paddingLeft: `${(depth + 1) * 20 + 8}px` }}
						>
							<div className="flex items-center gap-2 flex-1 min-w-0">
								<FaRegFileAlt size={16} className="text-neutral-400 shrink-0" />
								<span className="text-some-less text-sm truncate">{file.name}</span>
							</div>
							<span className="text-neutral-500 hidden text-xs shrink-0 mr-6 md:block">
								{(file.fullPath)}
							</span>
							<span className="text-neutral-500 text-xs shrink-0">
								{formatBytes(file.size)}
							</span>
							<Button onClick={() => downloadFile(file.fullPath)} variant={"outline"} className="text-neutral-500 text-xs">
								<FaDownload className="size-3" />
							</Button>
						</div>
					))}
				</>
			)}
		</div>
	);
});


const buildFileTree = (files: InputFile[]) => {
	const root: FileTreeNode = { name: "root", children: {}, files: [] }
	files.forEach((file) => {

		const parts = file.name.split("/")
		let current = root
		parts.forEach((part, index) => {
			if (index === parts.length - 1) {
				// its a file, end of string in files[].name
				current.files?.push({ name: part, size: file.size, fullPath: file.name })
			}
			else {
				// its a directory
				if (!current.children[part]) {
					current.children[part] = { name: part, children: {}, files: [] }
				}
				current = current.children[part] // going forward to that children
			}
		})
	})
	return root
}
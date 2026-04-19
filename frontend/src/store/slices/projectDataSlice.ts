import { getLatestCommit, GIT_COMMIT_SEPARATOR } from "@/lib/moreUtils/combined";
import { getBranches } from "@/lib/moreUtils/form";
import { Project } from "@/types/Project";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"

type ProjectDatas = Record<
	string,
	{
		latestCommitId: string | null
		latestCommitMsg: string | null
		isLoading: boolean
		isError: boolean
		error: string | null
	}
>

const initialState: ProjectDatas = {};

export const fetchCommit = createAsyncThunk(
	"projectsDatas/fetchLatestCommit",
	async ({ project }: { project: Project }, { rejectWithValue }) => {
		const commit = await getLatestCommit(project.repoURL, project.branch)
		if (!commit) return rejectWithValue("Failed to get commits");
		return commit
	}
)

const projectDataSlice = createSlice({
	name: "projectDatas",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(fetchCommit.pending, (state, action) => {

			const { project } = action.meta.arg
			if (!project._id) return
			const id = project._id
			if (!state[id]) {
				state[id] = {
					latestCommitId: null,
					latestCommitMsg: null,
					isLoading: true,
					isError: false,
					error: null
				}
				return
			}
			state[id].isLoading = true
			state[id].isError = false
			state[id].error = null

		})
		builder.addCase(fetchCommit.fulfilled, (state, action) => {
			const { project } = action.meta.arg
			if (!project._id) return
			const id = project._id
			const [sha, message] = action.payload.split(GIT_COMMIT_SEPARATOR)
			if (!state[id]) {
				state[id] = {
					latestCommitId: sha,
					latestCommitMsg: message,
					isLoading: false,
					isError: false,
					error: null
				}
				return
			}
			state[id].latestCommitId = sha
			state[id].latestCommitMsg = message
			state[id].isLoading = false
			state[id].isError = false
			state[id].error = null
		})
		builder.addCase(fetchCommit.rejected, (state, action) => {
			const { project } = action.meta.arg
			if (!project._id) return
			const id = project._id
			const error = (action.payload as any) ?? action.error?.message ?? "Unknown error"
			if (!state[id]) {
				state[id] = {
					latestCommitId: null,
					latestCommitMsg: null,
					isLoading: false,
					isError: true,
					error: error
				}
				return
			}
			state[id].isLoading = false
			state[id].isError = true
			state[id].error = error
		})
	}
})


export default projectDataSlice.reducer
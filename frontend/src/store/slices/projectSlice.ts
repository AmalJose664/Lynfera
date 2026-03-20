import { getBranches } from "@/lib/moreUtils/form";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"

interface ProjectState {
	_id: null | string;
	isPrivate: boolean;
	branches: string[];
	repoUrl: null | string;
	branchesLoading: boolean;
	branchesError: string | null;
}

const initialState: ProjectState = {
	_id: null,
	isPrivate: false,
	repoUrl: null,
	branches: [],
	branchesLoading: false,
	branchesError: null,
};

export const fetchBranches = createAsyncThunk(
	"projects/fetchBranches",
	async ({ repoUrl, isPrivate }: { repoUrl: string; isPrivate: boolean }, { rejectWithValue }) => {
		const branches = await getBranches(repoUrl, isPrivate)
		if (!branches || branches.length === 0) return rejectWithValue("Failed to fetch branches");
		return branches
	}
)

const projectSlice = createSlice({
	name: "project",
	initialState,
	reducers: {
		setProjectId: (state, action: PayloadAction<string>) => {
			state._id = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(fetchBranches.pending, (state) => {
			state.branchesLoading = true;
			state.branchesError = null;
		})
		builder.addCase(fetchBranches.fulfilled, (state, action) => {
			state.branchesLoading = false;
			state.branches = action.payload as string[];
			state.repoUrl = action.meta.arg.repoUrl;
		})
		builder.addCase(fetchBranches.rejected, (state, action) => {
			state.branchesLoading = false;
			state.branchesError = action.payload as string;
		})
	}
})

export const { setProjectId } = projectSlice.actions
export default projectSlice.reducer
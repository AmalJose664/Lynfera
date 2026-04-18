import { configureStore } from '@reduxjs/toolkit'
import projectReducer from "./slices/projectSlice"
import projectDataReducer from "./slices/projectDataSlice"
import logsReducer from "./slices/logSlice"

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { projectApis } from './services/projectsApi'
import { deployemntApis } from './services/deploymentApi'
import { logsApis } from './services/logsApi'
import { analyticsApi } from './services/analyticsApi'
import { authApi } from './services/authApi'

export const makeStore = () => {
	return configureStore({
		reducer: {
			project: projectReducer,
			projectData: projectDataReducer,
			logs: logsReducer,
			[projectApis.reducerPath]: projectApis.reducer,
			[deployemntApis.reducerPath]: deployemntApis.reducer,
			[logsApis.reducerPath]: logsApis.reducer,
			[analyticsApi.reducerPath]: analyticsApi.reducer,
			[authApi.reducerPath]: authApi.reducer
		},
		middleware: (gDM) => gDM().concat(
			projectApis.middleware,
			deployemntApis.middleware,
			logsApis.middleware,
			analyticsApi.middleware,
			authApi.middleware
		),
	})
}

export const store = makeStore()
export type AppStore = ReturnType<typeof makeStore>

export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
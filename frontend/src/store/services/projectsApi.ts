import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from "../axiosBaseQuery";
import { Project, ProjectSimpleStatsType, ProjectUsageResults } from '@/types/Project';
import { ProjectFormType } from '@/lib/schema/project';
interface GetProjectsParams {
	limit?: number;
	search?: string;
	page?: number;
	include?: string;
}
export const projectApis = createApi({
	reducerPath: "projectsApi",
	baseQuery: axiosBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_API_SERVER_ENDPOINT as string
	}),
	tagTypes: ['Projects'],
	endpoints: (builder) => ({
		getProjects: builder.query<Project[], GetProjectsParams>({
			query: (params) => ({ url: '/projects', method: 'get', params }),
			transformResponse(baseQueryReturnValue: any) {
				return baseQueryReturnValue.projects as Project[]
			},
			providesTags: ['Projects'],
		}),
		getProjectById: builder.query<Project, { id: string, params: { include?: string } }>({
			query: ({ id, params }) => ({ url: `/projects/${id}`, method: 'get', params }),
			transformResponse(baseQueryReturnValue: any, meta) {
				return baseQueryReturnValue.project as Project
			},
			providesTags: (result, error, { id }) => [{ type: 'Projects', id }]
		}),
		getProjectFull: builder.query<Project, { id: string, params: { include?: string } }>({
			query: ({ id, params }) => ({ url: `/projects/${id}/full`, method: 'get', params }),
			transformResponse(baseQueryReturnValue: any, meta) {
				return baseQueryReturnValue.project as Project
			},
			providesTags: (result, error, { id }) => [{ type: 'Projects', id }]
		}),
		getProjectSettings: builder.query<Project, { id: string }>({
			query: ({ id }) => ({ url: `/projects/${id}/settings`, method: 'get' }),
			transformResponse(baseQueryReturnValue: any, meta) {
				return baseQueryReturnValue.project as Project
			},
			providesTags: (result, error, { id }) => [{ type: 'Projects', id }]
		}),
		createProject: builder.mutation<Project, ProjectFormType>({
			query: (project) => ({
				url: "/projects",
				method: "POST",
				data: project,
			}),
			transformResponse(data: any) {
				return data.project
			},

			invalidatesTags: ["Projects"]
		}),
		deleteProject: builder.mutation<Project, string>({
			query: (projectId) => ({
				url: "/projects/" + projectId,
				method: "DELETE",
			}),
			transformResponse: (data) => {
				return data as Project
			},
			invalidatesTags: (result, error, projectId) => ([
				{ type: "Projects", id: projectId },
				{ type: "Projects", id: "LIST" },
			])
		}),
		updateProject: builder.mutation<Project, Partial<Project>>({
			query: (project) => {
				const fields = { ...project, projectId: project._id }
				delete fields._id
				return {
					url: "/projects/" + project._id,
					method: "PATCH",
					data: fields,
				}
			},
			transformResponse: (data: any) => {
				return data.project as Project
			},
			invalidatesTags: (result, error, project) => ([
				{ type: "Projects", id: project._id },
				{ type: "Projects", id: "LIST" },
			])
		}),
		changeProjectSubdomain: builder.mutation<Project, { projectId: string, newSubdomain: string }>({
			query: (project) => ({
				url: "/projects/" + project.projectId + "/subdomain",
				method: "PATCH",
				data: project,
			}
			),
			transformResponse: (data: any) => {
				return data.project as Project
			},
			invalidatesTags: (result, error, project) => ([
				{ type: "Projects", id: project.projectId },
				{ type: "Projects", id: "LIST" },
			])
		}),
		changeProjectDeployment: builder.mutation<Project, { projectId: string, newDeployment: string }>({
			query: (passedData) => ({
				url: "/projects/" + passedData.projectId + "/deployments",
				method: "PATCH",
				data: { newCurrentDeployment: passedData.newDeployment },
			}),
			transformResponse: (data: any) => {
				return data.project as Project
			},
			invalidatesTags: (result, error, passedData) => ([
				{ type: "Projects", id: passedData.projectId },
				{ type: "Projects", id: "LIST" },
			])
		}),
		getProjectsSimpleStats: builder.query<ProjectSimpleStatsType, string>({
			query: (id) => ({
				url: `/projects/${id}/simple-stats/`,
				method: "GET",
			}),
			keepUnusedDataFor: 20 * 1000,
			transformResponse: (data: any) => {
				return data.stats as ProjectSimpleStatsType
			},
		}),
		getProjectsUsages: builder.query<{ projects: ProjectUsageResults[], deploys: { _id: string, count: number }[] }, void>({
			query: () => ({ url: "/projects/total-usage", method: "GET" }),
			keepUnusedDataFor: 20 * 1000,
			transformResponse: (data: any) => {
				return data as {
					projects: ProjectUsageResults[],
					deploys: { _id: string, count: number }[]
				}
			},
		}),
	})
})


export const {
	useGetProjectsQuery,
	useCreateProjectMutation,
	useGetProjectByIdQuery,
	useDeleteProjectMutation,
	useUpdateProjectMutation,
	useGetProjectFullQuery,
	useGetProjectSettingsQuery,
	useChangeProjectSubdomainMutation,
	useChangeProjectDeploymentMutation,
	useGetProjectsSimpleStatsQuery,
	useGetProjectsUsagesQuery
} = projectApis;


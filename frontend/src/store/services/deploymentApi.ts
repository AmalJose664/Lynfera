import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../axiosBaseQuery";
import { Deployment, DeploymentBasic, DeploymentFilesType } from "@/types/Deployment";

export const deployemntApis = createApi({
	reducerPath: "deployemntsApi",
	baseQuery: axiosBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_API_SERVER_ENDPOINT as string
	}),
	tagTypes: ['Deployments'],
	endpoints: (builder) => ({
		getDeployments: builder.query<{ data: DeploymentBasic[], meta: Record<string, any> }, { params: Record<string, any> }>({
			query: ({ params }) => ({ url: '/deployments', method: 'get', params }),
			transformResponse: (data: any) => {
				return { data: data.deployments, meta: data.pagination }
			},
			providesTags: (result) =>
				result
					? [
						...result.data.map(({ _id }) => ({ type: 'Deployments' as const, _id })),
						{ type: 'Deployments', id: 'LIST' }
					]
					: [{ type: 'Deployments', id: 'LIST' }]
		}),
		getProjectDeployments: builder.query<{ data: DeploymentBasic[], meta: Record<string, any> }, { id: string, params?: Record<string, any> }>({
			query: ({ id, params }) => ({ url: `/projects/${id}/deployments`, method: 'get', params }),
			transformResponse: (data: any) => {
				return { data: data.deployments, meta: data.pagination }
			},
			providesTags: (result, error, { id }) =>
				result
					? [
						...result.data.map(({ _id }) => ({ type: 'Deployments' as const, _id })),
						{ type: 'Deployments', id: `PROJECT_${id}` }
					]
					: [{ type: 'Deployments', id: `PROJECT_${id}` }]

		}),



		getDeploymentById: builder.query<Deployment, { id: string, params: {} }>({
			query: ({ id, params }) => ({ url: '/deployments/' + id, method: 'get', params }),
			transformResponse: (data: any) => {
				return data.deployment
			},
			providesTags: (result, error, { id }) => [{ type: 'Deployments', id }]
		}),
		getDeploymentFiles: builder.query<DeploymentFilesType, { id: string, params: {} }>({
			query: ({ id, params }) => ({ url: '/deployments/' + id + "/files", method: 'get', params }),
			keepUnusedDataFor: 20 * 60,
			transformResponse: (data: any) => {
				return data.deployment
			},
			providesTags: (result, error, { id }) => [{ type: 'Deployments', id: "files__" + id, }]
		}),
		createDeployment: builder.mutation<Deployment, string>({
			query: (projectId) => ({ url: `/projects/${projectId}/deployments`, method: "POST", data: { projectId } }),
			invalidatesTags: (result, error, projectId) => [{ type: 'Deployments', id: 'LIST' }],
		}),
		deleteDeployment: builder.mutation<void, { projectId: string, deploymentId: string }>({
			query: ({ deploymentId, projectId }) => ({ url: `/projects/${projectId}/deployments/${deploymentId}`, method: "DELETE", }),
			invalidatesTags: (result, error, ids) => [{ type: 'Deployments', id: `PROJECT_${ids.projectId}` }, { type: 'Deployments', id: "LIST" }],
		})
	})

})

export const {
	useCreateDeploymentMutation, useGetDeploymentFilesQuery,
	useGetDeploymentByIdQuery, useGetProjectDeploymentsQuery,
	useGetDeploymentsQuery, useDeleteDeploymentMutation
} = deployemntApis
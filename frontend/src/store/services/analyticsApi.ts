import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../axiosBaseQuery";
import { AnalyticsParamsTypes, bandWidthType, platformDistTypes, overviewType, topPagesType } from "@/types/Analytics";

export const analyticsApi = createApi({
	reducerPath: "analyticsApi",
	baseQuery: axiosBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_SERVER_ENDPOINT as string }),
	keepUnusedDataFor: 20 * 60,

	tagTypes: ['Analytics'],
	endpoints: (builder) => ({
		clearAnalytics: builder.mutation<void, { projectId: string }>({
			query: ({ projectId }) => ({ url: `/analytics/${projectId}/clear-data`, method: "POST", }),
			invalidatesTags: ['Analytics']
		}),
		getBandWidth: builder.query<bandWidthType[], AnalyticsParamsTypes>({
			query: ({ projectId, range, interval }) => ({ url: `/analytics/${projectId}/bandwidth?range=${range}&interval=${interval}`, method: 'get' }),
			transformResponse: (data: any) => {
				return data.data
			},
			providesTags: (result, error, { projectId }) => [
				{ type: 'Analytics', id: "bandwidth_" + projectId },
			],

		}),
		getOverview: builder.query<overviewType[], AnalyticsParamsTypes>({
			query: ({ projectId, range, interval }) => ({ url: `/analytics/${projectId}/overview?range=${range}&interval=${interval}`, method: 'get' }),
			transformResponse: (data: any) => {
				return data.data
			},
			providesTags: (result, error, { projectId }) => [
				{ type: 'Analytics', id: "overview_" + projectId },
			],

		}),
		getTopPages: builder.query<topPagesType[], AnalyticsParamsTypes>({
			query: ({ projectId, range, limit }) => ({ url: `/analytics/${projectId}/top-pages?range=${range}&limit=${limit}`, method: 'get' }),
			transformResponse: (data: any) => {
				return data.data
			},
			providesTags: (result, error, { projectId }) => [
				{ type: 'Analytics', id: "pages_" + projectId },
			],

		}),
		getPlatformStats: builder.query<platformDistTypes, AnalyticsParamsTypes>({
			query: ({ projectId, range, limit }) => ({ url: `/analytics/${projectId}/platform-stats?range=${range}&limit=${limit}`, method: 'get' }),
			transformResponse: (data: any) => {
				return data.data
			},
			providesTags: (result, error, { projectId }) => [
				{ type: 'Analytics', id: "osstats_" + projectId },
			],

		}),
	})
})

export const { useGetBandWidthQuery,
	useGetOverviewQuery,
	useGetTopPagesQuery, useClearAnalyticsMutation,
	useGetPlatformStatsQuery, } = analyticsApi
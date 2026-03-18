import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../axiosBaseQuery";
import { GithubAccountResponse, GithubIdsOutput, GithubRepoResponse, User, UserDetailed } from "@/types/User";
import { authApi as api } from "@/store/services/authApi";

export const authApi = createApi({
	reducerPath: "authApi",
	baseQuery: axiosBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_SERVER_ENDPOINT as string }),
	tagTypes: ['Auth'],
	refetchOnMountOrArgChange: false,
	endpoints: (builder) => ({
		getUser: builder.query<User, void>({
			query: () => ({ url: "/auth/me", method: 'get' }),
			keepUnusedDataFor: 7 * 60,
			transformResponse: (data: any) => {
				return data.user
			},
			providesTags: (result, error,) => [{ type: 'Auth', id: "user_data" }]
		}),
		getUserDetailed: builder.query<UserDetailed, void>({
			query: () => ({ url: "/auth/me/full", method: 'get' }),
			keepUnusedDataFor: 7 * 60,

			transformResponse: (data: any) => {
				return data.user
			},
			providesTags: (result, error,) => [{ type: 'Auth', id: "user_data_detailed" }]
		}),
		logout: builder.mutation<{ success: boolean }, void>({
			query: () => ({
				url: "/auth/logout",
				method: "POST",
			}),
			onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
				try {
					await queryFulfilled;
					dispatch(api.util.resetApiState());
				} catch {
					// ignore
				}
			},
			invalidatesTags: [{ type: "Auth" }],
		}),
		getUserGthbInstalions: builder.query<GithubIdsOutput, void>({
			query: () => ({ url: "/auth/me/installation", method: 'get' }),
			keepUnusedDataFor: 7 * 60,

			transformResponse: (data: any) => {
				return data.ids
			},
			providesTags: (result, error,) => [{ type: 'Auth', id: "user_gthb_installation" }]
		}),
		getUserGthbRepos: builder.query<GithubRepoResponse[], void>({
			query: () => ({ url: "/github/repos", method: 'get' }),
			keepUnusedDataFor: 7 * 60,

			transformResponse: (data: any) => {
				return data.repos
			},
			providesTags: (result, error,) => [{ type: 'Auth', id: "user_repos" }]
		}),
		getUserGtbAccount: builder.query<GithubAccountResponse, void>({
			query: () => ({ url: "/github/account", method: 'get' }),
			keepUnusedDataFor: 7 * 60,

			transformResponse: (data: any) => {
				return data.account
			},
			providesTags: (result, error,) => [{ type: 'Auth', id: "user_github_account" }]
		}),

		removeUserGithubApp: builder.mutation<GithubAccountResponse, void>({
			query: () => ({ url: "/webhook/remove", method: 'delete' }),
			invalidatesTags: [
				{ type: 'Auth', id: 'user_github_account' },
				{ type: 'Auth', id: 'user_data_detailed' },
			],
		}),

	}),
})

export const { useGetUserQuery, useGetUserDetailedQuery, useLogoutMutation, useGetUserGtbAccountQuery, useRemoveUserGithubAppMutation,
	useGetUserGthbInstalionsQuery, useGetUserGthbReposQuery } = authApi
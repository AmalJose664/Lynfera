"use client"
import { useGetUserQuery } from "@/store/services/authApi"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const useAuth = () => {
	const router = useRouter()
	const hasCookie = typeof window !== 'undefined' && window.document.cookie.includes('is_Authenticated')

	const { data, isLoading, error, isError } = useGetUserQuery(undefined, { skip: !hasCookie, })
	useEffect(() => {
		if (!hasCookie) {
			router.replace("/login")
			return
		}
		if (!isLoading && (!data)) {
			router.replace("/login")
		}
	}, [data, isLoading, error])

	return { user: data, authLoading: isLoading, hasCookie }
}
export default useAuth
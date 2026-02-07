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
			console.log("Re directing you no cookie",)
			router.replace("/login")
			return
		}
		if (!isLoading && (!data)) {
			console.log("Re directing you no data", !data, !isLoading, error)
			router.replace("/login")
		}
	}, [data, isLoading, error])

	return { user: data, authLoading: isLoading, hasCookie }
}
export default useAuth
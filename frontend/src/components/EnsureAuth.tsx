'use client'
import useAuth from "@/hooks/useAuth"
import { ReactNode, useEffect, useState } from "react"

const EnsureAuth = ({ children }: { children: ReactNode }) => {
	const [mounted, setMounted] = useState(false)
	const { user, authLoading, hasCookie } = useAuth()
	useEffect(() => {
		setMounted(true)
	}, [])
	if (!mounted) return null
	if (!hasCookie) return null
	if (!user && !authLoading) return null
	return <>{children}</>
}
export default EnsureAuth
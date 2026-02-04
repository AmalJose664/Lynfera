import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"


const protectedRoutes = ["/projects", "/login/success", "/deployments", "/resources", "/user", "/new", "/user/plan", "/payment-success"]
const exemptAfterAuthRoutes = ["/login", "/signup"]

function extractCookieValue(cookieHeader: string, name: string): string | undefined {
	const match = cookieHeader.match(new RegExp(`(^| )${name}=([^;]+)`))
	return match ? match[2] : undefined
}
export async function proxy(req: NextRequest) {
	const path = req.nextUrl.pathname
	const cookies = req.cookies
	const accessToken = cookies.get("access_token")?.value
	const refreshToken = cookies.get("refresh_token")?.value

	const cookieHeader = req.headers.get('cookie') || ''
	const accessTokenL = req.cookies.get("access_token")?.value ||
		extractCookieValue(cookieHeader, "access_token")
	const refreshTokenL = req.cookies.get("refresh_token")?.value ||
		extractCookieValue(cookieHeader, "refresh_token")


	console.log("Cookie header:", cookieHeader)
	console.log("Access token:", accessTokenL ? "EXISTS" : "MISSING")
	console.log("Refresh token:", refreshTokenL ? "EXISTS" : "MISSING")
	if (exemptAfterAuthRoutes.includes(path)) {
		if (accessToken && refreshToken) {
			return NextResponse.redirect(new URL("/", req.url))
		}
	}


	if (protectedRoutes.some((route) => path.startsWith(route))) {

		if (!accessToken && !refreshToken) {
			return NextResponse.redirect(new URL("/login", req.url))
		}
		if (accessToken) {
			try {
				const verifyResponse = await fetch(
					`${process.env.NEXT_PUBLIC_API_SERVER_ENDPOINT}/auth/verify`,
					{
						headers: {
							'Cookie': `access_token=${accessToken}`
						},
						credentials: 'include',
						cache: 'no-store'
					}
				)

				if (verifyResponse.ok) {
					return NextResponse.next()
				}
			} catch (error) {
				console.log("Verify error:", error)
			}
		}

		if (refreshToken) {
			try {
				const refreshResponse = await fetch(
					`${process.env.NEXT_PUBLIC_API_SERVER_ENDPOINT}/auth/refresh`,
					{
						method: "POST",
						headers: {
							'Cookie': `refresh_token=${refreshToken}`
						},
						credentials: 'include',
						cache: 'no-store'
					}
				)

				if (refreshResponse.ok) {
					const response = NextResponse.next()

					const setCookieHeaders = refreshResponse.headers.getSetCookie()
					setCookieHeaders.forEach(cookie => {
						response.headers.append('Set-Cookie', cookie)
					})

					return response
				}
			} catch (error) {
				console.log("Refresh error:", error)
			}
		}

		const loginUrl = new URL("/login", req.url)
		const response = NextResponse.redirect(loginUrl)

		// response.cookies.delete("access_token")
		// response.cookies.delete("refresh_token")

		return response
	}
	return NextResponse.next()
}

export const config = {
	matcher: [
		"/projects/:path*",
		"/deployments/:path*",
		"/user/:path*",
		"/login",
		"/signup",
		"/resources",
		"/login/success",
		"/payment-success"
	]
}
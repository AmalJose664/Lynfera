import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"


const protectedRoutes = ["/projects", "/login/success", "/deployments", "/resources", "/user", "/new", "/user/plan", "/payment-success"]
const exemptAfterAuthRoutes = ["/login", "/signup"]

export async function proxy(req: NextRequest) {
	const path = req.nextUrl.pathname
	const cookies = req.cookies
	const authCookie = cookies.get("Is_Authenticated_Client")?.value
	const authCookieTrue = authCookie === "true"
	console.log("Cookie value", authCookie, authCookieTrue)

	if (exemptAfterAuthRoutes.includes(path)) {
		if (authCookie && authCookieTrue) {
			return NextResponse.redirect(new URL("/", req.url))
		}
	}


	if (protectedRoutes.some((route) => path.startsWith(route))) {

		if (!authCookie || !authCookieTrue) {
			return NextResponse.redirect(new URL("/login", req.url))
		}
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
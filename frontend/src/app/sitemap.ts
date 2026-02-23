import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl =
		process.env.NEXT_PUBLIC_APP_URL || "https://app.lynfera.qzz.io"

	const lastModified = new Date("2026-02-23")
	const pages = [
		"/",
		"/login",
		"/signup",
		"/projects",
		"/deployments",
		"/resources",
		"/showcase",
		"/user",
		"/user/plan",
		"/docs",
		"/pricing",
		"/legal/privacy",
		"/legal/terms-of-use",
		"/product"
	]

	const docs = [
		"getting-started",
		"support-and-limits",
		"build-deploy",
		"env-variables",
		"observability",
		"troubleshoot",
	]

	const docsRoutes = docs.map((slug) => ({
		url: `${baseUrl}/docs/${slug}`,
		lastModified: lastModified,
		changeFrequency: "monthly" as const,
		priority: 0.6,
	}))
	const basePages = pages.map((path) => ({
		url: `${baseUrl}${path}`,
		lastModified,
		changeFrequency: "weekly" as const,
		priority: path === "/" ? 1 : 0.7,
	}))
	return [...basePages, ...docsRoutes,]

}

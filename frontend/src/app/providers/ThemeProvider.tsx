'use client';
import { ThemeProvider } from 'next-themes';
export default function ThemeProviderComponent({
	children
}: {
	children: React.ReactNode
}) {

	return <ThemeProvider
		attribute="class"
		defaultTheme="dark"
		enableSystem
		disableTransitionOnChange={false}
	>
		{children}
	</ThemeProvider>
}
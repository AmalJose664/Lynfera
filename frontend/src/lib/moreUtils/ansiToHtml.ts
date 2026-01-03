import AnsiToHtml from "ansi-to-html"
export const ansiConverter = new AnsiToHtml({
	fg: '#D4D4D4',
	bg: '#000000',
	newline: false,
	escapeXML: true,
	stream: false,
	colors: {
		0: '#000000',
		1: '#EF4444', // red
		2: '#22C55E', // green
		3: '#EAB308', // yellow
		4: '#3B82F6', // blue
		5: '#A855F7', // magenta
		6: '#06B6D4', // cyan
		7: '#D4D4D4', // white
		8: '#6B7280', // bright black (gray)
		9: '#F87171', // bright red
		10: '#4ADE80', // bright green
		11: '#FACC15', // bright yellow
		12: '#60A5FA', // bright blue
		13: '#C084FC', // bright magenta
		14: '#22D3EE', // bright cyan
		15: '#F9FAFB', // bright white
	}
})
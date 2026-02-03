import { ENVS } from "@/config/env.config.js";

export const notify = (name: string, email: string, ip: string) => {
	return fetch("https://ping-forge.vercel.app/api/v1/events", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${ENVS.NOTIFY_EVENTS_API_KEY}`,
		},
		body: JSON.stringify({
			category: "lynfera",
			description: "New User",
			fields: {
				name,
				ip,
				email,
			},
		}),
	});
};

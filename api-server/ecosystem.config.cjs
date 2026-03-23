module.exports = {
	apps: [{
		name: "my-express-server",
		script: "./dist/server.js",


		instances: "max",
		exec_mode: "cluster",

		max_memory_restart: "4G",

		env: {
			NODE_ENV: "production",
			PORT: 7860 // Ensure this matches HF's requirements
		},

		autorestart: true,
		watch: false,
		max_restarts: 10,
		restart_delay: 4000
	}]
}
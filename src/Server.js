"use strict"

const database = new (require("./Database"))
const fastify = require("fastify")({logger: {base: {pid: null,hostname: null,name: null},prettyPrint: true}})

const handleShutdown = () => {
	console.log("Server shutting down in 3 seconds...")
	database.handleDropAll().then(result => {
		// Players are dropped
	}).catch((err) => {
		process.exit(1)
	})
	setTimeout(() => { process.exit(0) }, 3000)
}

fastify
	.register(require("fastify-static"), { root: require("path").join(__dirname, "public"), prefix: "/" })
	.register(require("fastify-formbody"))
	.register(require("fastify-helmet"))
	.register(require("fastify-no-cache"))
	.register(require("./Routes"), { database: database })
	.listen(80, (err, address) => {
		process.on("SIGINT",  () => handleShutdown())
		process.on("SIGTERM", () => handleShutdown())
		if (err) throw err
	})
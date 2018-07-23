"use strict"

const schema = {schema: {body: {type: "object",properties: {action: { type: "string" },name: { type: "string" },room: { type: "number" }}}}}

const newPlayer = (database, obj, res) => {
	database.handleNewPlayer(obj).then(result => {
		return handlePlayerData(database, obj.room, res)
	}).catch((err) => { return res.code(200).send("&response=denied") })
}
const updatePlayer = (database, obj, res) => {
	database.handleUpdatePlayer(obj).then(result => {
		return handlePlayerData(database, obj.room, res)
	}).catch((err) => { return res.code(200).send("&response=denied") })
}
const dropPlayer = (database, obj, res) => {
	database.handleDropPlayer(obj.username).then(result => {
		// Player is dropped
	}).catch((err) => { return res.code(200).send("&response=denied") })
}
const handlePlayerData = (database, room, res) => {
	let toPoll = "&players="
	database.getUsernamesInRoom(room).then(result => {
		for (const i in Object.keys(result)) toPoll += `${result[i].username}%7E`
		toPoll += "&"
		database.getAttributesInRoom(room).then(result => {
			for (const i in Object.keys(result)) toPoll += `${result[i].username}=${result[i].attributes}&`
			toPoll += `key=&room=${room}`
			return res.code(200).send(toPoll)
		}).catch((err) => { return res.code(200).send("&response=denied") })
	}).catch((err) => { return res.code(200).send("&response=denied") })
}

module.exports = function (fastify, opts, next) {
	fastify.get("/", (req, res) => { return res.sendFile("index.html") })
	fastify.post("/PChat.php", { schema }, (req, res) => {
		const [action, username, room, data] = [req.body.action, req.body.name, req.body.room, req.body[req.body.name]]
		const obj = { username: username, room: room, data: data }
		if (action == "newplayer") {
			return newPlayer(opts.database, obj, res)
		} else if (action == "update") {
			return updatePlayer(opts.database, obj, res)
		} else if (action == "drop") {
			return dropPlayer(opts.database, obj, res)
		}
	})
	next()
}
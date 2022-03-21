import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const port = process.env.PORT || 6969;
const host = process.env.HOST || "http://localhost";
const app = express();

const httpServer = createServer(app);
let users: any = [];

const addUser = (userId: any, socketId: any) => {
	!users.some((user: { userId: any, socketId: any; }) => user.userId === userId) &&
		users.push({ userId, socketId });
};

const removeUser = (socketId: any) => {
	users = users.filter((user: { userId: any, socketId: any; }) => user.socketId !== socketId);
};

const getUser = (userId: any) => {
	return users.find((user: { userId: any, socketId: any; }) => user.userId === userId);
};
const io = new Server(httpServer, {
	cors: {
		origin: '*',
		methods: ["GET", "POST"],
		credentials: true
	},
	allowEIO3: true,

});

io.on("connection", (socket) => {
	socket.on("addUser", (userId: any) => {
		addUser(userId, socket.id);
		io.emit("getUsers", users);
	});

	socket.on("sendMessage", ({ sender, receiver, content }: { sender: any, receiver: any, content: any }) => {
		console.log(receiver)
		const user = getUser(receiver);
		console.log(user)
		if (user) {
			io.to(user.socketId).emit("getMessage", {
				sender,
				content
			});
		}

	});
	// fetch existing users

	socket.on("disconnect", () => {
		removeUser(socket.id);
		socket.broadcast.emit("user disconnected", socket.id);
	});
});
app.get("/", (_, res) => res.send(`Server is up and running`));

httpServer.listen(port, () => {
	console.log("Server is listening");
	console.log(`${host}:${port}`);
});

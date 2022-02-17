import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const port = process.env.PORT || 6969;
const host = process.env.HOST || "http://localhost";
const corsOrigin = "*";
const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
	cors: {
		origin: corsOrigin,
		credentials: true,
	},
});

let users: any[] = [];

const addUser = (userId: any, socketId: any) => {
	!users.some((user) => user.userId === userId) && users.push({ userId, socketId });
};

const removeUser = (socketId: any) => {
	users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId: any) => {
	return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
	console.log("a user connected.");

    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        io.emit("getUsers", users);
    });

    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
        const user = getUser(receiverId);
        io.to(user.socketId).emit("getMessage", {
          senderId,
          text,
        });
      });
    
      //when disconnect
      socket.on("disconnect", () => {
        console.log("a user disconnected!");
        removeUser(socket.id);
        io.emit("getUsers", users);
      });

});
app.get("/", (_, res) => res.send(`Server is up and running`));

httpServer.listen(port,() => {
	console.log("Server is listening");
	console.log(`${host}:${port}`);
});

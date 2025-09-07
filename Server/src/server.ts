import { MessageHandler } from "./messageHandler.js";
import { DataInfo } from "./dataInfo.js";
import { v4 as uuidv4 } from "uuid";
import { WebSocketServer, WebSocket } from "ws";



const PORT = 3000;
const server = new WebSocketServer({ port: PORT });

// Keep track of connected users
const users = new Map<string, WebSocket>();

server.on("connection", (socket: WebSocket) => {
    let id = uuidv4();
    const messageHandler = new MessageHandler();

    console.log("New client connected");

    socket.on("message", (message) => {
        const text = message.toString();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.warn("Invalid JSON:", text);
            return;
        }
        console.log(data.type);

        const dataInfo = new DataInfo(data, id, socket, users)
        messageHandler.handle(dataInfo)
    });



    socket.on("close", () => {
        const dataInfo = new DataInfo(null, id, socket, users);
        messageHandler.cleanup(dataInfo);
    });


});

console.log(
    `WebSocket signaling server running on ws://localhost:${PORT}`
);

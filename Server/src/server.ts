import { MessageHandler } from "./messageHandler.js";
import { DataInfo } from "./dataInfo.js";
import { v4 as uuidv4 } from "uuid";
import { WebSocketServer, WebSocket } from "ws";
import { LobbyManager } from "./lobbyManager.js";



const PORT = 3000;
const server = new WebSocketServer({ port: PORT });

const users = new Map<string, WebSocket>(); 
const lobbyManager = new LobbyManager();


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

        const dataInfo = new DataInfo(data, id, socket, users, lobbyManager)
        messageHandler.handle(dataInfo)
    });



    socket.on("close", () => {
        const dataInfo = new DataInfo(null, id, socket, users, lobbyManager);
        messageHandler.cleanup(dataInfo);
    });


});

console.log(
    `WebSocket signaling server running on ws://localhost:${PORT}`
);

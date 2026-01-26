import { v4 as uuidv4 } from "uuid";
import { WebSocket, WebSocketServer } from "ws";

import { LobbyManager } from "./lobbyManager";
import { MessageHandler } from "./messageHandler";
import { ServerInfo } from "./serverInfo";
import { ClientMessage } from "../../Shared";

const PORT = 3000;
const server = new WebSocketServer({ port: PORT });

const users = new Map<string, WebSocket>();
const lobbyManager = new LobbyManager();


server.on("connection", (socket: WebSocket) => {
    let id = uuidv4();
    const messageHandler = new MessageHandler();

    console.log("New client connected");

    socket.on("message", (message: MessageEvent) => {
        const text = message.toString();
        let data: ClientMessage;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.warn("Invalid JSON:", text);
            return;
        }

        console.log(data.type);

        const serverInfo = new ServerInfo(id, socket, users, lobbyManager)
        messageHandler.handle(serverInfo, data)
    });

    socket.on("close", () => {
        console.log("Client disconnected");

        const serverInfo = new ServerInfo(id, socket, users, lobbyManager);
        messageHandler.cleanup(serverInfo);
    });
});


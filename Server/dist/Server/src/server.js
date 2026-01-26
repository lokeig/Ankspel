"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const ws_1 = require("ws");
const lobbyManager_1 = require("./lobbyManager");
const messageHandler_1 = require("./messageHandler");
const serverInfo_1 = require("./serverInfo");
const PORT = 3000;
const server = new ws_1.WebSocketServer({ port: PORT });
const users = new Map();
const lobbyManager = new lobbyManager_1.LobbyManager();
server.on("connection", (socket) => {
    let id = (0, uuid_1.v4)();
    const messageHandler = new messageHandler_1.MessageHandler();
    console.log("New client connected");
    socket.on("message", (message) => {
        const text = message.toString();
        let data;
        try {
            data = JSON.parse(text);
        }
        catch (e) {
            console.warn("Invalid JSON:", text);
            return;
        }
        console.log(data.type);
        const serverInfo = new serverInfo_1.ServerInfo(id, socket, users, lobbyManager);
        messageHandler.handle(serverInfo, data);
    });
    socket.on("close", () => {
        console.log("Client disconnected");
        const serverInfo = new serverInfo_1.ServerInfo(id, socket, users, lobbyManager);
        messageHandler.cleanup(serverInfo);
    });
});

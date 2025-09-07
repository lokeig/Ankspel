"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messageHandler_js_1 = require("./messageHandler.js");
const dataInfo_js_1 = require("./dataInfo.js");
const uuid_1 = require("uuid");
const ws_1 = require("ws");
const PORT = 3000;
const server = new ws_1.WebSocketServer({ port: PORT });
// Keep track of connected users
const users = new Map();
server.on("connection", (socket) => {
    let id = (0, uuid_1.v4)();
    const messageHandler = new messageHandler_js_1.MessageHandler();
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
        const dataInfo = new dataInfo_js_1.DataInfo(data, id, socket, users);
        messageHandler.handle(dataInfo);
    });
    socket.on("close", () => {
        const dataInfo = new dataInfo_js_1.DataInfo(null, id, socket, users);
        messageHandler.cleanup(dataInfo);
    });
});
console.log(`WebSocket signaling server running on ws://localhost:${PORT}`);

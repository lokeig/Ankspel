"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerInfo = void 0;
class ServerInfo {
    constructor(id, socket, users, lobbyManager) {
        this.clientID = id;
        this.clientSocket = socket;
        this.lobbyManager = lobbyManager;
        this.users = users;
    }
}
exports.ServerInfo = ServerInfo;

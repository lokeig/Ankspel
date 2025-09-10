"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataInfo = void 0;
class DataInfo {
    constructor(data, id, socket, users, lobbyManager) {
        this.clientID = id;
        this.clientSocket = socket;
        this.data = data;
        this.lobbyManager = lobbyManager;
        this.users = users;
    }
}
exports.DataInfo = DataInfo;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataInfo = void 0;
class DataInfo {
    constructor(data, id, socket, users) {
        this.clientID = id;
        this.clientSocket = socket;
        this.data = data;
        this.connectedUsers = users;
    }
}
exports.DataInfo = DataInfo;

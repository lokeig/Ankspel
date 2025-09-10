"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lobby = void 0;
class Lobby {
    constructor(host) {
        this.connectedUsers = new Set();
        this.host = host;
        this.connectedUsers.add(host);
    }
    setHost(id) {
        this.host = id;
    }
    getHost() {
        return this.host;
    }
    addUser(id) {
        if (this.connectedUsers.size === 0) {
            this.host = id;
        }
        this.connectedUsers.add(id);
    }
    getUsers() {
        return this.connectedUsers;
    }
    setNewHost() {
        const newHost = [...this.connectedUsers][0];
        this.host = newHost;
        return newHost;
    }
    removeUser(id) {
        this.connectedUsers.delete(id);
    }
}
exports.Lobby = Lobby;

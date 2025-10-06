"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lobby = void 0;
class Lobby {
    constructor(name, host) {
        this.connectedUsers = new Set();
        this.host = host;
        this.name = name;
        this.connectedUsers.add(host);
        this.maxSize = 8;
    }
    setHost(id) {
        this.host = id;
    }
    getHost() {
        return this.host;
    }
    getName() {
        return this.name;
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
    setMaxSize(maxSize) {
        this.maxSize = maxSize;
    }
    getMaxSize() {
        return this.maxSize;
    }
}
exports.Lobby = Lobby;

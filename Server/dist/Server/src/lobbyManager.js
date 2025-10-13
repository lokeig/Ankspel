"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LobbyManager = void 0;
const lobby_1 = require("./lobby");
class LobbyManager {
    constructor() {
        this.lobbies = new Map();
        this.hosts = new Map();
        this.userIDToLobbyID = new Map();
    }
    createLobby(lobbyID, lobbyName, lobbySize, host) {
        const lobby = new lobby_1.Lobby(lobbyName, host);
        lobby.setMaxSize(lobbySize);
        this.lobbies.set(lobbyID, lobby);
        this.userIDToLobbyID.set(host, lobbyID);
        this.hosts.set(host, lobby);
    }
    addUser(lobbyID, userID) {
        const lobby = this.lobbies.get(lobbyID);
        if (!lobby) {
            return;
        }
        lobby.addUser(userID);
        this.userIDToLobbyID.set(userID, lobbyID);
    }
    removeUserFromLobby(lobbyID, userID) {
        const lobby = this.lobbies.get(lobbyID);
        if (!lobby) {
            return;
        }
        lobby.removeUser(userID);
        this.userIDToLobbyID.delete(userID);
        if (lobby.getHost() === userID) {
            this.hosts.delete(userID);
            lobby.setNewHost();
        }
        if (lobby.getUsers().size === 0) {
            this.removeLobby(lobbyID);
        }
    }
    getLobby(lobbyID) {
        return this.lobbies.get(lobbyID);
    }
    getUserLobbyID(userID) {
        return this.userIDToLobbyID.get(userID);
    }
    getUsersLobby(userID) {
        const lobbyID = this.userIDToLobbyID.get(userID);
        if (!lobbyID) {
            return undefined;
        }
        return this.lobbies.get(lobbyID);
    }
    removeUser(lobbyID, userID) {
        const lobby = this.lobbies.get(lobbyID);
        if (!lobby) {
            return;
        }
        lobby.removeUser(userID);
        this.userIDToLobbyID.delete(userID);
    }
    removeLobby(lobbyID) {
        this.lobbies.delete(lobbyID);
    }
    getLobbies() {
        return this.lobbies;
    }
}
exports.LobbyManager = LobbyManager;

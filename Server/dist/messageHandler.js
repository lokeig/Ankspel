"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageHandler = void 0;
const ws_1 = require("ws");
const uuid_1 = require("uuid");
class MessageHandler {
    handle(dataInfo) {
        switch (dataInfo.data.type) {
            case "join":
                this.join(dataInfo);
                break;
            case "list-users":
                this.listUsers(dataInfo);
                break;
            case "offer":
            case "answer":
            case "candidate":
                this.forward(dataInfo);
                break;
            case "list-lobbies":
                this.listLobbies(dataInfo);
                break;
            case "join-lobby":
                this.joinLobby(dataInfo, dataInfo.data.lobbyID);
                break;
            case "leave-lobby":
                this.leaveLobby(dataInfo);
                break;
            case "host-lobby":
                this.hostLobby(dataInfo, dataInfo.data.lobbyName, dataInfo.data.lobbySize);
                break;
            case "start-lobby":
                this.startLobby(dataInfo);
                break;
            default:
                console.warn("Unknown message type:", dataInfo.data.type);
        }
    }
    join(dataInfo) {
        dataInfo.users.set(dataInfo.clientID, dataInfo.clientSocket);
        dataInfo.clientSocket.send(JSON.stringify({
            type: "welcome",
            id: dataInfo.clientID,
        }));
    }
    listUsers(dataInfo) {
        const lobby = dataInfo.lobbyManager.getUsersLobby(dataInfo.clientID);
        if (!lobby) {
            return;
        }
        const userArray = [];
        lobby.getUsers().forEach((e) => {
            if (e !== dataInfo.clientID) {
                userArray.push(e);
            }
        });
        dataInfo.clientSocket.send(JSON.stringify({
            type: "user-list",
            users: userArray
        }));
    }
    forward(dataInfo) {
        const target = dataInfo.users.get(dataInfo.data.to);
        if (target && target.readyState === ws_1.WebSocket.OPEN) {
            target.send(JSON.stringify({
                ...dataInfo.data,
                from: dataInfo.clientID,
            }));
        }
    }
    getLobbies(dataInfo) {
        const lobbies = dataInfo.lobbyManager.getLobbies();
        const lobbyArray = [];
        for (const [key, lobby] of lobbies.entries()) {
            const msg = {
                host: lobby.getHost(),
                lobbyID: key,
                lobbyName: lobby.getName(),
                playerCount: lobby.getUsers().size,
                maxPlayers: lobby.getMaxSize(),
                closed: lobby.getClosed()
            };
            lobbyArray.push(msg);
        }
        return lobbyArray;
    }
    listLobbies(dataInfo) {
        const lobbyArray = this.getLobbies(dataInfo);
        dataInfo.clientSocket.send(JSON.stringify({
            type: "lobby-list",
            lobbies: lobbyArray
        }));
    }
    joinLobby(dataInfo, lobbyID) {
        const lobby = dataInfo.lobbyManager.getLobby(lobbyID);
        if (!lobby) {
            return;
        }
        if (dataInfo.lobbyManager.getUserLobbyID(dataInfo.clientID) == lobbyID) {
            return;
        }
        if (lobby.getMaxSize() == lobby.getUsers().size) {
            return;
        }
        const prevLobby = dataInfo.lobbyManager.getUsersLobby(dataInfo.clientID);
        if (prevLobby) {
            this.leaveLobby(dataInfo);
        }
        dataInfo.lobbyManager.addUser(lobbyID, dataInfo.clientID);
        dataInfo.clientSocket.send(JSON.stringify({
            type: "joined-lobby",
            id: lobbyID
        }));
        this.broadcastToLobby(dataInfo, { type: "user-joined", id: dataInfo.clientID });
        this.broadcast(dataInfo, { type: "lobby-list", lobbies: this.getLobbies(dataInfo) });
    }
    leaveLobby(dataInfo) {
        const lobby = dataInfo.lobbyManager.getUsersLobby(dataInfo.clientID);
        const lobbyID = dataInfo.lobbyManager.getUserLobbyID(dataInfo.clientID);
        if (!lobby) {
            return;
        }
        this.broadcastToLobby(dataInfo, { type: "user-left", id: dataInfo.clientID });
        const oldHost = lobby.getHost();
        dataInfo.lobbyManager.removeUserFromLobby(lobbyID, dataInfo.clientID);
        if (dataInfo.clientID === oldHost) {
            const newHost = lobby.getHost();
            this.broadcast(dataInfo, { type: "new-host", hostID: newHost });
        }
        dataInfo.clientSocket.send(JSON.stringify({ type: "left-lobby" }));
        this.broadcast(dataInfo, { type: "lobby-list", lobbies: this.getLobbies(dataInfo) });
    }
    hostLobby(dataInfo, lobbyName, lobbySize) {
        const prevLobby = dataInfo.lobbyManager.getUserLobbyID(dataInfo.clientID);
        if (prevLobby) {
            this.leaveLobby(dataInfo);
        }
        const lobbyID = (0, uuid_1.v4)();
        dataInfo.lobbyManager.createLobby(lobbyID, lobbyName, lobbySize, dataInfo.clientID);
        dataInfo.clientSocket.send(JSON.stringify({
            type: "hosted-lobby",
            id: lobbyID
        }));
        this.broadcast(dataInfo, { type: "lobby-list", lobbies: this.getLobbies(dataInfo) });
    }
    startLobby(dataInfo) {
        const lobby = dataInfo.lobbyManager.getUsersLobby(dataInfo.clientID);
        if (!lobby) {
            return;
        }
        lobby.setClosed(true);
        this.broadcast(dataInfo, { type: "lobby-starting" });
        this.broadcast(dataInfo, { type: "lobby-list", lobbies: this.getLobbies(dataInfo) });
    }
    broadcast(dataInfo, msg, exclude = null) {
        const text = JSON.stringify(msg);
        for (const userID of dataInfo.users.keys()) {
            const userSocket = dataInfo.users.get(userID);
            if (userSocket !== exclude && userSocket.readyState === ws_1.WebSocket.OPEN) {
                userSocket.send(text);
            }
        }
    }
    broadcastToLobby(dataInfo, msg) {
        const lobby = dataInfo.lobbyManager.getUsersLobby(dataInfo.clientID);
        if (!lobby) {
            return;
        }
        const text = JSON.stringify(msg);
        for (const userID of lobby.getUsers().values()) {
            const userSocket = dataInfo.users.get(userID);
            if (userSocket !== dataInfo.clientSocket && userSocket.readyState === ws_1.WebSocket.OPEN) {
                userSocket.send(text);
            }
        }
    }
    cleanup(dataInfo) {
        this.leaveLobby(dataInfo);
        dataInfo.users.delete(dataInfo.clientID);
    }
}
exports.MessageHandler = MessageHandler;

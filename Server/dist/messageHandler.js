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
            case "host-lobby":
                this.hostLobby(dataInfo, dataInfo.data.lobbyName);
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
        this.broadcast(dataInfo, {
            type: "user-joined",
            id: dataInfo.clientID,
        }, dataInfo.clientSocket);
    }
    joinLobby(dataInfo, lobbyID) {
        const lobby = dataInfo.lobbyManager.getLobby(lobbyID);
        if (!lobby) {
            dataInfo.clientSocket.send(JSON.stringify({
                type: "lobby-not-found",
                id: lobbyID
            }));
            return;
        }
        dataInfo.lobbyManager.addUser(lobbyID, dataInfo.clientID);
        dataInfo.clientSocket.send(JSON.stringify({
            type: "joined-lobby",
            id: lobbyID
        }));
        this.broadcast(dataInfo, {
            type: "user-joined-lobby",
            id: dataInfo.clientID
        }, dataInfo.clientSocket);
    }
    leaveLobby(dataInfo, lobbyID) {
        const lobby = dataInfo.lobbyManager.getUsersLobby(dataInfo.clientID);
        if (!lobby) {
            return;
        }
        const oldHost = lobby.getHost();
        lobby.removeUser(dataInfo.clientID);
        if (dataInfo.clientID === oldHost) {
            const newHost = lobby.setNewHost();
            if (newHost) {
                const userIDs = lobby.getUsers();
                for (const userID of userIDs) {
                    const userSocket = dataInfo.users.get(userID);
                    if (userSocket && userSocket.readyState === ws_1.WebSocket.OPEN) {
                        userSocket.send(JSON.stringify({
                            type: "new-host",
                            hostID: newHost
                        }));
                    }
                }
            }
        }
        if (lobby.getUsers().size === 0) {
            dataInfo.lobbyManager.removeLobby(lobbyID);
        }
    }
    hostLobby(dataInfo, lobbyName) {
        const lobbyID = (0, uuid_1.v4)();
        dataInfo.lobbyManager.createLobby(lobbyID, lobbyName, dataInfo.clientID);
        dataInfo.clientSocket.send(JSON.stringify({
            type: "hosted-lobby",
            id: lobbyID
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
    listLobbies(dataInfo) {
        const lobbies = dataInfo.lobbyManager.getLobbies();
        const lobbyArray = [];
        for (const [key, lobby] of lobbies.entries()) {
            const msg = {
                host: lobby.getHost(),
                lobbyID: key,
                lobbyName: lobby.getName(),
                playerCount: `${lobby.getUsers().size} / ${lobby.getMaxSize()}`,
                status: "Online"
            };
            lobbyArray.push(msg);
        }
        dataInfo.clientSocket.send(JSON.stringify({
            type: "lobby-list",
            lobbies: lobbyArray
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
    broadcast(dataInfo, msg, exclude) {
        const text = JSON.stringify(msg);
        const lobby = dataInfo.lobbyManager.getUsersLobby(dataInfo.clientID);
        if (!lobby) {
            return;
        }
        const userIDs = lobby.getUsers();
        for (const userID of userIDs.values()) {
            const userSocket = dataInfo.users.get(userID);
            if (userSocket !== exclude && userSocket.readyState === ws_1.WebSocket.OPEN) {
                userSocket.send(text);
            }
        }
    }
    cleanup(dataInfo) {
        dataInfo.users.delete(dataInfo.clientID);
        const lobbyID = dataInfo.lobbyManager.getUserLobbyID(dataInfo.clientID);
        if (lobbyID) {
            this.leaveLobby(dataInfo, lobbyID);
        }
        this.broadcast(dataInfo, { type: "user-left", id: dataInfo.clientID }, dataInfo.clientSocket);
    }
}
exports.MessageHandler = MessageHandler;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageHandler = void 0;
const ws_1 = require("ws");
const uuid_1 = require("uuid");
const Shared_1 = require("../../Shared");
class MessageHandler {
    handle(serverInfo, data) {
        switch (data.type) {
            case Shared_1.CMsgType.connect:
                this.join(serverInfo);
                break;
            case Shared_1.CMsgType.listUsers:
                this.listUsers(serverInfo);
                break;
            case Shared_1.CMsgType.forward:
                this.forward(serverInfo, data);
                break;
            case Shared_1.CMsgType.listLobbies:
                this.listLobbies(serverInfo);
                break;
            case Shared_1.CMsgType.joinLobby:
                this.joinLobby(serverInfo, data.lobbyID);
                break;
            case Shared_1.CMsgType.leaveLobby:
                this.leaveLobby(serverInfo);
                break;
            case Shared_1.CMsgType.hostLobby:
                this.hostLobby(serverInfo, data.lobbyName, data.lobbySize);
                break;
            case Shared_1.CMsgType.startLobby:
                this.startLobby(serverInfo);
                break;
        }
    }
    forward(serverInfo, data) {
        const target = serverInfo.users.get(data.to);
        if (target && target.readyState === ws_1.WebSocket.OPEN) {
            const msg = {
                from: serverInfo.clientID,
                msg: data.msg
            };
            target.send(JSON.stringify({ msg, type: Shared_1.ServerMessage.forwarded }));
        }
    }
    join(serverInfo) {
        serverInfo.users.set(serverInfo.clientID, serverInfo.clientSocket);
        const msg = { clientID: serverInfo.clientID };
        this.sendTo(Shared_1.ServerMessage.connected, msg, serverInfo.clientSocket);
    }
    listUsers(serverInfo) {
        const lobby = serverInfo.lobbyManager.getUsersLobby(serverInfo.clientID);
        if (!lobby) {
            return;
        }
        const userArray = [];
        lobby.getUsers().forEach((e) => {
            if (e !== serverInfo.clientID) {
                userArray.push(e);
            }
        });
        this.sendTo(Shared_1.ServerMessage.userList, { users: userArray }, serverInfo.clientSocket);
    }
    allLobbies(serverInfo) {
        const lobbies = serverInfo.lobbyManager.getLobbies();
        const lobbyArray = [];
        for (const [key, lobby] of lobbies.entries()) {
            const msg = {
                host: lobby.getHost(),
                lobbyID: key,
                lobbyName: lobby.getName(),
                playerCount: lobby.getUsers().size,
                maxPlayers: lobby.getMaxSize(),
                closed: lobby.isClosed()
            };
            lobbyArray.push(msg);
        }
        return lobbyArray;
    }
    listLobbies(serverInfo) {
        this.sendTo(Shared_1.ServerMessage.lobbyList, { lobbies: this.allLobbies(serverInfo) }, serverInfo.clientSocket);
    }
    joinLobby(serverInfo, lobbyID) {
        const lobby = serverInfo.lobbyManager.getLobby(lobbyID);
        const alreadyConnected = serverInfo.lobbyManager.getUserLobbyID(serverInfo.clientID) == lobbyID;
        const full = lobby?.getMaxSize() === lobby?.getUsers().size;
        if (!lobby || lobby.isClosed() || alreadyConnected || full) {
            return;
        }
        const prevLobby = serverInfo.lobbyManager.getUsersLobby(serverInfo.clientID);
        if (prevLobby) {
            this.leaveLobby(serverInfo);
        }
        serverInfo.lobbyManager.addUser(lobbyID, serverInfo.clientID);
        this.sendTo(Shared_1.ServerMessage.joinSuccess, { lobbyID }, serverInfo.clientSocket);
        this.broadcastToLobby(serverInfo, Shared_1.ServerMessage.userJoined, { userID: serverInfo.clientID });
        this.broadcast(serverInfo, Shared_1.ServerMessage.lobbyList, { lobbies: this.allLobbies(serverInfo) });
    }
    leaveLobby(serverInfo) {
        const lobby = serverInfo.lobbyManager.getUsersLobby(serverInfo.clientID);
        const lobbyID = serverInfo.lobbyManager.getUserLobbyID(serverInfo.clientID);
        if (!lobby) {
            return;
        }
        this.broadcastToLobby(serverInfo, Shared_1.ServerMessage.userLeft, { userID: serverInfo.clientID });
        const oldHost = lobby.getHost();
        serverInfo.lobbyManager.removeUserFromLobby(lobbyID, serverInfo.clientID);
        if (serverInfo.clientID === oldHost) {
            this.broadcast(serverInfo, Shared_1.ServerMessage.newHost, { hostID: lobby.getHost() });
        }
        this.sendTo(Shared_1.ServerMessage.leaveSuccess, {}, serverInfo.clientSocket);
        this.broadcast(serverInfo, Shared_1.ServerMessage.lobbyList, { lobbies: this.allLobbies(serverInfo) });
    }
    hostLobby(serverInfo, lobbyName, lobbySize) {
        const prevLobby = serverInfo.lobbyManager.getUserLobbyID(serverInfo.clientID);
        if (prevLobby) {
            this.leaveLobby(serverInfo);
        }
        const lobbyID = (0, uuid_1.v4)();
        serverInfo.lobbyManager.createLobby(lobbyID, lobbyName, lobbySize, serverInfo.clientID);
        this.sendTo(Shared_1.ServerMessage.hostSuccess, { lobbyID }, serverInfo.clientSocket);
        this.broadcast(serverInfo, Shared_1.ServerMessage.lobbyList, { lobbies: this.allLobbies(serverInfo) });
    }
    startLobby(serverInfo) {
        const lobby = serverInfo.lobbyManager.getUsersLobby(serverInfo.clientID);
        if (!lobby) {
            return;
        }
        let index = 0;
        lobby.getUsers().forEach(user => {
            this.sendTo(Shared_1.ServerMessage.startGame, { userID: index++ }, serverInfo.users.get(user));
        });
        this.broadcast(serverInfo, Shared_1.ServerMessage.lobbyList, { lobbies: this.allLobbies(serverInfo) });
        lobby.setClosed(true);
    }
    sendTo(type, msg, client) {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(JSON.stringify({ msg, type }));
        }
    }
    broadcast(serverInfo, type, msg, exclude = null) {
        const text = JSON.stringify({ msg, type });
        for (const userID of serverInfo.users.keys()) {
            const userSocket = serverInfo.users.get(userID);
            if (userSocket !== exclude && userSocket.readyState === ws_1.WebSocket.OPEN) {
                userSocket.send(text);
            }
        }
    }
    broadcastToLobby(serverInfo, type, msg, exclude = null) {
        const lobby = serverInfo.lobbyManager.getUsersLobby(serverInfo.clientID);
        if (!lobby) {
            return;
        }
        const text = JSON.stringify({ msg, type });
        for (const userID of lobby.getUsers().values()) {
            const userSocket = serverInfo.users.get(userID);
            if (userSocket !== exclude && userSocket.readyState === ws_1.WebSocket.OPEN) {
                userSocket.send(text);
            }
        }
    }
    cleanup(serverInfo) {
        this.leaveLobby(serverInfo);
        serverInfo.users.delete(serverInfo.clientID);
    }
}
exports.MessageHandler = MessageHandler;

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
                type: Shared_1.SMsgType.forwarded,
                from: serverInfo.clientID,
                msg: data.msg
            };
            target.send(JSON.stringify(msg));
        }
    }
    join(serverInfo) {
        serverInfo.users.set(serverInfo.clientID, serverInfo.clientSocket);
        const msg = {
            type: Shared_1.SMsgType.connected,
            clientID: serverInfo.clientID
        };
        this.sendTo(serverInfo.clientSocket, msg);
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
        const msg = {
            type: Shared_1.SMsgType.userList,
            users: userArray
        };
        this.sendTo(serverInfo.clientSocket, msg);
    }
    getLobbiesMsg(serverInfo) {
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
        return {
            type: Shared_1.SMsgType.lobbyList,
            lobbies: lobbyArray
        };
    }
    listLobbies(serverInfo) {
        this.sendTo(serverInfo.clientSocket, this.getLobbiesMsg(serverInfo));
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
        const joinMsg = { type: Shared_1.SMsgType.joinSuccess, lobbyID };
        this.sendTo(serverInfo.clientSocket, joinMsg);
        const userJoinedMsg = {
            type: Shared_1.SMsgType.userJoined,
            userID: serverInfo.clientID
        };
        this.broadcastToLobby(serverInfo, userJoinedMsg, serverInfo.clientSocket);
        this.broadcast(serverInfo, this.getLobbiesMsg(serverInfo));
    }
    leaveLobby(serverInfo) {
        const lobby = serverInfo.lobbyManager.getUsersLobby(serverInfo.clientID);
        const lobbyID = serverInfo.lobbyManager.getUserLobbyID(serverInfo.clientID);
        if (!lobby) {
            return;
        }
        const userLeftMsg = {
            type: Shared_1.SMsgType.userLeft,
            userID: serverInfo.clientID
        };
        this.broadcastToLobby(serverInfo, userLeftMsg);
        const oldHost = lobby.getHost();
        serverInfo.lobbyManager.removeUserFromLobby(lobbyID, serverInfo.clientID);
        if (serverInfo.clientID === oldHost) {
            const newHostMsg = {
                type: Shared_1.SMsgType.newHost,
                hostID: lobby.getHost()
            };
            this.broadcast(serverInfo, newHostMsg);
        }
        const leftMsg = { type: Shared_1.SMsgType.leaveSuccess };
        this.sendTo(serverInfo.clientSocket, leftMsg);
        this.broadcast(serverInfo, this.getLobbiesMsg(serverInfo));
    }
    hostLobby(serverInfo, lobbyName, lobbySize) {
        const prevLobby = serverInfo.lobbyManager.getUserLobbyID(serverInfo.clientID);
        if (prevLobby) {
            this.leaveLobby(serverInfo);
        }
        const lobbyID = (0, uuid_1.v4)();
        serverInfo.lobbyManager.createLobby(lobbyID, lobbyName, lobbySize, serverInfo.clientID);
        const hostMsg = {
            type: Shared_1.SMsgType.hostSuccess,
            lobbyID: lobbyID
        };
        this.sendTo(serverInfo.clientSocket, hostMsg);
        this.broadcast(serverInfo, this.getLobbiesMsg(serverInfo));
    }
    startLobby(serverInfo) {
        const lobby = serverInfo.lobbyManager.getUsersLobby(serverInfo.clientID);
        if (!lobby) {
            return;
        }
        lobby.setClosed(true);
        const startMsg = { type: Shared_1.SMsgType.startGame };
        this.sendTo(serverInfo.clientSocket, startMsg);
        this.broadcast(serverInfo, this.getLobbiesMsg(serverInfo));
    }
    sendTo(client, msg) {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(JSON.stringify(msg));
        }
    }
    broadcast(serverInfo, msg, exclude = null) {
        const text = JSON.stringify(msg);
        for (const userID of serverInfo.users.keys()) {
            const userSocket = serverInfo.users.get(userID);
            if (userSocket !== exclude && userSocket.readyState === ws_1.WebSocket.OPEN) {
                userSocket.send(text);
            }
        }
    }
    broadcastToLobby(serverInfo, msg, exclude = null) {
        const lobby = serverInfo.lobbyManager.getUsersLobby(serverInfo.clientID);
        if (!lobby) {
            return;
        }
        const text = JSON.stringify(msg);
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

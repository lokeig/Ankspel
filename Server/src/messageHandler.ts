import { WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import { ClientMessage, ForwardMessage, LobbyMessageData, CMsgType, SMsgType, ServerMessage, ForwardedMessage } from "../../Shared";
import { ServerInfo } from "./serverInfo";

export class MessageHandler {

    public handle(serverInfo: ServerInfo, data: ClientMessage): void {
        switch (data.type) {
            case CMsgType.connect:
                this.join(serverInfo);
                break;

            case CMsgType.listUsers:
                this.listUsers(serverInfo);
                break;

            case CMsgType.forward:
                this.forward(serverInfo, data);
                break;

            case CMsgType.listLobbies:
                this.listLobbies(serverInfo);
                break;

            case CMsgType.joinLobby:
                this.joinLobby(serverInfo, data.lobbyID);
                break;

            case CMsgType.leaveLobby:
                this.leaveLobby(serverInfo);
                break;

            case CMsgType.hostLobby:
                this.hostLobby(serverInfo, data.lobbyName, data.lobbySize);
                break;

            case CMsgType.startLobby:
                this.startLobby(serverInfo);
                break;
        }
    }

    private forward(serverInfo: ServerInfo, data: ForwardMessage) {
        const target = serverInfo.users.get(data.to);
        if (target && target.readyState === WebSocket.OPEN) {
            const msg: ForwardedMessage = {
                type: SMsgType.forwarded,
                from: serverInfo.clientID,
                msg: data.msg
            };
            target.send(JSON.stringify(msg));
        }
    }

    private join(serverInfo: ServerInfo) {
        serverInfo.users.set(serverInfo.clientID, serverInfo.clientSocket);
        const msg: ServerMessage = {
            type: SMsgType.connected,
            clientID: serverInfo.clientID
        };
        this.sendTo(serverInfo.clientSocket, msg);
    }

    private listUsers(serverInfo: ServerInfo) {
        const lobby = serverInfo.lobbyManager.getUsersLobby(serverInfo.clientID);
        if (!lobby) {
            return;
        }
        const userArray: string[] = [];
        lobby.getUsers().forEach((e) => {
            if (e !== serverInfo.clientID) {
                userArray.push(e);
            }
        });

        const msg: ServerMessage = {
            type: SMsgType.userList,
            users: userArray
        };
        this.sendTo(serverInfo.clientSocket, msg);
    }

    private getLobbiesMsg(serverInfo: ServerInfo): { type: SMsgType.lobbyList, lobbies: LobbyMessageData[] } {
        const lobbies = serverInfo.lobbyManager.getLobbies();
        const lobbyArray: LobbyMessageData[] = [];
        for (const [key, lobby] of lobbies.entries()) {
            const msg: LobbyMessageData = {
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
            type: SMsgType.lobbyList,
            lobbies: lobbyArray
        };
    }

    private listLobbies(serverInfo: ServerInfo) {
        this.sendTo(serverInfo.clientSocket, this.getLobbiesMsg(serverInfo));
    }

    private joinLobby(serverInfo: ServerInfo, lobbyID: string) {
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
        const joinMsg: ServerMessage = { type: SMsgType.joinSuccess, lobbyID }
        this.sendTo(serverInfo.clientSocket, joinMsg);

        const userJoinedMsg: ServerMessage = {
            type: SMsgType.userJoined,
            userID: serverInfo.clientID
        };
        this.broadcastToLobby(serverInfo, userJoinedMsg, serverInfo.clientSocket);
        this.broadcast(serverInfo, this.getLobbiesMsg(serverInfo));
    }

    private leaveLobby(serverInfo: ServerInfo) {
        const lobby = serverInfo.lobbyManager.getUsersLobby(serverInfo.clientID);
        const lobbyID = serverInfo.lobbyManager.getUserLobbyID(serverInfo.clientID)

        if (!lobby) {
            return;
        }

        const userLeftMsg: ServerMessage = {
            type: SMsgType.userLeft,
            userID: serverInfo.clientID
        };
        this.broadcastToLobby(serverInfo, userLeftMsg);

        const oldHost = lobby.getHost();
        serverInfo.lobbyManager.removeUserFromLobby(lobbyID!, serverInfo.clientID);

        if (serverInfo.clientID === oldHost) {
            const newHostMsg: ServerMessage = {
                type: SMsgType.newHost,
                hostID: lobby.getHost()
            };
            this.broadcast(serverInfo, newHostMsg);
        }

        const leftMsg: ServerMessage = { type: SMsgType.leaveSuccess };
        this.sendTo(serverInfo.clientSocket, leftMsg);
        this.broadcast(serverInfo, this.getLobbiesMsg(serverInfo));
    }

    private hostLobby(serverInfo: ServerInfo, lobbyName: string, lobbySize: number) {
        const prevLobby = serverInfo.lobbyManager.getUserLobbyID(serverInfo.clientID);
        if (prevLobby) {
            this.leaveLobby(serverInfo);
        }

        const lobbyID = uuidv4();
        serverInfo.lobbyManager.createLobby(lobbyID, lobbyName, lobbySize, serverInfo.clientID);

        const hostMsg: ServerMessage = {
            type: SMsgType.hostSuccess,
            lobbyID: lobbyID
        }
        this.sendTo(serverInfo.clientSocket, hostMsg);

        this.broadcast(serverInfo, this.getLobbiesMsg(serverInfo));
    }

    private startLobby(serverInfo: ServerInfo) {
        const lobby = serverInfo.lobbyManager.getUsersLobby(serverInfo.clientID);
        if (!lobby) {
            return;
        }
        lobby.setClosed(true);
        const startMsg: ServerMessage = { type: SMsgType.startGame };
        this.sendTo(serverInfo.clientSocket, startMsg);
        this.broadcast(serverInfo, this.getLobbiesMsg(serverInfo));
    }

    private sendTo(client: WebSocket, msg: ServerMessage) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(msg));
        }
    }

    private broadcast(serverInfo: ServerInfo, msg: ServerMessage, exclude: WebSocket | null = null) {
        const text = JSON.stringify(msg);

        for (const userID of serverInfo.users.keys()) {
            const userSocket = serverInfo.users.get(userID)!;
            if (userSocket !== exclude && userSocket.readyState === WebSocket.OPEN) {
                userSocket.send(text);
            }
        }
    }

    private broadcastToLobby(serverInfo: ServerInfo, msg: ServerMessage, exclude: WebSocket | null = null) {
        const lobby = serverInfo.lobbyManager.getUsersLobby(serverInfo.clientID);
        if (!lobby) {
            return;
        }
        const text = JSON.stringify(msg);
        for (const userID of lobby.getUsers().values()) {
            const userSocket = serverInfo.users.get(userID)!;
            if (userSocket !== exclude && userSocket.readyState === WebSocket.OPEN) {
                userSocket.send(text);
            }
        }
    }

    public cleanup(serverInfo: ServerInfo) {
        this.leaveLobby(serverInfo);
        serverInfo.users.delete(serverInfo.clientID);
    }
}
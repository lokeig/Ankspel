import { WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import { ClientMessage, ForwardMessage, LobbyMessageData, CMsgType, ServerMessage, ServerMessageMap, ForwardedMessage } from "../../Shared";
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
                from: serverInfo.clientID,
                msg: data.msg
            };
            target.send(JSON.stringify({ msg, type: ServerMessage.forwarded }));
        }
    }

    private join(serverInfo: ServerInfo) {
        serverInfo.users.set(serverInfo.clientID, serverInfo.clientSocket);
        const msg = { clientID: serverInfo.clientID };
        this.sendTo(ServerMessage.connected, msg, serverInfo.clientSocket);
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

        this.sendTo(ServerMessage.userList, { users: userArray }, serverInfo.clientSocket);
    }

    private allLobbies(serverInfo: ServerInfo): LobbyMessageData[] {
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
        return lobbyArray;
    }

    private listLobbies(serverInfo: ServerInfo) {
        this.sendTo(ServerMessage.lobbyList, { lobbies: this.allLobbies(serverInfo) }, serverInfo.clientSocket);
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
        this.sendTo(ServerMessage.joinSuccess, { lobbyID }, serverInfo.clientSocket);
        this.broadcastToLobby(serverInfo, ServerMessage.userJoined, { userID: serverInfo.clientID });
        this.broadcast(serverInfo, ServerMessage.lobbyList, { lobbies: this.allLobbies(serverInfo) });
    }

    private leaveLobby(serverInfo: ServerInfo) {
        const lobby = serverInfo.lobbyManager.getUsersLobby(serverInfo.clientID);
        const lobbyID = serverInfo.lobbyManager.getUserLobbyID(serverInfo.clientID)
        if (!lobby) {
            return;
        }
        this.broadcastToLobby(serverInfo, ServerMessage.userLeft, { userID: serverInfo.clientID });

        const oldHost = lobby.getHost();
        serverInfo.lobbyManager.removeUserFromLobby(lobbyID!, serverInfo.clientID);

        if (serverInfo.clientID === oldHost) {
            this.broadcast(serverInfo, ServerMessage.newHost, { hostID: lobby.getHost() });
        }
        this.sendTo(ServerMessage.leaveSuccess, {}, serverInfo.clientSocket);
        this.broadcast(serverInfo, ServerMessage.lobbyList, { lobbies: this.allLobbies(serverInfo) });
    }

    private hostLobby(serverInfo: ServerInfo, lobbyName: string, lobbySize: number) {
        const prevLobby = serverInfo.lobbyManager.getUserLobbyID(serverInfo.clientID);
        if (prevLobby) {
            this.leaveLobby(serverInfo);
        }
        const lobbyID = uuidv4();
        serverInfo.lobbyManager.createLobby(lobbyID, lobbyName, lobbySize, serverInfo.clientID);
        console.log("lobby id is: " + lobbyID);
        this.sendTo(ServerMessage.hostSuccess, { lobbyID }, serverInfo.clientSocket);
        this.broadcast(serverInfo, ServerMessage.lobbyList, { lobbies: this.allLobbies(serverInfo) });
    }

    private startLobby(serverInfo: ServerInfo) {
        const lobby = serverInfo.lobbyManager.getUsersLobby(serverInfo.clientID);
        if (!lobby) {
            return;
        }
        let index = 0;
        lobby.getUsers().forEach(user => {
            this.sendTo(ServerMessage.startGame, { userID: index++ }, serverInfo.users.get(user)!);
        });
        this.broadcast(serverInfo, ServerMessage.lobbyList, { lobbies: this.allLobbies(serverInfo) });
        lobby.setClosed(true);
    }

    private sendTo<T extends keyof ServerMessageMap>(type: T, msg: ServerMessageMap[T], client: WebSocket) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ msg, type }));
        }
    }

    private broadcast<T extends ServerMessage>(serverInfo: ServerInfo, type: T, msg: ServerMessageMap[T], exclude: WebSocket | null = null) {
        const text = JSON.stringify({ msg, type });

        for (const userID of serverInfo.users.keys()) {
            const userSocket = serverInfo.users.get(userID)!;
            if (userSocket !== exclude && userSocket.readyState === WebSocket.OPEN) {
                userSocket.send(text);
            }
        }
    }

    private broadcastToLobby<T extends ServerMessage>(serverInfo: ServerInfo, type: T, msg: ServerMessageMap[T], exclude: WebSocket | null = null) {
        const lobby = serverInfo.lobbyManager.getUsersLobby(serverInfo.clientID);
        if (!lobby) {
            return;
        }
        const text = JSON.stringify({ msg, type });
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
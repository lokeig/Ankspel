import { DataInfo } from "./dataInfo";
import { WebSocket } from "ws";
import { LobbyMsg } from "./types";
import { v4 as uuidv4 } from "uuid";

export class MessageHandler {

    handle(dataInfo: DataInfo) {
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

    private join(dataInfo: DataInfo) {
        dataInfo.users.set(dataInfo.clientID, dataInfo.clientSocket);

        dataInfo.clientSocket.send(
            JSON.stringify({
                type: "welcome",
                id: dataInfo.clientID,
            })
        );
    }

    private listUsers(dataInfo: DataInfo) {
        const lobby = dataInfo.lobbyManager.getUsersLobby(dataInfo.clientID);
        if (!lobby) {
            return;
        }
        const userArray: string[] = [];
        lobby.getUsers().forEach((e) => {
            if (e !== dataInfo.clientID) {
                userArray.push(e);
            }
        });

        dataInfo.clientSocket.send(
            JSON.stringify({
                type: "user-list",
                users: userArray
            })
        );

    }

    private forward(dataInfo: DataInfo) {
        const target = dataInfo.users.get(dataInfo.data.to);
        if (target && target.readyState === WebSocket.OPEN) {
            target.send(
                JSON.stringify({
                    ...dataInfo.data,
                    from: dataInfo.clientID,
                })
            );
        }
    }

    private getLobbies(dataInfo: DataInfo): LobbyMsg[] {
        const lobbies = dataInfo.lobbyManager.getLobbies();
        const lobbyArray: LobbyMsg[] = [];

        for (const [key, lobby] of lobbies.entries()) {
            const msg: LobbyMsg = {
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

    private listLobbies(dataInfo: DataInfo) {
        const lobbyArray = this.getLobbies(dataInfo);
        dataInfo.clientSocket.send(
            JSON.stringify({
                type: "lobby-list",
                lobbies: lobbyArray
            })
        );
    }

    private joinLobby(dataInfo: DataInfo, lobbyID: string) {

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
        dataInfo.clientSocket.send(
            JSON.stringify({
                type: "joined-lobby",
                id: lobbyID
            })
        );

        this.broadcastToLobby(dataInfo, { type: "user-joined", id: dataInfo.clientID }, dataInfo.clientSocket);
        this.broadcast(dataInfo, { type: "lobby-list", lobbies: this.getLobbies(dataInfo) });
    }

    private leaveLobby(dataInfo: DataInfo) {
        const lobby = dataInfo.lobbyManager.getUsersLobby(dataInfo.clientID);
        const lobbyID = dataInfo.lobbyManager.getUserLobbyID(dataInfo.clientID)

        if (!lobby) {
            return;
        }

        this.broadcastToLobby(dataInfo, { type: "user-left", id: dataInfo.clientID });

        const oldHost = lobby.getHost();
        dataInfo.lobbyManager.removeUserFromLobby(lobbyID!, dataInfo.clientID);

        if (dataInfo.clientID === oldHost) {
            const newHost = lobby.getHost();
            this.broadcast(dataInfo, { type: "new-host", hostID: newHost });
        }

        dataInfo.clientSocket.send(JSON.stringify({ type: "left-lobby" }));
        this.broadcast(dataInfo, { type: "lobby-list", lobbies: this.getLobbies(dataInfo) });
    }

    private hostLobby(dataInfo: DataInfo, lobbyName: string, lobbySize: number) {
        const prevLobby = dataInfo.lobbyManager.getUserLobbyID(dataInfo.clientID);
        if (prevLobby) {
            this.leaveLobby(dataInfo);
        }

        const lobbyID = uuidv4();
        dataInfo.lobbyManager.createLobby(lobbyID, lobbyName, lobbySize, dataInfo.clientID);

        dataInfo.clientSocket.send(
            JSON.stringify({
                type: "hosted-lobby",
                id: lobbyID
            })
        );

        this.broadcast(dataInfo, { type: "lobby-list", lobbies: this.getLobbies(dataInfo) });
    }

    private startLobby(dataInfo: DataInfo) {
        const lobby = dataInfo.lobbyManager.getUsersLobby(dataInfo.clientID);
        if (!lobby) {
            return;
        }
        lobby.setClosed(true);
        this.broadcastToLobby(dataInfo, { type: "lobby-starting" });
        this.broadcast(dataInfo, { type: "lobby-list", lobbies: this.getLobbies(dataInfo) });
    }

    private broadcast(dataInfo: DataInfo, msg: any, exclude: WebSocket | null = null) {
        const text = JSON.stringify(msg);

        for (const userID of dataInfo.users.keys()) {
            const userSocket = dataInfo.users.get(userID)!;
            if (userSocket !== exclude && userSocket.readyState === WebSocket.OPEN) {
                userSocket.send(text);
            }
        }
    }

    private broadcastToLobby(dataInfo: DataInfo, msg: any, exclude: WebSocket | null = null) {
        const lobby = dataInfo.lobbyManager.getUsersLobby(dataInfo.clientID);
        if (!lobby) {
            return;
        }
        const text = JSON.stringify(msg);
        for (const userID of lobby.getUsers().values()) {
            const userSocket = dataInfo.users.get(userID)!;
            if (userSocket !== exclude && userSocket.readyState === WebSocket.OPEN) {
                userSocket.send(text);
            }
        }
    }

    public cleanup(dataInfo: DataInfo) {
        this.leaveLobby(dataInfo);
        dataInfo.users.delete(dataInfo.clientID);
    }
}
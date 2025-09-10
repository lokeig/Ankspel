import { DataInfo } from "./dataInfo";
import { Data, WebSocket } from "ws";

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

            case "join-lobby":
                this.joinLobby(dataInfo, dataInfo.data.lobbyID);
                break;

            case "host-lobby":
                this.hostLobby(dataInfo, dataInfo.data.lobbyID);
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

        this.broadcast(
            dataInfo,
            {
                type: "user-joined",
                id: dataInfo.clientID,
            },
            dataInfo.clientSocket
        );
    }

    private joinLobby(dataInfo: DataInfo, lobbyID: string) {

        const lobby = dataInfo.lobbyManager.getLobby(lobbyID);
        if (!lobby) {
            dataInfo.clientSocket.send(
                JSON.stringify({
                    type: "lobby-not-found",
                    id: lobbyID
                })
            );
            return;
        }

        dataInfo.lobbyManager.addUser(lobbyID, dataInfo.clientID);
        dataInfo.clientSocket.send(
            JSON.stringify({
                type: "joined-lobby",
                id: lobbyID
            })
        );

        this.broadcast(
            dataInfo,
            {
                type: "user-joined-lobby",
                id: dataInfo.clientID
            },
            dataInfo.clientSocket
        );
    }

    private leaveLobby(dataInfo: DataInfo, lobbyID: string) {
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
                    if (userSocket && userSocket.readyState === WebSocket.OPEN) {
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

    private hostLobby(dataInfo: DataInfo, lobbyID: string) {
        const lobby = dataInfo.lobbyManager.getLobby(lobbyID);
        if (lobby) {
            dataInfo.clientSocket.send(
                JSON.stringify({
                    type: "lobby-already-found",
                    id: lobbyID
                })
            );
            return;
        }

        dataInfo.lobbyManager.createLobby(lobbyID, dataInfo.clientID);

        dataInfo.clientSocket.send(
            JSON.stringify({
                type: "hosted-lobby",
                id: lobbyID
            })
        );

    }

    private listUsers(dataInfo: DataInfo) {
        console.log(dataInfo.clientID)
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
                users: userArray,
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

    private broadcast(dataInfo: DataInfo, msg: any, exclude: WebSocket) {
        const text = JSON.stringify(msg);

        const lobby = dataInfo.lobbyManager.getUsersLobby(dataInfo.clientID);
        if (!lobby) {
            return;
        }
        const userIDs = lobby.getUsers();

        for (const userID of userIDs.values()) {
            const userSocket = dataInfo.users.get(userID)!;
            if (userSocket !== exclude && userSocket.readyState === WebSocket.OPEN) {
                userSocket.send(text);
            }
        }
    }

    public cleanup(dataInfo: DataInfo) {
        dataInfo.users.delete(dataInfo.clientID);

        const lobbyID = dataInfo.lobbyManager.getUserLobbyID(dataInfo.clientID)
        if (lobbyID) {
            this.leaveLobby(dataInfo, lobbyID);
        }

        this.broadcast(dataInfo, { type: "user-left", id: dataInfo.clientID }, dataInfo.clientSocket);
    }
}
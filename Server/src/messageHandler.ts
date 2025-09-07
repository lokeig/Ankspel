import { DataInfo } from "./dataInfo";
import { WebSocket } from "ws";

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

            default:
                console.warn("Unknown message type:", dataInfo.data.type);
        }
    }

    private join(dataInfo: DataInfo) {
        dataInfo.connectedUsers.set(dataInfo.clientID, dataInfo.clientSocket);

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

    private listUsers(dataInfo: DataInfo) {
        console.log(dataInfo.clientID)
        if (dataInfo.clientSocket && dataInfo.clientID) {
            dataInfo.clientSocket.send(
                JSON.stringify({
                    type: "user-list",
                    peers: Array.from(dataInfo.connectedUsers.keys()).filter(
                        (pid) => pid !== dataInfo.clientID
                    ),
                })
            );
        }
    }

    private forward(dataInfo: DataInfo) {
        const target = dataInfo.connectedUsers.get(dataInfo.data.to);
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
        dataInfo.connectedUsers.forEach((user) => {
            if (user !== exclude && user.readyState === WebSocket.OPEN) {
                user.send(text);
            }
        });
    }

    public cleanup(dataInfo: DataInfo) {
        dataInfo.connectedUsers.delete(dataInfo.clientID);
        this.broadcast(dataInfo, { type: "user-left", id: dataInfo.clientID }, dataInfo.clientSocket);

    }
}
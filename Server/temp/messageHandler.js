import { WebSocket } from "ws";

export class MessageHandler {

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

            default:
                console.warn("Unknown message type:", dataInfo.type);
        }
    }

    join(dataInfo) {
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

    listUsers(dataInfo) {
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

    forward(dataInfo) {
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

    broadcast(dataInfo, msg, exclude) {
        const text = JSON.stringify(msg);
        dataInfo.connectedUsers.forEach((user) => {
            if (user !== exclude && user.readyState === WebSocket.OPEN) {
                user.send(text);
            }
        });
    }

    cleanup(dataInfo) {
        dataInfo.connectedUsers.delete(dataInfo.clientID);
        this.broadcast(dataInfo, { type: "user-left", id: dataInfo.clientID }, dataInfo.clientSocket);

    }
}
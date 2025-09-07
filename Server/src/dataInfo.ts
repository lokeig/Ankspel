import { WebSocket } from "ws";

export class DataInfo {
    public clientID: string;
    public clientSocket: WebSocket;
    public connectedUsers: Map<string, WebSocket>;
    public data: any;

    constructor(data: any, id: string, socket: WebSocket, users: Map<string, WebSocket>) {
        this.clientID = id;
        this.clientSocket = socket;
        this.data = data;
        this.connectedUsers = users;
    }
}
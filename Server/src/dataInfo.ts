import { WebSocket } from "ws";
import { LobbyManager } from "./lobbyManager";

export class DataInfo {
    public clientID: string;
    public clientSocket: WebSocket;
    public lobbyManager: LobbyManager
    public users: Map<string, WebSocket>;
    public data: any;

    constructor(data: any, id: string, socket: WebSocket, users: Map<string, WebSocket>, lobbyManager: LobbyManager) {
        this.clientID = id;
        this.clientSocket = socket;
        this.data = data;
        this.lobbyManager = lobbyManager;
        this.users = users;
    }
}
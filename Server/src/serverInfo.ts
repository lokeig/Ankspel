import { WebSocket } from "ws";
import { LobbyManager } from "./lobbyManager";

export class ServerInfo {
    public clientID: string;
    public clientSocket: WebSocket;
    public lobbyManager: LobbyManager
    public users: Map<string, WebSocket>;

    constructor(id: string, socket: WebSocket, users: Map<string, WebSocket>, lobbyManager: LobbyManager) {
        this.clientID = id;
        this.clientSocket = socket;
        this.lobbyManager = lobbyManager;
        this.users = users;
    }
}
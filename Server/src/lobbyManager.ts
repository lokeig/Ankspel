import { Lobby } from "./lobby";

export class LobbyManager {
    private lobbies: Map<string, Lobby> = new Map();
    private hosts: Map<string, Lobby> = new Map();

    private userIDToLobbyID: Map<string, string> = new Map();

    public createLobby(lobbyID: string, lobbyName: string, host: string): void {
        const lobby = new Lobby(lobbyName, host);
        this.lobbies.set(lobbyID, lobby);
        this.hosts.set(host, lobby);
    }

    public addUser(lobbyID: string, userID: string) {
        const lobby = this.lobbies.get(lobbyID);
        if (!lobby) {
            return;
        }
        lobby.addUser(userID);
        this.userIDToLobbyID.set(userID, lobbyID);
    }


    public getLobby(lobbyID: string): Lobby | undefined {
        return this.lobbies.get(lobbyID);
    }

    public getUserLobbyID(userID: string): string | undefined {
        return this.userIDToLobbyID.get(userID);
    }

    public getUsersLobby(userID: string): Lobby | undefined {
        const lobbyID = this.userIDToLobbyID.get(userID);
        if (!lobbyID) {
            return undefined;
        }
        return this.lobbies.get(lobbyID);
    }

    public removeUser(lobbyID: string, userID: string) {
        const lobby = this.lobbies.get(lobbyID);
        if (!lobby) {
            return;
        }
        lobby.removeUser(userID);
        this.userIDToLobbyID.delete(userID);
    }

    public removeLobby(lobbyID: string) {
        this.lobbies.delete(lobbyID);
    }

    public getLobbies(): Map<string, Lobby> {
        return this.lobbies;
    }



}
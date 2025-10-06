import { LobbyListInterface } from "./lobbylistInterface";

export class LobbyList {
    private static current: LobbyListInterface;

    public static set(lobbylistInterface: LobbyListInterface): void {
        this.current = lobbylistInterface;
    }

    public static get(): LobbyListInterface {
        return this.current;
    }
}
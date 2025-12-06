import { ILobbyList } from "./ILobbyList";


class LobbyList {
    private static current: ILobbyList;

    public static set(lobbylistInterface: ILobbyList): void {
        this.current = lobbylistInterface;
    }

    public static get(): ILobbyList {
        return this.current;
    }
}

export { LobbyList };
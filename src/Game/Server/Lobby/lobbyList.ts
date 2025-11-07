import { LobbyListInterface } from "./lobbyListInterface";


class LobbyList {
    private static current: LobbyListInterface;

    public static set(lobbylistInterface: LobbyListInterface): void {
        this.current = lobbylistInterface;
    }

    public static get(): LobbyListInterface {
        return this.current;
    }
}

export { LobbyList };
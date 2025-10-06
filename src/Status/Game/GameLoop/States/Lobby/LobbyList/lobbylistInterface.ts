import { Lobby } from "../lobbyType";

export interface LobbyListInterface {
    refresh(lobbies: Lobby[]): void;
    show(): void;
    hide(): void;
}
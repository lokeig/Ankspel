import { LobbyMessageData } from "@shared";

interface ILobbyList {
    refresh(lobbies: LobbyMessageData[]): void;
    show(): void;
    hide(): void;
}

export type { ILobbyList };
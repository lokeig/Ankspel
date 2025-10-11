import { LobbyMessageData } from "@shared";

interface LobbyListInterface {
    refresh(lobbies: LobbyMessageData[]): void;
    show(): void;
    hide(): void;
}

export type { LobbyListInterface };
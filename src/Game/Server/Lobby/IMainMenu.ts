import { ImageName } from "@render";
import { LobbyMessageData } from "@shared";

interface IMainMenu {
    refresh(lobbies: LobbyMessageData[]): void;
    getChosenColor(): ImageName;
    show(): void;
    hide(): void;
}

export type { IMainMenu };
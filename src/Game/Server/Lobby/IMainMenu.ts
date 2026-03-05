import { Controls } from "@common";
import { ImageName } from "@render";
import { LobbyMessageData } from "@shared";

interface IMainMenu {
    refresh(lobbies: LobbyMessageData[]): void;
    getChosenColor(): ImageName;
    getControls(player: number): Controls;
    show(): void;
    hide(): void;
}

export type { IMainMenu };
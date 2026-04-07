import { Controls } from "@common";
import { LobbyMessageData } from "@shared";

interface IMainMenu {
    refresh(lobbies: LobbyMessageData[]): void;
    getChosenColor(player: number): string;
    getName(player: number): string;
    getControls(player: number): Controls;
    show(): void;
    hide(): void;
}

export type { IMainMenu };
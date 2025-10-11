import { PlayerState } from "@player";

type ServerMessage =
    PlayerDataMessage

type PlayerDataMessage = {
    type: "playerData";
    id?: string;
    xPos: number;
    yPos: number;
    state: PlayerState;
}


export type { ServerMessage, PlayerDataMessage }
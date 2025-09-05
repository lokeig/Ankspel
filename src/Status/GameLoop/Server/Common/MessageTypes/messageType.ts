import { PlayerState } from "../../../MainGame/Objects/DynamicObjects/Player/PlayerStates/playerState"

export type ServerMessage =
    | PlayerDataMessage
    | NewPlayerMessage;

export type PlayerDataMessage = {
    type: "playerData";
    xPos: number;
    yPos: number;
    id: string;
    state: PlayerState;
}

export type NewPlayerMessage = {
    type: "newPlayer";
    id: string;
    xPos: number;
    yPos: number;
}

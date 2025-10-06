import { PlayerState } from "../../Game/Objects/DynamicObjects/Player/PlayerStates/playerState"

export type ServerMessage =
    PlayerDataMessage
    | NewPlayerMessage
    | StartGameMessage

export type PlayerDataMessage = {
    type: "playerData";
    id?: string;
    xPos: number;
    yPos: number;
    state: PlayerState;
}

export type NewPlayerMessage = {
    type: "newPlayer";
    id?: string;
    xPos: number;
    yPos: number;
}

export type StartGameMessage = {
    type: "startGame";
    id?: string;
}

import { PlayerState } from "../../../MainGame/Objects/DynamicObjects/Player/PlayerStates/playerState"

export type MessageType = PlayerData | NewPlayer 

export type PlayerData = {
    xPos: number,
    yPos: number,
    state: PlayerState
}

export type NewPlayer = {
    id: string,
    xPos: number,
    yPos: number
}

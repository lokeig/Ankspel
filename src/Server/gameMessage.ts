import { Vector, PlayerState } from "@common";
import { LobbyMessageData } from "@shared"

enum GMsgType {
    refreshLobbies = "refreshLobbies",
    inLobby = "inLobby",
    hostingLobby = "hostingLobby",
    noLobby = "noLobby",
    startGame = "startGame",
    playerInfo = "playerInfo"
}

type PlayerInfoMessage = {
    type: GMsgType.playerInfo,
    pos: Vector,
    state: PlayerState
}

interface GameMessageMap {
    [GMsgType.refreshLobbies]: { lobbies: LobbyMessageData[] };
    | { type: GMsgType.inLobby, lobbyID: string }
    | { type: GMsgType.hostingLobby, lobbyID: string | null }
    | { type: GMsgType.noLobby }
    | { type: GMsgType.startGame }
    | PlayerInfoMessage
}

export type { GameMessage, PlayerInfoMessage };
export { GMsgType };
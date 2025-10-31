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

interface GameMessageMap {
    [GMsgType.refreshLobbies]: { lobbies: LobbyMessageData[] };
    [GMsgType.inLobby]: { lobbyID: string };
    [GMsgType.hostingLobby]: { lobbyID: string | null };
    [GMsgType.noLobby]: {};
    [GMsgType.startGame]: {};
    [GMsgType.playerInfo]: { pos: Vector, state: PlayerState };
}

type GameMessage = GameMessageMap[GMsgType];

export { GMsgType };
export type { GameMessageMap, GameMessage };
import { Vector, PlayerState, PlayerAnim, Side } from "@common";
import { LobbyMessageData } from "@shared"

enum GMsgType {
    refreshLobbies = "refreshLobbies",
    inLobby = "inLobby",
    hostingLobby = "hostingLobby",
    noLobby = "noLobby",

    playerInfo = "playerInfo",
    newPlayer = "newPlayer",

    loadMap = "loadMap",
    playerSpawn = "playerSpawn",
    spawnItem = "spawnItem",
    dataDone = "dataDone",
    readyToStart = "readyToStart",

    startGame = "startGame",
}

interface GameMessageMap {
    [GMsgType.refreshLobbies]: { lobbies: LobbyMessageData[] };
    [GMsgType.inLobby]: { lobbyID: string };
    [GMsgType.hostingLobby]: { lobbyID: string | null };
    [GMsgType.noLobby]: {};

    [GMsgType.playerInfo]: {
        id: string
        pos: Vector
        holding: number | null
        state: PlayerState
        anim: PlayerAnim
        side: Side
        armAngle: number
    };
    [GMsgType.newPlayer]: { local: boolean, id: string };

    [GMsgType.loadMap]: { name: string };
    [GMsgType.playerSpawn]: { id: string, location: Vector };
    [GMsgType.spawnItem]: { id: number, location: Vector, itemType: string }

    [GMsgType.dataDone]: {}
    [GMsgType.readyToStart]: {}
    [GMsgType.startGame]: { time: number };
}

type GameMessage = GameMessageMap[GMsgType];

export { GMsgType };
export type { GameMessageMap, GameMessage };
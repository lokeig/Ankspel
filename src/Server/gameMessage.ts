import { Vector, PlayerState } from "@common";
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
    itemSpawn = "itemSpawn",
    dataDone = "dataDone",
    readyToStart = "readyToStart",

    startGame = "startGame",
}

interface GameMessageMap {
    [GMsgType.refreshLobbies]: { lobbies: LobbyMessageData[] };
    [GMsgType.inLobby]: { lobbyID: string };
    [GMsgType.hostingLobby]: { lobbyID: string | null };
    [GMsgType.noLobby]: {};

    [GMsgType.playerInfo]: { pos: Vector, state: PlayerState };
    [GMsgType.newPlayer]: { local: boolean, id: string };

    [GMsgType.loadMap]: { name: string };
    [GMsgType.playerSpawn]: { id: string, location: Vector };
    [GMsgType.itemSpawn]: { id: string, location: Vector, itemType: string }

    [GMsgType.dataDone]: {}
    [GMsgType.readyToStart]: {}
    [GMsgType.startGame]: { time: number };

}

type GameMessage = GameMessageMap[GMsgType];

export { GMsgType };
export type { GameMessageMap, GameMessage };
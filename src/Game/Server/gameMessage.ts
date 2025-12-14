import { PlayerState, PlayerAnim, Side, ThrowType } from "@common";
import { LobbyMessageData } from "@shared"

enum GMsgType {
    // Lobby interface
    refreshLobbies = "refreshLobbies",
    inLobby = "inLobby",
    hostingLobby = "hostingLobby",
    noLobby = "noLobby",
   
    // Player
    playerInfo = "playerInfo",
    newPlayer = "newPlayer",
    throwItem = "throwItem",
   
    // Spawns
    spawnItem = "spawnItem",
    spawnProjectile = "spawnProjectile",
    
    // Map
    playerSpawn = "playerSpawn",
    loadMap = "loadMap",
    dataDone = "dataDone",
    readyToStart = "readyToStart",
    startGame = "startGame",
};

type NetworkVector = {
    x: number,
    y: number
};

interface GameMessageMap {
    // Lobby interface
    [GMsgType.refreshLobbies]: { lobbies: LobbyMessageData[] };
    [GMsgType.inLobby]: { lobbyID: string };
    [GMsgType.hostingLobby]: { lobbyID: string | null };
    [GMsgType.noLobby]: {};

    // Player
    [GMsgType.playerInfo]: {
        id: string,
        pos: NetworkVector,
        holding: number | null,
        state: PlayerState,
        anim: PlayerAnim,
        side: Side,
        armAngle: number
    };
    [GMsgType.newPlayer]: { local: boolean, id: string };
    [GMsgType.throwItem]: { itemID: number, pos: NetworkVector, throwType: ThrowType }

    // Spawns
    [GMsgType.spawnItem]: { id: number, location: NetworkVector, type: string };
    [GMsgType.spawnProjectile]: { id: number, location: NetworkVector, angle: number, type: string };

    // Map
    [GMsgType.loadMap]: { name: string };
    [GMsgType.playerSpawn]: { id: string, location: NetworkVector };
    [GMsgType.dataDone]: {};
    [GMsgType.readyToStart]: {};
    [GMsgType.startGame]: { time: number };
}

type GameMessage = GameMessageMap[GMsgType];

export { GMsgType };
export type { GameMessageMap, GameMessage, NetworkVector };
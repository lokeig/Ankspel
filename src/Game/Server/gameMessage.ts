import { PlayerState, PlayerAnim, Side, ThrowType } from "@common";

enum GameMessage {
    // Player
    playerInfo = "playerInfo",
    newPlayer = "newPlayer",
    throwItem = "throwItem",
    // Spawns
    spawnItem = "spawnItem",
    spawnProjectile = "spawnProjectile",
    playerSpawn = "playerSpawn",
    // Map
    loadMap = "loadMap",
    dataDone = "dataDone",
    readyForMap = "readyForMap",
    startMap = "startMap",
};

type NetworkVector = {
    x: number,
    y: number
};

interface GameMessageMap {
    // Player
    [GameMessage.playerInfo]: {
        id: number,
        pos: NetworkVector,
        holding: number | null,
        state: PlayerState,
        anim: PlayerAnim,
        side: Side,
        armAngle: number
    };
    [GameMessage.newPlayer]: { id: number };
    [GameMessage.throwItem]: { itemID: number, pos: NetworkVector, direction: Side, throwType: ThrowType }

    // Spawns
    [GameMessage.spawnItem]: { id: number, location: NetworkVector, type: string };
    [GameMessage.spawnProjectile]: { id: number, location: NetworkVector, angle: number, type: string };
    [GameMessage.playerSpawn]: { id: number, location: NetworkVector };

    // Map
    [GameMessage.loadMap]: { name: string };
    [GameMessage.dataDone]: {};
    [GameMessage.readyForMap]: {};
    [GameMessage.startMap]: { time: number };
}

export { GameMessage };
export type { GameMessageMap, NetworkVector };
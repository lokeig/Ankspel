import { PlayerState, PlayerAnim, Side, ThrowType } from "@common";

enum GameMessage {
    readyToPlay,
    // Player
    playerInfo,
    newPlayer,
    throwItem,
    playerSpawn,
    // Projectile
    spawnProjectile,
    // Items
    spawnItem,
    deleteItem,
    activateItem,
    // Map
    loadMap,
    dataDone,
    readyForMap,
    startMap,
};

type NetworkVector = {
    x: number,
    y: number
};

interface GameMessageMap {
    [GameMessage.readyToPlay]: {};
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
    [GameMessage.playerSpawn]: { id: number, location: NetworkVector };
    //Projectile
    [GameMessage.spawnProjectile]: { id: number, location: NetworkVector, angle: number, type: string };
    // Items
    [GameMessage.throwItem]: { itemID: number, pos: NetworkVector, direction: Side, throwType: ThrowType };
    [GameMessage.spawnItem]: { id: number, location: NetworkVector, type: string };
    [GameMessage.deleteItem]: { id: number };
    [GameMessage.activateItem]: { id: number, action: number, angle: number, seed: number };
    // Map
    [GameMessage.loadMap]: { name: string };
    [GameMessage.dataDone]: {};
    [GameMessage.readyForMap]: {};
    [GameMessage.startMap]: { time: number };
}

const test: GameMessageMap[GameMessage] = {}

export { GameMessage };
export type { GameMessageMap, NetworkVector };
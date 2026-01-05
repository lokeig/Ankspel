import { PlayerState, PlayerAnim, Side, ThrowType, ItemInteractionInput } from "@common";

enum GameMessage {
    // ─── Connection ─────────────────────────
    ReadyToPlay,
    DataDone,

    // ─── Player ─────────────────────────────
    PlayerInfo,
    NewPlayer,
    PlayerSpawn,

    // ─── Items ──────────────────────────────
    SpawnItem,
    DeleteItem,
    ActivateItem,
    DeactivateItem,
    ThrowItem,

    // ─── Projectiles ────────────────────────
    SpawnProjectile,

    // ─── Map ────────────────────────────────
    LoadMap,
    ReadyForMap,
    StartMap,
}


type NetworkVector = {
    x: number,
    y: number
};

interface GameMessageMap {
    [GameMessage.ReadyToPlay]: {};
    // Player
    [GameMessage.PlayerInfo]: {
        id: number, pos: NetworkVector, holding: number | null, state: PlayerState, anim: PlayerAnim, side: Side, armAngle: number
    };
    [GameMessage.NewPlayer]: { id: number };
    [GameMessage.PlayerSpawn]: { id: number, location: NetworkVector };
    //Projectile
    [GameMessage.SpawnProjectile]: { id: number, location: NetworkVector, angle: number, type: string };
    // Items
    [GameMessage.ThrowItem]: { itemID: number, pos: NetworkVector, direction: Side, throwType: ThrowType };
    [GameMessage.SpawnItem]: { id: number, location: NetworkVector, type: string };
    [GameMessage.DeleteItem]: { id: number };
    [GameMessage.ActivateItem]: { id: number, position: NetworkVector, angle: number, direction: Side, action: ItemInteractionInput, seed: number };
    [GameMessage.DeactivateItem]: { id: number };
    // Map
    [GameMessage.LoadMap]: { name: string };
    [GameMessage.DataDone]: {};
    [GameMessage.ReadyForMap]: {};
    [GameMessage.StartMap]: { time: number };
}

const test: GameMessageMap[GameMessage] = {}

export { GameMessage };
export type { GameMessageMap, NetworkVector };
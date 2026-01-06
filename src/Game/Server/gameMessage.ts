import { PlayerState, PlayerAnim, Side, ThrowType, ItemInteractionInput, BodyParts } from "@common";

enum GameMessage {
    // ─── Connection ─────────────────────────
    ReadyToPlay,
    DataDone,

    // ─── Player ─────────────────────────────
    PlayerInfo,
    NewPlayer,
    PlayerSpawn,
    PlayerHit,
    PlayerDead,

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
    // ─── Connection ─────────────────────────
    [GameMessage.ReadyToPlay]: {};
    [GameMessage.DataDone]: {};

    // ─── Player ─────────────────────────────
    [GameMessage.PlayerInfo]: {
        id: number, pos: NetworkVector, holding: number | null, state: PlayerState,
        anim: PlayerAnim, side: Side, armAngle: number
    };
    [GameMessage.NewPlayer]: { id: number };
    [GameMessage.PlayerSpawn]: { id: number, location: NetworkVector };
    [GameMessage.PlayerHit]: { id: number, location: NetworkVector, projectileType: string, bodyPart: BodyParts };
    [GameMessage.PlayerDead]: { id: number };

    // ─── Items ──────────────────────────────
    [GameMessage.ThrowItem]: { itemID: number, pos: NetworkVector, direction: Side, throwType: ThrowType };
    [GameMessage.SpawnItem]: { id: number, location: NetworkVector, type: string };
    [GameMessage.DeleteItem]: { id: number };
    [GameMessage.ActivateItem]: {
        id: number, position: NetworkVector, angle: number,
        direction: Side, action: ItemInteractionInput, seed: number
    };
    [GameMessage.DeactivateItem]: { id: number };

    // ─── Projectiles ────────────────────────
    [GameMessage.SpawnProjectile]: { id: number, location: NetworkVector, angle: number, type: string };

    // ─── Map ────────────────────────────────
    [GameMessage.LoadMap]: { name: string };
    [GameMessage.ReadyForMap]: {};
    [GameMessage.StartMap]: { time: number };
}

const test: GameMessageMap[GameMessage] = {}

export { GameMessage };
export type { GameMessageMap, NetworkVector };
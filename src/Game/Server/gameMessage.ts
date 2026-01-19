import { PlayerState, PlayerAnim, Side, ThrowType, ItemInteraction, ProjectileEffect, EquipmentSlot } from "@common";

enum GameMessage {
    // ─── Connection ─────────────────────────
    ReadyToPlay,
    DataDone,

    // ─── Player ─────────────────────────────
    PlayerInfo,
    PlayerRagdollInfo,
    NewPlayer,
    PlayerSpawn,
    PlayerHit,
    PlayerDead,
    PlayerEquipment,

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
    [GameMessage.PlayerInfo]: { id: number, pos: NetworkVector, state: PlayerState, anim: PlayerAnim, side: Side, armAngle: number };
    [GameMessage.PlayerRagdollInfo]: { id: number, head: NetworkVector, body: NetworkVector, legs: NetworkVector };
    [GameMessage.NewPlayer]: { id: number };
    [GameMessage.PlayerSpawn]: { id: number, location: NetworkVector };
    [GameMessage.PlayerHit]: { id: number, effect: ProjectileEffect, seed: number, slot: EquipmentSlot | null };
    [GameMessage.PlayerDead]: { id: number };
    [GameMessage.PlayerEquipment]: { id: number, holding: number | null, head: number | null, body: number | null, boots: number | null, };

    // ─── Items ──────────────────────────────
    [GameMessage.ThrowItem]: { itemID: number, pos: NetworkVector, direction: Side, throwType: ThrowType };
    [GameMessage.SpawnItem]: { id: number, location: NetworkVector, type: string };
    [GameMessage.DeleteItem]: { id: number };
    [GameMessage.ActivateItem]: { id: number, position: NetworkVector, angle: number, direction: Side, action: ItemInteraction, seed: number };
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
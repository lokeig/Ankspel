import { PlayerState, PlayerAnim, Side, ThrowType, ItemInteraction, ProjectileEffect, EquipmentSlot } from "@common";

enum GameMessage {
    // ─── Connection ─────────────────────────
    ReadyToPlay,
    StartPlaying,

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

    // ─── Map ────────────────────────────────
    LoadMap,
    MapLoaded,
    StartMap,
}

type NetworkVector = {
    x: number,
    y: number
};

interface GameMessageMap {
    // ─── Connection ─────────────────────────
    [GameMessage.ReadyToPlay]: {};
    [GameMessage.StartPlaying]: {};

    // ─── Player ─────────────────────────────
    [GameMessage.PlayerInfo]: { id: number, velocity: NetworkVector, pos: NetworkVector, state: PlayerState, anim: PlayerAnim, side: Side };
    [GameMessage.PlayerRagdollInfo]: { id: number, velocity: NetworkVector, head: NetworkVector, body: NetworkVector, legs: NetworkVector };
    [GameMessage.NewPlayer]: { id: number };
    [GameMessage.PlayerSpawn]: { id: number, pos: NetworkVector };
    [GameMessage.PlayerHit]: { id: number, effect: ProjectileEffect, seed: number, slot: EquipmentSlot | null };
    [GameMessage.PlayerDead]: { id: number };
    [GameMessage.PlayerEquipment]: { id: number, holding: number | null, head: number | null, body: number | null, boots: number | null, };

    // ─── Items ──────────────────────────────
    [GameMessage.ThrowItem]: { itemID: number, pos: NetworkVector, direction: Side, throwType: ThrowType };
    [GameMessage.SpawnItem]: { id: number, pos: NetworkVector, type: string };
    [GameMessage.DeleteItem]: { id: number };
    [GameMessage.ActivateItem]: { id: number, pos: NetworkVector, angle: number, direction: Side, action: ItemInteraction, seed: number };
    [GameMessage.DeactivateItem]: { id: number };

    // ─── Projectiles ────────────────────────

    // ─── Map ────────────────────────────────
    [GameMessage.LoadMap]: { id: number };
    [GameMessage.MapLoaded]: {};
    [GameMessage.StartMap]: { time: number };
}

const test: GameMessageMap[GameMessage] = {}

export { GameMessage };
export type { GameMessageMap, NetworkVector };
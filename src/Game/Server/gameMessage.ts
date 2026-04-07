import { PlayerState, PlayerAnim, Side, ThrowType, ItemInteraction, ProjectileEffect, ProjectileEffectType, OnItemCollisionType, GameLoopState, OnItemCollision } from "@common";
import { SoundName } from "@game/Audio";
import { SpawnerDescription } from "@game/Map";
import { Vector } from "@math";

enum GameMessage {
    // ─── Connection ─────────────────────────
    ReadyToPlay,
    StartPlaying,

    // ─── Player ─────────────────────────────
    PlayerInfo,
    NewPlayer,
    PlayerLeave,
    PlayerSpawn,
    PlayerProjectileEffect,
    PlayerDead,
    PlayerEquipment,
    PlayerScore,
    PlayerEnabled,

    // ─── Items ──────────────────────────────
    SpawnItem,
    DeleteItem,
    ActivateItem,
    DeactivateItem,
    ThrowItem,
    ItemProjectileEffect,
    ItemCollision,

    // ─── Spawner ────────────────────────
    AddSpawner,
    SpawnerSpawn,

    // ─── Map ────────────────────────────────
    ResetMap,
    LoadMap,
    MapLoaded,
    StartMap,

    // ─── Other ────────────────────────────────
    ChatMessage,
    GameState,
    PlaySound
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
    [GameMessage.PlayerInfo]: { id: number, quacking: boolean, velocity: NetworkVector, pos: NetworkVector, state: PlayerState, anim: PlayerAnim, side: Side };
    [GameMessage.NewPlayer]: { id: number, color: string, name: string };
    [GameMessage.PlayerLeave]: { id: number };
    [GameMessage.PlayerSpawn]: { id: number, pos: NetworkVector };
    [GameMessage.PlayerProjectileEffect]: { id: number, type: ProjectileEffectType, effect: ProjectileEffect };
    [GameMessage.PlayerDead]: { id: number };
    [GameMessage.PlayerEquipment]: { id: number, holding: number | null, head: number | null, body: number | null, boots: number | null, };
    [GameMessage.PlayerScore]: { id: number, score: number };
    [GameMessage.PlayerEnabled]: { id: number, state: boolean };

    // ─── Items ──────────────────────────────
    [GameMessage.ThrowItem]: { id: number, pos: NetworkVector, direction: Side, throwType: ThrowType };
    [GameMessage.SpawnItem]: { id: number, pos: NetworkVector, type: string };
    [GameMessage.DeleteItem]: { id: number };
    [GameMessage.ItemProjectileEffect]: { id: number, effect: ProjectileEffect, pos: Vector };
    [GameMessage.ActivateItem]: { id: number, pos: NetworkVector, angle: number, direction: Side, action: ItemInteraction, seed: number };
    [GameMessage.DeactivateItem]: { id: number };
    [GameMessage.ItemCollision]: { id: number, effect: OnItemCollision };

    // ─── Spawner ────────────────────────
    [GameMessage.AddSpawner]: { config: SpawnerDescription, id: number };
    [GameMessage.SpawnerSpawn]: { id: number, item: string, itemId: number };

    // ─── Map ────────────────────────────────
    [GameMessage.ResetMap]: {};
    [GameMessage.LoadMap]: { id: number };
    [GameMessage.MapLoaded]: {};
    [GameMessage.StartMap]: {};

    // ─── Other ────────────────────────────────
    [GameMessage.ChatMessage]: { sender: number, text: string };
    [GameMessage.GameState]: { state: GameLoopState };
    [GameMessage.PlaySound]: { sound: SoundName };

}

export { GameMessage };
export type { GameMessageMap, NetworkVector };
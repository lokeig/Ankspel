import { IState, PlayerState } from "@common";
import { GameObject } from "@core";

interface IPlayerState extends IState<PlayerState> {
    offlineUpdate(deltaTime: number): void;
    getHeadCollision(body: GameObject): boolean;
    getBodyCollision(body: GameObject): boolean;
    getLegsCollision(body: GameObject): boolean;
} 

export type { IPlayerState };
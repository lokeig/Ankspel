import { IState, PlayerState } from "@common";

interface IPlayerState extends IState<PlayerState> {
    offlineUpdate(deltaTime: number): void;
} 

export type { IPlayerState };
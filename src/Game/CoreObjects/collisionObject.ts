import { GameObject } from "./gameObject";

type CollisionObject = {
    gameObject: GameObject;
    platform: boolean;
};

export type { CollisionObject };
import { GameObject } from "./gameObject";

type CollisionObject = {
    body: GameObject;
    platform: boolean;
};

export type { CollisionObject };
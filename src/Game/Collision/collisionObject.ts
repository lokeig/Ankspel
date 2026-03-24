import { GameObject } from "../CoreObjects/gameObject";

type CollisionObject = {
    body: GameObject;
    platform: boolean;
};

export type { CollisionObject };
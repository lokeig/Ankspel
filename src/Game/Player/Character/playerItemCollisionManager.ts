import { DynamicObject } from "@core";
import { OnItemCollision } from "@game/Common/Types/onItemCollision";
import { SpawnerManager } from "@game/Spawner";
import { IItem, ItemManager } from "@item";

class PlayerItemCollisionManager {
    private body: () => DynamicObject;
    private effectHandler: (effect: OnItemCollision) => void;

    constructor(body: () => DynamicObject, effectHandler: (effect: OnItemCollision) => void) {
        this.body = body;
        this.effectHandler = effectHandler;
    }

    public handle(deltaTime: number): IItem[] {
        const body = this.body();

        const inSpawners = SpawnerManager.getSpawnerItems(body);
        const onGround = ItemManager.getNearby(body);
        const nearby = [...inSpawners, ...onGround];

        nearby.forEach(item => {
            if (item.body.collision(body)) {
                const effects = item.playerCollision.handleLocally(deltaTime, body);
                effects.forEach(effect => this.effectHandler(effect));

                item.ignoring.set(this.body(), 0.3);
            }
        });
        return nearby;
    }
}

export { PlayerItemCollisionManager };
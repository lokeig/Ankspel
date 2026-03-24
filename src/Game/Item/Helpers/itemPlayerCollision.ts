import { OnItemCollision } from "@common";
import { DynamicObject } from "@core";
import { Connection, GameMessage } from "@server";

class ItemPlayerCollision {

    private onCollisionCallback: (deltaTime: number, body: DynamicObject) => OnItemCollision[];
    private handleCollisionCallback: (type: OnItemCollision) => void;

    private id: number;

    constructor(id: number, onCollision: (deltaTime: number, body: DynamicObject) => OnItemCollision[], handleCollision: (type: OnItemCollision) => void) {
        this.id = id;
        this.onCollisionCallback = onCollision;
        this.handleCollisionCallback = handleCollision;
    }

    public handleLocally(deltaTime: number, body: DynamicObject): OnItemCollision[] {
        const effects = this.onCollisionCallback(deltaTime, body);
        effects.forEach(effect => {
            this.handleCollisionType(effect);
            if (this.id > 0) {
                Connection.get().sendGameMessage(GameMessage.ItemCollision, ({ id: this.id, type: effect }));
            }
        });
        return effects;
    }

    public handleCollisionType(type: OnItemCollision): void {
        this.handleCollisionCallback(type);
    }
}

export { ItemPlayerCollision };
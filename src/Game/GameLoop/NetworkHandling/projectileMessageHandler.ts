import { Utility } from "@common";
import { ProjectileManager } from "@projectile";
import { Connection, GameMessage } from "@server";

class ProjectileMessageHandler {
    static init() {
        const gameEvent = Connection.get().gameEvent;

        gameEvent.subscribe(GameMessage.SpawnProjectile, ({ type, id, location, angle }) => {
            ProjectileManager.spawn(type, Utility.Vector.convertNetwork(location), angle, id);
        });
    }
}

export { ProjectileMessageHandler };
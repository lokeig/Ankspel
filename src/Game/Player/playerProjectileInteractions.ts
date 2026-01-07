import { ProjectileManager } from "@projectile";
import { PlayerCharacter } from "./Character/playerCharacter";
import { GameObject } from "@core";

type collisionFunction = (body: GameObject) => boolean;

class PlayerProjectileInteraction {
    character: PlayerCharacter;

    constructor(character: PlayerCharacter) {
        this.character = character;
    }

    public check(headCollision: collisionFunction, bodyCollision: collisionFunction, legsCollision: collisionFunction) {
        const body = this.character.body;
        const nearby = ProjectileManager.getNearbyProjectiles(body.pos, body.width, body.height);
        nearby.forEach(projectile => {
            if (headCollision(projectile.getBody())) {
                this.character.equipment
            } else if (bodyCollision(projectile.getBody())) {

            } else if (legsCollision(projectile.getBody())) {

            }
        });
    }

}

export { PlayerProjectileInteraction };
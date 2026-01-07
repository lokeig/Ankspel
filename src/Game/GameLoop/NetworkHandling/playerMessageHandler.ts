import { Utility } from "@common";
import { ItemManager } from "@item";
import { PlayerManager } from "@player";
import { Connection, GameMessage } from "@server";

class PlayerMessageHandler {
    public static init() {
        const gameEvent = Connection.get().gameEvent;

        gameEvent.subscribe(GameMessage.NewPlayer, ({ id }) => {
            PlayerManager.spawn(id);
        });

        gameEvent.subscribe(GameMessage.PlayerSpawn, ({ id, location }) => {
            const player = PlayerManager.getPlayerFromID(id);
            if (!player) {
                throw new Error("Player with id: " + id + " not found");
            }
            player.character.setPos(Utility.Vector.convertNetwork(location));
        });

        gameEvent.subscribe(GameMessage.PlayerInfo, ({ id, pos, state, holding, anim, side, armAngle }) => {
            const player = PlayerManager.getPlayerFromID(id);
            if (!player) {
                return;
            }
            player.character.setPos(Utility.Vector.convertNetwork(pos));
            if (holding !== null && ItemManager.getItemFromID(holding)) {
                player.character.equipment.setHolding(ItemManager.getItemFromID(holding)!);
            } else {
                player.character.equipment.setHolding(null);
            }
            player.setState(state);
            player.character.body.direction = side;
            player.character.animator.setAnimation(anim);
            player.character.armFront.angle = armAngle;
        });

        gameEvent.subscribe(GameMessage.PlayerHit, ({ id, bodyPart }) => {
            const player = PlayerManager.getPlayerFromID(id);
            // const projectile = ProjectileManager.spawn(projectileType, location, 0, 0);

        });

        gameEvent.subscribe(GameMessage.PlayerDead, ({ id }) => {
            const player = PlayerManager.getPlayerFromID(id)!;
            player.character.dead = true;
        }); 
    }

    public static sendLocalPlayersInfo(): void {
        PlayerManager.getLocal().forEach(player => {
            const id = PlayerManager.getPlayerID(player)!;
            let holding = player.character.equipment.getHolding();
            let itemID: number | null = null;
            if (holding) {
                itemID = ItemManager.getItemID(holding)!;
            }
            Connection.get().sendGameMessage(GameMessage.PlayerInfo, {
                id,
                pos: player.character.body.pos,
                state: player.getState(),
                holding: itemID,
                anim: player.character.animator.getCurrentAnimation(),
                side: player.character.body.direction,
                armAngle: player.character.armFront.angle,
            });
        })
    }


}

export { PlayerMessageHandler };
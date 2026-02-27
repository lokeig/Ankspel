import { EquipmentSlot, PlayerState, Utility } from "@common";
import { ItemManager } from "@item";
import { PlayerManager } from "@player";
import { Connection, GameMessage } from "@server";

class PlayerNetworkHandler {
    public static init() {
        const gameEvent = Connection.get().gameEvent;

        gameEvent.subscribe(GameMessage.NewPlayer, ({ id }) => {
            PlayerManager.spawn(id);
        });

        gameEvent.subscribe(GameMessage.PlayerSpawn, ({ id, pos }) => {
            const player = PlayerManager.getPlayerFromID(id)!;
            player.character.setPos(Utility.Vector.convertNetwork(pos));
        });

        gameEvent.subscribe(GameMessage.PlayerInfo, ({ id, pos, velocity, state, anim, side }) => {
            const player = PlayerManager.getPlayerFromID(id)!;
            if (state !== player.getCurrentState()) {
                player.setState(state);
            }
            player.character.standardBody.pos = Utility.Vector.convertNetwork(pos);
            player.character.standardBody.velocity = Utility.Vector.convertNetwork(velocity);
            if (player.character.standardBody.direction !== side) {
                player.character.armFront.angle *= -1;
                player.character.standardBody.direction = side;
            }
            player.character.animator.setAnimation(anim);
        });

        gameEvent.subscribe(GameMessage.PlayerHit, ({ id, effect, slot, seed }) => {
            const player = PlayerManager.getPlayerFromID(id)!;
            let item = null;
            if (slot && player.character.equipment.hasItem(slot)) {
                item = player.character.equipment.getItem(slot);
            }
            // player!.character.handleEffect(effect, item, seed, false);
        });

        gameEvent.subscribe(GameMessage.PlayerEquipment, ({ id, holding, head, body, boots }) => {
            const player = PlayerManager.getPlayerFromID(id)!;
            const convertion: [number | null, EquipmentSlot][] = [
                [holding, EquipmentSlot.Hand],
                [head, EquipmentSlot.Head],
                [body, EquipmentSlot.Body],
                [boots, EquipmentSlot.Boots],
            ];
            convertion.forEach(([id, slot]) => {
                if (id !== null && ItemManager.getItemFromID(id)) {
                    player.character.equipment.equip(ItemManager.getItemFromID(id)!, slot);
                } else {
                    player.character.equipment.equip(null, slot);
                }
            });
        })

        gameEvent.subscribe(GameMessage.PlayerDead, ({ id }) => {
            const player = PlayerManager.getPlayerFromID(id)!;
            player.character.die(false);
        });
    }

    public static sendLocalPlayersInfo(): void {
        PlayerManager.getLocal().forEach(player => {
            const id = player.getId();

            Connection.get().sendGameMessageUnreliable(GameMessage.PlayerInfo, {
                id,
                pos: Utility.Vector.convertToNetwork(player.character.standardBody.pos),
                velocity: Utility.Vector.convertToNetwork(player.character.standardBody.velocity),
                state: player.getCurrentState(),
                anim: player.character.animator.getCurrentAnimation(),
                side: player.character.standardBody.direction,
            });
        })
    }
}

export { PlayerNetworkHandler };
import { EquipmentSlot, PlayerState, Utility } from "@common";
import { ItemManager } from "@item";
import { PlayerManager } from "@player";
import { Connection, GameMessage } from "@server";

class PlayerNetworkHandler {
    public static init() {
        const gameEvent = Connection.get().gameEvent;

        gameEvent.subscribe(GameMessage.NewPlayer, ({ id, color }) => {
            PlayerManager.spawn(id, color);
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
            player.character.setPos(Utility.Vector.convertNetwork(pos));
            player.character.activeBody.velocity = Utility.Vector.convertNetwork(velocity);
            if (player.character.standardBody.direction !== side) {
                player.character.armFront.angle *= -1;
                player.character.standardBody.direction = side;
            }
            player.character.animator.setAnimation(anim);
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
                pos: Utility.Vector.convertToNetwork(player.character.activeBody.pos),
                velocity: Utility.Vector.convertToNetwork(player.character.activeBody.velocity),
                state: player.getCurrentState(),
                anim: player.character.animator.getCurrentAnimation(),
                side: player.character.standardBody.direction,
            });
        })
    }
}

export { PlayerNetworkHandler };
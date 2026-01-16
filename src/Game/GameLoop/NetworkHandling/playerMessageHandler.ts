import { EquipmentSlot, Utility } from "@common";
import { ItemManager } from "@item";
import { PlayerCharacter, PlayerManager } from "@player";
import { Connection, GameMessage, GameMessageMap } from "@server";

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

        gameEvent.subscribe(GameMessage.PlayerInfo, ({ id, pos, state, anim, side, armAngle }) => {
            const player = PlayerManager.getPlayerFromID(id);
            if (!player) {
                return;
            }
            player.character.setPos(Utility.Vector.convertNetwork(pos));
            player.setState(state);
            player.character.body.direction = side;
            player.character.animator.setAnimation(anim);
            player.character.armFront.angle = armAngle;
        });

        gameEvent.subscribe(GameMessage.PlayerHit, ({ id, effect, seed, bodyPart }) => {
            const player = PlayerManager.getPlayerFromID(id);
            player!.character.handleEffect(effect, seed, bodyPart);

        });

        gameEvent.subscribe(GameMessage.PlayerEquipment, ({ id, holding, head, body, boots }) => {
            const player = PlayerManager.getPlayerFromID(id)!;
            const convertion: [number | null, EquipmentSlot][] = [
                [holding, EquipmentSlot.Hand],
                [head, EquipmentSlot.Head],
                [body, EquipmentSlot.Body],
                [boots, EquipmentSlot.Boots],
            ]

            convertion.forEach(([id, slot]) => {
                if (id !== null && ItemManager.getItemFromID(id)) {
                    player.character.equipment.equip(ItemManager.getItemFromID(id)!, slot);
                } else {
                    player.character.equipment.equip(null, slot);
                }
            })

        })

        gameEvent.subscribe(GameMessage.PlayerDead, ({ id }) => {
            const player = PlayerManager.getPlayerFromID(id)!;
            player.character.dead = true;
        });
    }

    public static sendLocalPlayersInfo(): void {
        PlayerManager.getLocal().forEach(player => {
            const id = PlayerManager.getPlayerID(player)!;
            Connection.get().sendGameMessage(GameMessage.PlayerInfo, {
                id,
                pos: player.character.body.pos,
                state: player.getState(),
                anim: player.character.animator.getCurrentAnimation(),
                side: player.character.body.direction,
                armAngle: player.character.armFront.angle,
            });

            const message: GameMessageMap[GameMessage.PlayerEquipment] = {
                id,
                holding: ItemManager.getItemID(player.character.equipment.getItem(EquipmentSlot.Hand))!,
                head: ItemManager.getItemID(player.character.equipment.getItem(EquipmentSlot.Head))!,
                body: ItemManager.getItemID(player.character.equipment.getItem(EquipmentSlot.Body))!,
                boots: ItemManager.getItemID(player.character.equipment.getItem(EquipmentSlot.Boots))!,
            };
        })
    }


}

export { PlayerMessageHandler };
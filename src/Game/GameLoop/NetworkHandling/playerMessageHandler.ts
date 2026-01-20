import { EquipmentSlot, PlayerState, Utility } from "@common";
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
            const player = PlayerManager.getPlayerFromID(id)!;
            player.character.setPos(Utility.Vector.convertNetwork(location));
        });

        gameEvent.subscribe(GameMessage.PlayerInfo, ({ id, pos, state, anim, side, armAngle }) => {
            const player = PlayerManager.getPlayerFromID(id)!;
            if (state !== player.getCurrentState()) {
                player.setState(state);
            }
            player.character.setPos(Utility.Vector.convertNetwork(pos));
            player.character.body.direction = side;
            player.character.animator.setAnimation(anim);
            player.character.armFront.angle = armAngle;
        });

        gameEvent.subscribe(GameMessage.PlayerHit, ({ id, effect, slot, seed }) => {
            const player = PlayerManager.getPlayerFromID(id)!;
            let item = null;
            if (slot && player.character.equipment.hasItem(slot)) {
                item = player.character.equipment.getItem(slot);
            }
            player!.character.handleEffect(effect, item, seed, false);

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

        gameEvent.subscribe(GameMessage.PlayerRagdollInfo, ({ id, head, legs, body }) => {
            const player = PlayerManager.getPlayerFromID(id)!;
            if (player.getCurrentState() !== PlayerState.Ragdoll) {
                player.setState(PlayerState.Ragdoll);
            }
            player.setRagdoll(Utility.Vector.convertNetwork(head), Utility.Vector.convertNetwork(body), Utility.Vector.convertNetwork(legs));
        });
    }

    public static sendLocalPlayersInfo(): void {
        PlayerManager.getLocal().forEach(player => {
            const id = PlayerManager.getPlayerID(player)!;
            if (player.getCurrentState() === PlayerState.Ragdoll) {
                const positions = player.getRagdoll();
                Connection.get().sendGameMessage(GameMessage.PlayerRagdollInfo, {
                    id,
                    head: { x: positions.head.x, y: positions.head.y },
                    body: { x: positions.body.x, y: positions.body.y },
                    legs: { x: positions.legs.x, y: positions.legs.y }
                });
            } else {
                Connection.get().sendGameMessage(GameMessage.PlayerInfo, {
                    id,
                    pos: player.character.body.pos,
                    state: player.getCurrentState(),
                    anim: player.character.animator.getCurrentAnimation(),
                    side: player.character.body.direction,
                    armAngle: player.character.armFront.angle,
                });
            }
        })
    }
}

export { PlayerMessageHandler };
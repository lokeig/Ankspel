import { EquipmentSlot, Utility } from "@common";
import { ItemManager } from "@item";
import { PlayerManager } from "@player";
import { Connection, GameMessage } from "@server";
import { DuckGame } from "../game";

class PlayerNetworkHandler {
    public static init(game: DuckGame) {

        const gameEvent = Connection.get().gameEvent;

        gameEvent.subscribe(GameMessage.NewPlayer, ({ id, color, name }) => {
            PlayerManager.spawn(id, color, name);
        });

        gameEvent.subscribe(GameMessage.PlayerSpawn, ({ id, pos }) => {
            const player = PlayerManager.getPlayerFromID(id)!;
            player.character.setPos(Utility.Vector.convertNetwork(pos));
        });

        gameEvent.subscribe(GameMessage.PlayerInfo, ({ id, quacking, pos, velocity, state, anim, side }) => {
            const player = PlayerManager.getPlayerFromID(id)!;
            if (state !== player.getCurrentState()) {
                player.setState(state);
            }
            player.character.setQuacking(quacking);
            player.character.setPos(Utility.Vector.convertNetwork(pos));
            player.character.activeBody.velocity = Utility.Vector.convertNetwork(velocity);
            if (player.character.standardBody.direction !== side) {
                player.character.armFront.angle *= -1;
                player.character.standardBody.direction = side;
            }
            player.character.animator.setAnimation(anim);
        });

        gameEvent.subscribe(GameMessage.PlayerEnabled, ({ id, state }) => {
            const player = PlayerManager.getPlayerFromID(id);
            if (!player) {
                return;
            }
            player.setEnabled(state, false);
        })

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
        });

        gameEvent.subscribe(GameMessage.PlayerLeave, ({ id }) => {
            const player = PlayerManager.removePlayer(id)!;
            player.character.delete();
            game.chat.write({ sender: id, text: (" left the lobby").toUpperCase(), timeAlive: 0 });
        })

        gameEvent.subscribe(GameMessage.PlayerDead, ({ id }) => {
            const player = PlayerManager.getPlayerFromID(id)!;
            player.character.die(false);
        });

        gameEvent.subscribe(GameMessage.PlayerScore, ({ id, score }) => {
            const player = PlayerManager.getPlayerFromID(id)!;
            player.setScore(score);
        });

        gameEvent.subscribe(GameMessage.PlayerWins, ({ id, wins }) => {
            const player = PlayerManager.getPlayerFromID(id)!;
            player.setWins(wins);
        });

        gameEvent.subscribe(GameMessage.PlayerItemCollision, ({ id, effect }) => {
            const player = PlayerManager.getPlayerFromID(id)!;
            player.character.handleItemCollisionEffect(effect, false);
        })
    }

    public static sendLocalPlayersInfo(): void {
        PlayerManager.getLocal().forEach(player => {
            const id = player.getId();

            Connection.get().sendGameMessageUnreliable(GameMessage.PlayerInfo, {
                id,
                quacking: player.character.isQuacking(),
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
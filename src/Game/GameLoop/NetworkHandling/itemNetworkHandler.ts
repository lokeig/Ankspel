import { Utility } from "@common";
import { ItemManager, OnItemUseType } from "@item";
import { PlayerManager } from "@player";
import { Connection, GameMessage } from "@server";

class ItemMessageHandler {
    static init() {
        const gameEvent = Connection.get().gameEvent;

        gameEvent.subscribe(GameMessage.SpawnItem, ({ type, id, location }) => {
            ItemManager.spawn(type, Utility.Vector.convertNetwork(location), id);
        });

        gameEvent.subscribe(GameMessage.DeleteItem, ({ id }) => {
            const item = ItemManager.getItemFromID(id);
            if (!item) {
                return;
            }
            item.setToDelete();
        });

        gameEvent.subscribe(GameMessage.ActivateItem, ({ id, position, angle, direction, action, seed }) => {
            const item = ItemManager.getItemFromID(id);
            if (!item) {
                return;
            }
            item.setWorldAngle(angle);
            item.getBody().pos = Utility.Vector.convertNetwork(position);
            item.getBody().direction = direction;
            const local = false;
            const effects = item.interactions.get(action)!(seed, local);
            effects.forEach((effect) => {
                switch (effect.type) {
                    case (OnItemUseType.Aim): {
                        break;
                    }
                }
            })
        });

        gameEvent.subscribe(GameMessage.ThrowItem, ({ itemID, pos, direction, throwType }) => {
            const item = ItemManager.getItemFromID(itemID);
            if (!item) {
                return;
            }
            PlayerManager.getPlayers().forEach(player => {
                player.character.equipment.getAllEquippedItems().forEach((key, slot) => {
                    if (player.character.equipment.getItem(slot) === item) {
                        player.character.equipment.equip(null, slot);
                    }
                })
            });
            item.getBody().pos = Utility.Vector.convertNetwork(pos);
            item.getBody().direction = direction;
            item.throw(throwType);
        });
    }
}

export { ItemMessageHandler };
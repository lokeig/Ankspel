import { Utility } from "@common";
import { SpawnerManager } from "@game/Spawner";
import { isEquippable, ItemManager, OnItemUseType } from "@item";
import { Vector } from "@math";
import { PlayerManager } from "@player";
import { Connection, GameMessage } from "@server";

class ItemMessageHandler {
    static init() {
        const gameEvent = Connection.get().gameEvent;

        gameEvent.subscribe(GameMessage.SpawnItem, ({ type, id, pos: location }) => {
            ItemManager.spawn(type, Utility.Vector.convertNetwork(location), id);
        });

        gameEvent.subscribe(GameMessage.DeleteItem, ({ id }) => {
            const item = ItemManager.getItemFromID(id);
            if (!item) {
                console.log("Can't delete item: ", id, ", doesn't exist.");
                return;
            }
            item.setToDelete();
        });

        gameEvent.subscribe(GameMessage.ActivateItem, ({ id, pos: position, angle, direction, action, seed }) => {
            const item = ItemManager.getItemFromID(id);
            if (!item) {
                console.log("Can't activate item: ", id, ", doesn't exist.")
                return;
            }
            item.setAngle(angle);
            item.body.pos = Utility.Vector.convertNetwork(position);
            item.body.direction = direction;
            const local = false;
            const effects = item.playerInteractions.getUse(action)!(seed, local);
            effects.forEach((effect) => {
                switch (effect.type) {
                    case (OnItemUseType.Aim): {
                        break;
                    }
                }
            });
        });

        gameEvent.subscribe(GameMessage.AddSpawner, ({ config, id }) => {
            SpawnerManager.spawn(config, id);
        });

        gameEvent.subscribe(GameMessage.ItemCollision, ({ id, type }) => {
            const item = ItemManager.getItemFromID(id);
            if (!item) {
                console.log("Can't collide item: ", id, ", doesn't exist.")
                return;
            }
            item.playerCollision.handleCollisionType(type);
        });

        gameEvent.subscribe(GameMessage.ItemProjectileEffect, ({ id, pos, effect }) => {
            const item = ItemManager.getItemFromID(id);
            if (!item) {
                console.log("Can't effect item: ", id, ", doesn't exist.")
                return;
            }
            item.projectileCollision.handleEffect(effect, pos);
        });


        gameEvent.subscribe(GameMessage.SpawnerSpawn, ({ id, item, itemId }) => {
            const spawner = SpawnerManager.getSpawnerFromId(id);
            if (!spawner) {
                console.log("Can't find spawner ", id);
                return;
            }
            const newItem = ItemManager.spawn(item, new Vector(), itemId);
            if (!newItem) {
                console.log("Can't find item ", item);
                return;
            }
            spawner.setContaining(newItem);
        });

        gameEvent.subscribe(GameMessage.ItemProjectileEffect, ({ id, pos, effect }) => {
            const item = ItemManager.getItemFromID(id);
            if (!item || !isEquippable(item)) {
                return;
            }
            item.onProjectileEffect(effect, pos, true);
        })

        gameEvent.subscribe(GameMessage.ThrowItem, ({ id, pos, direction, throwType }) => {
            const item = ItemManager.getItemFromID(id);
            if (!item) {
                console.log("Can't throw item: ", id, ", doesn't exist.");
                return;
            }
            PlayerManager.getPlayers().forEach(player => {
                player.character.equipment.getAllEquippedItems().forEach((_, slot) => {
                    if (player.character.equipment.getItem(slot) === item) {
                        player.character.equipment.equip(null, slot);
                    }
                })
            });
            item.body.pos = Utility.Vector.convertNetwork(pos);
            item.body.direction = direction;
            item.throw(throwType);
        });
    }
}

export { ItemMessageHandler };
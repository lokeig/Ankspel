import { ItemManager } from "@item";
import { Shotgun } from "./shotgun";
import { Glock } from "./glock";
import { Grenade } from "./grenade";
import { ProjectileManager } from "@projectile";
import { ShotgunBullet } from "@impl/Projectiles";

function RegisterItems() {
    ItemManager.registerItem("shotgun", Shotgun);
    ItemManager.registerItem("glock", Glock);
    ItemManager.registerItem("grenade", Grenade);

    ProjectileManager.registerProjectile("shotgunBullet", ShotgunBullet);
}

export { RegisterItems };
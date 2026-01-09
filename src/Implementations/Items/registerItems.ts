import { Shotgun } from "./Shotgun/shotgun";
import { Glock } from "./glock";
import { Grenade } from "./grenade";
import { Chestplate } from "./Armor/chestplate";
import { Helmet } from "./Armor/helmet";
import { ItemManager } from "@item";

import { ProjectileManager } from "@projectile";
import { ShotgunBullet } from "@impl/Projectiles";
import { GlockBullet } from "@impl/Projectiles/glockBullet";
import { GrenadeBullet } from "@impl/Projectiles/grenadeBullet";

function RegisterItems() {
    ItemManager.registerItem("shotgun", Shotgun);
    ItemManager.registerItem("glock", Glock);
    ItemManager.registerItem("grenade", Grenade);
    ItemManager.registerItem("chestplate", Chestplate);
    ItemManager.registerItem("helmet", Helmet);


    ProjectileManager.registerProjectile("glockBullet", GlockBullet);
    ProjectileManager.registerProjectile("shotgunBullet", ShotgunBullet);
    ProjectileManager.registerProjectile("grenadeBullet", GrenadeBullet);

}

export { RegisterItems };
import { ItemManager } from "@item";
import { Shotgun } from "./Shotgun/shotgun";
import { Glock } from "./glock";
import { Grenade } from "./grenade";
import { ProjectileManager } from "@projectile";
import { ShotgunBullet } from "@impl/Projectiles";
import { GlockBullet } from "@impl/Projectiles/glockBullet";
import { GrenadeBullet } from "@impl/Projectiles/grenadeBullet";

function RegisterItems() {
    ItemManager.registerItem("shotgun", Shotgun);
    ItemManager.registerItem("glock", Glock);
    ItemManager.registerItem("grenade", Grenade);

    ProjectileManager.registerProjectile("glockBullet", GlockBullet);
    ProjectileManager.registerProjectile("shotgunBullet", ShotgunBullet);
    ProjectileManager.registerProjectile("grenadeBullet", GrenadeBullet);

}

export { RegisterItems };
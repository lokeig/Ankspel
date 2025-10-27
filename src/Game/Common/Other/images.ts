import { TileType } from "../Types/tileType";

const images = {
    // Player
    playerImage: '/assets/player.png',
    playerHands: '/assets/playerHands.png',

    // World
    tileIce: '/assets/tileIce.png',
    background: '/assets/rainbow.jpg',

    // Props
    prop: '/assets/props.png',

    // Weapons
    shotgun: '/assets/shotguns.png',
    glock: '/assets/glock.png',
    grenade: '/assets/grenade.png',

    // Projectiles
    bullet: '/assets/bullet.png',

    // Particles
    explosion: '/assets/explosion.png'
};

function getTileImage(type: TileType): string {
    return `/assets/tile${TileType[type]}.png`;
}

export { images, getTileImage };
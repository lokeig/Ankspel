import { forestBackground } from "@impl/Parallax/forestBackground";

const Images = {
    // Player
    player: { src: '/assets/player.png', frameWidth: 32, frameHeight: 32 },
    playerHands: { src: '/assets/playerHands.png', frameWidth: 16, frameHeight: 16 },

    // World
    tileIce: { src: '/assets/tileIce.png', frameWidth: 16, frameHeight: 16 },
    tileNature: { src: '/assets/natureTileset.png', frameWidth: 16, frameHeight: 16 },

    // Props
    prop: { src: '/assets/props.png', frameWidth: 16, frameHeight: 16 },

    // Weapons
    shotgun: { src: '/assets/shotguns.png', frameWidth: 32, frameHeight: 32 },
    glock: { src: '/assets/glock.png', frameWidth: 20, frameHeight: 20 },
    grenade: { src: '/assets/grenade.png', frameWidth: 16, frameHeight: 16 },

    // Gear
    armor: { src: '/assets/armor.png', frameWidth: 16, frameHeight: 16 },

    // Projectiles
    trail: { src: '/assets/trail.png', frameWidth: 8, frameHeight: 1 },

    // Particles
    explosion: { src: '/assets/explosion.png', frameWidth: 64, frameHeight: 64 },
    smallFlare: { src: '/assets/smallFlare.png', frameWidth: 11, frameHeight: 10 },
    bulletRebound: { src: '/assets/bulletRebound.png', frameWidth: 16, frameHeight: 16 },
    bulletGlow: { src: '/assets/bulletGlow.png', frameWidth: 1, frameHeight: 5 },

    // Background
    forestBackground: { src: '/assets/ParallaxBackgrounds/forest.png', frameWidth: 320, frameHeight: 240 },

    // UI
    ready: { src: '/assets/ready.png', frameWidth: 41, frameHeight: 9 },
    get: { src: '/assets/get.png', frameWidth: 25, frameHeight: 9 },
} as const;

type ImageName = keyof typeof Images;
type ImageInfo = typeof Images[keyof typeof Images];

export { Images };
export type { ImageName, ImageInfo };
const Images = {
    // Player
    player: { src: '/assets/images/player/player.png', frameWidth: 32, frameHeight: 32 },
    playerHands: { src: '/assets/images/player/playerHands.png', frameWidth: 16, frameHeight: 16 },

    // Tiles
    tileIce: { src: '/assets/images/tiles/tileIce.png', frameWidth: 16, frameHeight: 16 },
    tileNature: { src: '/assets/images/tiles/natureTileset.png', frameWidth: 16, frameHeight: 16 },
    
    // Items
    prop: { src: '/assets/images/items/props.png', frameWidth: 16, frameHeight: 16 },
    shotgun: { src: '/assets/images/items/shotguns.png', frameWidth: 32, frameHeight: 32 },
    glock: { src: '/assets/images/items/glock.png', frameWidth: 20, frameHeight: 20 },
    grenade: { src: '/assets/images/items/grenade.png', frameWidth: 16, frameHeight: 16 },
    armor: { src: '/assets/images/items/armor.png', frameWidth: 16, frameHeight: 16 },

    // Projectiles
    trail: { src: '/assets/images/projectiles/trail.png', frameWidth: 8, frameHeight: 1 },

    // Particles
    explosion: { src: '/assets/images/vfx/explosion.png', frameWidth: 64, frameHeight: 64 },
    smallFlare: { src: '/assets/images/vfx/smallFlare.png', frameWidth: 11, frameHeight: 10 },
    bulletRebound: { src: '/assets/images/vfx/bulletRebound.png', frameWidth: 16, frameHeight: 16 },
    bulletGlow: { src: '/assets/images/vfx/bulletGlow.png', frameWidth: 1, frameHeight: 5 },

    // Background
    forestBackground: { src: '/assets/images/ParallaxBackgrounds/forest.png', frameWidth: 320, frameHeight: 240 },

    // UI
    ready: { src: '/assets/images/ui/ready.png', frameWidth: 41, frameHeight: 9 },
    get: { src: '/assets/images/ui/get.png', frameWidth: 25, frameHeight: 9 },
} as const;

type ImageName = keyof typeof Images;
type ImageInfo = typeof Images[keyof typeof Images];

export { Images };
export type { ImageName, ImageInfo };
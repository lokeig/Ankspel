const Images = {
    // Player
    player: { src: '/assets/Images/Player/player.png', frameWidth: 32, frameHeight: 32 },
    playerHands: { src: '/assets/Images/Player/playerHands.png', frameWidth: 16, frameHeight: 16 },

    // Tiles
    tileIce: { src: '/assets/Images/Tiles/tileIce.png', frameWidth: 16, frameHeight: 16 },
    tileNature: { src: '/assets/Images/Tiles/natureTileset.png', frameWidth: 16, frameHeight: 16 },
    
    // Items
    prop: { src: '/assets/Images/Items/props.png', frameWidth: 16, frameHeight: 16 },
    shotgun: { src: '/assets/Images/Items/shotguns.png', frameWidth: 32, frameHeight: 32 },
    glock: { src: '/assets/Images/Items/glock.png', frameWidth: 20, frameHeight: 20 },
    grenade: { src: '/assets/Images/Items/grenade.png', frameWidth: 16, frameHeight: 16 },
    armor: { src: '/assets/Images/Items/armor.png', frameWidth: 16, frameHeight: 16 },

    // Projectiles
    trail: { src: '/assets/Images/Projectiles/trail.png', frameWidth: 8, frameHeight: 1 },

    // Particles
    explosion: { src: '/assets/Images/VFX/explosion.png', frameWidth: 64, frameHeight: 64 },
    smallFlare: { src: '/assets/Images/VFX/smallFlare.png', frameWidth: 11, frameHeight: 10 },
    bulletRebound: { src: '/assets/Images/VFX/bulletRebound.png', frameWidth: 16, frameHeight: 16 },
    bulletGlow: { src: '/assets/Images/VFX/bulletGlow.png', frameWidth: 1, frameHeight: 5 },

    // Background
    forestBackground: { src: '/assets/Images/ParallaxBackgrounds/forest.png', frameWidth: 320, frameHeight: 240 },

    // UI
    ready: { src: '/assets/Images/UI/ready.png', frameWidth: 41, frameHeight: 9 },
    get: { src: '/assets/Images/UI/get.png', frameWidth: 25, frameHeight: 9 },
} as const;

type ImageName = keyof typeof Images;
type ImageInfo = typeof Images[keyof typeof Images];

export { Images };
export type { ImageName, ImageInfo };
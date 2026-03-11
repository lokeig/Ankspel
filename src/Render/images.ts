const Images = {
    // Player
    playerBlack: { src: '/assets/Images/Player/playerBlack.png', frameWidth: 32, frameHeight: 32 },
    playerBlue: { src: '/assets/Images/Player/playerBlue.png', frameWidth: 32, frameHeight: 32 },
    playerBrown: { src: '/assets/Images/Player/playerBrown.png', frameWidth: 32, frameHeight: 32 },
    playerGreen: { src: '/assets/Images/Player/playerGreen.png', frameWidth: 32, frameHeight: 32 },
    playerPink: { src: '/assets/Images/Player/playerPink.png', frameWidth: 32, frameHeight: 32 },
    playerRed: { src: '/assets/Images/Player/playerRed.png', frameWidth: 32, frameHeight: 32 },
    playerWhite: { src: '/assets/Images/Player/playerWhite.png', frameWidth: 32, frameHeight: 32 },
    playerYellow: { src: '/assets/Images/Player/playerYellow.png', frameWidth: 32, frameHeight: 32 },
    playerGrey: { src: '/assets/Images/Player/playerGrey.png', frameWidth: 32, frameHeight: 32 },

    playerBlackHands: { src: '/assets/Images/Player/playerHandsBlack.png', frameWidth: 16, frameHeight: 16 },
    playerBlueHands: { src: '/assets/Images/Player/playerHandsBlue.png', frameWidth: 16, frameHeight: 16 },
    playerBrownHands: { src: '/assets/Images/Player/playerHandsBrown.png', frameWidth: 16, frameHeight: 16 },
    playerGreenHands: { src: '/assets/Images/Player/playerHandsGreen.png', frameWidth: 16, frameHeight: 16 },
    playerPinkHands: { src: '/assets/Images/Player/playerHandsPink.png', frameWidth: 16, frameHeight: 16 },
    playerRedHands: { src: '/assets/Images/Player/playerHandsRed.png', frameWidth: 16, frameHeight: 16 },
    playerWhiteHands: { src: '/assets/Images/Player/playerHandsWhite.png', frameWidth: 16, frameHeight: 16 },
    playerYellowHands: { src: '/assets/Images/Player/playerHandsYellow.png', frameWidth: 16, frameHeight: 16 },
    playerGreyHands: { src: '/assets/Images/Player/playerHandsGrey.png', frameWidth: 16, frameHeight: 16 },

    // Tiles
    tileIce: { src: '/assets/Images/Tiles/tileIce.png', frameWidth: 16, frameHeight: 16 },
    tileNature: { src: '/assets/Images/Tiles/natureTileset.png', frameWidth: 16, frameHeight: 16 },
    woodPlatform: { src: '/assets/Images/Tiles/woodPlatform.png', frameWidth: 16, frameHeight: 16 },

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
    spawnerBall: { src: '/assets/Images/VFX/spawnerBall.png', frameWidth: 4, frameHeight: 4 },
    itemSpawner: { src: '/assets/Images/VFX/itemSpawner.png', frameWidth: 14, frameHeight: 6 },

    // Background
    forest: { src: '/assets/Images/ParallaxBackgrounds/forest.png', frameWidth: 320, frameHeight: 240 },
    cloud1: { src: '/assets/Images/ParallaxBackgrounds/cloud1.png', frameWidth: 43, frameHeight: 12 },
    cloud2: { src: '/assets/Images/ParallaxBackgrounds/cloud2.png', frameWidth: 21, frameHeight: 10 },

    // UI
    ready: { src: '/assets/Images/UI/ready.png', frameWidth: 41, frameHeight: 9 },
    get: { src: '/assets/Images/UI/get.png', frameWidth: 25, frameHeight: 9 },
} as const;

type ImageName = keyof typeof Images;
type ImageInfo = typeof Images[keyof typeof Images];

export { Images };
export type { ImageName, ImageInfo };
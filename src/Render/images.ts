const Images = {
    // Player
    playerBase: { src: '/assets/Images/Player/playerBase.png', frameWidth: 32, frameHeight: 32 },
    playerBaseQuack: { src: '/assets/Images/Player/playerBaseQuack.png', frameWidth: 32, frameHeight: 32 },

    playerBaseMultiply: { src: '/assets/Images/Player/playerBaseMultiply.png', frameWidth: 32, frameHeight: 32 },
    playerOverlay: { src: '/assets/Images/Player/playerOverlay.png', frameWidth: 32, frameHeight: 32 },
    playerMask: { src: '/assets/Images/Player/playerMask.png', frameWidth: 32, frameHeight: 32 },

    playerHandsBase: { src: '/assets/Images/Player/playerHandsBase.png', frameWidth: 16, frameHeight: 16 },
    playerHandsBaseMultiply: { src: '/assets/Images/Player/playerHandsMultiply.png', frameWidth: 16, frameHeight: 16 },
    playerHandsOverlay: { src: '/assets/Images/Player/playerHandsOverlay.png', frameWidth: 16, frameHeight: 16 },
    playerHandsMask: { src: '/assets/Images/Player/playerHandsMask.png', frameWidth: 16, frameHeight: 16 },

    playerFeather: { src: '/assets/Images/Player/feather.png', frameWidth: 12, frameHeight: 4 },

    // Tiles
    tileIce: { src: '/assets/Images/Tiles/tileIce.png', frameWidth: 16, frameHeight: 16 },
    tileNature: { src: '/assets/Images/Tiles/natureTileset.png', frameWidth: 16, frameHeight: 16 },
    woodPlatform: { src: '/assets/Images/Tiles/woodPlatform.png', frameWidth: 16, frameHeight: 16 },

    // Items
    rock: { src: '/assets/Images/Items/rock.png', frameWidth: 16, frameHeight: 13 },
    crate: { src: '/assets/Images/Items/crate.png', frameWidth: 16, frameHeight: 16 },
    shotgun: { src: '/assets/Images/Items/shotguns.png', frameWidth: 32, frameHeight: 32 },
    glock: { src: '/assets/Images/Items/glock.png', frameWidth: 20, frameHeight: 20 },
    grenade: { src: '/assets/Images/Items/grenade.png', frameWidth: 16, frameHeight: 16 },
    armor: { src: '/assets/Images/Items/armor.png', frameWidth: 16, frameHeight: 16 },
    netGun: { src: '/assets/Images/Items/netGun.png', frameWidth: 32, frameHeight: 32 },
    netGunGuage: { src: '/assets/Images/Items/netGunGuage.png', frameWidth: 8, frameHeight: 8 },
    mine: { src: '/assets/Images/Items/mine.png', frameWidth: 18, frameHeight: 10 },
    mineFlash: { src: '/assets/Images/Items/mineFlash.png', frameWidth: 48, frameHeight: 48 },
    bazooka: { src: '/assets/Images/Items/bazooka.png', frameWidth: 30, frameHeight: 13 },

    // Projectiles
    net: { src: '/assets/Images/Projectiles/net.png', frameWidth: 16, frameHeight: 16 },
    trail: { src: '/assets/Images/Projectiles/trail.png', frameWidth: 8, frameHeight: 1 },
    missile: { src: '/assets/Images/Projectiles/missile.png', frameWidth: 14, frameHeight: 8 },

    // Particles
    explosion: { src: '/assets/Images/VFX/explosion.png', frameWidth: 64, frameHeight: 64 },
    smallFlare: { src: '/assets/Images/VFX/smallFlare.png', frameWidth: 11, frameHeight: 10 },
    bulletRebound: { src: '/assets/Images/VFX/bulletRebound.png', frameWidth: 16, frameHeight: 16 },
    bulletGlow: { src: '/assets/Images/VFX/bulletGlow.png', frameWidth: 1, frameHeight: 5 },
    spawnerBall: { src: '/assets/Images/VFX/spawnerBall.png', frameWidth: 4, frameHeight: 4 },
    itemSpawner: { src: '/assets/Images/VFX/itemSpawner.png', frameWidth: 14, frameHeight: 6 },
    dizzyStar: { src: '/assets/Images/VFX/dizzyStar.png', frameWidth: 9, frameHeight: 7 },
    smokeFront: { src: '/assets/Images/VFX/smoke.png', frameWidth: 44, frameHeight: 42 },
    smokeBack: { src: '/assets/Images/VFX/smokeBack.png', frameWidth: 44, frameHeight: 42 },

    // Background
    forest: { src: '/assets/Images/ParallaxBackgrounds/forest.png', frameWidth: 320, frameHeight: 240 },
    cloud1: { src: '/assets/Images/ParallaxBackgrounds/cloud1.png', frameWidth: 43, frameHeight: 12 },
    cloud2: { src: '/assets/Images/ParallaxBackgrounds/cloud2.png', frameWidth: 21, frameHeight: 10 },

    // UI
    ready: { src: '/assets/Images/UI/ready.png', frameWidth: 41, frameHeight: 9 },
    get: { src: '/assets/Images/UI/get.png', frameWidth: 25, frameHeight: 9 },
    plusOne: { src: '/assets/Images/UI/plusOne.png', frameWidth: 19, frameHeight: 15 },
    plusWin: { src: '/assets/Images/UI/plusOneWin.png', frameWidth: 19, frameHeight: 15 },
    scoreboard: { src: '/assets/Images/UI/scoreboard.png', frameWidth: 176, frameHeight: 180 },
    doorLeft: { src: '/assets/Images/UI/doorLeft.png', frameWidth: 123, frameHeight: 175 },
    doorRight: { src: '/assets/Images/UI/doorRight.png', frameWidth: 123, frameHeight: 175 },
} as const;

type ImageName = keyof typeof Images;
type ImageInfo = typeof Images[keyof typeof Images];

export { Images };
export type { ImageName, ImageInfo };
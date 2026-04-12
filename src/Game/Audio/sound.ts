const Sound = {
    quack: "quack",
    quackSwear: "quackSwear",

    crateDestroy: "crateDestroy",
    crateHit: "crateHit",
    woodHit: "woodHit",
    metalHit: "metalHit",

    glock: "glock",
    shotgunFire: "shotgunFire",
    shotgunLoad: "shotgunLoad",
    explode: "explode",
    pullPin: "pullPin",
    land: "land",
    jump: "jump",
    equip: "equip",
    beep: "beep",
    ting: "ting",
    click: "click",
    death: "death",
    netGunFire: "netGunFire",

    score: "score",
    win: "win",

    wallTouch: "wallTouch",
    wallLeave: "wallLeave",

    rock: "rock",

} as const;

const SoundInfo: Record<SoundName, { src: string }> = {
    quack: { src: "/assets/Sounds/quack.mp3" },
    quackSwear: { src: "/assets/Sounds/quackSwear.mp3" },

    crateDestroy: { src: "/assets/Sounds/crateDestroy.mp3" },
    crateHit: { src: "/assets/Sounds/crateHit.mp3" },
    woodHit: { src: "/assets/Sounds/woodHit.mp3" },
    metalHit: { src: "/assets/Sounds/metalHit.mp3" },

    glock: { src: "/assets/Sounds/glock.mp3" },
    shotgunFire: { src: "/assets/Sounds/shotgunFire.mp3" },
    shotgunLoad: { src: "/assets/Sounds/shotgunLoad.mp3" },
    explode: { src: "/assets/Sounds/explode.mp3" },
    pullPin: { src: "/assets/Sounds/pullPin.mp3" },
    land: { src: "/assets/Sounds/land.mp3" },
    jump: { src: "/assets/Sounds/jump.mp3" },
    equip: { src: "/assets/Sounds/equip.mp3" },
    beep: { src: "/assets/Sounds/beep.mp3" },
    ting: { src: "/assets/Sounds/ting.mp3" },
    click: { src: "/assets/Sounds/click.mp3" },
    death: { src: "/assets/Sounds/death.mp3" },
    netGunFire: { src: "/assets/Sounds/netGunFire.mp3" },

    score: { src: "/assets/Sounds/score.mp3" },
    win: { src: "/assets/Sounds/win.mp3" },

    wallTouch: { src: "/assets/Sounds/wallTouch.mp3" },
    wallLeave: { src: "/assets/Sounds/wallLeave.mp3" },

    rock: { src: "/assets/Sounds/rockHitGround.mp3" },
};

type SoundName = typeof Sound[keyof typeof Sound];

export { Sound, SoundInfo };
export type { SoundName };
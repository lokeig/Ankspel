const Sound = {
    quack: "quack",
    quackSwear: "quackSwear",
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
    score: "score",
    death: "death",

} as const;

const SoundInfo: Record<SoundName, { src: string }> = {
    quack: { src: "/assets/Sounds/quack.mp3" },
    quackSwear: { src: "/assets/Sounds/quackSwear.mp3" },
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
    score: { src: "/assets/Sounds/score.mp3" },
    death: { src: "/assets/Sounds/death.mp3" },
};

type SoundName = typeof Sound[keyof typeof Sound];

export { Sound, SoundInfo };
export type { SoundName };
const Sound = {
    glock: "glock",
    shotgunFire: "shotgunFire",
    shotgunLoad: "shotgunLoad",
    explode: "explode",
    pullPin: "pullPin",
    land: "land",
    jump: "jump",
    equip: "equip",
    beep: "beep",
} as const;

const SoundInfo: Record<SoundName, { src: string }> = {
    glock: { src: "/assets/sounds/glock.mp3" },
    shotgunFire: { src: "/assets/sounds/shotgunFire.mp3" },
    shotgunLoad: { src: "/assets/sounds/shotgunLoad.mp3" },
    explode: { src: "/assets/sounds/explode.mp3" },
    pullPin: { src: "/assets/sounds/pullPin.mp3" },
    land: { src: "/assets/sounds/land.mp3" },
    jump: { src: "/assets/sounds/jump.mp3" },
    equip: { src: "/assets/sounds/equip.mp3" },
    beep: { src: "/assets/sounds/beep.mp3" },
};
    
type SoundName = typeof Sound[keyof typeof Sound];

export { Sound, SoundInfo };
export type { SoundName };
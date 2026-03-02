const Sound = {
    Glock: "glock",
    Music: "music",
} as const;

type SoundName  = typeof Sound[keyof typeof Sound];

export { Sound };
export type { SoundName };
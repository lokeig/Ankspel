import { SoundName } from "./sound";

interface IAudio {
    load(name: SoundName, src: string): Promise<void>;
    play(name: SoundName): void;
}

type AudioOption = {
    volume: number,
    loop: boolean,
}

export type { IAudio, AudioOption };
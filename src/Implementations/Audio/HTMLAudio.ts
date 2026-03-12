import { IAudio, SoundName } from "@game/Audio";

class HTMLAudio implements IAudio {
    private sounds: Map<SoundName, HTMLAudioElement> = new Map();

    public async load(name: SoundName, src: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const audio = new Audio(src);

            audio.volume = 0.1;
            audio.loop = false;

            audio.oncanplaythrough = () => {
                this.sounds.set(name, audio);
                resolve();
            }
            audio.onerror = () => reject("Failed to load audio: " + src);
        });
    }

    public play(name: SoundName): void {
        const audio = this.sounds.get(name);
        if (!audio) {
            console.error("Sound " + name + " played before being loaded");
            return;
        }
        const soundInstance = audio.cloneNode(true) as HTMLAudioElement;
        
        soundInstance.volume = audio.volume;
        soundInstance.loop = audio.loop;

        soundInstance.play();
    }
}

export { HTMLAudio };
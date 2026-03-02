import { IAudio } from "./IAudio"

class AudioManager {
    private static current: IAudio;

    public static set(audioIF: IAudio): void {
        this.current = audioIF;
    }

    public static get(): IAudio {
        return this.current;
    }
}

export { AudioManager };
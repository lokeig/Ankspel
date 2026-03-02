interface IAudio {
    load(name: string, src: string): void;
    play(name: string, ): void;
} 

type AudioOption = {
    volume: number,
    loop: boolean,
}
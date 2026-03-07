import { Frame, Side } from "@common";

class SpriteLookup {
    private table: Record<number, Frame>;
    private lipLeft: Frame;
    private lipRight: Frame;
    private static emptyFrame = new Frame();

    constructor(table: Record<number, Frame>, lipLeft: Frame, lipRight: Frame) {
        this.table = table;
        this.lipLeft = lipLeft;
        this.lipRight = lipRight;
    }

    public tile(id: number): Frame {
        const result = this.table[id];
        return result ? result : SpriteLookup.emptyFrame;
    }

    public getLip(side: Side): Frame {
        return side === Side.Left ? this.lipLeft : this.lipRight;
    }
}

export { SpriteLookup };
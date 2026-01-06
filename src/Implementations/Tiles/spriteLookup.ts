import { Frame, Side } from "@common";
class SpriteLookup {
    private table: Record<number, Frame>;
    private lipLeft: Frame;
    private lipRight: Frame;

    constructor(table: Record<number, Frame>, lipLeft: Frame, lipRight: Frame) {
        this.table = table;
        this.lipLeft = lipLeft;
        this.lipRight = lipRight;
    }

    public tile(id: number): Frame {
        const result = this.table[id];
        return result ? result : new Frame();
    }

    public getLip(side: Side): Frame {
        return side === Side.Left ? this.lipLeft : this.lipRight;
    }
}

export { SpriteLookup };
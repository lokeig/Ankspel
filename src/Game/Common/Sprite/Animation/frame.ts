class Frame {
    public row: number;
    public col: number;

    constructor(row: number = 0, col: number = 0) {
        this.row = row;
        this.col = col;
    }

    public set(row: number, col: number): void {
        this.row = row;
        this.col = col;
    }
}

export { Frame };
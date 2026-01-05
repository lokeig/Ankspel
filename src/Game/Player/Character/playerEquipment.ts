import { IItem } from "@item";

class PlayerEquipment {
    private helmet!: IItem;
    private armor!: IItem;
    private boots!: IItem;
    private holding: IItem | null = null;
    
    public isHolding(): boolean {
        return this.holding !== null;
    }

    public getHolding(): IItem {
        return this.holding!;
    }

    public setHolding(item: IItem | null): void {
        if (!item && this.holding) {
            this.holding.setOwnership(false);
        }
        this.holding = item;
        if (item) {
            this.holding!.setOwnership(true);
        }
    }
}

export { PlayerEquipment };
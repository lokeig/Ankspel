import { OnItemUseEffect } from "./itemInteraction";

type useFunction = (deltaTime: number, seed: number) => OnItemUseEffect[];
const defaultFunction: useFunction = (deltaTime: number, seed: number) => { return [] };

class ItemControls {
    public onDown: useFunction = defaultFunction;
    public onUp: useFunction = defaultFunction;
    public onLeft: useFunction = defaultFunction;
    public onRight: useFunction = defaultFunction;
    public onFlap: useFunction = defaultFunction;
    public onJump: useFunction = defaultFunction;
    public onActivate: useFunction = defaultFunction;
}

export { ItemControls };
export type { useFunction };

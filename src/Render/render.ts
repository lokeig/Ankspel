import { IRender } from "./IRender";

class Render {
    public static renderIF: IRender;

    public static set(renderIF: IRender): void {
        this.renderIF = renderIF;
    }

    public static get(): IRender {
        return this.renderIF;
    }
}

export { Render };
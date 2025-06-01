import { RenderIF } from "./renderInterface";

export class Render {

    public static renderIF: RenderIF;

    public static set(renderIF: RenderIF): void {
        this.renderIF = renderIF;
    }

    public static get(): RenderIF {
        return this.renderIF;
    }
}
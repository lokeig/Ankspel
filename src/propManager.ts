import { Prop } from "./prop";

export class PropManager {
    private props: Map<string, [Prop]> = new Map();

    draw(ctx: CanvasRenderingContext2D) {
        for (const prop of this.props.values() {
            prop.draw(ctx);
        }
    }
}
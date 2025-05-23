import { Prop } from "./prop";

export class PropManager {
    private props: Map<string, [Prop]> = new Map();
    private movingProps: Array<Prop> = [];

    update(deltaTime: number) {
        for (const propArray of this.props.values()) {
            for (const prop of propArray.values()) {
                prop.update(deltaTime);
            }
        }
    }
    draw(ctx: CanvasRenderingContext2D) {
        for (const propArray of this.props.values()) {
            for (const prop of propArray.values()) {
                prop.draw(ctx);
            }
        }
    }
}
import { Direction } from "../Types/direction"


export class DirectionUtility {

    getReverseDirection(direction: Direction) {
        switch (direction) {
            case "left": return "right";
            case "right": return "left";
            case "top": return "bot";
            case "bot": return "top";
            case "topLeft": return "botRight";
            case "topRight": return "botLeft";
            case "botLeft": return "topRight";
            case "botRight": return "topLeft";
        }
    }
}
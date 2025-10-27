import { Direction } from "../Types/direction"

class DirectionUtility {

    public getReverseDirection(direction: Direction): Direction {
        switch (direction) {
            case Direction.left: return Direction.right;
            case Direction.right: return Direction.left;
            case Direction.top: return Direction.bot;
            case Direction.bot: return Direction.top;
            case Direction.topLeft: return Direction.botRight;
            case Direction.topRight: return Direction.botLeft;
            case Direction.botLeft: return Direction.topRight;
            case Direction.botRight: return Direction.topLeft;
        }
    }
}

export { DirectionUtility };
import { Direction } from "../Types/direction"

class DirectionUtility {

    public getReverseDirection(direction: Direction): Direction {
        switch (direction) {
            case Direction.Left: return Direction.Right;
            case Direction.Right: return Direction.Left;
            case Direction.Top: return Direction.Bot;
            case Direction.Bot: return Direction.Top;
            case Direction.TopLeft: return Direction.BotRight;
            case Direction.TopRight: return Direction.BotLeft;
            case Direction.BotLeft: return Direction.TopRight;
            case Direction.BotRight: return Direction.TopLeft;
        }
    }
}

export { DirectionUtility };
import { Direction } from "../Types/direction"

class DirectionUtility {

    public getReverseDirection(direction: Direction): Direction {
        switch (direction) {
            case Direction.Left: return Direction.Right;
            case Direction.Right: return Direction.Left;
            case Direction.Up: return Direction.Down;
            case Direction.Down: return Direction.Up;
            case Direction.UpLeft: return Direction.DownRight;
            case Direction.UpRight: return Direction.DownLeft;
            case Direction.DownLeft: return Direction.UpRight;
            case Direction.DownRight: return Direction.UpLeft;
        }
    }
}

export { DirectionUtility };
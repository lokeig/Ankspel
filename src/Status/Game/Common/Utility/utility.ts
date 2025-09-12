import { AngleUtility } from "./angleUtility";
import { DirectionUtility } from "./directionUtility";
import { RandomUtility } from "./randomUtility";
import { VectorUtility } from "./vectorUtility";

export class Utility {
    public static Angle = new AngleUtility();
    public static Direction = new DirectionUtility();
    public static Random = new RandomUtility();
    public static Vector = new VectorUtility();
}
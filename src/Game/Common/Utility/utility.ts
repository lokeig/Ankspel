import { AngleUtility } from "./angleUtility";
import { DirectionUtility } from "./directionUtility";
import { FileUtility } from "./Files/fileUtility";
import { RandomUtility } from "./Random/randomUtility";
import { VectorUtility } from "./vectorUtility";

class Utility {
    public static Angle = new AngleUtility();
    public static Direction = new DirectionUtility();
    public static Random = new RandomUtility();
    public static Vector = new VectorUtility();
    public static File = new FileUtility();
}

export { Utility };
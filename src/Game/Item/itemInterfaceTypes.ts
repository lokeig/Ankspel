import { Vector } from "@common";
import { ItemInterface } from "./itemInterface";

interface FirearmInterface extends ItemInterface {
    shoot(): Vector;
}

interface ExplosiveInterface extends ItemInterface {
    activate(): void;
}

export type { FirearmInterface, ExplosiveInterface };
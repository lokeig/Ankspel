import { OnItemUseEffect } from "./itemUseType";

type useFunction = (seed: number, local: boolean) => OnItemUseEffect[];

export type { useFunction };

import { OnItemUseEffect } from "./itemUseType";

type ItemUseHandler = (seed: number, local: boolean) => OnItemUseEffect[];

export type { ItemUseHandler };

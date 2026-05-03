import { Frame, SelectionType } from "@common";
import { SpawnerDescription } from "@game/Map";
import { Vector } from "@math";
import { ImageInfo } from "@render";

interface IMapEditorMenu {
    getSelection(): SelectionType;
    getCurrentName(): string;
    getSpawner(pos: Vector): SpawnerDescription;
    getParallaxIcon(): [ImageInfo, Frame];
    show(): void;
    hide(): void;
}

export type { IMapEditorMenu };
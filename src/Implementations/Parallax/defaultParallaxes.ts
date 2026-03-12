import { Parallax } from "@game/ParallaxBackground/parallax";
import { ForestBaseLayer } from "@impl/Parallax/Forest/forestBaseLayer";
import { Cloud1Layer } from "./Forest/cloud1Layer";
import { Cloud2Layer } from "./Forest/cloud2Layer";

const ForestParallax = new Parallax(new ForestBaseLayer(), new Cloud1Layer(), new Cloud2Layer());

export { ForestParallax };
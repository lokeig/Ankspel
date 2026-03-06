import { BackgroundConfig, BackgroundConfigLayer } from "@game/Map";
import { Images } from "@render";

const layer: BackgroundConfigLayer = {
    src: Images.forestBackground
}

const forestBackground: BackgroundConfig = {
    layers: [layer]
};

export { forestBackground };
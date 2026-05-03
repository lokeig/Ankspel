import { AudioManager, Sound, SoundInfo, SoundName } from "@game/Audio";
import { Render } from "./render";
import { FontName, Fonts } from "./fonts";
import { ImageName, Images } from "./images";

async function preloadAllImages(): Promise<void> {
    const keys = Object.keys(Images) as ImageName[];

    await Promise.all(
        keys.map(key => {
            const imageInfo = Images[key];
            return Render.get().loadImage(imageInfo);
        })
    );
}

async function preloadAllFonts(): Promise<void> {
    const keys = Object.keys(Fonts) as FontName[];

    await Promise.all(
        keys.map(key => {
            const fontInfo = Fonts[key];
            return Render.get().loadFont(key, fontInfo);
        })
    );
}

async function preloadAllAudio(): Promise<void> {
    const keys = Object.keys(Sound) as SoundName[];

    await Promise.all(
        keys.map(key => {
            const src = SoundInfo[key].src;
            return AudioManager.get().load(key, src);
        })
    );
}

async function preloadAll(): Promise<void> {
    await Promise.all([
        preloadAllAudio(),
        preloadAllFonts(),
        preloadAllImages()
    ])
}

export { preloadAll };
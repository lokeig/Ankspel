const Fonts = {
    chat: { src: '/assets/Fonts/ByteBounce.ttf', size: "16px" }
} as const;

type FontName = keyof typeof Fonts;
type FontInfo = typeof Fonts[keyof typeof Fonts];

export type { FontName, FontInfo };
export { Fonts };
import { Frame, SelectionType } from "@common";
import { ImageInfo, Images } from "@render";

type MenuEntry = [
    name: string,
    image: ImageInfo,
    frame: Frame,
    type: SelectionType,
]
const menuName = 0;
const menuImage = 1;
const menuFrame = 2;
const menuType = 3;

const MenuItems: Record<string, MenuEntry[]> = {
    tiles: [
        ["natureTile", Images.tileNature, new Frame(5, 0), SelectionType.Tile],
        ["iceTile", Images.tileIce, new Frame(5, 0), SelectionType.Tile],
        ["woodPlatform", Images.woodPlatform, new Frame(5, 0), SelectionType.Tile],
    ],
    weapons: [
        ["shotgun", Images.shotgun, new Frame(), SelectionType.Item],
        ["glock", Images.glock, new Frame(), SelectionType.Item],
        ["mine", Images.mine, new Frame(), SelectionType.Item],
        ["grenade", Images.grenade, new Frame(), SelectionType.Item],
        ["bazooka", Images.bazooka, new Frame(), SelectionType.Item],
        ["netGun", Images.netGun, new Frame(), SelectionType.Item],
    ],
    props: [
        ["rock", Images.rock, new Frame(), SelectionType.Item],
        ["crate", Images.crate, new Frame(), SelectionType.Item],
    ],
    equippable: [
        ["chestplate", Images.armor, new Frame(), SelectionType.Item],
        ["helmet", Images.armor, new Frame(1, 0), SelectionType.Item],
    ],
    spawns: [
        ["itemSpawner", Images.itemSpawner, new Frame(), SelectionType.Spawner],
        ["playerSpawn", Images.playerBase, new Frame(), SelectionType.PlayerSpawn],
    ],
    parallaxes: [
        ["forest", Images.backgroundIcons, new Frame(), SelectionType.Parallax],
    ],
}

export type { MenuEntry };
export { MenuItems, menuName, menuImage, menuFrame, menuType };
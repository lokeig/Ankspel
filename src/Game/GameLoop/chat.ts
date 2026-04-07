import { IDManager, Input } from "@common";
import { Vector } from "@math";
import { PlayerManager } from "@player";
import { DrawTextInfo, Rect, Render, RenderSpace, zIndex } from "@render";
import { Connection, GameMessage } from "@server";

type ChatMessage = {
    sender: number
    text: string
    timeAlive: number
}

class Chat {
    private messages: ChatMessage[] = [];
    private isOpen: boolean = false;
    private currentInput = "";

    private maxLength: number = 64;
    private size: number = 30;
    private lineHeight: number = this.size * 0.9;

    private static maxTimeAlive = 7;

    constructor() {
        Input.onAnyKey((key => {
            if (key === "Enter") {
                this.toggle();
                return;
            }

            if (!this.isChatOpen()) {
                return;
            }

            if (key === "Backspace") {
                this.currentInput = this.currentInput.substring(0, this.currentInput.length - 1);
            }
            if (key.length === 1 && this.currentInput.length < this.maxLength) {
                this.currentInput += key;
            }
        }))
    }

    private toggle(): void {
        if (this.isOpen) {
            const currentMsg = this.currentInput.trim();
            if (currentMsg !== "") {
                const sender = IDManager.getBaseOffset();
                this.write({ sender, text: currentMsg, timeAlive: 0 });
                Connection.get().sendGameMessage(GameMessage.ChatMessage, { sender, text: currentMsg });
            }
            this.currentInput = "";
        }
        this.isOpen = !this.isOpen;
    }

    public update(deltaTime: number): void {
        this.messages.forEach(msg => {
            msg.timeAlive += deltaTime
            if (msg.timeAlive > Chat.maxTimeAlive) {
                this.messages.shift();
            }
        });
    }

    public isChatOpen(): boolean {
        return this.isOpen;
    }

    public write(message: ChatMessage): void {
        this.messages.push(message);
    }

    private drawText(playerId: number, pos: Vector, message: string, opacity: number): void {
        const render = Render.get();

        const player = PlayerManager.getPlayerFromID(playerId)!;
        const messageInfo: DrawTextInfo = {
            text: message,
            pos: pos.clone(),
            font: "chat",
            size: this.size,
            color: "white",
            opacity,
            zIndex: zIndex.UI
        };
        const nameInfo = { ...messageInfo };
        nameInfo.text = player.getName() + ": ";
        nameInfo.color = player.getColor();
        nameInfo.pos = pos.clone();

        const nameLength = render.measureText(nameInfo.text, nameInfo.font, nameInfo.size).width;
        const height = render.measureText(nameInfo.text, nameInfo.font, nameInfo.size).height;

        messageInfo.pos.x += nameLength;
        const messageLength = render.measureText(messageInfo.text, messageInfo.font, messageInfo.size).width;
        render.drawText(nameInfo, RenderSpace.Screen);
        render.drawText(messageInfo, RenderSpace.Screen);

        const createRect = (padding: number): Rect => {
            return {
                x: nameInfo.pos.x - padding,
                y: nameInfo.pos.y - (height * 1.2) - padding,
                width: nameLength + messageLength + padding * 2,
                height: height + padding * 2
            }
        }
        const padding = 5;
        const borderSize = 2;
        const angle = 0;

        render.drawSquare(
            createRect(padding + borderSize),
            zIndex.UI - 1,
            angle,
            "#000000",
            opacity * 0.5,
            RenderSpace.Screen
        );
        render.drawSquare(
            createRect(padding),
            zIndex.UI - 1,
            angle,
            nameInfo.color,
            opacity * 0.4,
            RenderSpace.Screen
        );

        pos.y -= this.lineHeight;
    }

    public draw(): void {
        const render = Render.get();
        const pos = new Vector(20, render.getHeight());
        pos.y -= this.lineHeight;
        if (this.isChatOpen()) {
            this.drawText(IDManager.getBaseOffset(), pos, this.currentInput, 1);
        } else {
            pos.y -= this.lineHeight;
        }

        for (let i = this.messages.length - 1; i >= 0; i--) {
            const message = this.messages[i];
            let opacity = message.timeAlive / Chat.maxTimeAlive;
            const threshold = 0.8;
            if (opacity > threshold) {
                opacity = (1 - (message.timeAlive) / (Chat.maxTimeAlive)) / (1 - threshold);
            } else {
                opacity = 1;
            }
            this.drawText(message.sender, pos, message.text, opacity);
        }
    }
}

export { Chat };
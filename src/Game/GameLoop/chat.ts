import { Input } from "@common";
import { Vector } from "@math";
import { DrawTextInfo, Render, RenderSpace, zIndex } from "@render";
import { Connection, GameMessage } from "@server";

type ChatMessage = {
    author: string
    text: string
    timeAlive: number
}

class Chat {
    private messages: ChatMessage[] = [];
    private isOpen: boolean = false;
    private currentInput = "";

    private maxLength: number = 64;
    private size: number = 12;

    private static maxTimeAlive = 8;

    constructor() {
        Input.onAnyKey((key => {
            if (key === "Enter") {
                this.toggle();
                return;
            }
            if (key === "Backspace") {
                this.currentInput = this.currentInput.substring(0, this.currentInput.length - 1);
            }
            if (this.isChatOpen() && this.currentInput.length < this.maxLength && (this.isLetter(key) || key === " ")) {
                this.currentInput += key.toUpperCase();
            }
        }))
    }

    private isLetter(str: string): boolean {
        return str.length === 1 && str.toLowerCase() != str.toUpperCase();
    }

    private toggle(): void {
        if (this.isOpen) {
            const currentMsg = this.currentInput.trim();
            if (currentMsg !== "") {
                this.write({ author: "me", text: currentMsg, timeAlive: 0 });
                Connection.get().sendGameMessage(GameMessage.ChatMessage, { sender: 0, text: currentMsg });
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

    public draw(): void {
        const render = Render.get();
        const pos = new Vector(20, render.getHeight());
        pos.y -= this.size;

        const textInfo: DrawTextInfo = {
            text: this.currentInput,
            pos,
            font: "chat",
            size: this.size,
            color: "white",
            opacity: 1,
            zIndex: zIndex.UI
        }
        if (this.isOpen) {
            render.drawText(textInfo, RenderSpace.Screen);
        }
        for (let i = 0; i < this.messages.length; i++) {
            const msg = this.messages[i];
            const msgInfo = { ...textInfo };

            msgInfo.text = msg.text;
            msgInfo.pos = msgInfo.pos.clone()
            msgInfo.pos.y -= this.size * (this.messages.length - i) * 2;
            msgInfo.opacity = 1 - (msg.timeAlive / Chat.maxTimeAlive);

            render.drawText(msgInfo, RenderSpace.Screen);
        }
    }
}

export { Chat };
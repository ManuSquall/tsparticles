import { ClickMode } from "./enums/modes";
import { Container } from "../classes/container";
import { InteractivityDetect } from "./enums/generics";
import { ICoordinates } from "./interfaces";

export class EventListeners {
    private readonly container: Container;

    constructor(container: Container) {
        this.container = container;
    }

    public mouseMove(e: Event): void {
        const container = this.container;
        const options = container.options;

        let pos: ICoordinates;

        const mouseEvent = e as MouseEvent;

        if (container.interactivity.el === window) {
            pos = {
                x: mouseEvent.clientX,
                y: mouseEvent.clientY,
            };
        } else if (options.interactivity.detect_on === InteractivityDetect.parent) {
            const source = mouseEvent.srcElement as HTMLElement;
            const target = mouseEvent.currentTarget as HTMLElement
            if (source && target) {
                const sourceRect = source.getBoundingClientRect();
                const targetRect = target.getBoundingClientRect();
                pos = {
                    x: mouseEvent.offsetX + sourceRect.left - targetRect.left,
                    y: mouseEvent.offsetY + sourceRect.top - targetRect.top,
                };
            } else {
                pos = {
                    x: mouseEvent.offsetX || mouseEvent.clientX,
                    y: mouseEvent.offsetY || mouseEvent.clientY,
                };
            }
        } else {
            pos = {
                x: mouseEvent.offsetX || mouseEvent.clientX,
                y: mouseEvent.offsetY || mouseEvent.clientY,
            };
        }

        container.interactivity.mouse.pos_x = pos.x * (container.retina.isRetina ? container.canvas.pxratio : 1);
        container.interactivity.mouse.pos_y = pos.y * (container.retina.isRetina ? container.canvas.pxratio : 1);

        container.interactivity.status = "mousemove";
    }

    public mouseLeave(): void {
        const container = this.container;

        container.interactivity.mouse.pos_x = null;
        container.interactivity.mouse.pos_y = null;
        container.interactivity.status = "mouseleave";
    }

    public mouseClick(): void {
        const container = this.container;
        const options = container.options;

        container.interactivity.mouse.click_pos_x = container.interactivity.mouse.pos_x;
        container.interactivity.mouse.click_pos_y = container.interactivity.mouse.pos_y;
        container.interactivity.mouse.click_time = new Date().getTime();

        if (options.interactivity.events.onclick.enable) {
            const pushNb = options.interactivity.modes.push.particles_nb;
            const removeNb = options.interactivity.modes.remove.particles_nb;

            switch (options.interactivity.events.onclick.mode) {
                case ClickMode.push:
                    if (options.particles.move.enable) {
                        container.particles.push(pushNb, container.interactivity.mouse);
                    } else {
                        if (options.interactivity.modes.push.particles_nb === 1) {
                            container.particles.push(pushNb, container.interactivity.mouse);
                        } else if (options.interactivity.modes.push.particles_nb > 1) {
                            container.particles.push(pushNb);
                        }
                    }
                    break;
                case ClickMode.remove:
                    container.particles.remove(removeNb);
                    break;
                case ClickMode.bubble:
                    container.bubble.clicking = true;
                    break;
                case ClickMode.repulse:
                    container.repulse.clicking = true;
                    container.repulse.count = 0;
                    container.repulse.finish = false;
                    setTimeout(() => {
                        container.repulse.clicking = false;
                    }, options.interactivity.modes.repulse.duration * 1000);
                    break;
            }
        }
    }
}
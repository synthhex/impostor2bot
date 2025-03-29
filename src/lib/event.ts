export default class Event {
    public name: string;
    public execute: (...args: any[]) => Promise<void>;
    public once: boolean;
    // private disabled: boolean;

    constructor(options: {
        name: string;
        execute: (...args: any[]) => Promise<void>;
        once?: boolean;
    }) {
        this.name = options.name;
        this.execute = options.execute;
        this.once = options.once ?? false;
        // this.disabled = false;
    }

    public static createEvent(options: {
        name: string;
        execute: (...args: any[]) => Promise<void>;
        once?: boolean;
    }): Event {
        return new Event(options);
    }

    // public isDisabled(): boolean {
    //     return this.disabled;
    // }

    // public disable() {
    //     this.disabled = true;
    // }

    // public enable() {
    //     this.disabled = false;
    // }
}
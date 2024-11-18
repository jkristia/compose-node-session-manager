
export class Args {

    private _args: { name: string, value?: string }[] = [];
    public get args(): { name: string, value?: string }[] {
        return this._args;
    }

    constructor() {
        for (const arg of process.argv) {
            const split = arg.split('=').map(s => s.trim())
            const name = split[0].toLocaleLowerCase();
            const value = split.length > 1 ? split[1] : undefined;
            this._args.push({ name, value });
        }
    }

    public arg(argName: string): { name: string, value?: string } | undefined {
        return this._args.find(a => a.name === argName);
    }
    public value(argName: string, defaultValue?: any): string | undefined {
        const arg = this.arg(argName);
        if (arg?.value) {
            return arg?.value;
        }
        return defaultValue;
    }
}
class Session {
    constructor(private _id: string) {

    }
    public async run() {
        const sleep = (ms: number): Promise<void> => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve();
                }, ms);
            })
        }
        while (true) {
            console.log(`${new Date().toLocaleTimeString()} Session: ${this._id}`)
            await sleep(1000);
        }
    }
}

// main
const session = new Session(new Date().getTime().toString());
session.run();
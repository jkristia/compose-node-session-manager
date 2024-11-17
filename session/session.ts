
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

process.on('SIGINT', function() {
    console.log("CTRL-C: will terminate");
    process.exit();
});
process.on('SIGTERM', function() {
    console.log("SIGTERM: will terminate");
    process.exit();
});


// main
const session = new Session(new Date().getTime().toString());
session.run();
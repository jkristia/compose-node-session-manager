import express from 'express';
import { Args } from '../util';
import { FooA } from "./foo-a";

class Session {
    private _cnt = 1;
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
            // console.log(`${new Date().toLocaleTimeString()} Session: ${this._id}`)
            const f = new FooA(this._cnt.toString())
            this._cnt++;
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

console.log('ARGS ', process.argv)

const args = new Args()
const app = express();
const sessionId = Number(args.value('session-id', 1))
const port = Number(args.value('port', 11090))

// console.log(`JKJKJK******Session (${sessionId}), listening on http://localhost:${port}`);
// const session = new Session('')
// session.run();

app.get('/', (req, res) => {
    res.status(200).send({
        session: sessionId,
        time: new Date().toLocaleTimeString(),
        info: 'root response',
        foo: req.body || {}
    });
});
app.get('/ping', (req, res) => {
    res.status(200).send({
        session: sessionId,
        time: new Date().toLocaleTimeString(),
        info: 'ping response',
        foo: req.body || {}
    });
});

app.listen(port, () => {
    console.log(`Session (${sessionId}), listening on http://localhost:${port}`);
});

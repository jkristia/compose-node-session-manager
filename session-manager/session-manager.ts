// class SessionManager {
//     constructor() {}

//     public async run() {
//         const sleep = (ms: number): Promise<void> => {
//             return new Promise(resolve => {
//                 setTimeout(() => {
//                     resolve();
//                 }, ms);
//             })
//         }
//         while (true) {
//             // console.log(`${new Date().toLocaleTimeString()} Session: ${this._id}`)
//             await sleep(1000);
//         }
//     }
// }

// main
// const manager = new SessionManager();
// manager.run();

import express from 'express';

process.on('SIGINT', function() {
    console.log("CTRL-C: will terminate");
    process.exit();
});

const app = express();
const port = 8080;

const XYZ = '#5'

app.get('/', (req, res) => {
    console.log(`${new Date().toLocaleTimeString()} - request - ${XYZ}`)
    res.send(`${new Date().toLocaleTimeString()} - Hello - ${XYZ}`);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

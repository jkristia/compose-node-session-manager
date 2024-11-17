"use strict";
// class SessionManager {
//     constructor() {}
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const express_1 = __importDefault(require("express"));
process.on('SIGINT', function () {
    console.log("CTRL-C: will terminate");
    process.exit();
});
const app = (0, express_1.default)();
const port = 8080;
const XYZ = '#6';
app.get('/', (req, res) => {
    console.log(`${new Date().toLocaleTimeString()} - request - ${XYZ}`);
    res.send(`${new Date().toLocaleTimeString()} - Hello - ${XYZ}`);
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

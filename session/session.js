"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Session {
    constructor(_id) {
        this._id = _id;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const sleep = (ms) => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve();
                    }, ms);
                });
            };
            while (true) {
                console.log(`${new Date().toLocaleTimeString()} Session: ${this._id}`);
                yield sleep(1000);
            }
        });
    }
}
// main
const session = new Session(new Date().getTime().toString());
session.run();

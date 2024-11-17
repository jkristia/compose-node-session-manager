

export class FooA {
    constructor(s: string) {
        this.foo(s);
    }

    private foo(s: string) {
        setTimeout(() => {
            console.log(`FooA(${s}) - done ${new Date().toLocaleString()}`)
        }, 1100);
    }

}
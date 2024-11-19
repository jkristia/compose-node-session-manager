import express from 'express';
import Docker from 'dockerode';

class Session {
    public get id(): number {
        return this._id;
    }
    public get containerId(): string {
        return this._info.Id;
    }
    public get name(): string {
        return this._info.Names[0]
    }
    public get container(): Docker.Container | undefined {
        return this._container;
    }
    constructor(
        private _id: number,
        private _info: Docker.ContainerInfo,
        private _container?: Docker.Container
    ) {
    }
}

class SessionManager {
    private fixedSessionName = 'session-1';
    private sessionImage = 'session-run:latest';
    private _nextId = 1;
    private _sessions: Session[] = [];
    private _docker = new Docker({ socketPath: '/var/run/docker.sock' });
    constructor() {
        this.addInitialSession()
    }

    private async addInitialSession() {
        const container = await this.findContainer(this.fixedSessionName);
        if (container) {
            this._sessions.push(new Session(1, container));
            this._nextId = 2;
        }
    }
    public async findContainer(name: string): Promise<Docker.ContainerInfo | undefined> {
        const containers = await this._docker.listContainers({ all: false });
        const container = containers.find(c => c.Names[0].endsWith(name))
        if (!container) {
            console.log(`container NOT found ${name}, available containers:`)
            containers.forEach(c => {
                console.log(` - '${c.Names.join(",")}'`)
            })
        }
        // console.log(container)
        return container;
    }
    public async createSession() {
        try {
            const networks = await this._docker.listNetworks();
            const network = networks.find(n => n.Name.endsWith('sys-network'))
            const sessionId = this._nextId++;
            const sessionContainerName = `session-${sessionId}`;
            const newcontainer = await this._docker.createContainer({
                Image: this.sessionImage,
                name: sessionContainerName,
                Cmd: ['node', './session/session.js', `port=${10010 + sessionId}`, `session-id=${sessionId}`],
                HostConfig: {
                    NetworkMode: network?.Name
                }
            });
            await newcontainer.start();
            const info = await this.findContainer(sessionContainerName)
            this._sessions.push(new Session(sessionId, info!, newcontainer))
            console.log('Started new session:', sessionId);
        } catch (error) {
            console.error('Error:', error);
        }
    }
    public async shutdown() {
        for (const session of this._sessions) {
            if (!session.container) {
                continue;
            }
            try {
                await session.container.stop();
                await session.container.remove();
                console.log('Stopped session:', session.id);
            } catch (error) {
                console.error('Failed to stop container:', session.id, session.container.id, error);
            }
        }
    }
}

const manager = new SessionManager()

process.on('SIGINT', async () => {
    console.log("CTRL-C: will terminate");
    await manager.shutdown();
    process.exit();
});
process.on('SIGTERM', async () => {
    console.log("SIGTERM: will terminate");
    await manager.shutdown();
    process.exit();
});



const app = express();
const port = 8080;

app.get('/', (req, res) => {
    manager.createSession()
    console.log(`${new Date().toLocaleTimeString()} - request`)
    res.send(`${new Date().toLocaleTimeString()} - Hello`);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

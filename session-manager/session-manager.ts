import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware'
import Docker from 'dockerode';

class Session {
	public get id(): number {
		return this._id;
	}
	public get port(): number {
		return this._port;
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
	public get info(): Docker.ContainerInfo {
		return this._info;
	}
	constructor(
		private _id: number,
		private _port: number,
		private _info: Docker.ContainerInfo,
		private _container?: Docker.Container
	) {
	}
	public async remove(docker: Docker) {
		const container = docker.getContainer(this.containerId);
		if (!container) {
			console.log(`Session ${this._id}, no container`)
			return;
		}
		const info = await container.inspect();
		if (info.State.Running) {
			await container.stop();
		}
		await container.remove();
		this._container = undefined;
	}
}

export interface ISessionInfo {
	id: number;
	state: '' | 'running'
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
			this._sessions.push(new Session(1, 10011, container));
			this._nextId = 2;
		}
	}
	public findSession(sessionId: number): Session | undefined {
		return this._sessions.find(s => s.id === sessionId);
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
	public async createSession(): Promise<ISessionInfo | undefined> {
		try {
			const networks = await this._docker.listNetworks();
			const network = networks.find(n => n.Name.endsWith('sys-network'))
			const sessionId = this._nextId++;
			const sessionContainerName = `session-${sessionId}`;
			const port = 10010 + sessionId;
			const newcontainer = await this._docker.createContainer({
				Image: this.sessionImage,
				name: sessionContainerName,
				Cmd: ['node', './session/session.js', `port=${port}`, `session-id=${sessionId}`],
				HostConfig: {
					NetworkMode: network?.Name
				}
			});
			await newcontainer.start();
			const info = await this.findContainer(sessionContainerName);
			this._sessions.push(new Session(sessionId, port, info!, newcontainer))
			console.log('Started new session:', sessionId);
			return {
				id: sessionId,
				state: info?.State || '' as any,
			}
		} catch (error) {
			console.error('Error:', error);
		}
	}
	public async removeAllCreatedSessions() {
		const pending: Promise<any>[] = [];
		for (const session of this._sessions) {
			if (!session.container) {
				continue;
			}
			pending.push(session.remove(this._docker));
		}
		console.log(`Stopping ${pending.length} sessions`)
		await Promise.all(pending);
		console.log(`Stopping ${pending.length} sessions: Done`)
		this._sessions = [];
	}
	public async list(): Promise<ISessionInfo[]> {
		const containers = await this._docker.listContainers({ all: true });
		// update sessions, if session is not in running list, then it should be removed
		this._sessions.forEach(session => {
			const container = containers.find(c => c.Id === session.containerId);
			console.log(`session ${session.id}`, container?.State);
			if (!container) {
				console.log('NOT RUNNING - TO REMOVE ', session.id)
			}
		})
		return this._sessions.map(session => {
			return {
				id: session.id,
				state: session.info.State as any,
			}
		})
	}
}

const manager = new SessionManager()

process.on('SIGINT', async () => {
	console.log("CTRL-C: will terminate");
	await manager.removeAllCreatedSessions();
	process.exit();
});
process.on('SIGTERM', async () => {
	console.log("SIGTERM: will terminate");
	await manager.removeAllCreatedSessions();
	process.exit();
});



const app = express();
const port = 8080;

app.use('/session/:id', (req, res, next) => {
	const sessionId = Number(req.params.id);
	const session = manager.findSession(sessionId);
	if (!session) {
		// return 404
		res.status(404).send(`session ${req.params.id} not found`)
		return
	}
	const target = `http://session-${sessionId}:${session.port}`; // Replace 'port' with the actual port number
	const proxyMiddleware = createProxyMiddleware({
		target,
		changeOrigin: true,
	});
	return proxyMiddleware(req, res, next);
});

app.get('/', async (req, res) => {
	console.log(`${new Date().toLocaleTimeString()} - request`)
	// await manager.createSession();
	const data = await manager.list()
	res.status(200).send(data);
});
app.post('/create', async (req, res) => {
	console.log(`${new Date().toLocaleTimeString()} - request`)
	const data = await manager.createSession()
	res.status(200).send(data);
})
app.post('/kill', async (req, res) => {
	console.log(`${new Date().toLocaleTimeString()} - request`)
	await manager.removeAllCreatedSessions();
	res.status(200);
})

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});

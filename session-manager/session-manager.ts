import express from 'express';
import Docker from 'dockerode';

let nextSessionId = 2

const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const createdContainers: Docker.Container[] = [];
async function listAndStartContainers() {
    try {
        const networks = await docker.listNetworks();
        const network = networks.find( n => n.Name.endsWith('my_network'))
        // List only running containers
        const containers = await docker.listContainers({ all: false });
        for (const containerInfo of containers) {
            console.log(`ID     : ${containerInfo.Id}`);
            console.log(`  Name : ${containerInfo.Names.join(', ')}`);
            console.log(`  Image: ${containerInfo.Image}`);
            console.log(`  State: ${containerInfo.State}`);
        }
        const newcontainer = await docker.createContainer({
            Image: 'session-run:latest',
            name: `session-${nextSessionId}`,
            Cmd: ['node', './session/session.js', `port=${10100 + nextSessionId}`, `session-id=${nextSessionId}`],
            HostConfig: {
                NetworkMode: network?.Name
            }
        });
        nextSessionId++;
        createdContainers.push(newcontainer);
        await newcontainer.start();
        console.log('Started a new instance of the container:', newcontainer.id);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function stopAllCreatedContainers() {
    for (const container of createdContainers) {
        try {
            await container.stop();
            await container.remove();
            console.log('Stopped container:', container.id);
        } catch (error) {
            console.error('Failed to stop container:', container.id, error);
        }
    }
}

process.on('SIGINT', async () => {
    console.log("CTRL-C: will terminate");
    await stopAllCreatedContainers();
    process.exit();
});
process.on('SIGTERM', async () => {
    console.log("SIGTERM: will terminate");
    await stopAllCreatedContainers();
    process.exit();
});

const app = express();
const port = 8080;

const XYZ = '#7'

app.get('/', (req, res) => {
    listAndStartContainers()
    console.log(`${new Date().toLocaleTimeString()} - request - ${XYZ}`)
    res.send(`${new Date().toLocaleTimeString()} - Hello - ${XYZ}`);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

import express from 'express';
import Docker from 'dockerode';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const createdContainers: Docker.Container[] = [];
async function listAndStartContainers() {
    try {
        // List only running containers
        const containers = await docker.listContainers({ all: false });
        console.log('Running Containers:', containers);
        // If you want to print more details about each container
        for (const containerInfo of containers) {
            console.log(`Container ID: ${containerInfo.Id}`);
            console.log(`Container Name: ${containerInfo.Names.join(', ')}`);
            console.log(`Container Image: ${containerInfo.Image}`);
            console.log(`Container State: ${containerInfo.State}`);
            console.log('-----------------------------');
        }
        // List all containers
        // const containers = await docker.listContainers({ all: true });
        // console.log('Containers:', containers);

        // Start each stopped container
        // for (const containerInfo of containers) {
        //     if (!containerInfo.State.includes('running')) {
        //         const container = docker.getContainer(containerInfo.Id);
        //         await container.start();
        //         console.log(`Started container ${containerInfo.Id}`);
        //     }
        // }
        const newcontainer = await docker.createContainer({
            Image: 'session-run:latest',
            name: `session-${createdContainers.length}`,
            // Cmd: [	'node', '--inspect=0.0.0.0:9229', '--nolazy', './.dist/session-manager.js'],
            HostConfig: {
                NetworkMode: 'dockertest_my_network'
            }
        });
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

import express from 'express';
import Docker from 'dockerode';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

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
    } catch (error) {
        console.error('Error:', error);
    }
}


process.on('SIGINT', function () {
    console.log("CTRL-C: will terminate");
    process.exit();
});
process.on('SIGTERM', function () {
    console.log("SIGTERM: will terminate");
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

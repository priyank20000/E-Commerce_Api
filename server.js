const cluster = require('cluster');
const os = require('os');

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });
} else {
    const express = require('express');
    const app = express();
    
    const dotenv = require('dotenv');
    dotenv.config({ path: 'config/config.env' });
    let apiHitCounter = 0; 
    app.get('/', (req, res) => {
        apiHitCounter++;
        console.log(`Worker ${process.pid} API hit count: ${apiHitCounter}`);
        res.send(`<h1>Hello from ${process.pid} ${process.env.NODE_APP_NAME} on port ${process.env.PORT}!</h1>`);
    });
    console.log(`Worker ${process.pid} started`);
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
}

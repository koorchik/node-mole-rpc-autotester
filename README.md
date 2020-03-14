# node-mole-rpc-autotester
Automatic tester for Mole-RPC (JSON-RPC library) transports

This module allows to automatically test key method call scenarios.

```js
const AutoTester = require('mole-rpc-autotester');

const MoleClient = require('../MoleClient');
const MoleClientProxified = require('../MoleClientProxified');
const MoleServer = require('../MoleServer');
const X = require('../X');

const TransportClient = require('./TransportClient');
const TransportServer = require('./TransportServer');

async function main() {
    const emitter = new EventEmitter();

    const server = await prepareServer(emitter);
    const clients = await prepareClients(emitter);

    const autoTester = new AutoTester({
        X,
        server,
        simpleClient: clients.simpleClient,
        proxifiedClient: clients.proxifiedClient
    });

    await autoTester.runAllTests();
}

async function prepareServer(emitter) {
    return new MoleServer({
        transports: [
            // initialize your transports
            new TransportServer(...)
        ]
    });
}

async function prepareClients(emitter) {
    const simpleClient = new MoleClient({
        requestTimeout: 1000, // autotester expects this value
        transport: new TransportClient(...) // initialize your transport
    });

    const proxifiedClient = new MoleClientProxified({
        requestTimeout: 1000, // autotester expects this value
        transport: new TransportClient(...) // initialize your transport
    });

    return { simpleClient, proxifiedClient };
}

main().then(console.log, console.error);

```
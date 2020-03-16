# node-mole-rpc-autotester
Automatic tester for [Mole-RPC](https://www.npmjs.com/package/mole-rpc) (JSON-RPC library) transports.

If you writes own transport for Mole-RPC then use this module to be sure that your transport covers as expected.

This module does end-to-end testing and will:

* Run simple positive tests for simpleClient
* Run simple positive notification tests for simpleClient
* Run positive batch tests for simpleClient
* Run simple positive tests for proxifiedClient
* Run simple positive notification tests for proxifiedClient
* Run proxy positive tests for proxifiedClient
* Run proxy positive notification tests for proxifiedClient
* Run simple negative tests for simpleClient
* Run simple negative tests for proxifiedClient
* Run proxy negative tests for proxifiedClient
* It will test both sync and async calls
* Will test method execution errors

This modules covers a lot of cases but it does not help you with detecting memory leaks, reconnection problems etc.

### How to use it?

This example covers almose all of the API of the module.

*Do not forget to add 'mole-rpc' and 'mole-rpc-autotester' to devDependencies of your transport's package.json.*


```js
const AutoTester = require('mole-rpc-autotester');

const MoleClient = require('mole-rpc/MoleClient');
const MoleClientProxified = require('mole-rpc/MoleClientProxified');
const MoleServer = require('mole-rpc/MoleServer');
const X = require('mole-rpc/X');

// Import your transport
const TransportClient = require('./TransportClient');
const TransportServer = require('./TransportServer');

async function main() {
    const server = await prepareServer();
    const clients = await prepareClients();

    const autoTester = new AutoTester({
        X,
        server,
        simpleClient: clients.simpleClient,
        proxifiedClient: clients.proxifiedClient
    });

    await autoTester.runAllTests();
}

async function prepareServer() {
    return new MoleServer({
        transports: [
            // initialize your transports
            new TransportServer(...)
        ]
    });
}

async function prepareClients() {
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

## Real examples

* [EventEmitter transport tests](https://github.com/koorchik/node-mole-rpc-transport-eventemitter/blob/master/tests/autotests.js)
* [MQTT transport tests](https://github.com/koorchik/node-mole-rpc-transport-mqtt/blob/master/tests/autotests.js)
* [WS transport tests](https://github.com/koorchik/node-mole-rpc-transport-ws/tree/master/tests). This is the most interesting as it has autotests for different modes.


You can find more tranports [here](https://www.npmjs.com/search?q=mole-rpc-transport)
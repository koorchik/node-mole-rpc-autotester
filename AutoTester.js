const { assert } = require('chai');

const {
    functionsToExpose,
    lastResultsStore
} = require('./exposeFunctions/functionsToExpose');

const positiveTestsData = require('./exposeFunctions/positiveTestsData');
const negativeTestsData = require('./exposeFunctions/negativeTestsData');

class AutoTester {
    constructor({ simpleClient, proxifiedClient, server, X }) {
        if (!simpleClient) throw new Error('"simpleClient" required');
        if (!proxifiedClient) throw new Error('"proxifiedClient" required');
        if (!server) throw new Error('"server" required');
        if (!X) throw new Error('"X" exceptions object required');


        if (simpleClient.requestTimeout !== 1000) {
            throw new Error('"simpleClient" requestTimeout must be set to 1000')
        }

        if (proxifiedClient['options.requestTimeout'] !== 1000) {
            throw new Error('"proxifiedClient" requestTimeout must be set to 1000')
        }

        this.simpleClient = simpleClient;
        this.proxifiedClient = proxifiedClient;
        this.server = server;
        this.X = X;
    }

    async runAllTests() {
        console.log('Autotests started.');
        console.log('============================================================');

        await this._exposeServerMethods();

        // POSITIVE TESTS
        console.log('Run simple positive tests for simpleClient:');
        await this._runSimplePositiveTests(this.simpleClient, positiveTestsData);

        console.log('Run simple positive notification tests for simpleClient:');
        await this._runSimplePositiveNotificationTests(this.simpleClient, positiveTestsData);

        console.log('Run positive batch tests for simpleClient:');
        await this._runBatchTests(this.simpleClient, positiveTestsData);

        console.log('Run simple positive tests for proxifiedClient:');
        await this._runSimplePositiveTests(this.proxifiedClient, positiveTestsData);

        console.log('Run simple positive notification tests for proxifiedClient:');
        await this._runSimplePositiveNotificationTests(this.proxifiedClient, positiveTestsData);

        console.log('Run proxy positive tests for proxifiedClient:');
        await this._runProxyPositiveTests(this.proxifiedClient, positiveTestsData);

        console.log('Run proxy positive notification tests for proxifiedClient:');
        await this._runProxyPositiveNotificationTests(this.proxifiedClient, positiveTestsData);

        // NEGATIVE TESTS
        console.log('Run simple negative tests for simpleClient:');
        await this._runSimpleNegativeTests(this.simpleClient, negativeTestsData);

        console.log('Run simple negative tests for proxifiedClient:');
        await this._runSimpleNegativeTests(this.proxifiedClient, negativeTestsData);

        console.log('Run proxy negative tests for proxifiedClient:');
        await this._runProxyNegativeTests(this.proxifiedClient, negativeTestsData);

        // PING PONG TESTS
        console.log('Run ping pong tests for simpleClient.');
        await this._runPingPongTests(this.simpleClient);

        console.log('Run ping pong tests for proxifiedClient.');
        await this._runPingPongTests(this.proxifiedClient);

        console.log('============================================================');
        console.log('Autotests finished.');
    }

    async _exposeServerMethods() {
        this.server.expose(functionsToExpose);
        await this.server.run();
    }

    async _runSimplePositiveTests(client, positiveTestsData) {
        for (const { callMethod, args, expectedResult } of positiveTestsData) {
            console.log(`Positive test: calling ${callMethod}`);
            const gotResult = await client.callMethod(callMethod, args);
            assert.deepEqual(gotResult, expectedResult);
        }
        console.log('\n');
    }

    async _runSimplePositiveNotificationTests(client, positiveTestsData) {
        for (const { callMethod, args, expectedResult } of positiveTestsData) {
            console.log(`Positive test: notifying ${callMethod}`);
            const gotResult = await client.notify(callMethod, args);
            assert.equal(gotResult, true);
            assert.deepEqual(lastResultsStore[callMethod], expectedResult);
        }
        console.log('\n');
    }

    async _runBatchTests(client, positiveTestsData) {
        const requestData = [];
        const expectedResults = [];

        for (const { callMethod, args, expectedResult } of positiveTestsData) {
            requestData.push([callMethod, args]);
            expectedResults.push({
                success: true,
                result: expectedResult
            });
        }

        console.log(`Positive test: calling batch`);
        const gotResults = await client.runBatch(requestData);
        assert.deepEqual(gotResults, expectedResults);

        console.log('\n');
    }

    async _runProxyPositiveTests(client, positiveTestsData) {
        for (const { callMethod, args, expectedResult } of positiveTestsData) {
            console.log(`Positive test via proxy: calling ${callMethod}`);
            const gotResult = await client.callMethod[callMethod](...args);
            assert.deepEqual(gotResult, expectedResult);
        }
        console.log('\n');
    }

    async _runProxyPositiveNotificationTests(client, positiveTestsData) {
        for (const { callMethod, args, expectedResult } of positiveTestsData) {
            console.log(`Positive test via proxy: notifying ${callMethod}`);
            const gotResult = await client.notify[callMethod](...args);

            assert.equal(gotResult, true);
            assert.deepEqual(lastResultsStore[callMethod], expectedResult);
        }
        console.log('\n');
    }

    async _runSimpleNegativeTests(client, negativeTestsData) {
        for (const { callMethod, args, expectedError, expectedClassName } of negativeTestsData) {
            try {
                console.log(`Negative test: calling ${callMethod}`);
                await client.callMethod(callMethod, args);
                throw new Error(
                    `Method "${callMethod}" should fail but was executed without any error`
                );
            } catch (gotError) {
                assert.instanceOf(gotError, this.X[expectedClassName], 'check error class');
                assert.deepEqual(gotError.message, expectedError.message, 'check error message');
                assert.deepEqual(gotError.code, expectedError.code, 'check error code');

                if (expectedError.data) {
                    assert.deepEqual(gotError.data, expectedError.data, 'check custom data');
                }
            }
        }
        console.log('\n');
    }

    async _runProxyNegativeTests(client, negativeTestsData) {
        for (const { callMethod, args, expectedError, expectedClassName } of negativeTestsData) {
            try {
                console.log(`Negative test via proxy: calling ${callMethod}`);
                await client[callMethod](...args);
                throw new Error(
                    `Method "${callMethod}" should fail but was executed without any error`
                );
            } catch (gotError) {
                assert.instanceOf(gotError, this.X[expectedClassName], 'check error class');
                assert.deepEqual(gotError.message, expectedError.message, 'check error message');
                assert.deepEqual(gotError.code, expectedError.code, 'check error code');
            }
        }
        console.log('\n');
    }

    async _runPingPongTests(client) {
        if (!client.ping) {
            throw new Error('Ping method is not supported. Update mole-rpc package!');
        }

        const result = await client.ping();

        assert.equal(result, true);
    }
}

module.exports = AutoTester;

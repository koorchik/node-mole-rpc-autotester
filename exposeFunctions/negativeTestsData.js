module.exports = [
    {
        callMethod: 'notExistingMethod',
        args: [],
        expectedError: { code: -32601, message: 'Method not found' },
        expectedClassName: 'MethodNotFound'
    },

    {
        callMethod: 'toString',
        args: [],
        expectedError: { code: -32601, message: 'Method not found' },
        expectedClassName: 'MethodNotFound'
    },

    {
        callMethod: 'constructor',
        args: [],
        expectedError: { code: -32601, message: 'Method not found' },
        expectedClassName: 'MethodNotFound'
    },

    {
        callMethod: '_privateFunction',
        args: [],
        expectedError: { code: -32601, message: 'Method not found' },
        expectedClassName: 'MethodNotFound'
    },

    {
        callMethod: 'asyncFunctionLongRunning',
        args: [],
        expectedError: {
            code: -32001,
            message: 'Request exceeded maximum execution time'
        },
        expectedClassName: 'RequestTimeout'
    },

    {
        callMethod: 'asyncFunctionRejectsWithPrimitiveData',
        args: ['arg1', 123],
        expectedError: {
            code: -32002,
            message: 'Method has returned error',
            data: 'args data "arg1 123" from asyncFunctionRejectsWithPrimitiveData'
        },
        expectedClassName: 'ExecutionError'
    },

    {
        callMethod: 'asyncFunctionRejectsWithComplexData',
        args: ['arg1', 123],
        expectedError: {
            code: -32002,
            message: 'Method has returned error',
            data: { from: 'asyncFunctionRejectsWithComplexData', args: ['arg1', 123] }
        },
        expectedClassName: 'ExecutionError'
    },

    {
        callMethod: 'asyncFunctionThrowsString',
        args: ['arg1', 123],
        expectedError: {
            code: -32002,
            message: 'Method has returned error',
            data: 'asyncFunctionThrowsString'
        },
        expectedClassName: 'ExecutionError'
    },

    {
        callMethod: 'asyncFunctionThrowsError',
        args: ['arg1', 123],
        expectedError: {
            code: -32002,
            message: 'Method has returned error',
            data: 'asyncFunctionThrowsError'
        },
        expectedClassName: 'ExecutionError'
    },
];



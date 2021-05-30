/* eslint-disable  @typescript-eslint/no-unused-vars */

//export
const teleport = {
    qubits: [
        {
            id: 0,
            numChildren: 2,
        },
        {
            id: 1,
            numChildren: 2,
        },
        {
            id: 2,
            numChildren: 1,
        },
    ],
    operations: [
        {
            gate: 'TeleportCircuit',
            children: [
                {
                    gate: 'H',
                    targets: [
                        {
                            qId: 1,
                        },
                    ],
                },
                {
                    gate: 'X',
                    isControlled: true,
                    controls: [
                        {
                            qId: 1,
                        },
                    ],
                    targets: [
                        {
                            qId: 2,
                        },
                    ],
                },
                {
                    gate: 'Encode',
                    children: [
                        {
                            gate: 'PrepareRandomMessage',
                            children: [
                                {
                                    gate: 'Random',
                                    displayArgs: '([0.5, 0.5])',
                                    children: [
                                        {
                                            gate: 'DrawCategorical',
                                            displayArgs: '([0.5, 0.5])',
                                            children: [
                                                {
                                                    gate: 'DrawRandomDouble',
                                                    displayArgs: '(0, 1)',
                                                    targets: [],
                                                },
                                            ],
                                            targets: [],
                                        },
                                    ],
                                    targets: [],
                                },
                                {
                                    gate: 'SetPlus',
                                    children: [
                                        {
                                            gate: 'H',
                                            targets: [
                                                {
                                                    qId: 0,
                                                },
                                            ],
                                        },
                                    ],
                                    targets: [
                                        {
                                            qId: 0,
                                        },
                                    ],
                                },
                            ],
                            targets: [
                                {
                                    qId: 0,
                                },
                            ],
                        },
                        {
                            gate: 'X',
                            isControlled: true,
                            controls: [
                                {
                                    qId: 0,
                                },
                            ],
                            targets: [
                                {
                                    qId: 1,
                                },
                            ],
                        },
                        {
                            gate: 'H',
                            targets: [
                                {
                                    qId: 0,
                                },
                            ],
                        },
                    ],
                    targets: [
                        {
                            qId: 0,
                        },
                        {
                            qId: 1,
                        },
                    ],
                },
                {
                    gate: 'M',
                    isMeasurement: true,
                    controls: [
                        {
                            qId: 0,
                        },
                    ],
                    targets: [
                        {
                            type: 1,
                            qId: 0,
                            cId: 0,
                        },
                    ],
                },
                {
                    gate: 'measure',
                    isMeasurement: true,
                    controls: [
                        {
                            qId: 1,
                        },
                    ],
                    targets: [
                        {
                            type: 1,
                            qId: 1,
                            cId: 0,
                        },
                    ],
                },
                {
                    gate: 'Decode',
                    children: [
                        {
                            gate: 'ApplyIfElseR',
                            isConditional: true,
                            controls: [
                                {
                                    type: 1,
                                    qId: 1,
                                    cId: 0,
                                },
                            ],
                            targets: [],
                            children: [
                                {
                                    gate: 'X',
                                    controls: [
                                        {
                                            type: 1,
                                            qId: 1,
                                            cId: 0,
                                        },
                                    ],
                                    targets: [
                                        {
                                            qId: 2,
                                        },
                                    ],
                                    conditionalRender: 2,
                                },
                            ],
                        },
                        {
                            gate: 'ApplyIfElseR',
                            isConditional: true,
                            controls: [
                                {
                                    type: 1,
                                    qId: 0,
                                    cId: 0,
                                },
                            ],
                            targets: [],
                            children: [
                                {
                                    gate: 'Z',
                                    controls: [
                                        {
                                            type: 1,
                                            qId: 0,
                                            cId: 0,
                                        },
                                    ],
                                    targets: [
                                        {
                                            qId: 2,
                                        },
                                    ],
                                    conditionalRender: 2,
                                },
                            ],
                        },
                    ],
                    controls: [
                        {
                            type: 1,
                            qId: 0,
                            cId: 0,
                        },
                        {
                            type: 1,
                            qId: 1,
                            cId: 0,
                        },
                    ],
                    targets: [
                        {
                            qId: 2,
                        },
                    ],
                },
            ],
            targets: [
                {
                    qId: 1,
                },
                {
                    qId: 2,
                },
                {
                    qId: 0,
                },
            ],
        },
    ],
};

//export
const random = {
    qubits: [{ id: 0, numChildren: 1 }, { id: 1 }, { id: 2 }, { id: 3 }],
    operations: [
        {
            gate: 'Foo',
            conditionalRender: 3,
            targets: [
                { qId: 0 },
                { qId: 1 },
            ],
            children: [
                {
                    gate: 'H',
                    targets: [{ qId: 1 }],
                },
                {
                    gate: 'RX',
                    displayArgs: '(0.25)',
                    isControlled: true,
                    controls: [{ qId: 1 }],
                    targets: [{ qId: 0 }],
                },
            ],
        },
        {
            gate: 'H',
            targets: [{ qId: 2 }],
        },
        {
            gate: 'X',
            isControlled: true,
            controls: [{ qId: 1 }],
            targets: [
                { qId: 2 },
                { qId: 3 },
            ],
        },
        {
            gate: 'X',
            isControlled: true,
            controls: [
                { qId: 2 },
                { qId: 3 },
            ],
            targets: [{ qId: 1 }],
        },
        {
            gate: 'X',
            isControlled: true,
            controls: [
                { qId: 1 },
                { qId: 3 },
            ],
            targets: [{ qId: 2 }],
        },
        {
            gate: 'X',
            isControlled: true,
            controls: [{ qId: 2 }],
            targets: [
                { qId: 1 },
                { qId: 3 },
            ],
        },
        {
            gate: 'measure',
            isMeasurement: true,
            controls: [{ qId: 0 }],
            targets: [{ type: 1, qId: 0, cId: 0 }],
        },
        {
            gate: 'ApplyIfElseR',
            isConditional: true,
            controls: [{ type: 1, qId: 0, cId: 0 }],
            targets: [],
            children: [
                {
                    gate: 'H',
                    targets: [{ qId: 1 }],
                    conditionalRender: 1,
                },
                {
                    gate: 'X',
                    targets: [{ qId: 1 }],
                    conditionalRender: 1,
                },
                {
                    gate: 'X',
                    isControlled: true,
                    controls: [{ qId: 0 }],
                    targets: [{ qId: 1 }],
                    conditionalRender: 2,
                },
                {
                    gate: 'Foo',
                    targets: [{ qId: 3 }],
                    conditionalRender: 2,
                },
            ],
        },
        {
            gate: 'SWAP',
            targets: [
                { qId: 0 },
                { qId: 2 },
            ],
        },
        {
            gate: 'ZZ',
            targets: [
                { qId: 1 },
                { qId: 3 },
            ],
        },
        {
            gate: 'ZZ',
            targets: [
                { qId: 0 },
                { qId: 1 },
            ],
        },
        {
            gate: 'XX',
            isControlled: true,
            controls: [{ qId: 0 }],
            targets: [
                { qId: 1 },
                { qId: 3 },
            ],
        },
        {
            gate: 'XX',
            isControlled: true,
            controls: [{ qId: 2 }],
            targets: [
                { qId: 1 },
                { qId: 3 },
            ],
        },
        {
            gate: 'XX',
            isControlled: true,
            controls: [
                { qId: 0 },
                { qId: 2 },
            ],
            targets: [
                { qId: 1 },
                { qId: 3 },
            ],
        },
    ],
};

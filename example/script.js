const exampleJSON = {
    qubits: [{ id: 0, numChildren: 1 }, { id: 1 }, { id: 2 }, { id: 3 }],
    operations: [
        {
            gate: 'H',
            isControlled: false,
            isAdjoint: false,
            isMeasurement: false,
            controls: [],
            targets: [{ type: 0, qId: 1 }],
        },
        {
            gate: 'RX',
            displayArgs: '(0.25)',
            isControlled: true,
            isAdjoint: false,
            isMeasurement: false,
            controls: [{ type: 0, qId: 1 }],
            targets: [{ type: 0, qId: 0 }],
        },
        {
            gate: 'X',
            isControlled: true,
            isAdjoint: false,
            isMeasurement: false,
            controls: [{ type: 0, qId: 1 }],
            targets: [
                { type: 0, qId: 2 },
                { type: 0, qId: 3 },
            ],
        },
        {
            gate: 'X',
            isControlled: true,
            isAdjoint: false,
            isMeasurement: false,
            controls: [
                { type: 0, qId: 2 },
                { type: 0, qId: 3 },
            ],
            targets: [{ type: 0, qId: 1 }],
        },
        {
            gate: 'X',
            isControlled: true,
            isAdjoint: false,
            isMeasurement: false,
            controls: [
                { type: 0, qId: 1 },
                { type: 0, qId: 3 },
            ],
            targets: [{ type: 0, qId: 2 }],
        },
        {
            gate: 'X',
            isControlled: true,
            isAdjoint: false,
            isMeasurement: false,
            controls: [{ type: 0, qId: 2 }],
            targets: [
                { type: 0, qId: 1 },
                { type: 0, qId: 3 },
            ],
        },
        {
            gate: 'measure',
            isControlled: false,
            isAdjoint: false,
            isMeasurement: true,
            controls: [{ type: 0, qId: 0 }],
            targets: [{ type: 1, qId: 0, cId: 0 }],
        },
        {
            gate: 'if',
            isControlled: false,
            isAdjoint: false,
            isMeasurement: false,
            controls: [{ type: 1, qId: 0, cId: 0 }],
            targets: [],
            children: [
                [
                    {
                        gate: 'H',
                        isControlled: false,
                        isAdjoint: false,
                        isMeasurement: false,
                        controls: [],
                        targets: [{ type: 0, qId: 1 }],
                    },
                    {
                        gate: 'X',
                        isControlled: false,
                        isAdjoint: false,
                        isMeasurement: false,
                        controls: [],
                        targets: [{ type: 0, qId: 1 }],
                    },
                ],
                [
                    {
                        gate: 'X',
                        isControlled: true,
                        isAdjoint: false,
                        isMeasurement: false,
                        controls: [{ type: 0, qId: 0 }],
                        targets: [{ type: 0, qId: 1 }],
                    },
                    {
                        gate: 'Foo',
                        isControlled: false,
                        isAdjoint: false,
                        isMeasurement: false,
                        controls: [],
                        targets: [{ type: 0, qId: 3 }],
                    },
                ],
            ],
        },
        {
            gate: 'SWAP',
            isControlled: false,
            isAdjoint: false,
            isMeasurement: false,
            controls: [],
            targets: [
                { type: 0, qId: 0 },
                { type: 0, qId: 2 },
            ],
        },
        {
            gate: 'ZZ',
            isControlled: false,
            isAdjoint: false,
            isMeasurement: false,
            controls: [],
            targets: [
                { type: 0, qId: 1 },
                { type: 0, qId: 3 },
            ],
        },
        {
            gate: 'ZZ',
            isControlled: false,
            isAdjoint: false,
            isMeasurement: false,
            controls: [],
            targets: [
                { type: 0, qId: 0 },
                { type: 0, qId: 1 },
            ],
        },
        {
            gate: 'XX',
            isControlled: true,
            isAdjoint: false,
            isMeasurement: false,
            controls: [{ type: 0, qId: 0 }],
            targets: [
                { type: 0, qId: 1 },
                { type: 0, qId: 3 },
            ],
        },
        {
            gate: 'XX',
            isControlled: true,
            isAdjoint: false,
            isMeasurement: false,
            controls: [{ type: 0, qId: 2 }],
            targets: [
                { type: 0, qId: 1 },
                { type: 0, qId: 3 },
            ],
        },
        {
            gate: 'XX',
            isControlled: true,
            isAdjoint: false,
            isMeasurement: false,
            controls: [
                { type: 0, qId: 0 },
                { type: 0, qId: 2 },
            ],
            targets: [
                { type: 0, qId: 1 },
                { type: 0, qId: 3 },
            ],
        },
    ],
};

const svg = Sqore.executionPathToSvg(exampleJSON, Sqore.STYLES['Default']);
const div = document.getElementById('circuit');
if (div != null) div.innerHTML = svg;

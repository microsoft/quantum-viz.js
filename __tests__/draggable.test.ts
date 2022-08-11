// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { exportedForTesting } from '../src/draggable';
import { Circuit, create, Operation } from '../src/index';

const {
    _wireYs,
    _hostElems,
    _wirePrefixes,
    _center,
    _wireData,
    _equivGateElem,
    _equivOperation,
    _equivParentOperation,
    _equivParentArray,
    _moveX,
    _copyX,
    _moveY,
    _offsetRecursively,
    _targets,
    _circularMod,
    _indexes,
    _lastIndex,
} = exportedForTesting;

describe('Test _hostElems', () => {
    let container: HTMLElement;
    beforeAll(() => {
        container = document.createElement('div');
        const circuit = {
            qubits: [{ id: 0 }, { id: 1, numChildren: 1 }],
            operations: [
                {
                    gate: 'H',
                    targets: [{ qId: 0 }],
                },
                {
                    gate: 'X',
                    isControlled: true,
                    controls: [{ qId: 0 }],
                    targets: [{ qId: 1 }],
                },
                {
                    gate: 'Measure',
                    isMeasurement: true,
                    controls: [{ qId: 1 }],
                    targets: [{ type: 1, qId: 1, cId: 0 }],
                },
            ],
        };
        create(circuit).draw(container);
    });
    test('should return 4 elements', () => {
        expect(_hostElems(container)).toMatchSnapshot();
        expect(_hostElems(container)).toHaveLength(4);
    });
});

describe('Test _wireYs', () => {
    test('should return [40,100]', () => {
        Object.defineProperty(window.SVGElement.prototype, 'getBBox', {
            writable: true,
            value: () => ({
                x: 0,
                y: 20,
                width: 0,
                height: 120,
            }),
        });
        const elem = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        expect(_wireYs(elem, [40, 100, 140])).toStrictEqual([40, 100]);
    });
});

describe('Test _wirePrefixes', () => {
    test('2 wires', () => {
        expect(_wirePrefixes([40, 100])).toStrictEqual([
            { index: 0, prefixX: 40, wireY: 40 },
            { index: 1, prefixX: 40, wireY: 100 },
        ]);
    });
    test('3 wires', () => {
        expect(_wirePrefixes([40, 100, 140])).toStrictEqual([
            { index: 0, prefixX: 40, wireY: 40 },
            { index: 1, prefixX: 40, wireY: 100 },
            { index: 2, prefixX: 40, wireY: 140 },
        ]);
    });
});

describe('Test _center', () => {
    test('should return {25,50}', () => {
        Object.defineProperty(window.SVGElement.prototype, 'getBBox', {
            writable: true,
            value: () => ({
                x: 0,
                y: 0,
                width: 50,
                height: 100,
            }),
        });
        const elem = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        expect(_center(elem)).toStrictEqual({ cX: 25, cY: 50 });
    });
    test('should return {105,210}', () => {
        Object.defineProperty(window.SVGElement.prototype, 'getBBox', {
            writable: true,
            value: () => ({
                x: 100,
                y: 200,
                width: 10,
                height: 20,
            }),
        });
        const elem = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        expect(_center(elem)).toStrictEqual({ cX: 105, cY: 210 });
    });
});

describe('Test _wireData', () => {
    test('2 wires should return [40,100]', () => {
        const container = document.createElement('div');
        const circuit = {
            qubits: [{ id: 0 }, { id: 1, numChildren: 1 }],
            operations: [
                {
                    gate: 'H',
                    targets: [{ qId: 0 }],
                },
                {
                    gate: 'X',
                    isControlled: true,
                    controls: [{ qId: 0 }],
                    targets: [{ qId: 1 }],
                },
                {
                    gate: 'Measure',
                    isMeasurement: true,
                    controls: [{ qId: 1 }],
                    targets: [{ type: 1, qId: 1, cId: 0 }],
                },
            ],
        };
        create(circuit).draw(container);
        expect(_wireData(container)).toStrictEqual([40, 100]);
    });
    test('3 wires should return [40,100, 180]', () => {
        const container = document.createElement('div');
        const circuit = {
            qubits: [{ id: 0 }, { id: 1, numChildren: 1 }, { id: 2 }],
            operations: [
                {
                    gate: 'H',
                    targets: [{ qId: 2 }],
                },
                {
                    gate: 'X',
                    isControlled: true,
                    controls: [{ qId: 0 }],
                    targets: [{ qId: 1 }],
                },
                {
                    gate: 'Measure',
                    isMeasurement: true,
                    controls: [{ qId: 1 }],
                    targets: [{ type: 1, qId: 1, cId: 0 }],
                },
            ],
        };
        create(circuit).draw(container);
        expect(_wireData(container)).toStrictEqual([40, 100, 180]);
    });
});

describe('Test _equivGateElem', () => {
    let container: HTMLElement;
    beforeAll(() => {
        container = document.createElement('div');
        const circuit = {
            qubits: [{ id: 0 }, { id: 1, numChildren: 1 }],
            operations: [
                {
                    gate: 'H',
                    targets: [{ qId: 0 }],
                },
                {
                    gate: 'X',
                    isControlled: true,
                    controls: [{ qId: 0 }],
                    targets: [{ qId: 1 }],
                },
                {
                    gate: 'Measure',
                    isMeasurement: true,
                    controls: [{ qId: 1 }],
                    targets: [{ type: 1, qId: 1, cId: 0 }],
                },
            ],
        };
        create(circuit).draw(container);
    });
    test('should return gate H', () => {
        const elem = container.querySelector('[class^="gate-"]') as SVGElement;
        expect(_equivGateElem(elem)).toMatchSnapshot();
    });
});

describe('Test _equivOperation', () => {
    const circuit = {
        qubits: [{ id: 0 }, { id: 1, numChildren: 1 }],
        operations: [
            {
                gate: 'H',
                targets: [{ qId: 0 }],
            },
            {
                gate: 'X',
                isControlled: true,
                controls: [{ qId: 0 }],
                targets: [{ qId: 1 }],
            },
            {
                gate: 'Measure',
                isMeasurement: true,
                controls: [{ qId: 1 }],
                targets: [{ type: 1, qId: 1, cId: 0 }],
            },
        ],
    };
    test('should return H gate', () => {
        expect(_equivOperation('0', circuit.operations)).toMatchSnapshot();
    });
    test('should return X gate', () => {
        expect(_equivOperation('1', circuit.operations)).toMatchSnapshot();
    });
});

describe('Test _equivParentOperation', () => {
    test('should return Foo', () => {
        const circuit = {
            qubits: [{ id: 0, numChildren: 1 }, { id: 1 }, { id: 2 }, { id: 3 }],
            operations: [
                {
                    gate: 'Foo',
                    conditionalRender: 3,
                    targets: [{ qId: 0 }, { qId: 1 }],
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
                    gate: 'X',
                    targets: [{ qId: 3 }],
                },
                {
                    gate: 'X',
                    isControlled: true,
                    controls: [{ qId: 1 }],
                    targets: [{ qId: 2 }, { qId: 3 }],
                },
                {
                    gate: 'X',
                    isControlled: true,
                    controls: [{ qId: 2 }, { qId: 3 }],
                    targets: [{ qId: 1 }],
                },
                {
                    gate: 'X',
                    isControlled: true,
                    controls: [{ qId: 1 }, { qId: 3 }],
                    targets: [{ qId: 2 }],
                },
                {
                    gate: 'X',
                    isControlled: true,
                    controls: [{ qId: 2 }],
                    targets: [{ qId: 1 }, { qId: 3 }],
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
                    targets: [{ qId: 0 }, { qId: 2 }],
                    children: [
                        { gate: 'X', isControlled: true, controls: [{ qId: 0 }], targets: [{ qId: 2 }] },
                        { gate: 'X', isControlled: true, controls: [{ qId: 2 }], targets: [{ qId: 0 }] },
                        { gate: 'X', isControlled: true, controls: [{ qId: 0 }], targets: [{ qId: 2 }] },
                    ],
                },
                {
                    gate: 'ZZ',
                    targets: [{ qId: 1 }, { qId: 3 }],
                },
                {
                    gate: 'ZZ',
                    targets: [{ qId: 0 }, { qId: 1 }],
                },
                {
                    gate: 'XX',
                    isControlled: true,
                    controls: [{ qId: 0 }],
                    targets: [{ qId: 1 }, { qId: 3 }],
                },
                {
                    gate: 'XX',
                    isControlled: true,
                    controls: [{ qId: 2 }],
                    targets: [{ qId: 1 }, { qId: 3 }],
                },
                {
                    gate: 'XX',
                    isControlled: true,
                    controls: [{ qId: 0 }, { qId: 2 }],
                    targets: [{ qId: 1 }, { qId: 3 }],
                },
            ],
        };
        expect(_equivParentOperation('0-1', circuit.operations)).toMatchSnapshot();
    });
});

describe('Test _equivParentArray', () => {
    test('should return Foo', () => {
        const circuit = {
            qubits: [{ id: 0, numChildren: 1 }, { id: 1 }, { id: 2 }, { id: 3 }],
            operations: [
                {
                    gate: 'Foo',
                    conditionalRender: 3,
                    targets: [{ qId: 0 }, { qId: 1 }],
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
                    gate: 'X',
                    targets: [{ qId: 3 }],
                },
                {
                    gate: 'X',
                    isControlled: true,
                    controls: [{ qId: 1 }],
                    targets: [{ qId: 2 }, { qId: 3 }],
                },
                {
                    gate: 'X',
                    isControlled: true,
                    controls: [{ qId: 2 }, { qId: 3 }],
                    targets: [{ qId: 1 }],
                },
                {
                    gate: 'X',
                    isControlled: true,
                    controls: [{ qId: 1 }, { qId: 3 }],
                    targets: [{ qId: 2 }],
                },
                {
                    gate: 'X',
                    isControlled: true,
                    controls: [{ qId: 2 }],
                    targets: [{ qId: 1 }, { qId: 3 }],
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
                    targets: [{ qId: 0 }, { qId: 2 }],
                    children: [
                        { gate: 'X', isControlled: true, controls: [{ qId: 0 }], targets: [{ qId: 2 }] },
                        { gate: 'X', isControlled: true, controls: [{ qId: 2 }], targets: [{ qId: 0 }] },
                        { gate: 'X', isControlled: true, controls: [{ qId: 0 }], targets: [{ qId: 2 }] },
                    ],
                },
                {
                    gate: 'ZZ',
                    targets: [{ qId: 1 }, { qId: 3 }],
                },
                {
                    gate: 'ZZ',
                    targets: [{ qId: 0 }, { qId: 1 }],
                },
                {
                    gate: 'XX',
                    isControlled: true,
                    controls: [{ qId: 0 }],
                    targets: [{ qId: 1 }, { qId: 3 }],
                },
                {
                    gate: 'XX',
                    isControlled: true,
                    controls: [{ qId: 2 }],
                    targets: [{ qId: 1 }, { qId: 3 }],
                },
                {
                    gate: 'XX',
                    isControlled: true,
                    controls: [{ qId: 0 }, { qId: 2 }],
                    targets: [{ qId: 1 }, { qId: 3 }],
                },
            ],
        };
        expect(_equivParentArray('0-1', circuit.operations)).toMatchSnapshot();
    });
    test('should return all operations', () => {
        const circuit = {
            qubits: [{ id: 0 }, { id: 1, numChildren: 1 }],
            operations: [
                {
                    gate: 'H',
                    targets: [{ qId: 0 }],
                },
                {
                    gate: 'X',
                    isControlled: true,
                    controls: [{ qId: 0 }],
                    targets: [{ qId: 1 }],
                },
                {
                    gate: 'Measure',
                    isMeasurement: true,
                    controls: [{ qId: 1 }],
                    targets: [{ type: 1, qId: 1, cId: 0 }],
                },
            ],
        };
        expect(_equivParentArray('0', circuit.operations)).toMatchSnapshot();
    });
});

describe('Test _moveX', () => {
    let circuit: Circuit;
    beforeEach(() => {
        circuit = {
            qubits: [{ id: 0 }, { id: 1, numChildren: 1 }],
            operations: [
                {
                    gate: 'H',
                    targets: [{ qId: 0 }],
                },
                {
                    gate: 'X',
                    isControlled: true,
                    controls: [{ qId: 0 }],
                    targets: [{ qId: 1 }],
                },
                {
                    gate: 'Measure',
                    isMeasurement: true,
                    controls: [{ qId: 1 }],
                    targets: [{ type: 1, qId: 1, cId: 0 }],
                },
            ],
        };
    });
    test('move elem from index 0 to index 1', () => {
        _moveX('0', '2', circuit.operations);
        expect(circuit.operations).toMatchSnapshot();
    });
    test('move elem from index 0 to last', () => {
        _moveX('0', '3', circuit.operations);
        expect(circuit.operations).toMatchSnapshot();
    });
});

describe('Test _copyX', () => {
    let circuit: Circuit;
    beforeEach(() => {
        circuit = {
            qubits: [{ id: 0 }, { id: 1, numChildren: 1 }],
            operations: [
                {
                    gate: 'H',
                    targets: [{ qId: 0 }],
                },
                {
                    gate: 'X',
                    isControlled: true,
                    controls: [{ qId: 0 }],
                    targets: [{ qId: 1 }],
                },
                {
                    gate: 'Measure',
                    isMeasurement: true,
                    controls: [{ qId: 1 }],
                    targets: [{ type: 1, qId: 1, cId: 0 }],
                },
            ],
        };
    });
    test('copy elem from index 0 to index 1', () => {
        _copyX('0', '2', circuit.operations);
        expect(circuit.operations).toMatchSnapshot();
    });
    test('copy elem from index 0 to last', () => {
        _copyX('0', '3', circuit.operations);
        expect(circuit.operations).toMatchSnapshot();
    });
});

describe('Test _moveY', () => {
    let operation: Operation;
    beforeEach(() => {
        operation = {
            gate: 'ZZ',
            targets: [{ qId: 1 }, { qId: 3 }],
        };
    });
    test('offset by 1', () => {
        _moveY('1', '2', operation, 4);
        expect(operation).toStrictEqual({
            gate: 'ZZ',
            targets: [{ qId: 2 }, { qId: 0 }],
        });
    });
    test('offset by -3', () => {
        _moveY('3', '0', operation, 4);
        expect(operation).toStrictEqual({
            gate: 'ZZ',
            targets: [{ qId: 2 }, { qId: 0 }],
        });
    });
});

describe('Test _offsetRecursively', () => {
    let operation: Operation;
    beforeEach(() => {
        operation = {
            gate: 'ZZ',
            targets: [{ qId: 1 }, { qId: 3 }],
        };
    });
    test('offset by 1', () => {
        _offsetRecursively(operation, 1, 4);
        expect(operation).toStrictEqual({
            gate: 'ZZ',
            targets: [{ qId: 2 }, { qId: 0 }],
        });
    });
    test('offset by 2', () => {
        _offsetRecursively(operation, 2, 4);
        expect(operation).toStrictEqual({
            gate: 'ZZ',
            targets: [{ qId: 3 }, { qId: 1 }],
        });
    });
});

describe('Test _targets', () => {
    let circuit: Circuit;
    beforeEach(() => {
        circuit = {
            qubits: [{ id: 0, numChildren: 1 }, { id: 1 }, { id: 2 }, { id: 3 }],
            operations: [
                {
                    gate: 'Foo',
                    conditionalRender: 3,
                    targets: [{ qId: 0 }, { qId: 1 }],
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
                    gate: 'X',
                    targets: [{ qId: 3 }],
                },
                {
                    gate: 'X',
                    isControlled: true,
                    controls: [{ qId: 1 }],
                    targets: [{ qId: 2 }, { qId: 3 }],
                },
                {
                    gate: 'X',
                    isControlled: true,
                    controls: [{ qId: 2 }, { qId: 3 }],
                    targets: [{ qId: 1 }],
                },
                {
                    gate: 'X',
                    isControlled: true,
                    controls: [{ qId: 1 }, { qId: 3 }],
                    targets: [{ qId: 2 }],
                },
                {
                    gate: 'X',
                    isControlled: true,
                    controls: [{ qId: 2 }],
                    targets: [{ qId: 1 }, { qId: 3 }],
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
                    targets: [{ qId: 0 }, { qId: 2 }],
                    children: [
                        { gate: 'X', isControlled: true, controls: [{ qId: 0 }], targets: [{ qId: 2 }] },
                        { gate: 'X', isControlled: true, controls: [{ qId: 2 }], targets: [{ qId: 0 }] },
                        { gate: 'X', isControlled: true, controls: [{ qId: 0 }], targets: [{ qId: 2 }] },
                    ],
                },
                {
                    gate: 'ZZ',
                    targets: [{ qId: 1 }, { qId: 3 }],
                },
                {
                    gate: 'ZZ',
                    targets: [{ qId: 0 }, { qId: 1 }],
                },
                {
                    gate: 'XX',
                    isControlled: true,
                    controls: [{ qId: 0 }],
                    targets: [{ qId: 1 }, { qId: 3 }],
                },
                {
                    gate: 'XX',
                    isControlled: true,
                    controls: [{ qId: 2 }],
                    targets: [{ qId: 1 }, { qId: 3 }],
                },
                {
                    gate: 'XX',
                    isControlled: true,
                    controls: [{ qId: 0 }, { qId: 2 }],
                    targets: [{ qId: 1 }, { qId: 3 }],
                },
            ],
        };
    });
    test('move RX down 1, should return [{qId:1}, {qId:2}]', () => {
        const parentOperation = circuit.operations[0];
        const parentArray = parentOperation.children;
        if (parentArray) {
            const operation = parentArray[1];
            _moveY('0', '1', operation, 4);
        }
        expect(_targets(parentOperation)).toStrictEqual([{ qId: 1 }, { qId: 2 }]);
    });
    test('move RX down 2, should return [{qId:1}, {qId:2}, {qId:3}]', () => {
        const parentOperation = circuit.operations[0];
        const parentArray = parentOperation.children;
        if (parentArray) {
            const operation = parentArray[1];
            _moveY('0', '2', operation, 4);
        }
        expect(_targets(parentOperation)).toStrictEqual([{ qId: 1 }, { qId: 2 }, { qId: 3 }]);
    });
});

describe('Test _circularMod', () => {
    test('should return 2', () => {
        expect(_circularMod(5, 1, 4)).toEqual(2);
    });
    test('should return 1', () => {
        expect(_circularMod(100, 1, 2)).toEqual(1);
    });
    test('should return 3', () => {
        expect(_circularMod(3, 0, 4)).toEqual(3);
    });
});

describe('Test _lastIndex', () => {
    test('"" should return undefined', () => {
        expect(_lastIndex('')).toBeUndefined();
    });
    test('"0-0-1" should return 1', () => {
        expect(_lastIndex('0-0-1')).toEqual(1);
    });
    test('"1-0-5" should return [1,0,5]', () => {
        expect(_lastIndex('1-0-5')).toEqual(5);
    });
});

describe('Test _indexes', () => {
    test('"" should return []', () => {
        expect(_indexes('')).toStrictEqual([]);
    });
    test('"0-0-1" should return [0,0,1]', () => {
        expect(_indexes('0-0-1')).toStrictEqual([0, 0, 1]);
    });
    test('"1-0-1" should return [1,0,1]', () => {
        expect(_indexes('1-0-1')).toStrictEqual([1, 0, 1]);
    });
});

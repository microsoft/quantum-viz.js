// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { exportedForTesting } from '../src/editable';
import { draw, STYLES } from '../src/index';

const { _center, _wireData, _indexes, _lastIndex } = exportedForTesting;

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
        draw(circuit, container, STYLES['default']);
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
        draw(circuit, container, STYLES['default']);
        expect(_wireData(container)).toStrictEqual([40, 100, 180]);
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

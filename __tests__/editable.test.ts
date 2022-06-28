// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { exportedForTesting } from '../src/editable';

const { _indexes, _lastIndex, _center } = exportedForTesting;

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

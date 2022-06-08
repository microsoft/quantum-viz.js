import { Operation } from '../src/circuit';
import { exportedForTesting } from '../src/editable';
import { RegisterType } from '../src/register';

const {
    getDataId,
    splitDataId,
    cursorMove,
    cursorCopy,
    deleteAt,
    insertBefore,
    insertAfter,
    getDropzonePosition,
    getWireElemText,
    getWireElemY,
    getGate,
    getParent,
} = exportedForTesting;

// Utlities
describe('Testing getDataId', () => {
    const elem = document.createElement('div');
    test('with with no data-id', () => {
        expect(getDataId(elem)).toBe('');
    });
    test('with level 0 data-id', () => {
        elem.setAttribute('data-id', '0');
        expect(getDataId(elem)).toBe('0');
    });

    test('with level 1 data-id', () => {
        elem.setAttribute('data-id', '0-1');
        expect(getDataId(elem)).toBe('0-1');
    });
});

describe('Testing splitDataId', () => {
    test('with empty dataId', () => {
        expect(splitDataId('')).toStrictEqual([]);
    });
    test('with level 0 data-id', () => {
        expect(splitDataId('1')).toStrictEqual([1]);
    });

    test('with level 1 data-id', () => {
        expect(splitDataId('1-2')).toStrictEqual([1, 2]);
    });
});

describe('Testing cursorMove', () => {
    const container = document.createElement('div');
    test('turn on move cursor', () => {
        expect(container).toMatchSnapshot();
        cursorMove(container, true);
        expect(container).toMatchSnapshot();
    });
    test('turn off move cursor', () => {
        expect(container).toMatchSnapshot();
        cursorMove(container, false);
        expect(container).toMatchSnapshot();
    });
    test('turn on and off move cursor', () => {
        expect(container).toMatchSnapshot();
        cursorMove(container, true);
        cursorMove(container, false);
        expect(container).toMatchSnapshot();
    });
});

describe('Testing cursorCopy', () => {
    const container = document.createElement('div');
    test('turn on copy cursor', () => {
        expect(container).toMatchSnapshot();
        cursorCopy(container, true);
        expect(container).toMatchSnapshot();
    });
    test('turn off copy cursor', () => {
        expect(container).toMatchSnapshot();
        cursorCopy(container, false);
        expect(container).toMatchSnapshot();
    });
    test('turn on and off copy cursor', () => {
        expect(container).toMatchSnapshot();
        cursorCopy(container, true);
        cursorCopy(container, false);
        expect(container).toMatchSnapshot();
    });
});

describe('Testing deleteAt', () => {
    const operations: Operation[] = [];
    beforeEach(() => {
        Object.assign(operations, [
            {
                gate: 'X',
                isMeasurement: false,
                isConditional: false,
                isControlled: false,
                isAdjoint: false,
                controls: [],
                targets: [{ type: RegisterType.Qubit, qId: 0 }],
            },
            {
                gate: 'Y',
                isMeasurement: false,
                isConditional: false,
                isControlled: false,
                isAdjoint: false,
                controls: [],
                targets: [{ type: RegisterType.Qubit, qId: 0 }],
            },
            {
                gate: 'Z',
                isMeasurement: false,
                isConditional: false,
                isControlled: false,
                isAdjoint: false,
                controls: [],
                targets: [{ type: RegisterType.Qubit, qId: 0 }],
            },
        ]);
    });
    test('delete X at index 0', () => {
        deleteAt(operations, 0);
        expect(operations).toStrictEqual([
            {
                gate: 'Y',
                isMeasurement: false,
                isConditional: false,
                isControlled: false,
                isAdjoint: false,
                controls: [],
                targets: [{ type: RegisterType.Qubit, qId: 0 }],
            },
            {
                gate: 'Z',
                isMeasurement: false,
                isConditional: false,
                isControlled: false,
                isAdjoint: false,
                controls: [],
                targets: [{ type: RegisterType.Qubit, qId: 0 }],
            },
        ]);
    });
    test('delete Y at index 1', () => {
        deleteAt(operations, 1);
        expect(operations).toStrictEqual([
            {
                gate: 'X',
                isMeasurement: false,
                isConditional: false,
                isControlled: false,
                isAdjoint: false,
                controls: [],
                targets: [{ type: RegisterType.Qubit, qId: 0 }],
            },
            {
                gate: 'Z',
                isMeasurement: false,
                isConditional: false,
                isControlled: false,
                isAdjoint: false,
                controls: [],
                targets: [{ type: RegisterType.Qubit, qId: 0 }],
            },
        ]);
    });
    test('delete Z and X at index 2, 0', () => {
        deleteAt(operations, 2);
        deleteAt(operations, 0);
        expect(operations).toStrictEqual([
            {
                gate: 'Y',
                isMeasurement: false,
                isConditional: false,
                isControlled: false,
                isAdjoint: false,
                controls: [],
                targets: [{ type: RegisterType.Qubit, qId: 0 }],
            },
        ]);
    });
});

describe('Testing insertBefore', () => {
    test('insert before X', () => {
        const operations = [
            {
                gate: 'X',
                isMeasurement: false,
                isConditional: false,
                isControlled: false,
                isAdjoint: false,
                controls: [],
                targets: [{ type: RegisterType.Qubit, qId: 0 }],
            },
            {
                gate: 'Z',
                isMeasurement: false,
                isConditional: false,
                isControlled: false,
                isAdjoint: false,
                controls: [],
                targets: [{ type: RegisterType.Qubit, qId: 0 }],
            },
        ];
        const newGate = {
            gate: 'Y',
            isMeasurement: false,
            isConditional: false,
            isControlled: false,
            isAdjoint: false,
            controls: [],
            targets: [{ type: RegisterType.Qubit, qId: 0 }],
        };
        insertBefore(operations, 0, newGate);
        expect(operations).toStrictEqual([
            {
                gate: 'Y',
                isMeasurement: false,
                isConditional: false,
                isControlled: false,
                isAdjoint: false,
                controls: [],
                targets: [{ type: RegisterType.Qubit, qId: 0 }],
            },
            {
                gate: 'X',
                isMeasurement: false,
                isConditional: false,
                isControlled: false,
                isAdjoint: false,
                controls: [],
                targets: [{ type: RegisterType.Qubit, qId: 0 }],
            },
            {
                gate: 'Z',
                isMeasurement: false,
                isConditional: false,
                isControlled: false,
                isAdjoint: false,
                controls: [],
                targets: [{ type: RegisterType.Qubit, qId: 0 }],
            },
        ]);
    });
});

describe('Testing insertAfter', () => {
    test('insert after X', () => {
        const operations = [
            {
                gate: 'X',
                isMeasurement: false,
                isConditional: false,
                isControlled: false,
                isAdjoint: false,
                controls: [],
                targets: [{ type: RegisterType.Qubit, qId: 0 }],
            },
            {
                gate: 'Z',
                isMeasurement: false,
                isConditional: false,
                isControlled: false,
                isAdjoint: false,
                controls: [],
                targets: [{ type: RegisterType.Qubit, qId: 0 }],
            },
        ];
        const newGate = {
            gate: 'Y',
            isMeasurement: false,
            isConditional: false,
            isControlled: false,
            isAdjoint: false,
            controls: [],
            targets: [{ type: RegisterType.Qubit, qId: 0 }],
        };
        insertAfter(operations, 0, newGate);
        expect(operations).toStrictEqual([
            {
                gate: 'X',
                isMeasurement: false,
                isConditional: false,
                isControlled: false,
                isAdjoint: false,
                controls: [],
                targets: [{ type: RegisterType.Qubit, qId: 0 }],
            },
            {
                gate: 'Y',
                isMeasurement: false,
                isConditional: false,
                isControlled: false,
                isAdjoint: false,
                controls: [],
                targets: [{ type: RegisterType.Qubit, qId: 0 }],
            },
            {
                gate: 'Z',
                isMeasurement: false,
                isConditional: false,
                isControlled: false,
                isAdjoint: false,
                controls: [],
                targets: [{ type: RegisterType.Qubit, qId: 0 }],
            },
        ]);
    });
});

describe('Testing getDropzonePosition', () => {
    let svgElem: SVGElement;
    let dropzoneElem: SVGElement;
    beforeEach(() => {
        svgElem = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGElement;
        dropzoneElem = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
        svgElem.append(dropzoneElem);
    });
    test('get position of non-dropzone', () => {
        expect(() => getDropzonePosition(dropzoneElem)).toThrowError('Position not found');
    });
    test('get position of dropzone on the left', () => {
        dropzoneElem.setAttribute('data-dropzone-position', 'left');
        expect(getDropzonePosition(dropzoneElem)).toBe('left');
    });
    test('get position of dropzone on the right', () => {
        dropzoneElem.setAttribute('data-dropzone-position', 'right');
        expect(getDropzonePosition(dropzoneElem)).toBe('right');
    });
});

describe('Testing getWireElementText', () => {
    let svgElem: SVGElement;
    let groupElem: SVGGElement;
    let textElem: SVGGElement;
    beforeEach(() => {
        svgElem = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGElement;
        groupElem = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement;
        textElem = document.createElementNS('http://www.w3.org/2000/svg', 'text') as SVGTextElement;
        groupElem.append(textElem);
        svgElem.append(groupElem);
    });
    test('text element not exists', () => {
        textElem.remove();
        expect(() => getWireElemText(groupElem)).toThrowError('Text not found');
    });
    test('get text element without textContent', () => {
        expect(() => getWireElemText(groupElem)).toThrowError('Text not found');
    });
    test('get text element empty textContent', () => {
        expect(() => getWireElemText(groupElem)).toThrowError('Text not found');
    });
    test('should return q0', () => {
        textElem.textContent = 'q0';
        expect(getWireElemText(groupElem)).toEqual('q0');
    });
    test('should return q1', () => {
        textElem.textContent = 'q1';
        expect(getWireElemText(groupElem)).toEqual('q1');
    });
});

describe('Testing getWireElemY', () => {
    let svgElem: SVGElement;
    let groupElem: SVGGElement;
    let lineElem: SVGGElement;
    beforeEach(() => {
        svgElem = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGElement;
        groupElem = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement;
        lineElem = document.createElementNS('http://www.w3.org/2000/svg', 'line') as SVGLineElement;
        groupElem.append(lineElem);
        svgElem.append(groupElem);
    });
    test('line element not exists', () => {
        lineElem.remove();
        expect(() => getWireElemY(groupElem)).toThrowError('y not found');
    });
    test('get y element without y value', () => {
        expect(() => getWireElemY(groupElem)).toThrowError('y not found');
    });
    test('get text element empty textContent', () => {
        expect(() => getWireElemY(groupElem)).toThrowError('y not found');
    });
    test('should return 40', () => {
        lineElem.setAttribute('y1', '40');
        expect(getWireElemY(groupElem)).toEqual(40);
    });
    test('should return 99', () => {
        lineElem.setAttribute('y1', '99');
        expect(getWireElemY(groupElem)).toEqual(99);
    });
});

describe('Testing getParent', () => {
    test('with level 0 gate', () => {
        const operations = [
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
        ];
        expect(getParent('0', operations)).toStrictEqual([
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
        ]);
    });
    test('with level 1 gate', () => {
        const operations = [
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
        ];
        expect(getParent('0-1', operations)).toStrictEqual([
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
        ]);
    });
});

describe('Testing getGate', () => {
    test('should return H gate', () => {
        const operations = [
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
        ];
        expect(getGate('0', operations)).toStrictEqual({
            gate: 'H',
            targets: [{ qId: 0 }],
        });
    });
    test('should return X gate', () => {
        const operations = [
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
        ];
        expect(getGate('1', operations)).toStrictEqual({
            gate: 'X',
            isControlled: true,
            controls: [{ qId: 0 }],
            targets: [{ qId: 1 }],
        });
    });
    test('should return RX', () => {
        const operations = [
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
        ];
        expect(getGate('0-1', operations)).toStrictEqual({
            gate: 'RX',
            displayArgs: '(0.25)',
            isControlled: true,
            controls: [{ qId: 1 }],
            targets: [{ qId: 0 }],
        });
    });
});

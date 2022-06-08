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

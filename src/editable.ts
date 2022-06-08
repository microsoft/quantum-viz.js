// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Operation } from './circuit';
import { leftPadding } from './constants';
import { box } from './formatters/formatUtils';
import { Sqore } from './sqore';

interface Context {
    container: HTMLElement;
    operations: Operation[];
    wires: Wires;
    renderFn: () => void;
}

interface Wires {
    [y: string]: string;
}

let _sourceTarget: SVGElement | null;

/**
 * Add editable elements and events.
 *
 * @param container     HTML element for rendering visualization into.
 * @param sqore         Sqore object
 *
 */

const addEditable = (container: HTMLElement, sqore: Sqore): void => {
    const context: Context = {
        container: container,
        operations: sqore.circuit.operations,
        wires: getWireElemsY(container),
        renderFn: () => sqore.draw(container, 0, true),
    };
    addCustomStyles(container);
    addDropzones(container);
    addDocumentEvents(container);
    addDropzoneEvents(context);
    addMouseEvents(context);
};

// Commands

const addCustomStyles = (container: HTMLElement): void => {
    const style = container.querySelector<HTMLStyleElement>('style');
    if (style) {
        style.innerHTML += `
            .dropzone {
                fill: transparent;
                stroke: transparent;
            }
            .dropzone:hover{
                fill: red;
                opacity: 25%;
            }
            text {
                user-select: none;
            }
            .copying {
                cursor: copy;
            }
            .moving {
                cursor: move;
            }
            .detail-panel {
                display: flex;
                align-content: center;
                gap: 12px;
            }
        `;
    }
};

const addDropzones = (container: HTMLElement): void => {
    const gateElems = getGateElems(container);
    gateElems.forEach((gateElem) => {
        const { x, y, width, height } = gateElem.getBBox({ stroke: true });
        const dataId = getDataId(gateElem);
        gateElem.append(createLeftDropzone(x, y, height, dataId));
        gateElem.append(createRightDropzone(x, y, width, height, dataId));
    });
};

const addDocumentEvents = (container: HTMLElement): void => {
    container.addEventListener('click', (ev: MouseEvent) => {
        _sourceTarget = null;
        if (ev.ctrlKey) return;
    });
    container.addEventListener('contextmenu', (ev: MouseEvent) => {
        ev.preventDefault();
    });
    container.addEventListener('mouseup', () => {
        cursorCopy(container, false);
        cursorMove(container, false);
    });
};

const addDropzoneEvents = (context: Context): void => {
    const { container } = context;
    const dropzoneElems = container.querySelectorAll<SVGRectElement>('.dropzone');
    dropzoneElems.forEach((dropzoneElem) => {
        dropzoneElem.addEventListener('mouseup', (ev: MouseEvent) => handleDropzoneMouseUp(ev, context));
    });
};

const addMouseEvents = (context: Context): void => {
    const { container } = context;
    const gateElems = getGateElems(container);
    gateElems.forEach((gateElem) => {
        gateElem.addEventListener('mousedown', (ev: MouseEvent) => handleGateMouseDown(ev, container));
    });
};

// Event handlers
const handleGateMouseDown = (ev: MouseEvent, container: HTMLElement): void => {
    ev.stopPropagation();
    _sourceTarget = ev.currentTarget as SVGGElement;

    // Ctrl + Mousedown to copy. Mousedown only to move.
    ev.ctrlKey ? cursorCopy(container, true) : cursorMove(container, true);
};

const handleDropzoneMouseUp = (ev: MouseEvent, context: Context): void | false => {
    ev.stopPropagation();

    const { container, operations, wires, renderFn } = context;

    const currentTarget = ev.currentTarget as SVGGElement;

    if (!currentTarget) return false;

    const dataId = getDataId(currentTarget);
    const parent = getParent(dataId, operations);
    const index = splitDataId(dataId).pop();
    const position = getDropzonePosition(currentTarget);

    if (_sourceTarget == null) return false;

    const sourceDataId = getDataId(_sourceTarget);
    const sourceParent = getParent(sourceDataId, operations);
    const sourceIndex = splitDataId(sourceDataId).pop();

    if (index == null || sourceIndex == null) return false;

    const newGate = getGate(sourceDataId, operations);
    const wireY = getClosestWireY(ev.offsetY, wires);

    // Not allow Measure gate to move vertically
    if (wireY != null && newGate.gate !== 'measure') {
        console.log(wires[wireY]);
        // wires[wireY] returns qubit name (i.e: 'q0')
        // this remove 'q' and assign an index (i.e: 0)
        const index = Number(wires[wireY].slice(1));
        const [firstTarget, ...targetsExceptFirst] = newGate.targets;
        // Reserve all other properties, only change qId
        Object.assign(firstTarget, { ...firstTarget, qId: index });
        // Reserve all other targets, only change first target
        Object.assign(newGate, { ...newGate, targets: [firstTarget, ...targetsExceptFirst] });
    }

    // Remove source element if moving using Ctrl + Mousedown
    if (!ev.ctrlKey) {
        deleteAt(sourceParent, sourceIndex);
    }

    // If dropzone is left of gate, insert before gate.
    // Otherwise, insert after.
    if (position === 'left') {
        insertBefore(parent, index, newGate);
    } else {
        insertAfter(parent, index, newGate);
    }

    // Remove cursor styles
    cursorCopy(container, false);
    cursorMove(container, false);

    // Redraw the circuit
    renderFn();
};

// Element getters

const getGateElems = (container: HTMLElement): SVGGElement[] => {
    return Array.from(container.querySelectorAll('g.gate'));
};

const getWireElems = (container: HTMLElement): SVGGElement[] => {
    // elems include qubit wires and lines of measure gates
    const elems = container.querySelectorAll<SVGGElement>('svg > g:nth-child(3) > g');
    // filter out <g> elements having more than 2 elements because
    // qubit wires contain only 2 elements: <line> and <text>
    // lines of measure gates contain 4 <line> elements
    return Array.from(elems).filter((elem) => elem.childElementCount < 3);
};

// Element creators

const createDropzone = (
    x: number,
    y: number,
    width: number,
    height: number,
    dataId: string,
    position: 'left' | 'right',
): SVGElement => {
    const dropzone = box(x, y, width, height, `dropzone`);
    dropzone.setAttribute('data-id', dataId);
    dropzone.setAttribute('data-dropzone-position', position);
    return dropzone;
};

const createLeftDropzone = (x: number, y: number, height: number, dataId: string): SVGElement => {
    return createDropzone(x - leftPadding / 2, y, leftPadding / 2, height, dataId, 'left');
};
const createRightDropzone = (x: number, y: number, width: number, height: number, dataId: string): SVGElement => {
    return createDropzone(x + width, y, leftPadding / 2, height, dataId, 'right');
};

// Operation getters

const getParent = (dataId: string, operations: Operation[]): Operation[] => {
    const segments = splitDataId(dataId);
    // Remove last segment to navigate to parent instead of child
    segments.pop();

    let parent = operations;
    for (const segment of segments) {
        parent = parent[segment].children || parent;
    }
    return parent;
};

const getGate = (dataId: string, operations: Operation[]): Operation => {
    const parent = getParent(dataId, operations);
    const index = splitDataId(dataId).pop();

    if (index == null) {
        throw new Error('Gate not found');
    }

    return parent[index];
};

// Utilities
const getDataId = (element: Element): string => {
    return element.getAttribute('data-id') || '';
};

const splitDataId = (dataId: string): number[] => {
    return dataId === '' ? [] : dataId.split('-').map(Number);
};

const getWireElemsY = (container: HTMLElement): Wires => {
    const wireElems = getWireElems(container);
    return wireElems.reduce((previous, current) => {
        const y = getWireElemY(current);
        const text = getWireElemText(current);
        return { ...previous, [`${y}`]: text };
    }, {});
};

const getWireElemY = (wireElem: SVGGElement): number => {
    const lineElem = wireElem.querySelector<SVGLineElement>('line');
    if (lineElem == null || lineElem.getAttribute('y1') == null) throw Error('y not found');
    return Number(lineElem.getAttribute('y1'));
};

const getWireElemText = (wireElem: SVGGElement): string => {
    const textElem = wireElem.querySelector<SVGTextElement>('text');
    if (textElem == null || textElem.textContent == null || textElem.textContent === '')
        throw new Error('Text not found');
    return textElem.textContent;
};

const getClosestWireY = (offsetY: number, wires: { [y: number]: string }): number | null => {
    let wireY;
    Object.entries(wires).forEach((wire) => {
        const y = wire[0];
        const distance = Math.abs(offsetY - Number(y));
        // 15 is a magic number
        if (distance < 15) {
            wireY = y;
        }
    });
    return wireY || null;
};

const getDropzonePosition = (element: SVGElement): string => {
    const position = element.getAttribute('data-dropzone-position');
    if (position == null) throw new Error('Position not found');
    return position;
};

const insertBefore = (parent: Operation[], index: number, newGate: Operation): void => {
    parent.splice(index, 0, newGate);
};

const insertAfter = (parent: Operation[], index: number, newGate: Operation): void => {
    parent.splice(index + 1, 0, newGate);
};

const deleteAt = (parent: Operation[], index: number): void => {
    parent.splice(index, 1);
};

const cursorMove = (container: HTMLElement, value: boolean): void => {
    value ? container.classList.add('moving') : container.classList.remove('moving');
};

const cursorCopy = (container: HTMLElement, value: boolean): void => {
    value ? container.classList.add('copying') : container.classList.remove('copying');
};

const exportedForTesting = {
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
};

export { addEditable, exportedForTesting };

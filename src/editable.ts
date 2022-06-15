// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Operation } from './circuit';
import { leftPadding } from './constants';
import { box } from './formatters/formatUtils';
import { Sqore } from './sqore';

interface Context {
    container: HTMLElement;
    svg: SVGElement;
    operations: Operation[];
    wireData: number[];
    paddingY: number;
    renderFn: () => void;
}

/**
 * Add editable elements and events.
 *
 * @param container         HTML element for rendering visualization into.
 * @param sqore             Sqore object
 * @param onCircuitChange   User-provided callback function triggered when circuit is changed
 *
 */

const addEditable = (container: HTMLElement, sqore: Sqore, onCircuitChange?: () => void): void => {
    const context: Context = {
        container: container,
        svg: container.querySelector('svg') as SVGElement,
        operations: sqore.circuit.operations,
        wireData: _wireData(container),
        renderFn: getRenderFn(container, sqore, onCircuitChange),
        paddingY: 20,
    };
    // addDropzones(container);
    // addDocumentEvents(container);
    _addDropzones(context);
    // addDropzoneEvents(context);
    // addMouseEvents(context);
};

// Commands

const _createDropzoneLayer = () => {
    const dropzoneLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    dropzoneLayer.classList.add('dropzone-layer');
    return dropzoneLayer;
};

const _getHostElems = (container: HTMLElement) => {
    return container.querySelectorAll<SVGGraphicsElement>('[class^="gate-"]:not(.gate-control), .control-dot, .oplus');
};

const _addDropzones = (context: Context): void => {
    const getCenter = (elem: SVGGraphicsElement) => {
        const { x, y, width, height } = elem.getBBox();
        return { cX: x + width / 2, cY: y + height / 2 };
    };

    const { container, svg, wireData, paddingY } = context;
    const elems = _getHostElems(container);
    const dropzoneLayer = _createDropzoneLayer();
    svg.append(dropzoneLayer);

    const wirePrefixes = wireData.map((wireY) => ({ wireY, prefixX: 50 }));
    console.log(wirePrefixes);

    const colors = [
        '#F5B7B1',
        '#28B463',
        '#F8C471',
        '#D4E6F1',
        '#E74C3C',
        '#73C6B6',
        '#FCF3CF',
        '#5D6D7E',
        '#BA4A00',
        '#A2D9CE',
        '#8E44AD',
        '#D7BDE2',
    ];

    // Sort all elements by cX
    const sortedElems = Array.from(elems).sort((first, second) => {
        const { cX: cX1 } = getCenter(first);
        const { cX: cX2 } = getCenter(second);
        return cX1 - cX2;
    });

    sortedElems.map((elem) => {
        const { cX, cY } = getCenter(elem);

        const wirePrefix = wirePrefixes.find((item) => item.wireY === cY);

        // Check to prevent group gates creating dropzones between wires
        if (wirePrefix) {
            const prefixX = wirePrefix.prefixX;
            const elemDropzone = box(prefixX, cY - paddingY, cX - prefixX, paddingY * 2, 'dropzone');

            const color = colors[Math.floor(Math.random() * colors.length)];
            elemDropzone.setAttribute('fill', color);

            if (wirePrefix) wirePrefix.prefixX = cX;

            dropzoneLayer.appendChild(elemDropzone);
        }
    });

    wirePrefixes.map(({ wireY, prefixX }) => {
        const maxWidth = Number(svg.getAttribute('width'));
        const elemDropzone = box(prefixX, wireY - paddingY, maxWidth - prefixX, paddingY * 2, 'dropzone');
        const color = colors[Math.floor(Math.random() * colors.length)];
        elemDropzone.setAttribute('fill', color);
        dropzoneLayer.appendChild(elemDropzone);
    });

    // // Playground
    // // H element
    // let dzX = 50;
    // const hElem = elems[0];
    // let { cX, cY } = getCenter(hElem);
    // const hDz = box(dzX, cY - paddingY, cX - dzX, paddingY * 2, 'dropzone');
    // hDz.setAttribute('fill', 'red');
    // dropzoneLayer.appendChild(hDz);

    // // Control element
    // dzX = cX;
    // const cElem = elems[1];
    // ({ cX, cY } = getCenter(cElem));
    // const cDz = box(dzX, cY - paddingY, cX - dzX, paddingY * 2, 'dropzone');
    // cDz.setAttribute('fill', 'yellow');
    // dropzoneLayer.appendChild(cDz);

    // // X element
    // dzX = 50;
    // const xElem = elems[2];
    // ({ cX, cY } = getCenter(xElem));
    // const xDz = box(dzX, cY - paddingY, cX - dzX, paddingY * 2, 'dropzone');
    // xDz.setAttribute('fill', 'green');
    // dropzoneLayer.appendChild(xDz);

    // // Measure element
    // dzX = cX;
    // const mElem = elems[3];
    // ({ cX, cY } = getCenter(mElem));
    // const mDz = box(dzX, cY - paddingY, cX - dzX, paddingY * 2, 'dropzone');
    // mDz.setAttribute('fill', 'pink');
    // dropzoneLayer.appendChild(mDz);
};

const _wireData = (container: HTMLElement) => {
    // elems include qubit wires and lines of measure gates
    const elems = container.querySelectorAll<SVGGElement>('svg > g:nth-child(3) > g');
    // filter out <g> elements having more than 2 elements because
    // qubit wires contain only 2 elements: <line> and <text>
    // lines of measure gates contain 4 <line> elements
    const wireElems = Array.from(elems).filter((elem) => elem.childElementCount < 3);
    const wireData = wireElems.map((wireElem) => {
        const lineElem = wireElem.children[0] as SVGLineElement;
        return lineElem.y1.baseVal.value;
    });
    return wireData;
};

const addDropzones = (container: HTMLElement): void => {
    const gateElems = getGateElems(container);
    gateElems.forEach((gateElem) => {
        const { x, y, width, height } = gateElem.getBBox();
        const dataId = getDataId(gateElem);
        gateElem.append(createLeftDropzone(x, y, height, dataId));
        gateElem.append(createRightDropzone(x, y, width, height, dataId));
    });
};

// Element getters

const getGateElems = (container: HTMLElement): SVGGElement[] => {
    return Array.from(container.querySelectorAll('g.gate'));
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

const createLeftDropzone = (gateX: number, gateY: number, gateHeight: number, dataId: string): SVGElement => {
    return createDropzone(gateX - leftPadding / 2, gateY, leftPadding / 2, gateHeight, dataId, 'left');
};
const createRightDropzone = (
    gateX: number,
    gateY: number,
    gateWidth: number,
    gateHeight: number,
    dataId: string,
): SVGElement => {
    return createDropzone(gateX + gateWidth, gateY, leftPadding / 2, gateHeight, dataId, 'right');
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
const getRenderFn = (container: HTMLElement, sqore: Sqore, onCircuitChange?: () => void): (() => void) => {
    return () => {
        sqore.draw(container, 0, true, onCircuitChange);
        if (onCircuitChange) onCircuitChange();
    };
};

const getDataId = (element: Element): string => {
    return element.getAttribute('data-id') || '';
};

const splitDataId = (dataId: string): number[] => {
    return dataId === '' ? [] : dataId.split('-').map(Number);
};

const getWireElemText = (wireElem: SVGGElement): string => {
    const textElem = wireElem.querySelector<SVGTextElement>('text');
    if (textElem == null || textElem.textContent == null || textElem.textContent === '')
        throw new Error('Text not found');
    return textElem.textContent;
};

const getClosestWireY = (offsetY: number, wires: { [y: number]: string }): number | null => {
    for (const wire of Object.entries(wires)) {
        const y = wire[0];
        const distance = Math.abs(offsetY - Number(y));
        // 15 is an arbitrary number to determine the closeness of distance
        if (distance <= 15) {
            return Number(y);
        }
    }
    return null;
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
    // addEditable
    addDropzones,
    // handleDropzoneMouseUp
    getGateElems,
    createDropzone,
    createLeftDropzone,
    createRightDropzone,
    getParent,
    getGate,
    getDataId,
    getRenderFn,
    splitDataId,
    getWireElemText,
    getClosestWireY,
    getDropzonePosition,
    insertBefore,
    insertAfter,
    deleteAt,
    cursorMove,
    cursorCopy,
};

export { addEditable, exportedForTesting };

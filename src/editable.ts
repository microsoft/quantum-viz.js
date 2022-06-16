// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Operation } from './circuit';
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
    _addDataWires(container);
    _addDropzones(context);
    // addDropzoneEvents(context);
    // addMouseEvents(context);
    _addEvents(context);
};

const _addDataWires = (container: HTMLElement) => {
    const elems = _getHostElems(container);
    elems.forEach((elem) => {
        const { cY } = _getCenter(elem);
        // i.e. cY = 40, wireData returns [40, 100, 140, 180]
        // dataWire will return 0, which is the index of 40 in wireData
        const dataWire = _wireData(container).findIndex((y) => y === cY);
        elem.setAttribute('data-wire', `${dataWire}`);
    });
};

const _createDropzoneLayer = () => {
    const dropzoneLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    dropzoneLayer.classList.add('dropzone-layer');
    return dropzoneLayer;
};

const _getHostElems = (container: HTMLElement) => {
    return container.querySelectorAll<SVGGraphicsElement>(
        '[class^="gate-"]:not(.gate-control, .gate-swap), .control-dot, .oplus, .cross',
    );
};

const _wirePrefixes = (wireData: number[]) => wireData.map((wireY, index) => ({ index, wireY, prefixX: 50 }));

const _getCenter = (elem: SVGGraphicsElement) => {
    const { x, y, width, height } = elem.getBBox();
    return { cX: x + width / 2, cY: y + height / 2 };
};

const _addDropzones = (context: Context): void => {
    const { container, svg, wireData, paddingY } = context;
    const elems = _getHostElems(container);
    const dropzoneLayer = _createDropzoneLayer();
    svg.appendChild(dropzoneLayer);

    const wirePrefixes = _wirePrefixes(wireData);

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

    // Sort elements by its x property
    const sortedElems = Array.from(elems).sort((first, second) => {
        const { x: x1 } = first.getBBox();
        const { x: x2 } = second.getBBox();
        return x1 - x2;
    });

    sortedElems.map((elem) => {
        const { cX, cY } = _getCenter(elem);
        // console.log({ dataId: _getDataId(elem), elem, isExpandedGroup: _isExpandedGroup(_getGateElem(elem)) });
        const wirePrefix = wirePrefixes.find((item) => item.wireY === cY);

        // Check to prevent group gates creating dropzones between wires
        if (wirePrefix) {
            const prefixX = wirePrefix.prefixX;
            const elemDropzone = box(prefixX, cY - paddingY, cX - prefixX, paddingY * 2, 'dropzone');
            elemDropzone.setAttribute('data-gate-id', _getDataId(elem) || '');
            elemDropzone.setAttribute('data-gate-wire', `${wirePrefix.index}`);

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

const _getYs = (gateElem: SVGGElement, container: HTMLElement): number[] => {
    const wireData = _wireData(container);
    const { y, height } = gateElem.getBBox();
    const wireYs = wireData.filter((wireY) => wireY > y && wireY < y + height);
    return wireYs;
};

const _getGateElem = (elem: SVGElement) => {
    return elem.closest<SVGElement>('[data-id]');
};

const _getDataId = (elem: SVGElement) => {
    const gateElem = _getGateElem(elem);
    return gateElem?.getAttribute('data-id');
};

const _isExpandedGroup = (gateElem: SVGElement | null) => {
    return gateElem ? gateElem.hasAttribute('data-expanded') : false;
};

const _addEvents = (context: Context) => {
    const { container } = context;
    const dropzoneLayer = container.querySelector('.dropzone-layer') as SVGGElement;

    const elems = _getHostElems(container);
    elems.forEach((elem) => {
        const gateElem = _getGateElem(elem);
        gateElem?.addEventListener('mousedown', () => (dropzoneLayer.style.display = 'block'));
    });

    container.addEventListener('mouseup', () => (dropzoneLayer.style.display = 'none'));

    const dropzoneElems = dropzoneLayer.querySelectorAll('.dropzone');
    dropzoneElems.forEach((dropzoneElem) => {
        const dataGateId = dropzoneElem.getAttribute('data-gate-id');
        const dataGateWire = dropzoneElem.getAttribute('data-gate-wire');
        dropzoneElem.addEventListener('mouseup', () => console.log({ dataGateId, dataGateWire }));
    });
};

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
    // handleDropzoneMouseUp
    getGate,
    getDataId,
    getRenderFn,
    splitDataId,
    getClosestWireY,
    getDropzonePosition,
    insertBefore,
    insertAfter,
    deleteAt,
    cursorMove,
    cursorCopy,
};

export { addEditable, exportedForTesting };

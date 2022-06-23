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
    renderFn: () => void;
    paddingY: number;
    selectedId: string | null;
    selectedWire: string | null;
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
    const svg = container.querySelector('svg') as SVGElement;

    const context: Context = {
        container: container,
        svg,
        operations: sqore.circuit.operations,
        wireData: _wireData(container),
        renderFn: _renderFn(container, sqore, onCircuitChange),
        paddingY: 20,
        selectedId: null,
        selectedWire: null,
    };

    // addDropzones(container);
    // addDocumentEvents(container);
    _addDataWires(container);
    svg.appendChild(_dropzones(context));
    // addDropzoneEvents(context);
    // addMouseEvents(context);
    _addEvents(context);
};

const _addDataWires = (container: HTMLElement) => {
    const elems = _hostElems(container);
    elems.forEach((elem) => {
        const { cY } = _center(elem);
        // i.e. cY = 40, wireData returns [40, 100, 140, 180]
        // dataWire will return 0, which is the index of 40 in wireData
        const dataWire = _wireData(container).findIndex((y) => y === cY);
        if (dataWire !== -1) {
            elem.setAttribute('data-wire', `${dataWire}`);
        } else {
            const { y, height } = elem.getBBox();
            const wireData = _wireData(container);
            const groupDataWire = wireData.findIndex((wireY) => wireY > y && wireY < y + height);
            elem.setAttribute('data-wire', `${groupDataWire}`);
        }
    });
};

const _hostElems = (container: HTMLElement) => {
    return container.querySelectorAll<SVGGraphicsElement>(
        '[class^="gate-"]:not(.gate-control, .gate-swap), .control-dot, .oplus, .cross',
    );
};

const _wirePrefixes = (wireData: number[]) => wireData.map((wireY, index) => ({ index, wireY, prefixX: 50 }));

const _center = (elem: SVGGraphicsElement) => {
    const { x, y, width, height } = elem.getBBox();
    return { cX: x + width / 2, cY: y + height / 2 };
};

const _dropzones = (context: Context) => {
    const dropzoneLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    dropzoneLayer.classList.add('dropzone-layer');

    const { container, svg, wireData, operations, paddingY } = context;
    const elems = _hostElems(container);

    const wirePrefixes = _wirePrefixes(wireData);

    // Sort host elements by its x property
    const sortedElems = Array.from(elems).sort((first, second) => {
        const { x: x1 } = first.getBBox();
        const { x: x2 } = second.getBBox();
        return x1 - x2;
    });

    // Add dropzones for each host elements
    sortedElems.map((elem) => {
        const { cX, cY } = _center(elem);
        const wirePrefix = wirePrefixes.find((item) => item.wireY === cY);

        // Check to prevent group gates creating dropzones between wires
        if (wirePrefix) {
            const prefixX = wirePrefix.prefixX;
            const elemDropzone = box(prefixX, cY - paddingY, cX - prefixX, paddingY * 2, 'dropzone');
            elemDropzone.setAttribute('data-dropzone-id', _equivDataId(elem) || '');
            elemDropzone.setAttribute('data-dropzone-wire', `${wirePrefix.index}`);

            if (wirePrefix) wirePrefix.prefixX = cX;

            dropzoneLayer.appendChild(elemDropzone);
        }
    });

    // Add remaining dropzones to fit max-width of the circuit
    wirePrefixes.map(({ wireY, prefixX }) => {
        const maxWidth = Number(svg.getAttribute('width'));
        const elemDropzone = box(prefixX, wireY - paddingY, maxWidth - prefixX, paddingY * 2, 'dropzone');
        elemDropzone.setAttribute('data-dropzone-id', `${operations.length}`);
        const index = wireData.findIndex((item) => item === wireY);
        elemDropzone.setAttribute('data-dropzone-wire', `${index}`);
        dropzoneLayer.appendChild(elemDropzone);
    });

    return dropzoneLayer;
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

/*
    Find equivalent gate element of host element
*/
const _equivGateElem = (elem: SVGElement) => {
    return elem.closest<SVGElement>('[data-id]');
};

/*
    Find data-id of host element
*/
const _equivDataId = (elem: SVGElement) => {
    const gateElem = _equivGateElem(elem);
    return gateElem != null ? gateElem.getAttribute('data-id') : null;
};

const _isExpandedGroup = (gateElem: SVGElement | null) => {
    return gateElem ? gateElem.hasAttribute('data-expanded') : false;
};

const _addEvents = (context: Context) => {
    const { container, operations, renderFn } = context;

    container.addEventListener('contextmenu', (ev: MouseEvent) => {
        ev.preventDefault();
    });

    const dropzoneLayer = container.querySelector('.dropzone-layer') as SVGGElement;
    container.addEventListener('mouseup', () => (dropzoneLayer.style.display = 'none'));

    const elems = _hostElems(container);
    elems.forEach((elem) => {
        elem.addEventListener('mousedown', () => {
            context.selectedWire = elem.getAttribute('data-wire');
        });

        const gateElem = _equivGateElem(elem);
        gateElem?.addEventListener('mousedown', (ev: MouseEvent) => {
            ev.stopPropagation();
            context.selectedId = _equivDataId(elem);
            dropzoneLayer.style.display = 'block';
        });
    });

    const dropzoneElems = dropzoneLayer.querySelectorAll('.dropzone');
    dropzoneElems.forEach((dropzoneElem) => {
        dropzoneElem.addEventListener('mouseup', () => {
            const targetId = dropzoneElem.getAttribute('data-dropzone-id');
            const targetWire = dropzoneElem.getAttribute('data-dropzone-wire');
            if (
                targetId == null || //
                targetWire == null ||
                context.selectedId == null ||
                context.selectedWire == null
            )
                return;

            const newSourceOperation = ev.ctrlKey
                ? _copyX(context.selectedId, targetId, operations)
                : _moveX(context.selectedId, targetId, operations);

            if (newSourceOperation != null) {
                _moveY(context.selectedWire, targetWire, newSourceOperation);
            }

            renderFn();
        });
    });
};

const _equivOperationParent = (dataId: string | null, operations: Operation[]): Operation[] | null => {
    if (!dataId) return null;

    const indexes = _indexes(dataId);
    indexes.pop();

    let operationParent = operations;
    for (const index of indexes) {
        operationParent = operationParent[index].children || operationParent;
    }
    return operationParent;
};

const _equivOperation = (dataId: string | null, operations: Operation[]): Operation | null => {
    if (!dataId) return null;

    const index = _lastIndex(dataId);
    const operationParent = _equivOperationParent(dataId, operations);

    if (
        operationParent == null || //
        index == null
    )
        return null;

    return operationParent[index];
};

const _moveX = (sourceId: string, targetId: string, operations: Operation[]) => {
    if (sourceId === targetId) return;
    const sourceOperation = _equivOperation(sourceId, operations);
    const sourceOperationParent = _equivOperationParent(sourceId, operations);
    const targetOperationParent = _equivOperationParent(targetId, operations);
    const targetLastIndex = _lastIndex(targetId);

    if (
        targetOperationParent == null || //
        targetLastIndex == null ||
        sourceOperation == null ||
        sourceOperationParent == null
    )
        return;

    // Insert sourceOperation to target last index
    const newSourceOperation: Operation = { ...sourceOperation };
    targetOperationParent.splice(targetLastIndex, 0, newSourceOperation);

    // Delete sourceOperation
    sourceOperation.gate = 'removed';
    const indexToRemove = sourceOperationParent.findIndex((operation) => operation.gate === 'removed');
    sourceOperationParent.splice(indexToRemove, 1);

    return newSourceOperation;
};

const _copyX = (sourceId: string, targetId: string, operations: Operation[]) => {
    if (sourceId === targetId) return;
    const sourceOperation = _equivOperation(sourceId, operations);
    const targetOperationParent = _equivOperationParent(targetId, operations);
    const targetLastIndex = _lastIndex(targetId);
    const sourceOperationParent = _equivOperationParent(sourceId, operations);

    if (
        targetOperationParent == null || //
        targetLastIndex == null ||
        sourceOperation == null ||
        sourceOperationParent == null
    )
        return;

    // Insert sourceOperation to target last index
    const newSourceOperation: Operation = JSON.parse(JSON.stringify(sourceOperation));
    targetOperationParent.splice(targetLastIndex, 0, newSourceOperation);

    return newSourceOperation;
};

const _moveY = (sourceWire: string, targetWire: string, operation: Operation) => {
    const offset = parseInt(targetWire) - parseInt(sourceWire);
    _offsetRecursively(offset, operation);
};

const _offsetRecursively = (offset: number, operation: Operation) => {
    if (operation.targets != null) {
        operation.targets.forEach((target) => {
            target.qId += offset;
            if (target.cId) target.cId += offset;
        });
    }
    if (operation.controls != null) {
        operation.controls.forEach((control) => {
            control.qId += offset;
            if (control.cId) control.cId += offset;
        });
    }
    if (operation.children != null) {
        operation.children.forEach((child) => _offsetRecursively(offset, child));
    }
};

const _indexes = (dataId: string) => dataId.split('-').map((segment) => parseInt(segment));

const _lastIndex = (dataId: string) => {
    return _indexes(dataId).pop();
};

const _renderFn = (container: HTMLElement, sqore: Sqore, onCircuitChange?: () => void): (() => void) => {
    return () => {
        sqore.draw(container, 0, true, onCircuitChange);
        if (onCircuitChange) onCircuitChange();
    };
};

const exportedForTesting = {};

export { addEditable, exportedForTesting };

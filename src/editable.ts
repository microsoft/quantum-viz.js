// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Circuit, Operation } from './circuit';
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

const addEditable = (container: HTMLElement, sqore: Sqore, onCircuitChange?: (circuit: Circuit) => void): void => {
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
    svg.appendChild(_dropzoneLayer(context));
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

/**
 *  Create a list of wires that element is spanning on.
 *  i.e. Gate 'Foo' spans on wire 0 (y=40), 1 (y=100), and 2 (y=140).
 *       Function returns [40, 100, 140]
 */
const _elemWireYs = (elem: SVGGraphicsElement, wireData: number[]) => {
    const { y, height } = elem.getBBox();
    return wireData.filter((wireY) => wireY > y && wireY < y + height);
};

const _hostElems = (container: HTMLElement) => {
    return container.querySelectorAll<SVGGraphicsElement>(
        '[class^="gate-"]:not(.gate-control, .gate-swap), .control-dot, .oplus, .cross',
    );
};

const _wirePrefixes = (wireData: number[]) => wireData.map((wireY, index) => ({ index, wireY, prefixX: 40 }));

/**
 *  Find center point of element
 */
const _center = (elem: SVGGraphicsElement): { cX: number; cY: number } => {
    const { x, y, width, height } = elem.getBBox();
    return { cX: x + width / 2, cY: y + height / 2 };
};

/**
 *  Create dropzone layer with all dropzones popullated
 */
const _dropzoneLayer = (context: Context) => {
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

            wirePrefix.prefixX = cX;

            dropzoneLayer.appendChild(elemDropzone);
        } else {
            // Let group gates creating dropzones for each wire
            const { x } = elem.getBBox();
            const elemWireYs = _elemWireYs(elem, wireData);

            elemWireYs.map((wireY) => {
                const wirePrefix = wirePrefixes.find((item) => item.wireY === wireY);
                if (wirePrefix) {
                    const prefixX = wirePrefix.prefixX;
                    const elemDropzone = box(prefixX, wireY - paddingY, x - prefixX, paddingY * 2, 'dropzone');
                    elemDropzone.setAttribute('data-dropzone-id', _equivDataId(elem) || '');
                    elemDropzone.setAttribute('data-dropzone-wire', `${wirePrefix.index}`);

                    wirePrefix.prefixX = x;

                    dropzoneLayer.appendChild(elemDropzone);
                }
            });
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

const _wireData = (container: HTMLElement): number[] => {
    // elems include qubit wires and lines of measure gates
    const elems = container.querySelectorAll<SVGGElement>('svg > g:nth-child(3) > g');
    // filter out <g> elements having more than 2 elements because
    // qubit wires contain only 2 elements: <line> and <text>
    // lines of measure gates contain 4 <line> elements
    const wireElems = Array.from(elems).filter((elem) => elem.childElementCount < 3);
    const wireData = wireElems.map((wireElem) => {
        const lineElem = wireElem.children[0] as SVGLineElement;
        return Number(lineElem.getAttribute('y1'));
    });
    return wireData;
};

/**
 *  Find equivalent gate element of host element
 */
const _equivGateElem = (elem: SVGElement) => {
    return elem.closest<SVGElement>('[data-id]');
};

/**
 *  Find data-id of host element
 */
const _equivDataId = (elem: SVGElement) => {
    const gateElem = _equivGateElem(elem);
    return gateElem != null ? gateElem.getAttribute('data-id') : null;
};

/**
 *  Disable contextmenu default behaviors
 */
const _addContextMenuEvents = (container: HTMLElement) => {
    container.addEventListener('contextmenu', (ev: MouseEvent) => {
        ev.preventDefault();
    });
};

/**
 *  Add events specifically for dropzoneLayer
 */
const _addDropzoneLayerEvents = (container: HTMLElement, dropzoneLayer: SVGGElement) => {
    container.addEventListener('mouseup', () => (dropzoneLayer.style.display = 'none'));
};

const _addEvents = (context: Context) => {
    const { container, operations, renderFn } = context;
    const dropzoneLayer = container.querySelector('.dropzone-layer') as SVGGElement;

    _addContextMenuEvents(container);
    _addDropzoneLayerEvents(container, dropzoneLayer);

    // Host element events
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

    // Dropzone element events
    const dropzoneElems = dropzoneLayer.querySelectorAll<SVGRectElement>('.dropzone');
    dropzoneElems.forEach((dropzoneElem) => {
        dropzoneElem.addEventListener('mouseup', (ev: MouseEvent) => {
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
                _moveY(context.selectedWire, targetWire, newSourceOperation, context.wireData);
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

const _moveX = (sourceId: string, targetId: string, operations: Operation[]): Operation | null => {
    if (sourceId === targetId) return _equivOperation(sourceId, operations);
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
        return null;

    // Insert sourceOperation to target last index
    const newSourceOperation: Operation = { ...sourceOperation };
    targetOperationParent.splice(targetLastIndex, 0, newSourceOperation);

    // Delete sourceOperation
    sourceOperation.gate = 'removed';
    const indexToRemove = sourceOperationParent.findIndex((operation) => operation.gate === 'removed');
    sourceOperationParent.splice(indexToRemove, 1);

    return newSourceOperation;
};

const _copyX = (sourceId: string, targetId: string, operations: Operation[]): Operation | null => {
    if (sourceId === targetId) return _equivOperation(sourceId, operations);
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
        return null;

    // Insert sourceOperation to target last index
    const newSourceOperation: Operation = JSON.parse(JSON.stringify(sourceOperation));
    targetOperationParent.splice(targetLastIndex, 0, newSourceOperation);

    return newSourceOperation;
};

const _moveY = (sourceWire: string, targetWire: string, operation: Operation, wireData: number[]) => {
    const offset = parseInt(targetWire) - parseInt(sourceWire);
    _offsetRecursively(offset, operation, wireData);
};

const _offsetRecursively = (offset: number, operation: Operation, wireData: number[]) => {
    const wireDataSize = wireData.length;

    // Offset all targets by offsetY value
    if (operation.targets != null) {
        operation.targets.forEach((target) => {
            target.qId = _circularMod(target.qId, offset, wireDataSize);
            if (target.cId) target.cId = _circularMod(target.cId, offset, wireDataSize);
        });
    }

    // Offset all controls by offsetY value
    if (operation.controls != null) {
        operation.controls.forEach((control) => {
            control.qId = _circularMod(control.qId, offset, wireDataSize);
            if (control.cId) control.cId = _circularMod(control.qId, offset, wireDataSize);
        });
    }

    // Offset recursively through all children
    if (operation.children != null) {
        operation.children.forEach((child) => _offsetRecursively(offset, child, wireData));
    }
};

/**
 *  This modulo function always returns positive value based on total.
 *  i.e: value=0, offset=-1, total=4 returns 3 instead of -1
 */
const _circularMod = (value: number, offset: number, total: number): number => {
    return (((value + offset) % total) + total) % total;
};

const _indexes = (dataId: string): number[] =>
    dataId !== '' //
        ? dataId.split('-').map((segment) => parseInt(segment))
        : [];

const _lastIndex = (dataId: string): number | undefined => {
    return _indexes(dataId).pop();
};

const _renderFn = (
    container: HTMLElement,
    sqore: Sqore,
    onCircuitChange?: (circuit: Circuit) => void,
): (() => void) => {
    return () => {
        sqore.draw(container, 0, true, onCircuitChange);
        if (onCircuitChange) onCircuitChange(sqore.circuit);
    };
};

const exportedForTesting = {
    _center,
    _wireData,
    _equivOperation,
    _equivOperationParent,
    _moveX,
    _copyX,
    _circularMod,
    _indexes,
    _lastIndex,
};

export { addEditable, exportedForTesting };

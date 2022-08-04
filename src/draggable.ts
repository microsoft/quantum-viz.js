// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import { Operation } from './circuit';
import { box } from './formatters/formatUtils';
import { Register } from './register';
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
 * @param Container     HTML element for rendering visualization into.
 * @param sqore         Sqore object
 * @param useRefresh    Function to trigger circuit re-rendering
 */
const extensionDraggable = (container: HTMLElement, sqore: Sqore, useRefresh: () => void): void => {
    const svg = container.querySelector('svg[id]') as SVGElement;

    const context: Context = {
        container: container,
        svg,
        operations: sqore.circuit.operations,
        wireData: _wireData(container),
        renderFn: useRefresh,
        paddingY: 20,
        selectedId: null,
        selectedWire: null,
    };
    _addStyles(container, _wireData(container));
    _addDataWires(container);
    svg.appendChild(_dropzoneLayer(context));
    _addEvents(context);
};

/**
 * Add data-wire to all host elements
 */
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
 * Create a list of wires that element is spanning on
 * i.e. Gate 'Foo' spans on wire 0 (y=40), 1 (y=100), and 2 (y=140)
 *      Function returns [40, 100, 140]
 */
const _wireYs = (elem: SVGGraphicsElement, wireData: number[]): number[] => {
    const { y, height } = elem.getBBox();
    return wireData.filter((wireY) => wireY > y && wireY < y + height);
};

/**
 * Get list of host elements that dropzones can be attached to
 */
const _hostElems = (container: HTMLElement): SVGGraphicsElement[] => {
    const svgElem = container.querySelector('svg[id]');
    return svgElem != null
        ? Array.from(
              svgElem.querySelectorAll<SVGGraphicsElement>(
                  '[class^="gate-"]:not(.gate-control, .gate-swap), .control-dot, .oplus, .cross',
              ),
          )
        : [];
};

/**
 * Add custom styles specific to this module
 */
const _addStyles = (container: HTMLElement, wireData: number[]): void => {
    const elems = _hostElems(container);
    elems.forEach((elem) => {
        if (_wireYs(elem, wireData).length < 2) elem.style.cursor = 'grab';
    });
};

/**
 * Generate an array of wire prefixes from wire data
 */
const _wirePrefixes = (wireData: number[]): { index: number; wireY: number; prefixX: number }[] =>
    wireData.map((wireY, index) => ({ index, wireY, prefixX: 40 }));

/**
 * Find center point of element
 */
const _center = (elem: SVGGraphicsElement): { cX: number; cY: number } => {
    const { x, y, width, height } = elem.getBBox();
    return { cX: x + width / 2, cY: y + height / 2 };
};

/**
 * Create dropzone layer with all dropzones popullated
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
            const { prefixX } = wirePrefix;
            const elemDropzone = box(prefixX, cY - paddingY, cX - prefixX, paddingY * 2, 'dropzone');
            elemDropzone.setAttribute('data-dropzone-id', _equivDataId(elem) || '');
            elemDropzone.setAttribute('data-dropzone-wire', `${wirePrefix.index}`);

            wirePrefix.prefixX = cX;

            dropzoneLayer.appendChild(elemDropzone);
        } else {
            // Let group gates creating dropzones for each wire
            const { x } = elem.getBBox();
            const wireYs = _wireYs(elem, wireData);

            wireYs.map((wireY) => {
                const wirePrefix = wirePrefixes.find((item) => item.wireY === wireY);
                if (wirePrefix) {
                    const { prefixX } = wirePrefix;
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

/**
 * Generate an array of y values based on circuit wires
 */
const _wireData = (container: HTMLElement): number[] => {
    // elems include qubit wires and lines of measure gates
    const elems = container.querySelectorAll<SVGGElement>('svg[id] > g:nth-child(3) > g');
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
 * Find equivalent gate element of host element
 */
const _equivGateElem = (elem: SVGElement): SVGElement | null => {
    return elem.closest<SVGElement>('[data-id]');
};

/**
 * Find data-id of host element
 */
const _equivDataId = (elem: SVGElement) => {
    const gateElem = _equivGateElem(elem);
    return gateElem != null ? gateElem.getAttribute('data-id') : null;
};

/**
 * Add events specifically for dropzoneLayer
 */
const _addDropzoneLayerEvents = (container: HTMLElement, dropzoneLayer: SVGGElement) => {
    container.addEventListener('mouseup', () => (dropzoneLayer.style.display = 'none'));
};

/**
 * Add events for document
 */
const _addDocumentEvents = (context: Context) => {
    const { container } = context;

    document.addEventListener('keydown', (ev: KeyboardEvent) => {
        if (ev.ctrlKey && context.selectedId) {
            container.classList.remove('moving');
            container.classList.add('copying');
        }
    });

    document.addEventListener('keyup', () => {
        if (context.selectedId) {
            container.classList.remove('copying');
            container.classList.add('moving');
        }
    });

    document.addEventListener('mouseup', () => {
        container.classList.remove('moving', 'copying');
    });
};

/**
 * Disable contextmenu default behaviors
 */
const _addContextMenuEvent = (container: HTMLElement) => {
    container.addEventListener('contextmenu', (ev: MouseEvent) => {
        ev.preventDefault();
    });
};

/**
 * Add all events
 */
const _addEvents = (context: Context) => {
    const { container, operations, renderFn } = context;
    const dropzoneLayer = container.querySelector('.dropzone-layer') as SVGGElement;

    _addContextMenuEvent(container);
    _addDropzoneLayerEvents(container, dropzoneLayer);
    _addDocumentEvents(context);

    // Host element events
    const elems = _hostElems(container);
    elems.forEach((elem) => {
        elem.addEventListener('mousedown', () => {
            context.selectedWire = elem.getAttribute('data-wire');
        });

        const gateElem = _equivGateElem(elem);
        gateElem?.addEventListener('mousedown', (ev: MouseEvent) => {
            ev.stopPropagation();
            if (gateElem.getAttribute('data-expanded') !== 'true') {
                context.selectedId = _equivDataId(elem);
                container.classList.add('moving');
                dropzoneLayer.style.display = 'block';
            }
        });
    });

    // Dropzone element events
    const dropzoneElems = dropzoneLayer.querySelectorAll<SVGRectElement>('.dropzone');
    dropzoneElems.forEach((dropzoneElem) => {
        dropzoneElem.addEventListener('mouseup', (ev: MouseEvent) => {
            const originalOperations = cloneDeep(operations);
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
                _moveY(context.selectedWire, targetWire, newSourceOperation, context.wireData.length);
                const parentOperation = _equivParentOperation(context.selectedId, operations);
                if (parentOperation != null) {
                    parentOperation.targets = _targets(parentOperation);
                }
            }
            if (isEqual(originalOperations, operations) === false) renderFn();
        });
    });
};

const _equivParentOperation = (dataId: string | null, operations: Operation[]): Operation | null => {
    if (!dataId) return null;

    const indexes = _indexes(dataId);
    indexes.pop();
    const lastIndex = indexes.pop();

    if (lastIndex == null) return null;

    let parentOperation = operations;
    for (const index of indexes) {
        parentOperation = parentOperation[index].children || parentOperation;
    }
    return parentOperation[lastIndex];
};

/**
 * Find equivalent parent array of an operation
 */
const _equivParentArray = (dataId: string | null, operations: Operation[]): Operation[] | null => {
    if (!dataId) return null;

    const indexes = _indexes(dataId);
    indexes.pop();

    let parentArray = operations;
    for (const index of indexes) {
        parentArray = parentArray[index].children || parentArray;
    }
    return parentArray;
};

/**
 * Find an equivalent operation of an element based on its data-id
 */
const _equivOperation = (dataId: string | null, operations: Operation[]): Operation | null => {
    if (!dataId) return null;

    const index = _lastIndex(dataId);
    const operationParent = _equivParentArray(dataId, operations);

    if (
        operationParent == null || //
        index == null
    )
        return null;

    return operationParent[index];
};

/**
 * Move an operation horizontally
 */
const _moveX = (sourceId: string, targetId: string, operations: Operation[]): Operation | null => {
    if (sourceId === targetId) return _equivOperation(sourceId, operations);
    const sourceOperation = _equivOperation(sourceId, operations);
    const sourceOperationParent = _equivParentArray(sourceId, operations);
    const targetOperationParent = _equivParentArray(targetId, operations);
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

    // Delete sourceOperation
    sourceOperation.gate = 'removed';
    const indexToRemove = sourceOperationParent.findIndex((operation) => operation.gate === 'removed');
    sourceOperationParent.splice(indexToRemove, 1);

    return newSourceOperation;
};

/**
 * Copy an operation horizontally
 */
const _copyX = (sourceId: string, targetId: string, operations: Operation[]): Operation | null => {
    const sourceOperation = _equivOperation(sourceId, operations);
    const sourceOperationParent = _equivParentArray(sourceId, operations);
    const targetOperationParent = _equivParentArray(targetId, operations);
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

/**
 * Move an operation vertically by changing its controls and targets
 */
const _moveY = (sourceWire: string, targetWire: string, operation: Operation, totalWires: number): Operation => {
    if (operation.gate !== 'measure') {
        const offset = parseInt(targetWire) - parseInt(sourceWire);
        _offsetRecursively(operation, offset, totalWires);
    }
    return operation;
};

/**
 * Recursively change object controls and targets
 */
const _offsetRecursively = (operation: Operation, wireOffset: number, totalWires: number): Operation => {
    // Offset all targets by offsetY value
    if (operation.targets != null) {
        operation.targets.forEach((target) => {
            target.qId = _circularMod(target.qId, wireOffset, totalWires);
            if (target.cId) target.cId = _circularMod(target.cId, wireOffset, totalWires);
        });
    }

    // Offset all controls by offsetY value
    if (operation.controls != null) {
        operation.controls.forEach((control) => {
            control.qId = _circularMod(control.qId, wireOffset, totalWires);
            if (control.cId) control.cId = _circularMod(control.qId, wireOffset, totalWires);
        });
    }

    // Offset recursively through all children
    if (operation.children != null) {
        operation.children.forEach((child) => _offsetRecursively(child, wireOffset, totalWires));
    }

    return operation;
};

/**
 * Find targets of an operation by recursively walkthrough all of its children controls and targets
 * i.e. Gate Foo contains gate H and gate RX.
 *      qIds of Gate H is 1
 *      qIds of Gate RX is 1, 2
 *      This should return [{qId: 1}, {qId: 2}]
 */
const _targets = (operation: Operation): Register[] | [] => {
    const _recurse = (operation: Operation) => {
        registers.push(...operation.targets);
        if (operation.controls) {
            registers.push(...operation.controls);
            // If there is more children, keep adding more to registers
            if (operation.children) {
                for (const child of operation.children) {
                    _recurse(child);
                }
            }
        }
    };

    const registers: Register[] = [];
    if (operation.children == null) return [];

    // Recursively walkthrough all children to populate registers
    for (const child of operation.children) {
        _recurse(child);
    }

    // Extract qIds from array of object
    // i.e. [{qId: 0}, {qId: 1}, {qId: 1}] -> [0, 1, 1]
    const qIds = registers.map((register) => register.qId);
    const uniqueQIds = Array.from(new Set(qIds));

    // Transform array of numbers into array of qId object
    // i.e. [0, 1] -> [{qId: 0}, {qId: 1}]
    return uniqueQIds.map((qId) => ({
        qId,
    }));
};

/**
 * This modulo function always returns positive value based on total
 * i.e: value=0, offset=-1, total=4 returns 3 instead of -1
 */
const _circularMod = (value: number, offset: number, total: number): number => {
    return (((value + offset) % total) + total) % total;
};

/**
 * Split data-id into an array of indexes
 */
const _indexes = (dataId: string): number[] =>
    dataId !== '' //
        ? dataId.split('-').map((segment) => parseInt(segment))
        : [];

/**
 * Get the last index of data-id
 * i.e: data-id = "0-1-2", _lastIndex will return 2
 */
const _lastIndex = (dataId: string): number | undefined => {
    return _indexes(dataId).pop();
};

/**
 * Object exported for unit testing
 */
const exportedForTesting = {
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
};

export {
    extensionDraggable,
    Context,
    _equivOperation,
    _equivGateElem,
    _equivParentArray,
    _lastIndex,
    exportedForTesting,
};

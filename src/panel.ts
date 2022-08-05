// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import cloneDeep from 'lodash/cloneDeep';
import range from 'lodash/range';
import { Operation } from './circuit';
import { gateHeight, horizontalGap, minGateWidth, panelWidth, verticalGap } from './constants';
import { _equivOperation, _equivParentArray, _lastIndex, _offsetRecursively } from './draggable';
import { _formatGate } from './formatters/gateFormatter';
import { GateType, Metadata } from './metadata';
import { Register } from './register';
import { Sqore } from './sqore';
import { getGateWidth } from './utils';

/**
 * Interface for context
 */
interface Context {
    addMode: boolean;
    operations: Operation[];
    operation: Operation | undefined;
    registerSize: number;
    container: HTMLElement | undefined;
}

/**
 * Object to maintain global state of extensionPanel
 */
const context: Context = {
    addMode: true,
    operations: [],
    operation: undefined,
    registerSize: 0,
    container: undefined,
};

/**
 * Interface for options provided through usePanel()
 */
interface PanelOptions {
    displaySize?: number;
    gateDictionary?: GateDictionary;
}

/**
 * Interface for dispatch
 */
interface Dispatch {
    (action: Action): void;
}

/**
 * Entry point to run extensionPanel
 * @param options   User-provided object to customize extensionPanel
 * @returns         Curried function of entry point to run extensionPanel
 */
const extensionPanel =
    (options?: PanelOptions) =>
    /**
     * Curried function of entry point to run extensionPanel
     * @param container     HTML element for rendering visualization into
     * @param sqore         Sqore object
     * @param useRefresh    Function to trigger circuit re-rendering
     */
    (container: HTMLElement, sqore: Sqore, useRefresh: () => void): void => {
        const dispatch = (action: Action) => {
            update(action, context, useRefresh);

            const panelElem = panel(dispatch, context, options);
            const prevPanelElem = container.querySelector('.panel');

            prevPanelElem && container.replaceChild(panelElem, prevPanelElem);
        };

        addEvents(dispatch, container, sqore);

        const panelElem = panel(dispatch, context, options);
        const prevPanelElem = container.querySelector('.panel');

        prevPanelElem == null && container.prepend(panelElem);
    };

/**
 * Function to handle all event listeners
 * @param dispatch      Function to update state and trigger panel re-rendering
 * @param container     HTML element for rendering visualization into
 * @param sqore         Sqore object
 */
const addEvents = (dispatch: Dispatch, container: HTMLElement, sqore: Sqore): void => {
    // Gates in SVG circuit are selectable
    const elems = container.querySelectorAll<SVGElement>('[data-id]');
    elems.forEach((elem) =>
        elem.addEventListener('mousedown', (ev: MouseEvent) => {
            ev.stopImmediatePropagation();
            const dataId = elem.getAttribute('data-id');
            const operation = _equivOperation(dataId, sqore.circuit.operations);
            dispatch({ type: 'OPERATION', payload: operation });
            dispatch({ type: 'EDIT_MODE' });
        }),
    );

    // Context is updated when mouse is over container
    container.addEventListener('mouseover', () => {
        context.registerSize = sqore.circuit.qubits.length;
        context.operations = sqore.circuit.operations;
        context.container = container;
    });

    // addMode triggers
    const svgElem = container.querySelector('svg[id]');
    svgElem?.addEventListener('mousedown', () => {
        dispatch({ type: 'ADD_MODE' });
    });

    // Drag and drop
    const dropzoneLayer = container.querySelector('.dropzone-layer') as SVGGElement;
    const dropzoneElems = dropzoneLayer.querySelectorAll<SVGRectElement>('.dropzone');
    dropzoneElems.forEach((dropzoneElem) =>
        dropzoneElem.addEventListener('mouseup', () => {
            if (
                context.operation && //
                context.addMode
            ) {
                const targetId = dropzoneElem.getAttribute('data-dropzone-id');
                const targetWire = dropzoneElem.getAttribute('data-dropzone-wire');
                dispatch({ type: 'ADD_OPERATION', payload: targetId });
                dispatch({ type: 'TARGET', payload: [{ qId: parseInt(targetWire || '') }] });
            }
        }),
    );

    // Remove ghost element if drops gate in svgElement
    svgElem?.addEventListener('mouseup', () => {
        dispatch({ type: 'REMOVE_GHOST_ELEMENT' });
    });

    // Remove ghost element if drops gate in addPanel
    container.querySelector('.add-panel')?.addEventListener('mouseup', () => {
        dispatch({ type: 'REMOVE_GHOST_ELEMENT' });
    });
};

/**
 * Interface for action
 */
interface Action {
    type: string;
    payload?: unknown;
}

/**
 * Primary function for state management
 * @param action        Object to have type and payload
 * @param context       Context object to manage extension state
 * @param useRefresh    Function to trigger circuit re-rendering
 */
const update = (action: Action, context: Context, useRefresh: () => void): void => {
    switch (action.type) {
        case 'ADD_MODE': {
            context.addMode = true;
            break;
        }
        case 'EDIT_MODE': {
            context.addMode = false;
            break;
        }
        case 'OPERATION': {
            context.operation = action.payload as Operation;
            break;
        }
        case 'TARGET': {
            const { operation } = context;
            const payload = action.payload as Register[];
            if (operation) {
                const difference = payload[0].qId - operation.targets[0].qId;
                _offsetRecursively(operation, difference, context.registerSize);
            }
            useRefresh();
            break;
        }
        case 'CONTROLS': {
            const { operation } = context;
            if (operation) {
                const payload = action.payload as Register[];
                operation.controls = payload;
                operation.isControlled = payload.length > 0 ? true : false;
            }
            useRefresh();
            break;
        }
        case 'DISPLAY_ARGS': {
            const { operation } = context;
            operation && (operation.displayArgs = action.payload as string);
            useRefresh();
            break;
        }
        case 'ADD_OPERATION': {
            const targetId = action.payload as string;
            const targetOperationParent = _equivParentArray(targetId, context.operations);
            const targetLastIndex = _lastIndex(targetId);
            if (
                targetOperationParent != null && //
                targetLastIndex != null &&
                context.operation != null
            ) {
                targetOperationParent.splice(targetLastIndex, 0, context.operation);
            }
            break;
        }
        case 'DISPLAY_DROPZONE_LAYER': {
            const { container } = context;
            if (container) {
                const dropzoneLayer = container.querySelector('.dropzone-layer') as SVGGElement;
                dropzoneLayer.style.display = 'block';
            }
            break;
        }
        case 'DISPLAY_CURSOR_MOVING': {
            const { container } = context;
            container && container.classList.add('moving');
            break;
        }
        case 'DISPLAY_GHOST_ELEMENT': {
            const handleMouseMove = (ev: MouseEvent) => {
                divElem.style.left = `${ev.clientX - minGateWidth / 2}px`;
                divElem.style.top = `${ev.clientY - gateHeight / 2}px`;
            };

            const { container } = context;
            const { ghostElem, initX, initY } = action.payload as {
                ghostElem: SVGGraphicsElement;
                initX: number;
                initY: number;
            };

            // Generate svg element to wrap around ghost element
            const svgElem = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svgElem.append(ghostElem);

            // Generate div element to wrap around svg element
            const divElem = elem('div', 'ghost');
            divElem.style.left = `${initX - minGateWidth / 2}px`;
            divElem.style.top = `${initY - gateHeight / 2}px`;
            divElem.appendChild(svgElem);

            if (container) {
                container.appendChild(divElem);
                container.addEventListener('mousemove', handleMouseMove);
            }

            break;
        }
        case 'REMOVE_GHOST_ELEMENT': {
            const { container } = context;
            if (container) {
                const ghostElem = container.querySelector('.ghost');
                ghostElem && container.removeChild(ghostElem);
            }
        }
    }
};

/**
 * Function to produce panel element
 * @param dispatch      Function to update state and trigger panel re-rendering
 * @param context       Context object to manage extension state
 * @param options       User-provided object to customize extensionPanel
 * @returns             HTML element for panel
 */
const panel = (dispatch: Dispatch, context: Context, options?: PanelOptions): HTMLElement => {
    const panelElem = elem('div');
    panelElem.className = 'panel';
    children(panelElem, [
        context.addMode //
            ? addPanel(dispatch, context, options)
            : editPanel(dispatch, context),
    ]);
    return panelElem;
};

/**
 * Function to produce addPanel element
 * @param dispatch      Function to update state and trigger panel re-rendering
 * @param context       Context object to manage extension state
 * @param options       User-provided object to customize extensionPanel
 * @returns             HTML element for addPanel
 */
const addPanel = (dispatch: Dispatch, context: Context, options?: PanelOptions): HTMLElement => {
    let gateDictionary = defaultGateDictionary;
    let objectKeys = Object.keys(gateDictionary);
    if (options != null) {
        const { displaySize, gateDictionary: customGateDictionary } = options;
        displaySize && (objectKeys = objectKeys.slice(0, displaySize));
        if (customGateDictionary) {
            gateDictionary = { ...defaultGateDictionary, ...customGateDictionary };
            objectKeys = Object.keys(gateDictionary);
        }
    }

    let prefixX = 0;
    let prefixY = 0;
    const gateElems = objectKeys.map((key) => {
        const { width: gateWidth } = toMetadata(gateDictionary[key], 0, 0);
        if (prefixX + gateWidth + horizontalGap > panelWidth) {
            prefixX = 0;
            prefixY += gateHeight + verticalGap;
        }
        const gateElem = gate(dispatch, gateDictionary, key.toString(), prefixX, prefixY);
        prefixX += gateWidth + horizontalGap;
        return gateElem;
    });

    // Generate svg container to store gate elements
    const svgElem = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgElem.classList.add('add-panel-svg');
    childrenSvg(svgElem, gateElems);

    // Generate add panel
    const addPanelElem = elem('div', 'add-panel');
    children(addPanelElem, [title('ADD')]);
    addPanelElem.appendChild(svgElem);

    return addPanelElem;
};

/**
 * Function to produce editPanel element
 * @param dispatch      Function to update state and trigger panel re-rendering
 * @param context       Context object to manage extension state
 * @returns             HTML element for editPanel
 */
const editPanel = (dispatch: Dispatch, context: Context): HTMLElement => {
    const { operation, registerSize } = context;
    const options = range(registerSize).map((i) => ({ value: `${i}`, text: `q${i}` }));
    const target = operation?.targets[0].qId;
    const controls = operation?.controls?.map((control) => control.qId);

    const shouldDisplayTarget = operation?.gate.toLowerCase() !== 'measure';
    const shouldDisplayControls = operation?.gate.toLowerCase() !== 'measure';
    const shouldDisplayParameters = operation?.gate !== 'X' && operation?.gate.toLowerCase() !== 'measure';

    const editPanelElem = elem('div', 'edit-panel');
    children(editPanelElem, [title('EDIT')]);
    shouldDisplayTarget &&
        editPanelElem.appendChild(select('Target', 'target-input', options, target || 0, dispatch, operation));
    shouldDisplayControls &&
        editPanelElem.appendChild(
            checkboxes('Controls', 'controls-input', options, controls || [], dispatch, operation),
        );
    shouldDisplayParameters && editPanelElem.appendChild(text('Parameters', 'parameters-input', dispatch, operation));

    return editPanelElem;
};

/**
 * Factory function to produce HTML element
 * @param tag       Tag name
 * @param className Class name
 * @returns         HTML element
 */
const elem = (tag: string, className?: string): HTMLElement => {
    const _elem = document.createElement(tag);
    className && (_elem.className = className);
    return _elem;
};

/**
 * Append all child elements to a parent HTML element
 * @param parentElem    Parent HTML element
 * @param childElems    Array of HTML child elements
 * @returns             Parent HTML element with all children appended
 */
const children = (parentElem: HTMLElement, childElems: HTMLElement[]): HTMLElement => {
    childElems.map((elem) => parentElem.appendChild(elem));
    return parentElem;
};

/**
 * Append all child elements to a parent SVG element
 * @param parentElem    Parent SVG element
 * @param childElems    Array of SVG child elements
 * @returns             Parent SVG element with all children appended
 */
const childrenSvg = (parentElem: SVGElement, childElems: SVGElement[]): SVGElement => {
    childElems.map((elem) => parentElem.appendChild(elem));
    return parentElem;
};

/**
 * Function to produce title element
 * @param text  Text
 * @returns     Title element
 */
const title = (text: string): HTMLElement => {
    const titleElem = elem('h2');
    titleElem.className = 'title';
    titleElem.textContent = text;
    return titleElem;
};

/**
 * Interface for option element
 */
interface Option {
    value: string;
    text: string;
}

/**
 * Function to produce select element
 * @param label         Label
 * @param className     Class name
 * @param options       Array of Option objects contain value and text
 * @param selectedIndex Index of current selected option
 * @param dispatch      Function to update state and trigger panel re-rendering
 * @param operation     Optional Operation object
 * @returns             Select element
 */
const select = (
    label: string,
    className: string,
    options: Option[],
    selectedIndex: number,
    dispatch: Dispatch,
    operation?: Operation,
): HTMLElement => {
    const optionElems = options.map(({ value, text }) => option(value, text));
    const selectElem = elem('select') as HTMLSelectElement;
    children(selectElem, optionElems);
    operation == undefined && selectElem.setAttribute('disabled', 'true');
    selectElem.selectedIndex = selectedIndex;

    const labelElem = elem('label') as HTMLLabelElement;
    labelElem.className = 'block';
    labelElem.textContent = label;

    const divElem = elem('div') as HTMLDivElement;
    divElem.className = className;
    children(divElem, [labelElem, selectElem]);

    selectElem.onchange = () => {
        dispatch({ type: 'TARGET', payload: [{ qId: parseInt(selectElem.value) }] });
    };

    return divElem;
};

/**
 * Function to produce option element
 * @param value Value
 * @param text  Text
 * @returns     Option element
 */
const option = (value: string, text: string): HTMLOptionElement => {
    const optionElem = elem('option') as HTMLOptionElement;
    optionElem.value = value;
    optionElem.textContent = text;
    return optionElem;
};

/**
 * Function to produce checkbox elements
 * @param label             Label
 * @param className         Class name
 * @param options           Array of Option objects contain value and text
 * @param selectedIndexes   Array of indexes of current selected options
 * @param dispatch          Function to update state and trigger panel re-rendering
 * @param operation         Optional Operation object
 * @returns                 Parent div containing checkbox elements
 */
const checkboxes = (
    label: string,
    className: string,
    options: Option[],
    selectedIndexes: number[],
    dispatch: Dispatch,
    operation?: Operation,
): HTMLDivElement => {
    const checkboxElems = options.map((option, index) => {
        const elem = checkbox(option.value, option.text);
        const inputElem = elem.querySelector('input') as HTMLInputElement;
        selectedIndexes.includes(index) && inputElem.setAttribute('checked', 'true');
        // Disable control checkboxes if already in targets
        if (operation) {
            const targetIndexes = operation.targets.map((register) => register.qId);
            targetIndexes.includes(index) && inputElem.setAttribute('disabled', 'true');
        }

        inputElem.onchange = () => {
            // Get all checked options
            const checkedElems = Array.from(divElem.querySelectorAll<HTMLInputElement>('input:checked'));
            // Generate new controls from checked options
            const newControls = checkedElems.map((elem) => ({
                qId: parseInt(elem.value),
            }));
            // Dispatch new controls
            dispatch({ type: 'CONTROLS', payload: newControls });
        };

        return elem;
    });

    const labelElem = elem('label');
    labelElem.className = 'block';
    labelElem.textContent = label;

    const divElem = elem('div') as HTMLDivElement;
    divElem.className = className;
    children(divElem, [labelElem, ...checkboxElems]);

    return divElem;
};

/**
 * Function to produce checkbox element
 * @param value Value
 * @param text  Text
 * @returns     Checkbox element
 */
const checkbox = (value: string, text: string): HTMLLabelElement => {
    const inputElem = elem('input') as HTMLInputElement;
    inputElem.type = 'checkbox';
    inputElem.value = value;

    const labelElem = elem('label') as HTMLLabelElement;
    labelElem.textContent = text;
    labelElem.prepend(inputElem);
    return labelElem;
};

/**
 * Function to produce input text element
 * @param label     Label
 * @param className Class name
 * @param dispatch  Function to update state and trigger panel re-rendering
 * @param operation Optional Operation object
 * @returns         Parent div containing input text element
 */
const text = (label: string, className: string, dispatch: Dispatch, operation?: Operation): HTMLElement => {
    const labelElem = elem('label') as HTMLLabelElement;
    labelElem.className = 'block';
    labelElem.textContent = label;

    const textElem = elem('input') as HTMLInputElement;
    operation == undefined && textElem.setAttribute('disabled', 'true');
    textElem.type = 'text';
    textElem.value = operation?.displayArgs || '';
    textElem.setAttribute('autofocus', 'true');

    textElem.onchange = () => {
        dispatch({ type: 'DISPLAY_ARGS', payload: textElem.value });
    };

    const divElem = elem('div');
    divElem.className = className;
    children(divElem, [labelElem, textElem]);

    return divElem;
};

/**
 * Wrapper to generate metadata based on _opToMetadata with mock registers and limited support
 * @param operation     Operation object
 * @param x             x coordinate at starting point from the left
 * @param y             y coordinate at starting point from the top
 * @returns             Metata object
 */
const toMetadata = (operation: Operation | undefined, x: number, y: number): Metadata => {
    const metadata: Metadata = {
        type: GateType.Invalid,
        x: x + 1 + minGateWidth / 2, // offset by 1 for left padding
        controlsY: [],
        targetsY: [y + 1 + gateHeight / 2], // offset by 1 for top padding
        label: '',
        width: -1,
    };

    if (operation == null) return metadata;

    const {
        gate,
        displayArgs,
        isMeasurement,
        // isConditional,
        isControlled,
        // isAdjoint,
        // conditionalRender,
    } = operation;

    if (isMeasurement) {
        metadata.type = GateType.Measure;
    } else if (gate === 'SWAP') {
        metadata.type = GateType.Swap;
    } else if (isControlled) {
        metadata.type = gate === 'X' ? GateType.Cnot : GateType.ControlledUnitary;
        metadata.label = gate;
    } else if (gate === 'X') {
        metadata.type = GateType.X;
        metadata.label = gate;
    } else {
        metadata.type = GateType.Unitary;
        metadata.label = gate;
        metadata.targetsY = [[y + 1 + gateHeight / 2]];
        // GateType.Unitary wants matrix array. Also, offset by 1 for top padding
    }

    if (displayArgs != null) metadata.displayArgs = displayArgs;

    metadata.width = getGateWidth(metadata);
    metadata.x = x + 1 + metadata.width / 2; // offset by 1 for left padding

    return metadata;
};

/**
 * Generate gate element for Add Panel based on type of gate
 * @param dispatch  Function to update state and trigger panel re-rendering
 * @param type      Type of gate. Example: 'H' or 'X'
 */
const gate = (dispatch: Dispatch, gateDictionary: GateDictionary, type: string, x: number, y: number): SVGElement => {
    const operation = gateDictionary[type];
    if (operation == null) throw new Error(`Gate ${type} not available`);
    const metadata = toMetadata(operation, x, y);
    const gateElem = _formatGate(metadata).cloneNode(true) as SVGElement;
    gateElem.addEventListener('mousedown', (ev: MouseEvent) => {
        // Generate equivalent ghost element with x and y at 0
        const ghostMetadata = toMetadata(operation, 0, 0);
        const ghostElem = _formatGate(ghostMetadata).cloneNode(true);
        // Get initial x and y position from 'mousedown' event
        const { clientX: initX, clientY: initY } = ev;

        // Dispatch relevant events
        dispatch({ type: 'OPERATION', payload: cloneDeep(operation) });
        dispatch({ type: 'DISPLAY_DROPZONE_LAYER' });
        dispatch({ type: 'DISPLAY_CURSOR_MOVING', payload: true });
        dispatch({ type: 'DISPLAY_GHOST_ELEMENT', payload: { ghostElem, initX, initY } });
    });

    return gateElem;
};

/**
 * Interface for gate dictionary
 */
interface GateDictionary {
    [index: string]: Operation;
}

/**
 * Object for default gate dictionary
 */
const defaultGateDictionary: GateDictionary = {
    RX: {
        gate: 'RX',
        targets: [{ qId: 0 }],
    },
    RY: {
        gate: 'RY',
        targets: [{ qId: 0 }],
    },
    RZ: {
        gate: 'RZ',
        targets: [{ qId: 0 }],
    },
    H: {
        gate: 'H',
        targets: [{ qId: 0 }],
    },
    X: {
        gate: 'X',
        targets: [{ qId: 0 }],
    },
    S: {
        gate: 'S',
        targets: [{ qId: 0 }],
    },
    T: {
        gate: 'T',
        targets: [{ qId: 0 }],
    },
    Y: {
        gate: 'Y',
        targets: [{ qId: 0 }],
    },
    Z: {
        gate: 'Z',
        targets: [{ qId: 0 }],
    },
    ZZ: {
        gate: 'ZZ',
        targets: [{ qId: 0 }],
    },
};

/**
 * Object exported for unit testing
 */
const exportedForTesting = {
    panel,
    addPanel,
    editPanel,
    elem,
    children,
    childrenSvg,
    title,
    select,
    option,
    checkboxes,
    checkbox,
    text,
    toMetadata,
    gate,
    defaultGateDictionary,
};

export { extensionPanel, PanelOptions, exportedForTesting, Dispatch, Action, Context as PanelContext };

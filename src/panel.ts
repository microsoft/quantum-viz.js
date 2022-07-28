import cloneDeep from 'lodash/cloneDeep';
import range from 'lodash/range';
import { Operation } from './circuit';
import { gateGap, gateHeight, minGateWidth, panelWidth } from './constants';
import { _equivOperation, _equivParentArray, _lastIndex } from './draggable';
import { _formatGate } from './formatters/gateFormatter';
import { GateType, Metadata } from './metadata';
import { Register } from './register';
import { Sqore } from './sqore';
import { getGateWidth } from './utils';

interface Context {
    addMode: boolean;
    operations: Operation[];
    operation: Operation | undefined;
    registerSize: number;
    container: HTMLElement | undefined;
}

const context: Context = {
    addMode: true,
    operations: [],
    operation: undefined,
    registerSize: 0,
    container: undefined,
};

interface PanelOptions {
    displaySize?: number;
    gateDictionary?: GateDictionary;
}

const extensionPanel =
    (options?: PanelOptions) =>
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

const addEvents = (dispatch: Dispatch, container: HTMLElement, sqore: Sqore) => {
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

    container.addEventListener('mouseover', () => {
        context.registerSize = sqore.circuit.qubits.length;
        context.operations = sqore.circuit.operations;
        context.container = container;
    });

    const svgElem = container.querySelector('svg[id]');
    svgElem?.addEventListener('mousedown', () => {
        dispatch({ type: 'ADD_MODE' });
    });

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

    svgElem?.addEventListener('mouseup', () => {
        dispatch({ type: 'REMOVE_GHOST_ELEMENT' });
    });
    container.querySelector('.add-panel')?.addEventListener('mouseup', () => {
        dispatch({ type: 'REMOVE_GHOST_ELEMENT' });
    });
};

interface Action {
    type: string;
    payload?: unknown;
}

const update = (action: Action, context: Context, useRefresh: () => void) => {
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
            operation && (operation.targets = payload);
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
            useRefresh();
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

const panel = (dispatch: Dispatch, context: Context, options?: PanelOptions) => {
    const panelElem = elem('div');
    panelElem.className = 'panel';
    children(panelElem, [
        context.addMode //
            ? addPanel(dispatch, context, options)
            : editPanel(dispatch, context),
    ]);
    return panelElem;
};

const addPanel = (dispatch: Dispatch, context: Context, options?: PanelOptions) => {
    let gateDictionary = defaultGateDictionary;
    let objectKeys = Object.keys(gateDictionary);
    if (options != null) {
        const { displaySize, gateDictionary: optionGateDictionary } = options;
        displaySize && (objectKeys = objectKeys.slice(0, displaySize));
        optionGateDictionary && (gateDictionary = optionGateDictionary);
    }

    let prefixX = 0;
    let prefixY = 0;
    const gateElems = objectKeys.map((key) => {
        const gateElem = gate(dispatch, gateDictionary, key.toString(), prefixX, prefixY);
        if (prefixX + gateGap > panelWidth) {
            prefixX = 0;
            prefixY += gateGap;
        } else {
            prefixX += gateGap;
        }
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

const editPanel = (dispatch: Dispatch, context: Context) => {
    const { operation, registerSize } = context;
    const options = range(registerSize).map((i) => ({ value: `${i}`, text: `q${i}` }));
    const target = operation?.targets[0].qId;
    const controls = operation?.controls?.map((control) => control.qId);

    const editPanelElem = elem('div', 'edit-panel');
    children(editPanelElem, [
        title('EDIT'),
        select('Target', 'target-input', options, target || 0, dispatch, operation),
        checkboxes('Controls', 'controls-input', options, controls || [], dispatch, operation),
        text('Display', 'display-input', dispatch, operation),
    ]);
    return editPanelElem;
};

const elem = (tag: string, className?: string): HTMLElement => {
    const _elem = document.createElement(tag);
    _elem.className = className || '';
    return _elem;
};

/**
 * Append all child elements to a parent element
 */
const children = (parentElem: HTMLElement, childElems: HTMLElement[]) => {
    childElems.map((elem) => parentElem.appendChild(elem));
    return parentElem;
};

const childrenSvg = (parentElem: SVGElement, childElems: SVGElement[]) => {
    childElems.map((elem) => parentElem.appendChild(elem));
    return parentElem;
};

const title = (text: string) => {
    const titleElem = elem('h2');
    titleElem.className = 'title';
    titleElem.innerText = text;
    return titleElem;
};

interface Option {
    value: string;
    text: string;
}

interface Dispatch {
    (action: Action): void;
}

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

const option = (value: string, text: string) => {
    const optionElem = elem('option') as HTMLOptionElement;
    optionElem.value = value;
    optionElem.textContent = text;
    return optionElem;
};

const checkboxes = (
    label: string,
    className: string,
    options: Option[],
    selectedIndexes: number[],
    dispatch: Dispatch,
    operation?: Operation,
) => {
    const checkboxElems = options.map((option, index) => {
        const elem = checkbox(option.value, option.text);
        const inputElem = elem.querySelector('input') as HTMLInputElement;
        selectedIndexes.includes(index) && inputElem.setAttribute('checked', 'true');
        operation == undefined && inputElem.setAttribute('disabled', 'true');

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

const checkbox = (value: string, text: string) => {
    const inputElem = elem('input') as HTMLInputElement;
    inputElem.type = 'checkbox';
    inputElem.value = value;

    const labelElem = elem('label') as HTMLLabelElement;
    labelElem.textContent = text;
    labelElem.prepend(inputElem);
    return labelElem;
};

const text = (label: string, className: string, dispatch: Dispatch, operation?: Operation) => {
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

    return metadata;
};

/**
 * Generate gate element for Add Panel based on type of gate
 * @param dispatch
 * @param type i.e. 'H' or 'X'
 */
const gate = (dispatch: Dispatch, gateDictionary: GateDictionary, type: string, x: number, y: number) => {
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

interface GateDictionary {
    [index: string]: Operation;
}

const defaultGateDictionary: GateDictionary = {
    RX: {
        gate: 'RX',
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
    ZZ: {
        gate: 'ZZ',
        targets: [{ qId: 0 }],
    },
};

export { extensionPanel, PanelOptions };

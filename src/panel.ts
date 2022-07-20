import range from 'lodash/range';
import { Operation } from './circuit';
import { _equivOperation } from './draggable';
import { Register } from './register';
import { Sqore } from './sqore';

interface Context {
    operations: Operation[];
    operation: Operation | undefined;
    registerSize: number;
}

let context: Context = {
    operations: [],
    operation: undefined,
    registerSize: 0,
};

const extensionPanel = (container: HTMLElement, sqore: Sqore, useRefresh: () => void): void => {
    const elems = container.querySelectorAll<SVGElement>('[data-id]');
    elems.forEach((elem) =>
        elem.addEventListener('mousedown', () => {
            const dataId = elem.getAttribute('data-id');
            const operation = _equivOperation(dataId, sqore.circuit.operations);
            context.operation = operation || undefined;
            const newPanelElem = panel(dispatch, context);
            container.replaceChild(newPanelElem, panelElem);
            panelElem = newPanelElem;
        }),
    );
    container.addEventListener('mouseover', () => {
        context.registerSize = sqore.circuit.qubits.length;
        context.operations = sqore.circuit.operations;
    });

    const dispatch = update(context, useRefresh);
    let panelElem = panel(dispatch, context);
    const prevPanelElem = container.querySelector('.panel');
    prevPanelElem //
        ? container.replaceChild(panelElem, prevPanelElem)
        : container.prepend(panelElem);
};

interface Action {
    type: string;
    payload: unknown;
}

const update = (context: Context, useRefresh: () => void) => (action: Action) => {
    switch (action.type) {
        case 'OPERATION': {
            context.operation = action.payload as Operation;
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
            operation && (operation.controls = action.payload as Register[]);
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
            context.operations.push(action.payload as Operation);
            useRefresh();
            break;
        }
    }
};

const panel = (dispatch: Dispatch, context: Context) => {
    const panelElem = elem('div');
    panelElem.className = 'panel';
    children(panelElem, addPanel(dispatch, context));
    // _children(panelElem, editPanel(dispatch, context));
    return panelElem;
};

const addPanel = (dispatch: Dispatch, context: Context) => {
    const buttonElem = elem('button') as HTMLButtonElement;
    buttonElem.textContent = 'H';
    buttonElem.addEventListener('mouseup', () => {
        const operation = {
            gate: 'H',
            targets: [{ qId: 0 }],
        };
        dispatch({ type: 'ADD_OPERATION', payload: operation });
    });
    return [title('ADD'), buttonElem];
};

const editPanel = (dispatch: Dispatch, context: Context) => {
    const { operation, registerSize } = context;
    const options = range(registerSize).map((i) => ({ value: `${i}`, text: `q${i}` }));
    const target = operation?.targets[0].qId;
    const controls = operation?.controls?.map((control) => control.qId);
    return [
        title('EDIT'),
        _select('Target', 'target-input', options, target || 0, dispatch, operation),
        _checkboxes('Controls', 'controls-input', options, controls || [], dispatch, operation),
        _text('Display', 'display-input', dispatch, operation),
    ];
};

const elem = (tag: string): HTMLElement => document.createElement(tag);

/**
 * Append all child elements to a parent element
 */
const children = (parentElem: HTMLElement, childElems: HTMLElement[]) => {
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

const _select = (
    label: string,
    className: string,
    options: Option[],
    selectedIndex: number,
    dispatch: Dispatch,
    operation?: Operation,
): HTMLElement => {
    const optionElems = options.map(({ value, text }) => _option(value, text));
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

const _option = (value: string, text: string) => {
    const optionElem = elem('option') as HTMLOptionElement;
    optionElem.value = value;
    optionElem.textContent = text;
    return optionElem;
};

const _checkboxes = (
    label: string,
    className: string,
    options: Option[],
    selectedIndexes: number[],
    dispatch: Dispatch,
    operation?: Operation,
) => {
    const checkboxElems = options.map((option, index) => {
        const elem = _checkbox(option.value, option.text);
        const inputElem = elem.querySelector('input') as HTMLInputElement;
        selectedIndexes.includes(index) && inputElem.setAttribute('checked', 'true');
        operation == undefined && inputElem.setAttribute('disabled', 'true');

        inputElem.onchange = () => {
            const checkedElems = Array.from(divElem.querySelectorAll<HTMLInputElement>('input:checked'));
            const newControls = checkedElems.map((elem) => ({
                qId: parseInt(elem.value),
            }));
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

const _checkbox = (value: string, text: string) => {
    const inputElem = elem('input') as HTMLInputElement;
    inputElem.type = 'checkbox';
    inputElem.value = value;

    const labelElem = elem('label') as HTMLLabelElement;
    labelElem.textContent = text;
    labelElem.prepend(inputElem);
    return labelElem;
};

const _text = (label: string, className: string, dispatch: Dispatch, operation?: Operation) => {
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

export { extensionPanel };

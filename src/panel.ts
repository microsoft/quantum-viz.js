import range from 'lodash/range';
import { Operation } from './circuit';
import { _equivOperation } from './draggable';
import { Register } from './register';
import { Sqore } from './sqore';

interface Context {
    operation: Operation | undefined;
    registerSize: number;
}

const context: Context = {
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
            context.registerSize = sqore.circuit.qubits.length;
            const newPanelElem = _panel(dispatch, context);
            container.replaceChild(newPanelElem, panelElem);
            panelElem = newPanelElem;
        }),
    );

    const dispatch = update(context, useRefresh);

    let panelElem = _panel(dispatch, context);
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
        case 'TARGET': {
            const { operation } = context;
            const payload = action.payload as Register[];
            operation && (operation.targets = payload);
            break;
        }
        case 'CONTROLS': {
            const { operation } = context;
            operation && (operation.controls = action.payload as Register[]);
            break;
        }
        case 'DISPLAY_ARGS': {
            const { operation } = context;
            operation && (operation.displayArgs = action.payload as string);
            break;
        }
    }
    useRefresh();
};

const _panel = (dispatch: Dispatch, context: Context) => {
    const panelElem = _elem('div');
    panelElem.className = 'panel';
    _children(panelElem, editPanel(dispatch, context));

    return panelElem;
};

// const addPanel = () => {};

const editPanel = (dispatch: Dispatch, context: Context) => {
    const { operation, registerSize } = context;
    const options = range(registerSize).map((i) => ({ value: `${i}`, text: `q${i}` }));
    const target = operation?.targets[0].qId;
    const controls = operation?.controls?.map((control) => control.qId);
    return [
        _title('EDIT'),
        _select('Target', 'target-input', options, target || 0, dispatch, operation),
        _checkboxes('Controls', 'controls-input', options, controls || [], dispatch, operation),
        _text('Display', 'display-input', dispatch, operation),
    ];
};

const _elem = (tag: string): HTMLElement => document.createElement(tag);

/**
 * Append all child elements to a parent element
 */
const _children = (parentElem: HTMLElement, childElems: HTMLElement[]) => {
    childElems.map((elem) => parentElem.appendChild(elem));
    return parentElem;
};

const _title = (text: string) => {
    const elem = _elem('h1');
    elem.className = 'title';
    elem.innerText = text;
    return elem;
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
    const selectElem = _elem('select') as HTMLSelectElement;
    _children(selectElem, optionElems);
    operation == undefined && selectElem.setAttribute('disabled', 'true');
    selectElem.selectedIndex = selectedIndex;

    const labelElem = _elem('label') as HTMLLabelElement;
    labelElem.className = 'block';
    labelElem.textContent = label;

    const divElem = _elem('div') as HTMLDivElement;
    divElem.className = className;
    _children(divElem, [labelElem, selectElem]);

    selectElem.onchange = () => {
        dispatch({ type: 'TARGET', payload: [{ qId: parseInt(selectElem.value) }] });
    };

    return divElem;
};

const _option = (value: string, text: string) => {
    const elem = _elem('option') as HTMLOptionElement;
    elem.value = value;
    elem.textContent = text;
    return elem;
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

    const labelElem = _elem('label');
    labelElem.className = 'block';
    labelElem.textContent = label;

    const divElem = _elem('div') as HTMLDivElement;
    divElem.className = className;
    _children(divElem, [labelElem, ...checkboxElems]);

    return divElem;
};

const _checkbox = (value: string, text: string) => {
    const inputElem = _elem('input') as HTMLInputElement;
    inputElem.type = 'checkbox';
    inputElem.value = value;

    const labelElem = _elem('label') as HTMLLabelElement;
    labelElem.textContent = text;
    labelElem.prepend(inputElem);
    return labelElem;
};

const _text = (label: string, className: string, dispatch: Dispatch, operation?: Operation) => {
    const labelElem = _elem('label') as HTMLLabelElement;
    labelElem.className = 'block';
    labelElem.textContent = label;

    const textElem = _elem('input') as HTMLInputElement;
    operation == undefined && textElem.setAttribute('disabled', 'true');
    textElem.type = 'text';
    textElem.value = operation?.displayArgs || '';
    textElem.setAttribute('autofocus', 'true');

    textElem.onchange = () => {
        dispatch({ type: 'DISPLAY_ARGS', payload: textElem.value });
    };

    const divElem = _elem('div');
    divElem.className = className;
    _children(divElem, [labelElem, textElem]);

    return divElem;
};

export { extensionPanel };

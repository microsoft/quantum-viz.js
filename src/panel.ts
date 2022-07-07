import { Operation } from './circuit';
import { _equivOperation } from './editable';

const addPanel = (container: HTMLElement, operations: Operation[]): void => {
    container.prepend(_panel());
    container.querySelectorAll<SVGElement>('[data-id]').forEach((elem) =>
        elem.addEventListener('mousedown', () => {
            const dataId = elem.getAttribute('data-id');
            console.log({ dataId, operation: _equivOperation(dataId, operations) });
        }),
    );
};

const _panel = () => {
    const options: Option[] = [
        {
            value: '0',
            text: 'q0',
        },
        {
            value: '1',
            text: 'q1',
        },
        {
            value: '2',
            text: 'q2',
        },
        {
            value: '3',
            text: 'q3',
        },
    ];

    const panelElem = _elem('div');
    _children(panelElem, [
        _select('Target', 'target-input', options, 0),
        _checkboxes('Controls', 'controls-input', options, [2, 3]),
        _text('Display', 'display-input', 'display-arg'),
    ]);

    return panelElem;
};

const _elem = (tag: string): HTMLElement => document.createElement(tag);

/**
 * Append all child elements to a parent element
 */
const _children = (parentElem: HTMLElement, childElems: HTMLElement[]) => {
    childElems.map((elem) => parentElem.appendChild(elem));
    return parentElem;
};

interface Option {
    value: string;
    text: string;
}

const _select = (label: string, className: string, options: Option[], selectedIndex: number) => {
    const optionElems = options.map(({ value, text }) => _option(value, text));
    const selectElem = _elem('select') as HTMLSelectElement;
    _children(selectElem, optionElems);
    selectElem.selectedIndex = selectedIndex;

    const labelElem = _elem('label') as HTMLLabelElement;
    labelElem.textContent = label;

    const divElem = _elem('div') as HTMLDivElement;
    divElem.className = className;
    _children(divElem, [labelElem, selectElem]);

    return divElem;
};

const _option = (value: string, text: string) => {
    const elem = _elem('option') as HTMLOptionElement;
    elem.value = value;
    elem.textContent = text;
    return elem;
};

const _checkboxes = (label: string, className: string, options: Option[], selectedIndexes: number[]) => {
    const checkboxElems = options.map((option, index) => {
        const elem = _checkbox(option.value, option.text);
        if (selectedIndexes.includes(index)) {
            elem.querySelector('input')?.setAttribute('checked', 'true');
        }
        return elem;
    });

    const labelElem = _elem('label');
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

const _text = (label: string, className: string, value: string) => {
    const labelElem = _elem('label') as HTMLLabelElement;
    labelElem.textContent = label;

    const textElem = _elem('input') as HTMLInputElement;
    textElem.type = 'text';
    textElem.value = value;

    const divElem = _elem('div');
    divElem.className = className;
    _children(divElem, [labelElem, textElem]);

    return divElem;
};

export { addPanel };

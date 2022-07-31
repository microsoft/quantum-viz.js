import range from 'lodash/range';
import { PanelContext, PanelOptions } from '../src/panel';
import { Action, Dispatch, exportedForTesting } from '../src/panel';

const {
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
} = exportedForTesting;

describe('Test elem', () => {
    test('Should return <div>', () => {
        expect(elem('div')).toMatchSnapshot();
    });
    test('Should return <p>', () => {
        expect(elem('p')).toMatchSnapshot();
    });
    test('Should return <div> with className "panel"', () => {
        expect(elem('div', 'panel')).toMatchSnapshot();
    });
});

describe('Test children', () => {
    let parentElem: HTMLDivElement;
    beforeEach(() => {
        parentElem = document.createElement('div');
    });
    test('Add 1 child to parent', () => {
        const childElems = [document.createElement('p')] as HTMLElement[];
        expect(children(parentElem, childElems)).toMatchSnapshot();
    });
    test('Add 2 children to parent', () => {
        const childElems = [document.createElement('p'), document.createElement('div')] as HTMLElement[];
        expect(children(parentElem, childElems)).toMatchSnapshot();
    });
    test('Add 0 with class to parent', () => {
        const childElems = [] as HTMLElement[];
        expect(children(parentElem, childElems)).toMatchSnapshot();
    });
});

describe('Test childrenSvg', () => {
    let parentElem: SVGElement;
    beforeEach(() => {
        parentElem = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    });
    test('Add 0 child to parent', () => {
        const childElems = [] as SVGElement[];
        expect(childrenSvg(parentElem, childElems)).toMatchSnapshot();
    });
    test('Add 1 child to parent', () => {
        const childElems = [document.createElementNS('http://www.w3.org/2000/svg', 'rect')] as SVGElement[];
        expect(childrenSvg(parentElem, childElems)).toMatchSnapshot();
    });
    test('Add 2 children to parent', () => {
        const childElems = [
            document.createElementNS('http://www.w3.org/2000/svg', 'rect'), //
            document.createElementNS('http://www.w3.org/2000/svg', 'circle'), //
        ] as SVGElement[];
        expect(childrenSvg(parentElem, childElems)).toMatchSnapshot();
    });
});

describe('Test title', () => {
    test('Should return title "PANEL"', () => {
        expect(title('PANEL')).toMatchSnapshot();
    });
    test('Should return title "ADD"', () => {
        expect(title('ADD')).toMatchSnapshot();
    });
    test('Should return title "EDIT"', () => {
        expect(title('EDIT')).toMatchSnapshot();
    });
});

describe('Test text', () => {
    const emptyDispatch: Dispatch = (action: Action) => {
        action;
    };
    test('Should return gate H without display-args', () => {
        const operation = {
            gate: 'H',
            targets: [{ qId: 0 }],
        };
        expect(text('Display', 'display-input', emptyDispatch, operation)).toMatchSnapshot();
    });
    test('Should return gate RX with display-args', () => {
        const operation = {
            gate: 'RX',
            displayArgs: '(0.25)',
            isControlled: true,
            controls: [{ qId: 1 }],
            targets: [{ qId: 0 }],
        };
        expect(text('Display', 'display-input', emptyDispatch, operation)).toMatchSnapshot();
    });
});

describe('Test toMetadata', () => {
    test('Should return metadata of gate H', () => {
        const operation = {
            gate: 'H',
            targets: [{ qId: 0 }],
        };
        expect(toMetadata(operation, 0, 0)).toMatchSnapshot();
    });
    test('Should return metadata of gate RX', () => {
        const operation = {
            gate: 'H',
            targets: [{ qId: 0 }],
        };
        expect(toMetadata(operation, 0, 0)).toMatchSnapshot();
    });
    test('Should return metadata of gate X', () => {
        const operation = {
            gate: 'X',
            targets: [{ qId: 3 }],
        };
        expect(toMetadata(operation, 0, 0)).toMatchSnapshot();
    });
});

describe('Test select', () => {
    const emptyDispatch: Dispatch = (action: Action) => {
        action;
    };
    test('Test with gate X', () => {
        const operation = {
            gate: 'X',
            targets: [{ qId: 0 }],
            controls: [{ qId: 1 }],
        };
        const registerSize = 2;
        const options = range(registerSize).map((i) => ({ value: `${i}`, text: `q${i}` }));
        const target = operation?.targets[0].qId;
        select('Target', 'target-input', options, target || 0, emptyDispatch, operation);
    });
    test('Test with gate H', () => {
        const operation = {
            gate: 'H',
            targets: [{ qId: 0 }],
        };
        const registerSize = 2;
        const options = range(registerSize).map((i) => ({ value: `${i}`, text: `q${i}` }));
        const target = operation?.targets[0].qId;
        select('Target', 'target-input', options, target || 0, emptyDispatch, operation);
    });
});

describe('Test option', () => {
    test('Should return option q0', () => {
        expect(option('0', 'q0')).toMatchSnapshot();
    });
    test('Should return option q1', () => {
        expect(option('1', 'q1')).toMatchSnapshot();
    });
    test('Should return option q2', () => {
        expect(option('2', 'q2')).toMatchSnapshot();
    });
});

describe('Test checkboxes', () => {
    const emptyDispatch: Dispatch = (action: Action) => {
        action;
    };
    test('Test with gate X with 1 control', () => {
        const operation = {
            gate: 'X',
            targets: [{ qId: 0 }],
            controls: [{ qId: 1 }],
        };
        const registerSize = 2;
        const options = range(registerSize).map((i) => ({ value: `${i}`, text: `q${i}` }));
        const controls = operation.controls?.map((control) => control.qId);
        expect(
            checkboxes('Controls', 'controls-input', options, controls || [], emptyDispatch, operation),
        ).toMatchSnapshot();
    });
    test('Test with gate X with 2 controls', () => {
        const operation = {
            gate: 'X',
            targets: [{ qId: 1 }],
            controls: [{ qId: 0 }, { qId: 2 }],
        };
        const registerSize = 3;
        const options = range(registerSize).map((i) => ({ value: `${i}`, text: `q${i}` }));
        const controls = operation.controls?.map((control) => control.qId);
        expect(
            checkboxes('Controls', 'controls-input', options, controls || [], emptyDispatch, operation),
        ).toMatchSnapshot();
    });
});

describe('Test checkbox', () => {
    test('Should return checkbox q0', () => {
        expect(checkbox('0', 'q0')).toMatchSnapshot();
    });
    test('Should return checkbox q1', () => {
        expect(checkbox('1', 'q1')).toMatchSnapshot();
    });
    test('Should return checkbox q2', () => {
        expect(checkbox('2', 'q2')).toMatchSnapshot();
    });
});

describe('Test gate', () => {
    const emptyDispatch: Dispatch = (action: Action) => {
        action;
    };
    test('Should return gate H', () => {
        expect(gate(emptyDispatch, defaultGateDictionary, 'H', 0, 0)).toMatchSnapshot();
    });
    test('Should return gate X', () => {
        expect(gate(emptyDispatch, defaultGateDictionary, 'X', 0, 0)).toMatchSnapshot();
    });
    test('Should return gate RX', () => {
        expect(gate(emptyDispatch, defaultGateDictionary, 'RX', 0, 0)).toMatchSnapshot();
    });
});

describe('Test defaulGateDictionary', () => {
    test('Verify defaultGateDictionary', () => {
        const expected = {
            Entangle: {
                gate: 'Entangle',
                targets: [{ qId: 0 }],
            },
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
        expect(defaultGateDictionary).toMatchObject(expected);
    });
});

describe('Test editPanel', () => {
    const emptyDispatch: Dispatch = (action: Action) => {
        action;
    };
    test('Should return editPanel editing X gate', () => {
        const context: PanelContext = {
            addMode: false,
            operations: [],
            operation: {
                gate: 'X',
                targets: [{ qId: 0 }],
            },
            registerSize: 2,
            container: undefined,
        };
        expect(editPanel(emptyDispatch, context)).toMatchSnapshot();
    });
});

describe('Test addPanel', () => {
    const emptyDispatch: Dispatch = (action: Action) => {
        action;
    };
    test('Should return default addPanel', () => {
        const context: PanelContext = {
            addMode: true,
            operations: [],
            operation: {
                gate: 'X',
                targets: [{ qId: 0 }],
            },
            registerSize: 2,
            container: undefined,
        };
        expect(addPanel(emptyDispatch, context)).toMatchSnapshot();
    });
    test('Should return default addPanel with displaySize 2', () => {
        const context: PanelContext = {
            addMode: true,
            operations: [],
            operation: {
                gate: 'X',
                targets: [{ qId: 0 }],
            },
            registerSize: 2,
            container: undefined,
        };
        const options: PanelOptions = { displaySize: 2 };
        expect(addPanel(emptyDispatch, context, options)).toMatchSnapshot();
    });
});

describe('Test panel', () => {
    const emptyDispatch: Dispatch = (action: Action) => {
        action;
    };
    test('Should return panel with addPanel visible', () => {
        const context: PanelContext = {
            addMode: true,
            operations: [],
            operation: {
                gate: 'X',
                targets: [{ qId: 0 }],
            },
            registerSize: 2,
            container: undefined,
        };
        expect(panel(emptyDispatch, context)).toMatchSnapshot();
    });
    test('Should return panel with editPanel visible', () => {
        const context: PanelContext = {
            addMode: false,
            operations: [],
            operation: {
                gate: 'X',
                targets: [{ qId: 0 }],
            },
            registerSize: 2,
            container: undefined,
        };
        expect(panel(emptyDispatch, context)).toMatchSnapshot();
    });
});

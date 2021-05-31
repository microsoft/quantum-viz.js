import { formatInputs } from './formatters/inputFormatter';
import { formatGates } from './formatters/gateFormatter';
import { formatRegisters } from './formatters/registerFormatter';
import { processOperations } from './process';
import { ConditionalRender, Circuit, Operation } from './circuit';
import { Metadata, GateType } from './metadata';
import { StyleConfig, style, STYLES } from './styles';
import { createUUID } from './utils';

/**
 * Contains metadata for visualization.
 */
interface ComposedSqore {
    /** Width of visualization. */
    width: number;
    /** Height of visualization. */
    height: number;
    /** SVG elements the make up the visualization. */
    elements: string[];
}

/**
 * Defines the mapping of unique ID to each operation. Used for enabling
 * interactivity.
 */
type GateRegistry = {
    [id: string]: Operation;
};

/**
 * Implements click handlers for classically-controlled operations.
 */
// TODO: Once `generateSvg` returns a HTMLElement, attach this directly.
const addClassicalControlHandlers = (container: Element | null): Element | null => {
    container?.querySelectorAll('.classically-controlled-btn').forEach((btn) => {
        // Zoom in on clicked gate
        btn.addEventListener('click', (evt: Event) => {
            const textSvg = btn.querySelector('text');
            const group = btn.parentElement;
            if (textSvg == null || group == null) return;

            const currValue = textSvg.firstChild?.nodeValue;
            const zeroGates = group?.querySelector('.gates-zero');
            const oneGates = group?.querySelector('.gates-one');
            switch (currValue) {
                case '?':
                    textSvg.childNodes[0].nodeValue = '1';
                    group.classList.remove('classically-controlled-unknown');
                    group.classList.remove('classically-controlled-zero');
                    group.classList.add('classically-controlled-one');
                    zeroGates?.classList.add('hidden');
                    oneGates?.classList.remove('hidden');
                    break;
                case '1':
                    textSvg.childNodes[0].nodeValue = '0';
                    group.classList.remove('classically-controlled-unknown');
                    group.classList.add('classically-controlled-zero');
                    group.classList.remove('classically-controlled-one');
                    zeroGates?.classList.remove('hidden');
                    oneGates?.classList.add('hidden');
                    break;
                case '0':
                    textSvg.childNodes[0].nodeValue = '?';
                    group.classList.add('classically-controlled-unknown');
                    group.classList.remove('classically-controlled-zero');
                    group.classList.remove('classically-controlled-one');
                    zeroGates?.classList.remove('hidden');
                    oneGates?.classList.remove('hidden');
                    break;
            }
            evt.stopPropagation();
        });
    });

    return container;
};

/**
 * Entrypoint class for rendering circuit visualizations.
 */
class Visualizer {
    circuit: Circuit;
    style: StyleConfig = {};
    composedSqore: ComposedSqore;
    gateRegistry: GateRegistry = {};

    /**
     * Initializes Sqore object with custom styles.
     *
     * @param circuit Circuit to be visualized.
     * @param style Custom styles for visualization.
     * @param renderDepth Depth of circuit to be visualized.
     */
    constructor(circuit: Circuit, style: StyleConfig = {}) {
        this.circuit = circuit;
        this.stylize(style);

        // Create visualization components
        this.composedSqore = this.compose(circuit);
    }

    visualize(container: HTMLElement, renderDepth = 0): void {
        // Inject into container
        if (container == null) throw new Error(`Container not provided.`);

        // Create copy of circuit to prevent mutation
        const circuit: Circuit = JSON.parse(JSON.stringify(this.circuit));

        // Assign unique IDs to each operation
        circuit.operations.forEach((op, i) => this.fillGateRegistry(op, i.toString()));

        // Render operations at starting at given depth
        circuit.operations = this.selectOpsAtDepth(circuit.operations, renderDepth);

        this.renderCircuit(container, circuit);
    }

    /**
     * Generates visualization of `composedSqore` as an SVG string.
     *
     * @returns SVG representation of circuit visualization.
     */
    // TODO: Return an SVG node instead and attach interactivity.
    generateSvg(): string {
        const uuid: string = createUUID();

        return `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="${uuid}" class="qviz" width="${
            this.composedSqore.width
        }" height="${this.composedSqore.height}">
    ${style(this.style)}
    ${this.composedSqore.elements.join('\n')}
</svg>`;
    }

    /**
     * Generates visualization as an HTML string.
     *
     * @returns HTML representation of circuit visualization.
     */
    generateHtml(): string {
        const svg: string = this.generateSvg();
        return `<html>
    ${svg}
</html>`;
    }

    /**
     * Sets custom style for visualization.
     *
     * @param style Custom `StyleConfig` for visualization.
     */
    private stylize(style: StyleConfig | string = {}): Visualizer {
        if (typeof style === 'string' || style instanceof String) {
            const styleName: string = style as string;
            if (!STYLES.hasOwnProperty(styleName)) {
                console.error(`No style ${styleName} found in STYLES.`);
                return this;
            }
            style = STYLES[styleName] || {};
        }
        this.style = style;
        return this;
    }

    private renderCircuit(container: HTMLElement, circuit: Circuit): void {
        // Create visualization components
        this.composedSqore = this.compose(circuit);
        container.innerHTML = this.generateSvg();
        this.addGateClickHandlers(container, circuit);
    }

    /**
     * Generates the components required for visualization.
     *
     * @param circuit Circuit to be visualized.
     *
     * @returns `ComposedSqore` object containing metadata for visualization.
     */
    private compose(circuit: Circuit): ComposedSqore {
        const add = (acc: Metadata[], gate: Metadata | Metadata[]): void => {
            if (Array.isArray(gate)) {
                gate.forEach((g) => add(acc, g));
            } else {
                acc.push(gate);
                gate.children?.forEach((g) => add(acc, g));
            }
        };

        const flatten = (gates: Metadata[]): Metadata[] => {
            const result: Metadata[] = [];
            add(result, gates);
            return result;
        };

        const { qubits, operations } = circuit;
        const { qubitWires, registers, svgHeight } = formatInputs(qubits);
        const { metadataList, svgWidth } = processOperations(operations, registers);
        const formattedGates: string = formatGates(metadataList);
        const measureGates: Metadata[] = flatten(metadataList).filter(({ type }) => type === GateType.Measure);
        const formattedRegs: string = formatRegisters(registers, measureGates, svgWidth);

        const composedSqore: ComposedSqore = {
            width: svgWidth,
            height: svgHeight,
            elements: [qubitWires, formattedRegs, formattedGates],
        };
        return composedSqore;
    }

    /**
     * Depth-first traversal to assign unique ID to `operation`.
     * The operation is assigned the id `id` and its `i`th child is recursively given
     * the id `${id}-${i}`.
     *
     * @param operation Operation to be assigned.
     * @param id: ID to assign to `operation`.
     *
     */
    private fillGateRegistry(operation: Operation, id: string): void {
        if (operation.dataAttributes == null) operation.dataAttributes = {};
        operation.dataAttributes['id'] = id;
        operation.dataAttributes['zoom-out'] = 'false';
        this.gateRegistry[id] = operation;
        operation.children?.forEach((childOp, i) => {
            this.fillGateRegistry(childOp, `${id}-${i}`);
            if (childOp.dataAttributes == null) childOp.dataAttributes = {};
            childOp.dataAttributes['zoom-out'] = 'true';
        });
        operation.dataAttributes['zoom-in'] = (operation.children != null).toString();
    }

    // Selects operations to render
    private selectOpsAtDepth(operations: Operation[], renderDepth: number): Operation[] {
        if (renderDepth < 0) throw new Error(`Invalid renderDepth of ${renderDepth}. Needs to be >= 0.`);
        if (renderDepth === 0) return operations;
        return operations
            .map((op) => (op.children != null ? this.selectOpsAtDepth(op.children, renderDepth - 1) : op))
            .flat();
    }

    private addGateClickHandlers(container: HTMLElement, circuit: Circuit): void {
        addClassicalControlHandlers(container);
        this.addZoomClickHandlers(container, circuit);
    }

    private addZoomClickHandlers(container: HTMLElement, circuit: Circuit): void {
        container.querySelectorAll(`.gate .gate-control`).forEach((ctrl) => {
            // Zoom in on clicked gate
            ctrl.addEventListener('click', (ev: Event) => {
                const gateId: string | null | undefined = ctrl.parentElement?.getAttribute('data-id');
                if (typeof gateId == 'string') {
                    if (ctrl.classList.contains('collapse')) {
                        this.collapseOperation(circuit.operations, gateId);
                    } else if (ctrl.classList.contains('expand')) {
                        this.expandOperation(circuit.operations, gateId);
                    }
                    this.renderCircuit(container, circuit);

                    ev.stopPropagation();
                }
            });
        });
    }

    private expandOperation(operations: Operation[], id: string): void {
        operations.forEach((op) => {
            if (op.conditionalRender === ConditionalRender.AsGroup) this.expandOperation(op.children || [], id);
            if (op.dataAttributes == null) return op;
            const opId: string = op.dataAttributes['id'];
            if (opId === id && op.children != null) {
                op.conditionalRender = ConditionalRender.AsGroup;
                op.dataAttributes['expanded'] = 'true';
            }
        });
    }

    private collapseOperation(operations: Operation[], parentId: string): void {
        operations.forEach((op) => {
            if (op.conditionalRender === ConditionalRender.AsGroup) this.collapseOperation(op.children || [], parentId);
            if (op.dataAttributes == null) return op;
            const opId: string = op.dataAttributes['id'];
            // Collapse parent gate and its children
            if (opId.startsWith(parentId)) op.conditionalRender = ConditionalRender.Always;
            // Allow parent gate to be interactive again
            if (opId === parentId) delete op.dataAttributes['expanded'];
        });
    }
}

export { addClassicalControlHandlers };
export { STYLES } from './styles';

// Export types
export type { Circuit, StyleConfig, Visualizer };
export type { Qubit, Operation } from './circuit';

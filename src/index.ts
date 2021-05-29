// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    createExecutionPathVisualizer,
    addGateClickHandlers,
    Circuit,
    StyleConfig,
    Operation,
    ConditionalRender,
} from './composer';

type GateRegistry = {
    [id: string]: Operation;
};

// Event handler to visually signal to user that the gate can be zoomed out on ctrl-click
window.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Shift') return;
    addCtrlClickStyles();
});

// Event handler to visually signal to user that the gate can be zoomed in on click
window.addEventListener('keyup', (ev) => {
    if (ev.key !== 'Shift') return;
    addDefaultStyles();
});

// Adds default cursor styles (i.e. zoom in on hover)
const addDefaultStyles = () => {
    document
        .querySelectorAll('[data-zoom-out="true"]:not([data-zoom-in="true"]),[data-expanded="true"]')
        .forEach((el: Element) => {
            (el as HTMLElement).style.cursor = 'default';
        });
    document.querySelectorAll('[data-zoom-in="true"]:not([data-expanded="true"])').forEach((el: Element) => {
        (el as HTMLElement).style.cursor = 'zoom-in';
    });
};

// Adds cursor styles on control-click (i.e. zoom out on hover)
const addCtrlClickStyles = () => {
    document.querySelectorAll('[data-zoom-out="true"]:not([data-expanded="true"])').forEach((el: Element) => {
        (el as HTMLElement).style.cursor = 'zoom-out';
    });
};

export class Visualizer {
    userStyleConfig: StyleConfig = {};
    displayedCircuit: Circuit | null = null;
    container: HTMLElement | null = null;
    gateRegistry: GateRegistry = {};

    constructor(container: HTMLElement, userStyleConfig: StyleConfig) {
        this.container = container;
        this.userStyleConfig = userStyleConfig;
    }

    visualize(circuit: Circuit, renderDepth = 0): void {
        // Assign unique IDs to each operation
        circuit.operations.forEach((op, i) => this.fillGateRegistry(op, i.toString()));

        // Render operations at starting at given depth
        circuit.operations = this.selectOpsAtDepth(circuit.operations, renderDepth);
        this.renderCircuit(circuit);
    }

    // Depth-first traversal to assign unique ID to operation.
    // The operation is assigned the id `id` and its `i`th child is recursively given
    // the id `${id}-${i}`.
    fillGateRegistry(operation: Operation, id: string): void {
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

    private selectOpsAtDepth(operations: Operation[], renderDepth: number): Operation[] {
        if (renderDepth < 0) throw new Error(`Invalid renderDepth of ${renderDepth}. Needs to be >= 0.`);
        if (renderDepth === 0) return operations;
        return operations
            .map((op) => (op.children != null ? this.selectOpsAtDepth(op.children, renderDepth - 1) : op))
            .flat();
    }

    private renderCircuit(circuit: Circuit): void {
        // Generate HTML visualization
        const html: string = createExecutionPathVisualizer().stylize(this.userStyleConfig).compose(circuit).asSvg();

        // Inject into div
        if (this.container == null) throw new Error(`Container not provided.`);
        this.container.innerHTML = html;
        this.displayedCircuit = circuit;

        // Handle click events
        this.addGateClickHandlers();

        // Add styles
        addDefaultStyles();
        //container.querySelector('svg').style.maxWidth = 'none';
    }

    private addGateClickHandlers(): void {
        // Add handlers from container:
        addGateClickHandlers(this.container);

        this.container?.querySelectorAll(`.gate`).forEach((gate) => {
            // Zoom in on clicked gate
            gate.addEventListener('click', (ev: Event) => {
                ev.stopPropagation();
                if (this.displayedCircuit == null) return;

                const id: string | null = gate.getAttribute('data-id');
                if (id == null) return;

                const canZoomIn = gate.getAttribute('data-zoom-in') === 'true';
                const canZoomOut = gate.getAttribute('data-zoom-out') === 'true';

                if ((ev as MouseEvent).shiftKey && canZoomOut) {
                    const parentId: string = (id.match(/(.*)-\d/) || ['', ''])[1];
                    this.collapseOperation(this.displayedCircuit.operations, parentId);
                } else if (canZoomIn) {
                    this.expandOperation(this.displayedCircuit.operations, id);
                }

                this.renderCircuit(this.displayedCircuit);
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
        // Cannot collapse top-level operation
        if (parentId === '0') return;
        operations.forEach((op) => {
            if (op.conditionalRender === ConditionalRender.AsGroup) this.collapseOperation(op.children || [], parentId);
            if (op.dataAttributes == null) return op;
            const opId: string = op.dataAttributes['id'];
            // Collapse parent gate and its children
            if (opId.startsWith(parentId)) op.conditionalRender = ConditionalRender.Always;
            // Allow parent gate to be interactive again
            if (opId === parentId) op.dataAttributes['expanded'] = 'false';
        });
    }
}

// Export methods/values from other modules:
export { createExecutionPathVisualizer, addGateClickHandlers } from './composer';
export { STYLES } from './styles';

// Export types from other modules:
export type { Circuit, StyleConfig, ExecutionPathVisualizer, ComposedCircuit, ConditionalRender } from './composer';
export type { Qubit, Operation } from './circuit';

import { formatInputs } from './formatters/inputFormatter';
import { formatGates } from './formatters/gateFormatter';
import { formatRegisters } from './formatters/registerFormatter';
import { processOperations } from './process';
import { Circuit } from './circuit';
import { Metadata, GateType } from './metadata';
import { StyleConfig, style, STYLES } from './styles';
import { createUUID } from './utils';

/**
 * Custom JavaScript code to be injected into visualization HTML string.
 * Handles interactive elements, such as classically-controlled operations.
 */
export const addGateClickHandlers = (container: Element | null) : Element | null => {
    container?.querySelectorAll('.classically-controlled-btn').forEach((btn) => {
        // Zoom in on clicked gate
        btn.addEventListener('click', (evt: Event) => {
            const textSvg = btn.querySelector('text');
            const group = btn.parentElement;
            if (textSvg == null || group == null) return;

            const currValue = textSvg.firstChild?.nodeValue;
            const zeroGates = group?.querySelector('.classically-controlled-zero');
            const oneGates = group?.querySelector('.classically-controlled-one');
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
                    group.classList.remove('classically-controlled-unknown');;
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
}


/**
 * Contains all metadata required to generate final output.
 */
class ComposedCircuit {
    width: number;
    height: number;
    style: StyleConfig;
    elements: string[];

    /**
     * Initializes `ComposedCircuit` with metadata required for visualization.
     *
     * @param width Width of SVG element.
     * @param height Height of SVG element.
     * @param style Visualization style.
     * @param elements SVG elements the make up circuit visualization.
     */
    constructor(width: number, height: number, style: StyleConfig, elements: string[]) {
        this.width = width;
        this.height = height;
        this.style = style;
        this.elements = elements;
    }

    /**
     * Generates visualization as an SVG string and optionally injects the custom script into the browser.
     *
     * @param injectScript Injects custom script into document manually. This is used when the visualization
     *                     is injected into the document via `innerHtml`.
     *
     * @returns SVG representation of circuit visualization.
     */
    asSvg(): string {
        const uuid: string = createUUID();
        let script = '';

        return `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="${uuid}" class="qviz" width="${this.width}" height="${this.height}">
    ${style(this.style)}
    ${this.elements.join('\n')}
</svg>`;
    }

    /**
     * Generates visualization as an HTML string and optionally injects the custom script into the browser.
     *
     * @returns HTML representation of circuit visualization.
     */
    asHtml(): string {
        const svg: string = this.asSvg();
        return `<html>
    ${svg}
</html>`;
    }
}

/**
 * Entrypoint class for rendering circuit visualizations.
 */
class ExecutionPathVisualizer {
    style: StyleConfig;

    /**
     * Initializes ExecutionPathVisualizer object with custom styles.
     *
     * @param style Custom styles for visualization.
     */
    constructor(style: StyleConfig = {}) {
        this.style = style;
    }

    /**
     * Sets custom style for visualization.
     *
     * @param style Custom `StyleConfig` for visualization.
     */
    stylize(style: StyleConfig | string = {}): ExecutionPathVisualizer {
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

    /**
     * Generates the components required for visualization.
     *
     * @param circuit Circuit to be visualized.
     *
     * @returns `ComposedCircuit` object containing metadata for visualization.
     */
    compose(circuit: Circuit): ComposedCircuit {
        const flatten = (gates: Metadata[]): Metadata[] => {
            const result: Metadata[] = [];
            function add(acc: Metadata[], gate: Metadata | Metadata[]) {
                if (Array.isArray(gate)) {
                    gate.forEach((g) => add(acc, g));
                } else {
                    acc.push(gate);
                    gate.children?.forEach((g) => add(acc, g));
                }
            }
            add(result, gates);
            return result;
        };

        const { qubits, operations } = circuit;
        const { qubitWires, registers, svgHeight } = formatInputs(qubits);
        const { metadataList, svgWidth } = processOperations(operations, registers);
        const formattedGates: string = formatGates(metadataList);
        const measureGates: Metadata[] = flatten(metadataList).filter(({ type }) => type === GateType.Measure);
        const formattedRegs: string = formatRegisters(registers, measureGates, svgWidth);

        const composition: ComposedCircuit = new ComposedCircuit(svgWidth, svgHeight, this.style, [
            qubitWires,
            formattedRegs,
            formattedGates,
        ]);
        return composition;
    }
}

/** Exported function for creating a new ExecutionPathVisualizer class. */
export const createExecutionPathVisualizer = (): ExecutionPathVisualizer => new ExecutionPathVisualizer();
export { STYLES } from './styles';
export { ConditionalRender } from './circuit';

// Export types
export type { Circuit, StyleConfig, ExecutionPathVisualizer, ComposedCircuit };
export type { Qubit, Operation } from './circuit';

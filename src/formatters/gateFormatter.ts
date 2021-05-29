// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Metadata, GateType } from '../metadata';
import {
    minGateWidth,
    gateHeight,
    labelFontSize,
    argsFontSize,
    controlBtnRadius,
    controlBtnOffset,
    groupBoxPadding,
    classicalRegHeight,
    nestedGroupPadding,
} from '../constants';
import { group, controlDot, line, box, text, arc, dashedLine, dashedBox } from './formatUtils';

/**
 * Given an array of operations (in metadata format), return the SVG representation.
 *
 * @param opsMetadata Array of Metadata representation of operations.
 * @param nestedDepth Depth of nested operations (used in classically controlled and grouped operations).
 *
 * @returns SVG representation of operations.
 */
const formatGates = (opsMetadata: Metadata[], nestedDepth = 0): string => {
    const formattedGates: string[] = opsMetadata.map((metadata) => _formatGate(metadata, nestedDepth));
    return formattedGates.flat().join('\n');
};

const _gateControls = (metadata: Metadata, nestedDepth: number): string[] => {
    const [x1, y1] = _gatePosition(metadata, nestedDepth);
    const { dataAttributes } = metadata;
    const atts = dataAttributes || {};
    const ctrls: string[] = [];

    const expanded = 'expanded' in atts;

    // Add collapse if expanded.
    if (expanded) {
        ctrls.push(
            group(['<circle cx="0" cy="0" r="10" />', '<path d="M-7,0 H7" />'], {
                class: 'gate-control collapse',
                transform: `translate(${x1 + 2}, ${y1 + 2})`,
            }),
        );
    } else if (atts['zoom-in'] == 'true') {
        ctrls.push(
            group(['<circle cx="0" cy="0" r="10" />', '<path d="M0,-7 V7 M-7,0 H7" />'], {
                class: 'gate-control expand',
                transform: `translate(${x1 + 2}, ${y1 + 2})`,
            }),
        );
    }

    return ctrls;
};

/**
 * Groups SVG elements into a gate SVG group.
 *
 * @param svgElems       Array of SVG elements.
 * @param dataAttributes Custom data attributes to be attached to SVG group.
 *
 * @returns SVG representation of a gate.
 */
const _createGate = (body: string[], metadata: Metadata, nestedDepth: number): string => {
    const ctrls = _gateControls(metadata, nestedDepth);
    const { dataAttributes } = metadata;
    const attributes: { [attr: string]: string } = { class: 'gate' };
    Object.entries(dataAttributes || {}).forEach(([attr, val]) => (attributes[`data-${attr}`] = val));

    return group(body.concat(ctrls), attributes);
};

/**
 * Takes in an operation's metadata and formats it into SVG.
 *
 * @param metadata Metadata object representation of gate.
 * @param nestedDepth Depth of nested operations (used in classically controlled and grouped operations).
 *
 * @returns SVG representation of gate.
 */
const _formatGate = (metadata: Metadata, nestedDepth = 0): string => {
    const { type, x, controlsY, targetsY, label, displayArgs, width } = metadata;
    switch (type) {
        case GateType.Measure:
            return _createGate([_measure(x, controlsY[0])], metadata, nestedDepth);
        case GateType.Unitary:
            return _createGate([_unitary(label, x, targetsY as number[][], width, displayArgs)], metadata, nestedDepth);
        case GateType.Swap:
            return controlsY.length > 0
                ? _controlledGate(metadata, nestedDepth)
                : _createGate([_swap(metadata, nestedDepth)], metadata, nestedDepth);
        case GateType.Cnot:
        case GateType.ControlledUnitary:
            return _controlledGate(metadata, nestedDepth);
        case GateType.Group:
            return _groupedOperations(metadata, nestedDepth);
        case GateType.ClassicalControlled:
            return _classicalControlled(metadata);
        default:
            throw new Error(`ERROR: unknown gate (${label}) of type ${type}.`);
    }
};

/**
 * Creates a measurement gate at position (x, y).
 *
 * @param x  x coord of measurement gate.
 * @param y  y coord of measurement gate.
 *
 * @returns SVG representation of measurement gate.
 */
const _measure = (x: number, y: number): string => {
    x -= minGateWidth / 2;
    const width: number = minGateWidth,
        height = gateHeight;
    // Draw measurement box
    const mBox: string = box(x, y - height / 2, width, height, 'gate-measure');
    const mArc: string = arc(x + 5, y + 2, width / 2 - 5, height / 2 - 8);
    const meter: string = line(x + width / 2, y + 8, x + width - 8, y - height / 2 + 8);
    return [mBox, mArc, meter].join('\n');
};

/**
 * Creates the SVG for a unitary gate on an arbitrary number of qubits.
 *
 * @param label            Gate label.
 * @param x                x coord of gate.
 * @param y                Array of y coords of registers acted upon by gate.
 * @param width            Width of gate.
 * @param displayArgs           Arguments passed in to gate.
 * @param renderDashedLine If true, draw dashed lines between non-adjacent unitaries.
 *
 * @returns SVG representation of unitary gate.
 */
const _unitary = (
    label: string,
    x: number,
    y: number[][],
    width: number,
    displayArgs?: string,
    renderDashedLine = true,
): string => {
    if (y.length === 0) return '';

    // Render each group as a separate unitary boxes
    const unitaryBoxes: string[] = y.map((group: number[]) => {
        const maxY: number = group[group.length - 1],
            minY: number = group[0];
        const height: number = maxY - minY + gateHeight;
        return _unitaryBox(label, x, minY, width, height, displayArgs);
    });

    // Draw dashed line between disconnected unitaries
    if (renderDashedLine && unitaryBoxes.length > 1) {
        const lastBox: number[] = y[y.length - 1];
        const firstBox: number[] = y[0];
        const maxY: number = lastBox[lastBox.length - 1],
            minY: number = firstBox[0];
        const vertLine: string = dashedLine(x, minY, x, maxY);
        return [vertLine, ...unitaryBoxes].join('\n');
    } else return unitaryBoxes.join('\n');
};

/**
 * Generates SVG representation of the boxed unitary gate symbol.
 *
 * @param label  Label for unitary operation.
 * @param x      x coord of gate.
 * @param y      y coord of gate.
 * @param width  Width of gate.
 * @param height Height of gate.
 * @param displayArgs Arguments passed in to gate.
 *
 * @returns SVG representation of unitary box.
 */
const _unitaryBox = (
    label: string,
    x: number,
    y: number,
    width: number,
    height: number = gateHeight,
    displayArgs?: string,
): string => {
    y -= gateHeight / 2;
    const uBox: string = box(x - width / 2, y, width, height);
    const labelY = y + height / 2 - (displayArgs == null ? 0 : 7);
    const labelText: string = text(label, x, labelY);
    const elems = [uBox, labelText];
    if (displayArgs != null) {
        const argStrY = y + height / 2 + 8;
        const argText: string = text(displayArgs, x, argStrY, argsFontSize);
        elems.push(argText);
    }
    return elems.join('\n');
};

/**
 * Creates the SVG for a SWAP gate on y coords given by targetsY.
 *
 * @param x          Centre x coord of SWAP gate.
 * @param targetsY   y coords of target registers.
 *
 * @returns SVG representation of SWAP gate.
 */
const _swap = (metadata: Metadata, nestedDepth: number): string => {
    const { x, targetsY } = metadata;

    // Get SVGs of crosses
    const [x1, y1, x2, y2] = _gatePosition(metadata, nestedDepth);
    const ys = targetsY.flatMap((y) => y as number[]);

    const bg: string = box(x1, y1, x2, y2, 'gate-swap');
    const crosses: string[] = ys.map((y) => _cross(x, y));
    const vertLine: string = line(x, ys[0], x, ys[1]);
    return [bg, crosses, vertLine].join('\n');
};

/**
 * Generates cross for display in SWAP gate.
 *
 * @param x x coord of gate.
 * @param y y coord of gate.
 *
 * @returns SVG representation for cross.
 */
const _cross = (x: number, y: number): string => {
    const radius = 8;
    const line1: string = line(x - radius, y - radius, x + radius, y + radius);
    const line2: string = line(x - radius, y + radius, x + radius, y - radius);
    return [line1, line2].join('\n');
};

/**
 * Produces the SVG representation of a controlled gate on multiple qubits.
 *
 * @param metadata Metadata of controlled gate.
 *
 * @returns SVG representation of controlled gate.
 */
const _controlledGate = (metadata: Metadata, nestedDepth: number): string => {
    const targetGateSvgs: string[] = [];
    const { type, x, controlsY, label, displayArgs, width } = metadata;
    let { targetsY } = metadata;

    // Get SVG for target gates
    switch (type) {
        case GateType.Cnot:
            (targetsY as number[]).forEach((y) => targetGateSvgs.push(_oplus(x, y)));
            break;
        case GateType.Swap:
            (targetsY as number[]).forEach((y) => targetGateSvgs.push(_cross(x, y)));
            break;
        case GateType.ControlledUnitary:
            const groupedTargetsY: number[][] = targetsY as number[][];
            targetGateSvgs.push(_unitary(label, x, groupedTargetsY, width, displayArgs, false));
            targetsY = targetsY.flat();
            break;
        default:
            throw new Error(`ERROR: Unrecognized gate: ${label} of type ${type}`);
    }
    // Get SVGs for control dots
    const controlledDotsSvg: string[] = controlsY.map((y) => controlDot(x, y));
    // Create control lines
    const maxY: number = Math.max(...controlsY, ...(targetsY as number[]));
    const minY: number = Math.min(...controlsY, ...(targetsY as number[]));
    const vertLine: string = line(x, minY, x, maxY);
    const svg: string = _createGate([vertLine, ...controlledDotsSvg, ...targetGateSvgs], metadata, nestedDepth);
    return svg;
};

/**
 * Generates $\oplus$ symbol for display in CNOT gate.
 *
 * @param x x coordinate of gate.
 * @param y y coordinate of gate.
 * @param r radius of circle.
 *
 * @returns SVG representation of $\oplus$ symbol.
 */
const _oplus = (x: number, y: number, r = 15): string => {
    const circle = `<circle class="oplus" cx="${x}" cy="${y}" r="${r}"></circle>`;
    const vertLine: string = line(x, y - r, x, y + r);
    const horLine: string = line(x - r, y, x + r, y);
    return [circle, vertLine, horLine].join('\n');
};

const _gatePosition = (metadata: Metadata, nestedDepth: number): [number, number, number, number] => {
    const { x, width, type, targetsY } = metadata;

    const ys = targetsY.flatMap((y) => y as number[]);
    const maxY = Math.max(...ys);
    const minY = Math.min(...ys);

    let x1: number, y1: number, x2: number, y2: number;

    switch (type) {
        case GateType.Group:
            const padding = groupBoxPadding - nestedDepth * nestedGroupPadding;

            x1 = x - 2 * padding;
            y1 = minY - gateHeight / 2 - padding;
            x2 = width + 2 * padding;
            y2 = maxY + +gateHeight / 2 + padding - (minY - gateHeight / 2 - padding);

            return [x1, y1, x2, y2];

        default:
            x1 = x - width / 2;
            y1 = minY - gateHeight / 2;
            x2 = x + width;
            y2 = maxY + gateHeight / 2;
    }

    return [x1, y1, x2, y2];
};

/**
 * Generates the SVG for a group of nested operations.
 *
 * @param metadata Metadata representation of gate.
 * @param nestedDepth Depth of nested operations (used in classically controlled and grouped operations).
 *
 * @returns SVG representation of gate.
 */
const _groupedOperations = (metadata: Metadata, nestedDepth: number): string => {
    const { children } = metadata;
    const [x1, y1, x2, y2] = _gatePosition(metadata, nestedDepth);
    const childrenGates: string = children != null ? formatGates(children as Metadata[], nestedDepth + 1) : '';

    // Draw dashed box around children gates
    const box: string = dashedBox(x1, y1, x2, y2);
    return _createGate([box, childrenGates], metadata, nestedDepth);
};

/**
 * Generates the SVG for a classically controlled group of operations.
 *
 * @param metadata Metadata representation of gate.
 * @param padding  Padding within dashed box.
 *
 * @returns SVG representation of gate.
 */
const _classicalControlled = (metadata: Metadata, padding: number = groupBoxPadding): string => {
    const { controlsY, dataAttributes } = metadata;
    const targetsY: number[] = metadata.targetsY as number[];
    const children: Metadata[][] = metadata.children as Metadata[][];
    let { x, width } = metadata;

    const controlY = controlsY[0];

    // Get SVG for gates controlled on 0
    let childrenZero: string = children != null ? formatGates(children[0]) : '';
    childrenZero = `<g class="gates-zero">\r\n${childrenZero}</g>`;

    // Get SVG for gates controlled on 1
    let childrenOne: string = children != null ? formatGates(children[1]) : '';
    childrenOne = `<g class="gates-one">\r\n${childrenOne}</g>`;

    // Draw control button and attached dashed line to dashed box
    const controlCircleX: number = x + controlBtnRadius;
    const controlCircle: string = _controlCircle(controlCircleX, controlY);
    const lineY1: number = controlY + controlBtnRadius,
        lineY2: number = controlY + classicalRegHeight / 2;
    const vertLine: string = dashedLine(controlCircleX, lineY1, controlCircleX, lineY2, 'classical-line');
    x += controlBtnOffset;
    const horLine: string = dashedLine(controlCircleX, lineY2, x, lineY2, 'classical-line');

    width = width - controlBtnOffset + (padding - groupBoxPadding) * 2;
    x += groupBoxPadding - padding;
    const y: number = targetsY[0] - gateHeight / 2 - padding;
    const height: number = targetsY[1] - targetsY[0] + gateHeight + padding * 2;

    // Draw dashed box around children gates
    const box: string = dashedBox(x, y, width, height, 'classical-container');

    // Display controlled operation in initial "unknown" state
    const attributes: { [attr: string]: string } = {
        class: `classically-controlled-group classically-controlled-unknown`,
    };
    if (dataAttributes != null)
        Object.entries(dataAttributes).forEach(([attr, val]) => (attributes[`data-${attr}`] = val));

    return group([horLine, vertLine, controlCircle, childrenZero, childrenOne, box], attributes);
};

/**
 * Generates the SVG representation of the control circle on a classical register with interactivity support
 * for toggling between bit values (unknown, 1, and 0).
 *
 * @param x   x coord.
 * @param y   y coord.
 * @param cls Class name.
 * @param r   Radius of circle.
 *
 * @returns SVG representation of control circle.
 */
const _controlCircle = (x: number, y: number, r: number = controlBtnRadius): string =>
    `<g class="classically-controlled-btn">
<circle cx="${x}" cy="${y}" r="${r}"></circle>
<text font-size="${labelFontSize}" x="${x}" y="${y}">?</text>
</g>`;

export {
    formatGates,
    _formatGate,
    _createGate,
    _measure,
    _unitary,
    _swap,
    _controlledGate,
    _groupedOperations,
    _classicalControlled,
};

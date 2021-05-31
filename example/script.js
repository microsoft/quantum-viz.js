// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/* This example shows how to render a circuit manually by
   generating the SVG. */
const circuitDiv = document.getElementById('circuit');
if (circuitDiv != null) {
    const viz1 = new Sqore.Visualizer(random, Sqore.STYLES['Default']);

    // Generate SVG
    const svg = viz1.generateSvg();
    circuitDiv.innerHTML = svg;
    // Add interactivity for classically-controlled operations
    Sqore.addClassicalControlHandlers(circuitDiv);
}

/* This example shows how to render an expandable circuit into
   a container. */
const teleportDiv = document.getElementById('teleport');
if (teleportDiv != null) {
    const viz2 = new Sqore.Visualizer(teleport, Sqore.STYLES['Default']);
    viz2.visualize(teleportDiv);
}

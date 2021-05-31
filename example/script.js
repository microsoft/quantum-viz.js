// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/* This example shows how to render an expandable circuit into
   a container. */
const sampleDiv = document.getElementById('sample');
if (sampleDiv != null) {
    const sampleViz = new Sqore.Visualizer(sample, Sqore.STYLES['Default']);
    sampleViz.visualize(sampleDiv);
}

const teleportDiv = document.getElementById('teleport');
if (teleportDiv != null) {
    const teleportViz = new Sqore.Visualizer(teleport, Sqore.STYLES['Default']);
    teleportViz.visualize(teleportDiv);
}

const groverDiv = document.getElementById('grover');
if (groverDiv != null) {
    const groverViz = new Sqore.Visualizer(grover, Sqore.STYLES['Default']);
    groverViz.visualize(groverDiv);
}

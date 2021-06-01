// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/* This example shows how to render an expandable circuit into
   a container. */
const sampleDiv = document.getElementById('sample');
if (sampleDiv != null) {
    const sampleViz = new sqore.Sqore(sample, sqore.STYLES['Default']);
    sampleViz.visualize(sampleDiv);
}

const teleportDiv = document.getElementById('teleport');
if (teleportDiv != null) {
    const teleportViz = new sqore.Sqore(teleport, sqore.STYLES['Default']);
    teleportViz.visualize(teleportDiv);
}

const groverDiv = document.getElementById('grover');
if (groverDiv != null) {
    const groverViz = new sqore.Sqore(grover, sqore.STYLES['Default']);
    groverViz.visualize(groverDiv);
}

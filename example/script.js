// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/* This example shows how to render an expandable circuit into
   a container. */
const sampleDiv = document.getElementById('sample');
if (sampleDiv != null) {
    qviz.draw(sample, sampleDiv, qviz.STYLES['Default']);
}

const teleportDiv = document.getElementById('teleport');
if (teleportDiv != null) {
    qviz.draw(teleport, teleportDiv, qviz.STYLES['Default']);
}

const groverDiv = document.getElementById('grover');
if (groverDiv != null) {
    qviz.draw(grover, groverDiv, qviz.STYLES['Default']);
}

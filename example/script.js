// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

if (typeof(qviz) != "undefined") {
    /* These examples shows how to draw circuits into containers. */
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

} else {
    title = document.createElement("h1");
    title.innerHTML = "<code>qviz</code> not found!"
    msg = document.createElement("div");
    msg.innerHTML = "Please make sure the project is built first by following the <i>Running from source</i> instructions from the README.md";
    
    document.body.appendChild(title);
    document.body.appendChild(msg);
}
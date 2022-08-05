// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

if (typeof qviz != 'undefined') {
    document.getElementById('message').remove();

    /* These examples shows how to draw circuits into containers. */
    const entangleDiv = document.getElementById('entangle');
    if (entangleDiv != null) {
        qviz.create(entangle) //
            .useOnCircuitChange((circuit) => {
                console.log('New circuit ↓');
                console.log(circuit);
            })
            .draw(entangleDiv);
    }

    const entangleUDDiv = document.getElementById('entangle-usedraggable');
    if (entangleUDDiv != null) {
        qviz.create(entangle) //
            .useDraggable()
            .draw(entangleUDDiv);
    }

    const entangleUDUPDiv = document.getElementById('entangle-usedraggable-usepanel');
    if (entangleUDUPDiv != null) {
        qviz.create(entangle) //
            .useDraggable()
            .usePanel()
            .draw(entangleUDUPDiv);
    }

    const sampleDiv = document.getElementById('sample');
    if (sampleDiv != null) {
        qviz.create(sample) //
            .draw(sampleDiv);
    }

    const teleportDiv = document.getElementById('teleport');
    if (teleportDiv != null) {
        qviz.create(teleport) //
            .draw(teleportDiv);
    }

    const groverDiv = document.getElementById('grover');
    if (groverDiv != null) {
        qviz.create(grover) //
            .draw(groverDiv);
    }
} else {
    document.getElementById('group').remove();
}

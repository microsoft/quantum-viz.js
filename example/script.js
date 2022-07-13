// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

if (typeof qviz != 'undefined') {
    document.getElementById('message').remove();

    /* These examples shows how to draw circuits into containers. */
    const entangleDiv = document.getElementById('entangle');
    if (entangleDiv != null) {
        qviz.create(entangle) //
            .useDraggable()
            .usePanel()
            .draw(entangleDiv);
    }

    const sampleDiv = document.getElementById('sample');
    if (sampleDiv != null) {
        /* Pass in isEditable = true to allow circuit to be editable */
        /* Pass in onCircuitChange to trigger callback function
           whenever there is a change in circuit */
        // qviz.draw(sample, sampleDiv, qviz.STYLES['Default'], 0, isEditable, onCircuitChange);
        qviz.create(sample) //
            .useDraggable()
            .usePanel()
            .useOnCircuitChange((circuit) => {
                console.log('New circuit ↓');
                console.log(circuit);
            })
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

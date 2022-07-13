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
            .useOnCircuitChange((circuit) => {
                console.log('New circuit ↓');
                console.log(circuit);
            })
            .draw(entangleDiv);
    }

    const sampleDiv = document.getElementById('sample');
    if (sampleDiv != null) {
        const isEditable = true;
        const onCircuitChange = (circuit) => {
            console.log('New circuit ↓');
            console.log(circuit);
        };
        /* Pass in isEditable = true to allow circuit to be editable */
        /* Pass in onCircuitChange to trigger callback function
           whenever there is a change in circuit */
        // qviz.draw(sample, sampleDiv, qviz.STYLES['Default'], 0, isEditable, onCircuitChange);
    }

    const teleportDiv = document.getElementById('teleport');
    if (teleportDiv != null) {
        // qviz.draw(teleport, teleportDiv, qviz.STYLES['Default'], 0, true);
    }

    const groverDiv = document.getElementById('grover');
    if (groverDiv != null) {
        // qviz.draw(grover, groverDiv, qviz.STYLES['Default']);
    }
} else {
    document.getElementById('group').remove();
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

// This shows how to render a circuit in a div:
const div = document.getElementById('circuit');
if (div != null) {
    const svg = Sqore.createExecutionPathVisualizer()
        .stylize(Sqore.STYLES['Default'])
        .compose(random)
        .asSvg((injectScript = true));
    div.innerHTML = svg;
    Sqore.addGateClickHandlers(div);
}

// This shows how to render an expandable circuit:
const div2 = document.getElementById('teleport');
if (div2 != null) {
    const viz2 = new Sqore.Visualizer(div2, Sqore.STYLES['Default']);
    viz2.visualize(teleport);
}


console.log(JSON.stringify(teleport));
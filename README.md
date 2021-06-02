# quantum-viz.js
[![Licensed under the MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE.txt)
[![PR's Welcome](https://img.shields.io/badge/PRs%20-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Build Status](https://github.com/microsoft/quantum-viz.js/actions/workflows/main.yml/badge.svg)](https://github.com/microsoft/quantum-viz.js/actions)

**quantum-viz.js** (or **qviz**) is a configurable tool for rendering quantum circuits. With the increasing demand for quantum libraries and educational tools, quantum circuits provide an intuitive way to visualize and understand quantum algorithms. quantum-viz.js is a lightweight library that can be easily integrated into any project. It aims to be easily configurable while allowing complex user interactions, such as toggling between different measurement outcomes.

## Getting Started
### Installation
Install the necessary dependencies with `npm install`.

#### Embedding in browser
To use quantum-viz.js in the browser, perform the following steps:
1. Run `npm run build:prod` to build the minified JS files.
2. Include `dist/qviz.js` or `dist/qviz.min.js` as a `<script>` in your HTML.
3. You can now use `qviz` in your JavaScript files!

#### Using with TypeScript
To import quantum-viz.js into your TypeScript project, perform the following steps:
1. Run `npm run build` to compile TypeScript source files with the type declaration files.
2. You can now import the files from `lib/index.js`!

### Example usage
```js
const sampleCircuit = {
    qubits: [
        // ...
    ],
    operations: [
        // ...
    ],
};
const sampleDiv = document.getElementById('sample');
qviz.draw(sampleCircuit, sampleDiv, qviz.STYLES['Default']);
```

Refer to the example project in the [`example`](./example) folder for an example on how to use quantum-viz.js.

## Contributing

Check out our [contributing guidelines](CONTRIBUTING.md) to find out how you can contribute to quantum-viz.js!

## Code of Conduct
This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

# quantum-viz.js
[![Licensed under the MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE.txt)
[![PR's Welcome](https://img.shields.io/badge/PRs%20-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Build Status](https://github.com/microsoft/quantum-viz.js/actions/workflows/main.yml/badge.svg)](https://github.com/microsoft/quantum-viz.js/actions)
[![npm version](https://badge.fury.io/js/%40microsoft%2Fquantum-viz.js.svg)](https://www.npmjs.com/package/@microsoft/quantum-viz.js)

**quantum-viz.js** (or **qviz**) is a configurable tool for rendering quantum circuits. With the increasing demand for quantum libraries and educational tools, quantum circuits provide an intuitive way to visualize and understand quantum algorithms. quantum-viz.js is a lightweight library that can be easily integrated into any project. It aims to be easily configurable while allowing complex user interactions, such as toggling between different measurement outcomes.

## Getting Started
### Installation
Include `quantum-viz.js` in your HTML page by using it directly from CDN:
```html
<script src="https://unpkg.com/@microsoft/quantum-viz.js"></script>
```
or import it in into your TypeScript package:
```bash
npm i @microsoft/quantum-viz.js
```

### Usage
1. Create a `Circuit` JavaScript object (the `Circuit` schema is documented [here](https://github.com/microsoft/quantum-viz.js/wiki/API-schema-reference)):
```js
const sampleCircuit = {
    qubits: [
        // ...
    ],
    operations: [
        // ...
    ],
};
```


2. Draw it in a `div`:
```js
const sampleDiv = document.getElementById('sample');
qviz.draw(sampleCircuit, sampleDiv, qviz.STYLES['Default']);
```

Refer to the [`example`](./example) folder for an example on how to use quantum-viz.js. Notice that in order to open the contents of this folder in a browser you will need first to install from source (see below).

## Running from source

### Installing
To build and install this project from source, run the following commands from the root folder of this repository:
```bash
# Install dependencies
> npm install
# Build 
> npm run build:prod
```

### Running tests
To run tests for this project, run the following commands:
```bash
# Installs dependencies (run this step if you haven't)
> npm install
# Starts Jest tests
> npm run test
```

## Contributing
Check out our [contributing guidelines](CONTRIBUTING.md) to find out how you can contribute to quantum-viz.js!


## Feedback ##
If you have feedback about this library, please let us know by filing a [new issue](https://github.com/microsoft/quantum-viz.js/issues/new/choose)!


## Reporting Security Issues
Security issues and bugs should be reported privately, via email, to the Microsoft Security
Response Center (MSRC) at [secure@microsoft.com](mailto:secure@microsoft.com). You should
receive a response within 24 hours. If for some reason you do not, please follow up via
email to ensure we received your original message. Further information, including the
[MSRC PGP](https://technet.microsoft.com/en-us/security/dn606155) key, can be found in
the [Security TechCenter](https://technet.microsoft.com/en-us/security/default).


## Trademarks
This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft trademarks or logos is subject to and must follow Microsoft's Trademark & Brand Guidelines. Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship. Any use of third-party trademarks or logos are subject to those third-party's policies.


## Code of Conduct
This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

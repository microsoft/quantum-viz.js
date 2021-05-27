# Sqore
[![Licensed under the MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE.txt)
[![PR's Welcome](https://img.shields.io/badge/PRs%20-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Build Status](https://dev.azure.com/rcykoh/Sqore/_apis/build/status/microsoft.sqore?branchName=main)](https://dev.azure.com/rcykoh/Sqore/_build/latest?definitionId=1&branchName=main)

<p align="center"><img src="https://raw.githubusercontent.com/microsoft/quantum-viz.js/main/assets/sqore-anim.gif?token=AES5QW6SRPGZIXO6F4V4N23AW7XFI" width="80%"/></p>

Sqore is a configurable tool for rendering quantum circuits. With the increasing demand for quantum libraries and educational tools, quantum circuits provide an intuitive way to visualize and understand quantum algorithms. Sqore is a lightweight library that can be easily integrated into any project. It aims to be easily configurable while allowing complex user interactions, such as toggling between different measurement outcomes.

## Getting Started
### Installation
Install the necessary dependencies with `npm install`.

#### Embedding in browser
To use Sqore in the browser, perform the following steps:
1. Run `npm run build:prod` to build the minified JS files.
2. Include `dist/sqore.js` or `dist/sqore.min.js` as a `<script>` in your HTML.
3. You can now use `Sqore` in your JavaScript files!

#### Using with TypeScript
To import Sqore into your TypeScript project, perform the following steps:
1. Run `npm run build` to compile TypeScript source files with the type declaration files.
2. You can now import the files from `lib/index.js`!

### Example usage
```JavaScript
const svg = Sqore.createSqore()
    .stylize(Sqore.STYLES['Default'])
    .compose(circuit)
    .asSvg((injectScript = true));
```

Refer to the example project in the [`example`](./example) folder for an example on how to use Sqore.

## Contributing

Check out our [contributing guidelines](CONTRIBUTING.md) to find out how you can contribute to Sqore!

## Code of Conduct
This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

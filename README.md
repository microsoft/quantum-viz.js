# Sqore
[![Licensed under the MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://dev.azure.com/t-rkoh/CircuitViz/_git/sqore?path=LICENSE.txt)
[![PR's Welcome](https://img.shields.io/badge/PRs%20-welcome-brightgreen.svg)](#contribute)
[![Build Status](https://dev.azure.com/t-rkoh/CircuitViz/_apis/build/status/sqore?branchName=master)](https://dev.azure.com/t-rkoh/CircuitViz/_build/latest?definitionId=3&branchName=master)

Sqore is a configurable tool for rendering quantum circuits. With the increasing demand for quantum libraries and educational tools, quantum circuits provide an intuitive way to visualize and understand quantum algorithms. Sqore is a lightweight library that can be easily integrated into any project. It aims to be easily configurable while allowing complex user interactions, such as toggling between different measurement outcomes.

# Getting Started
## Embedding in browser
To use Sqore in the browser, perform the following steps:
1. Run `npm build:prod` to build to minified JS files.
2. Include `dist/sqore.js` or `dist/sqore.min.js` as a `<script>` in your HTML.
3. You can now use `Sqore` in your JavaScript files! (e.g. `Sqore.circuitToSvg(circuit, Sqore.STYLES['Default'])`)

## Using with TypeScript
To import Sqore into your TypeScript project, perform the following steps:
1. Run `npm build` to compile TypeScript source files with the type declaration files.
2. You can now import the files from `lib/index.js`!

Refer to the example project in the [`example`](./example) folder for an example on how to use Sqore.

# Development
## Installation
To build this project, run the following commands:
```bash
# Installs dependencies
> npm install
# Starts TypeScript compilation in watch mode
> npm start
```

## Running tests
To run tests for this project, run the following commands:
```bash
# Installs dependencies (run this step if you haven't)
> npm install
# Starts Jest tests
> npm run test
```

# Contribute
First off, thank you so much for being interested in contributing to this project and improving how we visualize quantum algorithms! :rocket: To begin contributing, check for any open issues and leave a comment that you're interested in taking it up. Once assigned to an issue, fork this repository and begin your journey! When you're ready to submit it for review, open up a pull request with your new changes and one of our maintainers will get back to you.

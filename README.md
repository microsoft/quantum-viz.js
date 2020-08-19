# Sqore
[![Licensed under the MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://dev.azure.com/t-rkoh/CircuitViz/_git/sqore?path=LICENSE.txt)
[![PR's Welcome](https://img.shields.io/badge/PRs%20-welcome-brightgreen.svg)](#contribute)
[![Build Status](https://dev.azure.com/ms-hiddenfalls-interns-20/KohRaphael2020/_apis/build/status/KohRaphael2020?branchName=master)](https://dev.azure.com/ms-hiddenfalls-interns-20/KohRaphael2020/_build/latest?definitionId=2&branchName=master)

<p align="center"><img src="https://dev.azure.com/ms-hiddenfalls-interns-20/9a27a273-a6ca-4047-83ea-161c1c14b461/_apis/git/repositories/596d0289-b25e-4f28-9e4a-0a0302f13634/items?path=%2Fassets%2Fsqore-anim.gif&versionDescriptor%5BversionOptions%5D=0&versionDescriptor%5BversionType%5D=0&versionDescriptor%5Bversion%5D=master&resolveLfs=true&%24format=octetStream&api-version=5.0" width="80%"/></p>

Sqore is a configurable tool for rendering quantum circuits. With the increasing demand for quantum libraries and educational tools, quantum circuits provide an intuitive way to visualize and understand quantum algorithms. Sqore is a lightweight library that can be easily integrated into any project. It aims to be easily configurable while allowing complex user interactions, such as toggling between different measurement outcomes.

# Getting Started
## Installation
### Embedding in browser
To use Sqore in the browser, perform the following steps:
1. Run `npm build:prod` to build the minified JS files.
2. Include `dist/sqore.js` or `dist/sqore.min.js` as a `<script>` in your HTML.
3. You can now use `Sqore` in your JavaScript files!

### Using with TypeScript
To import Sqore into your TypeScript project, perform the following steps:
1. Run `npm build` to compile TypeScript source files with the type declaration files.
2. You can now import the files from `lib/index.js`!

## Example usage
```JavaScript
const svg = Sqore.createSqore()
    .stylize(Sqore.STYLES['Default'])
    .compose(circuit)
    .asSvg((injectScript = true));
```

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

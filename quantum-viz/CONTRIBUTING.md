Contributor Guide
=================

Thank you for your interest in improving this project. This project is
open-source under the [MIT license](./LICENSE.txt) and welcomes
contributions in the form of bug reports, feature requests, and pull
requests.

Here is a list of important resources for contributors:

- [Source Code](https://github.com/microsoft/quantum-viz.js)
- [Issue Tracker](https://github.com/microsoft/quantum-viz.js/issues)
- [Code of Conduct](https://opensource.microsoft.com/codeofconduct/)

How to report a bug
-------------------

Report bugs on the [Issue
Tracker](https://github.com/microsoft/quantum-viz.js/issues).

When filing an issue, make sure to answer these questions:

- Which operating system and Python version are you using?
- Which version of this project are you using?
- What did you do?
- What did you expect to see?
- What did you see instead?

The best way to get your bug fixed is to provide a test case, and/or
steps to reproduce the issue.

How to request a feature
------------------------

Request features on the [Issue
Tracker](https://github.com/microsoft/quantum-viz.js/issues).

How to set up your development environment
------------------------------------------

You need Python 3.7+ and the following tools:

- [Poetry](https://python-poetry.org/)
- [Nox](https://nox.thea.codes/)
- [noxppoetry](https://nox-poetry.readthedocs.io/)

If you would like to create a virtual environment for development, use
`venv`:

```bash
python3 -m venv quantum-viz-env
```

Activate your virtual environment. On Windows, run:

```bash
quantum-viz-env\Scripts\activate.bat
```

On Unix or MacOS, run:

```bash
source quantum-viz-env/bin/activate
```

Then, install the quantum-viz package with development requirements:

```bash
pip install poetry nox nox-poetry
poetry install
```

This installs all dependencies as defined in the poetry.lock file.

How to test the project
-----------------------

Run the full test suite:

```bash
nox
```

List the available Nox sessions (defined in quantum-viz/noxfile.py):

```bash
nox --list-sessions
```

You can also run a specific Nox session. For example, invoke the unit
test suite like this:

```bash
nox --session=tests
```

Unit tests are located in the `tests` directory, and are written using
the [pytest](https://pytest.readthedocs.io/) testing framework.

How to submit changes
---------------------

Open a [pull request](https://github.com/microsoft/quantum-viz.js/pulls)
to submit changes to this project.

Your pull request needs to meet the following guidelines for acceptance:

- The Nox test suite must pass without errors and warnings.
- Include unit tests. This project maintains 100% code coverage.
- If your changes add functionality, update the documentation
    accordingly.

Feel free to submit early, though, we can always iterate on this.

To run linting and code formatting checks before committing your change,
you can install pre-commit as a Git hook by running the following
command:

```bash
nox --session=pre-commit -- install
```

It is recommended to open an issue before starting work on anything.
This will allow a chance to talk it over with the owners and validate
your approach.

# quantum-viz

`quantum-viz` is a Jupyter widget for rendering interactive quantum circuit diagrams. It is based on [quantum-viz.js](https://github.com/microsoft/quantum-viz.js) and supports visualizing any arbitrary quantum gate, classical control logic and collapsed grouped blocks of gates.

![quantum-viz screenshot](https://user-images.githubusercontent.com/4041805/137234877-6a529652-a3b9-48c6-9d3c-c2b9d1e11855.gif)

## Installation

You can install the *quantum-viz.js widget* via `pip` from PyPI:

```bash
pip install quantum-viz
```

## Example

```python
from quantum_viz import QuantumViz

# Create a quantum program to prepare a Bell state
program = {
    "qubits": [{ "id": 0 }, { "id": 1, "numChildren": 1 }],
    "operations": [
        {
            "gate": 'H',
            "targets": [{ "qId": 0 }],
        },
        {
            "gate": 'X',
            "isControlled": "True",
            "controls": [{ "qId": 0 }],
            "targets": [{ "qId": 1 }],
        },
        {
            "gate": 'Measure',
            "isMeasurement": "True",
            "controls": [{ "qId": 1 }],
            "targets": [{ "type": 1, "qId": 1, "cId": 0 }],
        },
    ],
}

QuantumViz(program)
```

![quantum-viz example](https://user-images.githubusercontent.com/4041805/137230540-b523dc76-29c7-48e2-baa3-34d4ee0a17a1.PNG)
# quantum-viz

`quantum-viz` is a Jupyter widget for rendering quantum circuit diagrams.

![quantum-viz screenshot](https://user-images.githubusercontent.com/19257435/120700950-4ce70a80-c480-11eb-9f8b-0d5f2be18b37.png)

## Installation

You can install the *quantum-viz.js widget* via `pip` from PyPI:

```bash
pip install quantum-viz
```

## Example

```python
from quantum_viz import QuantumVizWidget
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
QuantumVizWidget(program)
```

![quantum-viz example](https://user-images.githubusercontent.com/4041805/137230540-b523dc76-29c7-48e2-baa3-34d4ee0a17a1.PNG)
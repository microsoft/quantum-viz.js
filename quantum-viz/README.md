# quantum-viz

`quantum-viz` is the Python package companion of [quantum-viz.js](https://github.com/microsoft/quantum-viz.js), a JavaScript package that supports visualizing any arbitrary quantum gate, classical control logic and collapsed grouped blocks of gates using JSON-formatted input data. `quantum-viz` contains a Jupyter widget and will also include support for translating quantum circuits written in common quantum programming libraries to JSON using the `quantum-viz.js` JSON schema.

![quantum-viz screenshot](https://user-images.githubusercontent.com/4041805/137234877-6a529652-a3b9-48c6-9d3c-c2b9d1e11855.gif)

## Installation

You can install the *quantum-viz.js widget* via `pip` from PyPI:

```bash
pip install quantum-viz
```

## Example

To use the quantum-viz widget, run the below example code in a [Jupyter notebook](https://jupyter.org/) cell:

```python
from quantum_viz import Viewer

# Create a quantum circuit that prepares a Bell state
circuit = {
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

widget = Viewer(circuit)
widget # Display the widget
```

![quantum-viz example](https://user-images.githubusercontent.com/4041805/137230540-b523dc76-29c7-48e2-baa3-34d4ee0a17a1.PNG)

## Qiskit Integration

By installing the optional `[qiskit]` dependency, you can leverage Qiskit's `QuantumCircuit` APIs
to define the circuit and render it using the `Viewer` widget on Jupyter, for example:

```python
from qiskit import QuantumRegister, ClassicalRegister, QuantumCircuit
from quantum_viz import Viewer

qr = QuantumRegister(3, 'q')
anc = QuantumRegister(1, 'ancilla')
cr = ClassicalRegister(3, 'c')
qc = QuantumCircuit(qr, anc, cr)


qc.h(qr[0:3])
qc.x(anc[0])
qc.h(anc[0])
qc.cx(qr[0:3], anc[0])
qc.h(qr[0:3])
qc.barrier(qr)
qc.measure(qr, cr)

Viewer(qc)
```

Optionally, you can also import the `display` method from `quantum_viz.utils` to render the circuit on a new browser window:

```python
from quantum_viz.utils import display
display(qc)
```

## Contributing

Check out our [contributing guidelines](https://github.com/microsoft/quantum-viz.js/blob/main/quantum-viz/CONTRIBUTING.md) to find out how you can contribute to quantum-viz.

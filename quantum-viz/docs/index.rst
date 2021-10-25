Quantum-viz package
===================

`quantum-viz` is a Python package for rendering interactive quantum circuit diagrams using [quantum-viz.js](https://github.com/microsoft/quantum-viz.js), a JavaScript package that supports visualizing any arbitrary quantum gate, classical control logic and collapsed grouped blocks of gates using JSON-formatted input data. `quantum-viz` contains a Jupyter widget and will also include support for translating quantum circuits written in common quantum programming libraries to JSON using the `quantum-viz.js` JSON schema.

Installation
------------

You can install the *quantum-viz.js widget* via `pip` from PyPI:

.. code:: console
   pip install quantum-viz

Example
-------

.. code:: python
   from quantum_viz import QViz

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

   QViz(circuit)

.. image:: https://user-images.githubusercontent.com/4041805/137230540-b523dc76-29c7-48e2-baa3-34d4ee0a17a1.PNG
  :width: 400
  :alt: quantum-viz example

.. toctree::
   :hidden:
   :maxdepth: 1

   License <license>
   Credits <credits>

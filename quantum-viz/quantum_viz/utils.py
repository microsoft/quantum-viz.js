import json
import tempfile
import webbrowser
from pathlib import Path
from quantum_viz.qiskit_parser import qiskit2json

from qiskit import QuantumCircuit

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>quantum-viz.js visualization</title>
</head>
<body>
  <div id="msg" style="font-size: large; font-weight: bolder;">
    There was some error with the script
  </div>
  <div id="circuit_div"></div>
  <script src="https://unpkg.com/@microsoft/quantum-viz.js"></script>
  <script type="text/javascript">
  var circuitString = `{}`;
  </script>
  <script type="text/javascript">
    var circuit = JSON.parse(circuitString);
    if (typeof qviz != 'undefined' && typeof circuit != undefined) {{
      document.getElementById('msg').style.display = 'none';
      var displayDiv = document.getElementById('circuit_div');
      if (displayDiv != null) {{
        qviz.draw(circuit, displayDiv, qviz.STYLES['Default']);
      }}
    }}
  </script>

</body>
</html>
"""
SUFFIX = "_qviz.html"


def display(circuit: QuantumCircuit) -> str:
    json_str = qiskit2json(circuit)
    with tempfile.NamedTemporaryFile(suffix=SUFFIX, delete=False) as f:
        Path(f.name).write_text(HTML_TEMPLATE.format(json_str))
        print(f.name)
        webbrowser.open(f"file://{f.name}")
    return json_str


if __name__ == "__main__":
    from qiskit.circuit.random import random_circuit

    qc = random_circuit(6, 10)
    print(qc.draw())
    display(qc)

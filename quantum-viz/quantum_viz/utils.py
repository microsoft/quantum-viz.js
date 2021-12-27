# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
import json
import tempfile
import warnings
import webbrowser
from pathlib import Path
from typing import Any
from typing import Dict
from typing import Optional
from typing import TYPE_CHECKING
from typing import Union

if TYPE_CHECKING:
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
  <script src="https://unpkg.com/@microsoft/quantum-viz.js{0}"></script>
  <script type="text/javascript">
  var circuitString = `{1}
  `;
  </script>
  <script type="text/javascript">
    var circuit = JSON.parse(circuitString);
    if (typeof qviz != 'undefined' && typeof circuit != undefined) {{
      document.getElementById('msg').style.display = 'none';
      var displayDiv = document.getElementById('circuit_div');
      if (displayDiv != null) {{
        qviz.draw(circuit, displayDiv, qviz.STYLES['{2}']);
      }}
    }}
  </script>

</body>
</html>
"""
SUFFIX = "_qviz.html"
STYLES = ("Default", "BlackAndWhite", "Inverted")  # Use Literal type in python 3.8


def display(
    circuit: Union[Dict[str, Any], "QuantumCircuit"],
    filename: Union[str, Path, None] = None,
    style: str = "Default",
    version: Optional[str] = None,
    **kwargs,
) -> None:

    if filename is None:
        file = tempfile.NamedTemporaryFile(suffix=SUFFIX, delete=False)
        file.close()
        path = Path(file.name)
    else:
        path = Path(filename)

    if style not in STYLES:
        warnings.warn(
            f"The selected style '{style}' is not supported and will be ignored.\n"
            f"The supported styles are {STYLES}"
        )

    if version is None:
        version = ""  # Use the latest version
    else:
        version = "@" + version

    if isinstance(circuit, dict):
        qviz_json = json.dumps(circuit, indent=kwargs.get("indent", 2))
    else:
        from quantum_viz.qiskit_parser import qiskit2json

        qviz_json = qiskit2json(circuit, **kwargs)

    html = HTML_TEMPLATE.format(version, qviz_json, style)
    path.write_text(html)
    webbrowser.open(f"file://{path.absolute()}")

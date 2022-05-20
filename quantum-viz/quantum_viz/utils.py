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

from .widget import DEFAULT_STYLE
from .widget import Style

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
    var circuit = {1};
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

STYLES = list(Style)


class UnsupportedStyleWarning(UserWarning):
    """A warning raised when an unsupported style is chosen."""


def display(
    circuit: Union[Dict[str, Any], "QuantumCircuit"],
    filename: Union[str, Path, None] = None,
    style: Style = DEFAULT_STYLE,
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
            f"The supported styles are {STYLES}",
            UnsupportedStyleWarning,
        )

    if version is None:
        version = ""  # Use the latest version
    else:
        version = "@" + version

    if not isinstance(circuit, dict):
        from .qiskit_parser import qiskit2dict

        circuit = qiskit2dict(circuit, **kwargs)

    qviz_json = json.dumps(circuit)

    html = HTML_TEMPLATE.format(version, qviz_json, style)
    path.write_text(html)
    webbrowser.open(f"file://{path.absolute()}")

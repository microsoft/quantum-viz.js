# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
"""quantum-viz Viewer is a Jupyter Widget that displays the quantum-viz.js circuit
visualizer.
"""  # noqa: D400, D205
import json
import uuid
from enum import Enum
from typing import Any
from typing import Dict
from typing import List
from typing import Optional

from IPython.display import display
from IPython.display import HTML
from varname import varname
from varname.utils import ImproperUseError

# The default quantum-viz.js version to use.
VERSION = "1.0.2"
# Rel file path for Javascript source
JS_SOURCE = "qviz.min"
BASE_URL = "https://unpkg.com/@microsoft/quantum-viz.js{version_suffix}/dist"


class Style(str, Enum):
    """Supported styles for the quantum-viz.js widget."""

    DEFAULT = "Default"
    BNW = "BlackAndWhite"
    INV = "Inverted"


DEFAULT_STYLE = Style.DEFAULT

_HTML_STR_FORMAT = """
<script type="text/javascript">
require.config({{
    paths: {{
        qviz: '{base_url}/{js_source}'
    }}
}});
require(['qviz'], function(qviz) {{
    const circuit = {data};
    const targetDiv = document.getElementById('JSApp_{uid}');
    if (targetDiv != null) {{
        qviz.draw(circuit, targetDiv, qviz.STYLES['{style}']);
    }}
}});
</script>
<div id="JSApp_{uid}"></div>
<div id="msg"></div>
"""


class Viewer:
    """Jupyter widget for displaying Quantum-viz quantum circuit."""

    n = 0

    def __init__(
        self,
        circuit: Dict[str, Any],
        version: Optional[str] = VERSION,
        style: Style = DEFAULT_STYLE,
        width: int = 400,
        height: int = 350,
    ):
        """
        Create Viewer instance.

        :param circuit: Quantum circuit
        :type circuit: dict
        :param width: Widget width in pixels, defaults to 400
        :type width: int, optional
        :param height: Widget height in pixels, defaults to 350
        :type height: int, optional
        """
        try:
            self.name = varname()
        except ImproperUseError:
            self.name = "_"

        if not isinstance(circuit, dict):
            from .qiskit_parser import qiskit2dict, QuantumCircuit

            if not isinstance(circuit, QuantumCircuit):
                raise TypeError(
                    f"Received a circuit of an unsupported type: {type(circuit)}"
                )
            circuit = qiskit2dict(circuit)

        self.width = width
        self.height = height
        self.value = json.dumps(circuit)
        self.base_url = self._get_base_url(version)
        self.style = style
        self._uids: List[str] = []

    @staticmethod
    def _get_base_url(version: Optional[str]) -> str:
        if version is None:
            version_suffix = ""  # Use the latest version
        else:
            version_suffix = f"@{version}"
        return BASE_URL.format(version_suffix=version_suffix)

    def _gen_uid(self) -> str:
        """Generate unique identifier for javascript applet. Returns UID."""
        uid = str(uuid.uuid1()).replace("-", "")
        # Keep track of all UIDs
        self._uids.append(uid)
        return uid

    def html_str(self, uid: Optional[str] = None) -> str:
        """Return an HTML string that contains the widget.

        :param uid: Unique identifier of widget
        :type uid: str or None
        :return: HTML string for displaying widget
        :rtype: str
        """
        if uid is None:
            uid = self._gen_uid()
        Viewer.n += 1
        return _HTML_STR_FORMAT.format(
            base_url=self.base_url,
            js_source=JS_SOURCE,
            uid=uid,
            data=self.value,
            style=self.style,
        )

    def _ipython_display_(self) -> None:
        """Display the widget with IPython."""
        viewer = HTML(self.html_str())
        display((viewer,))

    def browser_display(self) -> None:
        """Display the widget in the browser."""
        raise NotImplementedError

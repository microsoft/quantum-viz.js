# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
"""quantum-viz Viewer is a Jupyter Widget that displays the quantum-viz.js circuit
visualizer.
"""  # noqa: D400, D205
import uuid
from typing import Any
from typing import Dict
from typing import List
from typing import Union

from IPython.core.display import display
from IPython.core.display import HTML
from varname import varname
from varname.utils import ImproperUseError

# Rel file path for Javascript source
JS_SOURCE = "qviz.min"
BASE_URL = "https://unpkg.com/@microsoft/quantum-viz.js@1.0.2/dist"

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
        qviz.draw(circuit, targetDiv, qviz.STYLES['Default']);
    }}
}});
</script>
<div id="JSApp_{uid}"></div>
<div id="msg"></div>
"""


class Viewer:
    """Jupyter widget for displaying Quantum-viz quantum circuit."""

    n = 0

    def __init__(self, circuit: Union[Dict[str, Any], "QuantumCircuit"], width: int = 400, height: int = 350):
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
            from .qiskit_parser import qiskit2dict
            circuit = qiskit2dict(circuit)

        self.width = width
        self.height = height
        self.value = json.dumps(circuit)
        self._uids: List[str] = []

    def _gen_uid(self) -> str:
        """Generate unique identifier for javascript applet. Returns UID."""
        uid = str(uuid.uuid1()).replace("-", "")
        # Keep track of all UIDs
        self._uids.append(uid)
        return uid

    def html_str(self, uid: str) -> str:
        """Return an HTML string that contains the widget.

        :param uid: Unique identifier of widget
        :type uid: str
        :return: HTML string for displaying widget
        :rtype: str
        """
        Viewer.n += 1
        return _HTML_STR_FORMAT.format(
            base_url=BASE_URL, js_source=JS_SOURCE, uid=uid, data=self.value
        )

    def _ipython_display_(self) -> None:
        """Display the widget."""
        uid = self._gen_uid()
        viewer = HTML(self.html_str(uid=uid))
        display(viewer)

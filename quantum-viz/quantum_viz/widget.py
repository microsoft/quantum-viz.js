# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
"""
QViz.

Module for Jupyter Widget that displays the quantum-viz.js
circuit visualizer.
"""
import uuid
from typing import Any
from typing import Dict
from typing import List

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
    function renderQuantumProgram(program) {{
        const targetDiv = document.getElementById('JSApp_{uid}');
        if (targetDiv != null) {{
            qviz.draw(program, targetDiv, qviz.STYLES['Default']);
        }}
    }}
    const data = {data};
    renderQuantumProgram(data);
}});
</script>
<div id="JSApp_{uid}"></div>
<div id="msg"></div>
"""


class QViz:
    """Jupyter widget for displaying Quantum-viz quantum circuit."""

    n = 0

    def __init__(self, program: Dict[str, Any], width: int = 400, height: int = 350):
        """
        Create QViz instance.

        :param program: Quantum program
        :type program: dict
        :param width: Widget width in pixels, defaults to 400
        :type width: int, optional
        :param height: Widget height in pixels, defaults to 350
        :type height: int, optional
        """
        try:
            self.name = varname()
        except ImproperUseError:
            self.name = "_"

        self.width = width
        self.height = height
        self.value = program
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
        QViz.n += 1
        return _HTML_STR_FORMAT.format(
            base_url=BASE_URL, js_source=JS_SOURCE, uid=uid, data=self.value
        )

    def _ipython_display_(self) -> None:
        """Display the widget."""
        uid = self._gen_uid()
        qviz = HTML(self.html_str(uid=uid))
        display(qviz)

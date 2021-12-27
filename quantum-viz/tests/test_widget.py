from unittest.mock import patch

import pytest
from quantum_viz.widget import Viewer


@pytest.fixture
def circuit():
    circuit = {
        "qubits": [{"id": 0}, {"id": 1, "numChildren": 1}],
        "operations": [
            {
                "gate": "H",
                "targets": [{"qId": 0}],
            },
            {
                "gate": "X",
                "isControlled": "True",
                "controls": [{"qId": 0}],
                "targets": [{"qId": 1}],
            },
            {
                "gate": "Measure",
                "isMeasurement": "True",
                "controls": [{"qId": 1}],
                "targets": [{"type": 1, "qId": 1, "cId": 0}],
            },
        ],
    }
    return circuit


def test_widget(circuit):
    widget = Viewer(circuit=circuit)
    assert widget
    with patch("quantum_viz.widget.display") as display:
        widget._ipython_display_()
        display.assert_called_once()
        assert (
            widget.html_str("test")
            == """\
\n<script type=\"text/javascript\">\
\nrequire.config({\
\n    paths: {\
\n        qviz: 'https://unpkg.com/@microsoft/quantum-viz.js@1.0.2/dist/qviz.min'\
\n    }\
\n});\
\nrequire(['qviz'], function(qviz) {\
\n    const circuit = {"qubits": [{"id": 0}, {"id": 1, "numChildren": 1}], "operations": [{"gate": "H", "targets": [{"qId": 0}]}, {"gate": "X", "isControlled": "True", "controls": [{"qId": 0}], "targets": [{"qId": 1}]}, {"gate": "Measure", "isMeasurement": "True", "controls": [{"qId": 1}], "targets": [{"type": 1, "qId": 1, "cId": 0}]}]};\
\n    const targetDiv = document.getElementById('JSApp_test');\
\n    if (targetDiv != null) {\
\n        qviz.draw(circuit, targetDiv, qviz.STYLES['Default']);\
\n    }\
\n});\
\n</script>\
\n<div id=\"JSApp_test\"></div>\
\n<div id=\"msg\"></div>\
\n"""
        )


def test_widget_no_varname(circuit):
    Viewer(circuit=circuit)

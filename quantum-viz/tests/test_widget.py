# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
from unittest.mock import patch

import pytest
from quantum_viz.widget import Viewer
from tests.conftest import simple_qc


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
    widget = Viewer(circuit=circuit)
    assert widget


def test_widget_qiskit(simple_qc):
    widget = Viewer(circuit=simple_qc)
    assert widget

    html = widget.html_str("simple_qc_widget")
    assert html.index("qviz.draw(circuit, targetDiv") > 0
    assert (
        html.index("targetDiv = document.getElementById('JSApp_simple_qc_widget');") > 0
    )
    assert html.index("const circuit = {") > 0


def test_widget_no_version(circuit):
    widget = Viewer(circuit=circuit, version=None)
    assert widget

    html = widget.html_str("_widget_")
    assert html.index("qviz.draw(circuit, targetDiv") > 0
    assert html.index("targetDiv = document.getElementById('JSApp__widget_');") > 0
    assert html.index("""https://unpkg.com/@microsoft/quantum-viz.js""") > 0

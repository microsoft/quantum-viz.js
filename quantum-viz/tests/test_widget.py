import pytest

from unittest.mock import patch
from quantum_viz.widget import QViz


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
    widget = QViz(circuit=circuit)
    assert widget
    with patch("quantum_viz.widget.display") as display:
        widget._ipython_display_()
        display.assert_called_once()


def test_widget_no_varname(circuit):
    QViz(circuit=circuit)

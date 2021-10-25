import pytest

from unittest.mock import patch
from quantum_viz.widget import QViz


@pytest.fixture
def program():
    program = {
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
    return program


def test_widget(program):
    widget = QViz(program=program)
    assert widget
    with patch("quantum_viz.widget.display") as display:
        widget._ipython_display_()
        display.assert_called_once()


def test_widget_no_varname(program):
    QViz(program=program)

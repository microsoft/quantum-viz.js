import pytest
from quantum_viz.widget import QuantumVizWidget


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
    widget = QuantumVizWidget(program=program)
    assert widget
    widget._ipython_display_()


def test_widget_no_varname(program):
    QuantumVizWidget(program=program)

# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
from unittest.mock import patch

import pytest
import os

from pathlib import Path
from quantum_viz.utils import _create_file
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


def test_create_file(circuit):
    path = _create_file(circuit)
    assert path.exists()

    content = path.read_text()
    assert content.startswith("<!DOCTYPE html>")
    assert content.index("var circuit = {") > 0
    assert content.index("qviz.draw(circuit") > 0

    os.remove(path)

def test_create_file_with_path(circuit):
    import tempfile
    fd, original_path = tempfile.mkstemp(suffix=".html")
    print(original_path)
    path = _create_file(circuit, original_path)
    assert path.exists()
    assert path.absolute() == Path(original_path).absolute()

    content = path.read_text()
    assert content.startswith("<!DOCTYPE html>")
    assert content.index("""https://unpkg.com/@microsoft/quantum-viz.js""") > 0
    assert content.index("var circuit = {") > 0
    assert content.index("qviz.draw(circuit") > 0

    os.close(fd)
    os.remove(original_path)

def test_create_file_with_version(circuit):
    path = _create_file(circuit, version="1.2.3.4")
    assert path.exists()

    content = path.read_text()
    assert content.startswith("<!DOCTYPE html>")
    assert content.index("https://unpkg.com/@microsoft/quantum-viz.js@1.2.3.4") > 0

    os.remove(path)

def test_create_file_with_qiskit(simple_qc):
    path = _create_file(simple_qc)
    assert path.exists()

    content = path.read_text()
    assert content.startswith("<!DOCTYPE html>")
    assert content.index("var circuit = {") > 0

    os.remove(path)
    
def test_create_file_with_invalid_style(circuit):
    path = _create_file(circuit, style="invalid")
    assert path.exists()

    content = path.read_text()
    assert content.startswith("<!DOCTYPE html>")
    assert content.index("var circuit = {") > 0
    assert content.index("qviz.STYLES['invalid']") > 0

    os.remove(path)

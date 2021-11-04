import json
from pathlib import Path
from quantum_viz.qiskit_parser import qiskit2dict

import pytest
from conftest import *  # noqa: F403


def _get_saved_dict(qc) -> str:
    with open(qc_to_path(qc)) as fp:
        return json.load(fp)


@pytest.mark.parametrize(
    "qc",
    [
        empty_qc(),
        no_ops_qc(),
        no_ops_regs_qc(),
        simple_qc(),
        conditioned_ops_qc(),
        parametrized_qc(),
    ],
)
def test_qviz_dict(qc):
    assert qiskit2dict(qc) == _get_saved_dict(qc)

import json

from quantum_viz.qiskit_parser import qiskit2dict
from tests.conftest import *  # noqa: F403


def _get_saved_dict(qc) -> str:
    with open(qc_to_path(qc)) as fp:
        return json.load(fp)


def test_qviz_dict(
    empty_qc, no_ops_qc, no_ops_regs_qc, simple_qc, parametrized_qc, conditioned_ops_qc
) -> None:
    for circuit in [
        empty_qc,
        no_ops_qc,
        no_ops_regs_qc,
        simple_qc,
        parametrized_qc,
        conditioned_ops_qc,
    ]:
        assert qiskit2dict(circuit) == _get_saved_dict(circuit)

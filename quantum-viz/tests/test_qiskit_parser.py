# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
import json

from quantum_viz.qiskit_parser import qiskit2dict
from tests.conftest import *  # noqa: F403


def _get_snapshot(qc) -> str:
    """
    gets the snapshoft of the dictionary created by qiskit2dict

    if a snapshot of the circuit is not found, then
    one is automatically created and returned.
    """
    path = qc_to_path(qc)
    if path.exists():
        with open(path, "r") as fp:
            return json.load(fp)
    else:
        result = qiskit2dict(qc)
        path.write_text(json.dumps(result, indent=2))
        return result


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
        assert qiskit2dict(circuit) == _get_snapshot(circuit)

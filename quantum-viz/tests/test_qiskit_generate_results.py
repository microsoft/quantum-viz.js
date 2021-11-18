from quantum_viz.qiskit_parser import qiskit2json
from quantum_viz.utils import display

from .conftest import qc_to_path


def test_generate_results(
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
        display(circuit)
        qc_to_path(circuit).write_text(qiskit2json(circuit))

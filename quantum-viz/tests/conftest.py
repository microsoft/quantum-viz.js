from pathlib import Path

import pytest
import qiskit
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister, AncillaRegister

from quantum_viz.qiskit_parser import qiskit2json
from quantum_viz.utils import display


def qc_to_path(qc: QuantumCircuit) -> Path:
    return Path(__file__).parent / f"resources/{qc.name}.json"


def empty_qc(name="empty_circ") -> QuantumCircuit:
    return QuantumCircuit(name=name)


def no_ops_qc(name="no_ops_qc") -> QuantumCircuit:
    return QuantumCircuit(4, 3, name=name)


def no_ops_regs_qc(name="no_ops_regs_qc") -> QuantumCircuit:
    qreg1 = QuantumRegister(6, "q1")
    qreg2 = QuantumRegister(6, "q2")
    creg = ClassicalRegister(2, "c")
    areg = AncillaRegister(4, "aux")
    return QuantumCircuit(qreg1, qreg2, creg, areg, name=name)


def test_generate_results() -> None:
    for qc in [empty_qc(), no_ops_qc(), no_ops_regs_qc()]:
        display(qc)
        qc_to_path(qc).write_text(qiskit2json(qc))


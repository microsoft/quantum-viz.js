import pytest

from qiskit import AncillaRegister
from qiskit import ClassicalRegister
from qiskit import QuantumCircuit
from qiskit import QuantumRegister
from qiskit.circuit import Parameter

from pathlib import Path


def qc_to_path(qc: QuantumCircuit) -> Path:
    return Path(__file__).parent / f"resources/{qc.name}.json"


@pytest.fixture()
def empty_qc(name: str = "empty_circ") -> QuantumCircuit:
    return QuantumCircuit(name=name)


@pytest.fixture()
def no_ops_qc(name: str = "no_ops_qc") -> QuantumCircuit:
    return QuantumCircuit(4, 3, name=name)


@pytest.fixture()
def no_ops_regs_qc(name: str = "no_ops_regs_qc") -> QuantumCircuit:
    qreg1 = QuantumRegister(6, "q1")
    qreg2 = QuantumRegister(6, "q2")
    creg = ClassicalRegister(2, "c")
    areg = AncillaRegister(4, "aux")
    return QuantumCircuit(qreg1, qreg2, creg, areg, name=name)


@pytest.fixture()
def simple_qc(name: str = "simple_qc") -> QuantumCircuit:
    num_qubits = 5
    num_clbits = 3
    qc = QuantumCircuit(num_qubits, num_clbits, name=name)
    qc.h(range(num_qubits))
    qc.cswap(2, 1, 3)
    qc.barrier()
    qc.sxdg(0)
    qc.measure([3], [0])
    qc.barrier()
    qc.reset([4])
    return qc


@pytest.fixture()
def parametrized_qc(name: str = "parametrized_qc") -> QuantumCircuit:
    qc = QuantumCircuit(4, name=name)
    theta = Parameter("θ")
    qc.cu(theta, 1.040599, 0, 2, control_qubit=3, target_qubit=1)
    return qc


@pytest.fixture()
def conditioned_ops_qc(name: str = "conditioned_ops_qc") -> QuantumCircuit:
    cregs = [ClassicalRegister(1) for _ in range(2)]
    q = QuantumRegister(3)
    qc = QuantumCircuit(q, name=name)
    for register in cregs:
        qc.add_register(register)
    qc.h(q)
    qc.measure([q[0]], cregs[0])
    qc.x(q[0]).c_if(cregs[0], 1)
    qc.measure([q[1]], cregs[1])
    qc.reset([2])
    qc.barrier()
    qc.measure_all()
    return qc

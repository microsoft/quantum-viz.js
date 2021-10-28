import json
from typing import Dict
from typing import List
from typing import Optional

try:
    import qiskit
except ImportError:
    raise ImportError(
        '`qiskit` was not found, try to `pip install "quantum-viz[qiskit]"`'
    )

from qiskit.circuit import QuantumCircuit, QuantumRegister, Qubit, Clbit
from qiskit.circuit.instruction import Instruction
from qiskit.circuit.gate import Gate
from qiskit.circuit.controlledgate import ControlledGate
from qiskit.circuit.measure import Measure
from qiskit.circuit.barrier import Barrier


def qiskit2json(circ: qiskit.QuantumCircuit, indent=2) -> str:
    return json.dumps(qiskit2dict(circ), indent=indent)


def qiskit2dict(circ: qiskit.QuantumCircuit) -> dict:
    return QiskitCircuitParser(circ).qviz_dict


class QiskitCircuitParser:
    QUBITS_KEY = "qubits"
    OPERATIONS_KEY = "operations"
    UPPERCASE = ["x", "y", "z", "h", "s", "t", "swap"]
    CAPITALIZE = ["rx", "ry", "rz", "id", "rzz", "u1", "u2", "u3", "tdg", "sdg"]

    def __init__(self, circuit: QuantumCircuit, precision=2) -> None:
        self.qc: QuantumCircuit = circuit
        self.precision = precision
        self.qviz_dict: dict = {
            self.QUBITS_KEY: [],
            self.OPERATIONS_KEY: [],
        }
        self.qubit2id: Dict[Qubit, int] = dict()
        self.init_qubits()
        self.update_qviz_dict()

    def init_qubits(self) -> None:
        qubits = self.qc.qubits + self.qc.ancillas
        num_qubits = self.qc.num_qubits + self.qc.num_ancillas
        qubits_range = range(num_qubits)
        self.qubit2id = dict(zip(qubits, qubits_range))
        self.qviz_dict[self.QUBITS_KEY] += [{"id": i} for i in qubits_range]

    def update_qviz_dict(self) -> None:
        qc = self.qc
        self.qviz_dict[self.OPERATIONS_KEY] += [
            {
                "gate": qc.name,
                "children": [
                    self.parse_operation(instruction, qargs, cargs)
                    for instruction, qargs, cargs in qc.data
                ],
                "targets": [
                    {"qId": self.qubit2id[qubit]} for qubit in qc.qubits + qc.ancillas
                ],
            }
        ]

    def parse_operation(
        self, instruction: Instruction, qargs: List[Qubit], cargs: List[Clbit]
    ) -> Optional[Dict]:
        if isinstance(instruction, Barrier):
            raise NotImplementedError

        op_dict = {"gate": instruction.name}

        if instruction.params:
            f"({', '.join(map('{:.2f}'.format, instruction.params))})"
            mapper = map(f"{{:.{self.precision}f}}".format, instruction.params)
            op_dict["displayArgs"] = f"({', '.join(mapper)})"

        if isinstance(instruction, Measure):
            if len(qargs) != 1 or len(cargs) != 1:
                raise ValueError
            qubit = qargs[0]
            clbit = cargs[0]  # TODO: add it to "qubits"
            q_id = self.qubit2id[qubit]
            op_dict["isMeasurement"] = True
            op_dict["controls"] = [{"qId": q_id}]
            op_dict["targets"] = [{"qId": q_id, "cId": 0}]
            # TODO: update the clbit information in the "qubits"

        if isinstance(instruction, ControlledGate):
            ctrl_state = instruction.ctrl_state
            if not all([int(c) for c in str(ctrl_state)]):
                raise NotImplementedError(
                    f"The controlled gate {instruction} is controlled by a state that "
                    f"is not all 1's: {ctrl_state}"
                )
            num_ctrl_qubits = instruction.num_ctrl_qubits
            ctrl_qubits = qargs[:num_ctrl_qubits]
            target_qubits = qargs[num_ctrl_qubits:]
            op_dict["isControlled"] = True
            op_dict["gate"] = instruction.base_gate.name
            op_dict["controls"] = [
                {"qId": self.qubit2id[qubit]} for qubit in ctrl_qubits
            ]
            op_dict["targets"] = [
                {"qId": self.qubit2id[qubit]} for qubit in target_qubits
            ]
        else:
            op_dict["targets"] = [{"qId": self.qubit2id[qubit]} for qubit in qargs]
        # + [{"cId": self.qubit2id[clbit]} for clbit in cargs]
        name = op_dict["gate"]
        if name in self.UPPERCASE:
            op_dict["gate"] = name.upper()
        elif name in self.CAPITALIZE:
            op_dict["gate"] = name.capitalize()
        return op_dict

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
    qbitCount = (
        circ.num_qubits + circ.num_ancillas
    )  # Number of qubits and ancilla bits in Qiskit
    clbitCount = circ.num_clbits  # Number of Classical Bits
    print(circ.parameters)
    circ_dict = {"qubits": [], "operations": []}

    qubits = []
    operations = []
    ignore = ["barrier"]  # Terms in Qiskit that don't translate to QuantumViz

    # Add an id number for each qbit
    for i in range(qbitCount):
        qubits.append({"id": i})

    # print(quantumCircut.h(0).label)

    # Loop through each of the elements of the circuit.
    # Each element of quantumCircuit.data basically corresponds to the function call used to create that element and appears sequentially
    # https://qiskit.org/documentation/stubs/qiskit.circuit.QuantumCircuit.html#qiskit.circuit.QuantumCircuit.data
    for qc in circ.data:

        isMeasurement = "false"
        isConditional = "false"
        out = {}

        # Each different type of gate has a different structure that needs to be parsed (measurement, control, etc).
        # print(qc)

        instruction = qc[0].name
        print(qc[0])
        # print("Gate " + qc[0].name)
        out["gate"] = instruction.upper()

        # Make sure it is something supported by QuantumViz
        if instruction not in ignore:

            out["controls"] = []
            out["targets"] = []
            controlOut = {}

            # Last element of the array in the first element of qc is the target
            qbitTarget = qc[1][-1].index

            # Add isMeasurement key for when it is measurement gate.
            if instruction == "measure":
                out["isMeasurement"] = "true"
                out["controls"].append({"qId": qbitTarget})

            # Is a control qubit if the array has more than one element.
            # Example:
            #
            # For a Qiskit command to create a controlled X Gate in ancilla 0 tied to quantum registers 0, 1, 2:
            # qc.cx(qr[0:3], anc[0])
            # You may get an element such as the following in qc[1][0]:
            # [Qubit(QuantumRegister(3, 'q'), 0), Qubit(QuantumRegister(1, 'ancilla'), 0)]
            # The index is the qbit that is controlled by the target. The target in this case being ancilla bit 0 and the controlled one being the 0th element
            # of the 3 Quantum Registers available.

            if len(qc[1]) > 1:

                out["isControlled"] = "true"
                print(qc[1])
                for i in range(len(qc[1]) - 1):
                    qbitControlled = qc[1][i].index
                    print(qc[1][i])
                    print(qbitControlled)
                    if qc[1][i].register.name == "ancilla":
                        qbitControlled = qbitControlled + circ.num_qubits - 1

                    controlOut["type"] = 0
                    controlOut["qId"] = qbitControlled

                    out["controls"].append(controlOut.copy())
                    controlOut.clear()

            if qc[1][-1].register.name == "ancilla":
                qbitTarget = qbitTarget + circ.num_qubits - 1

            out["targets"].append({"qId": qbitTarget})

            # print(out)
            operations.append(out.copy())  # Add instruction dict to output array
            # Clear temporary dict for next loop
            out.clear()

    circ_dict["qubits"] = qubits
    circ_dict["operations"] = operations
    return circ_dict


class QiskitCircuitParser:
    QUBITS_KEY = "qubits"
    OPERATIONS_KEY = "operations"

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
            op_dict["isMeasurement"] = 1
            op_dict["controls"] = {"qId": q_id}
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
        return op_dict

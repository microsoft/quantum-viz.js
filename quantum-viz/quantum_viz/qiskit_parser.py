# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
"""This module provides methods to serialize a Qiskit circuit into a qviz dictionary."""  # noqa: B950
from enum import IntEnum
from typing import Dict
from typing import Iterator
from typing import List
from typing import Optional
from typing import Tuple
from typing import Type
from typing import Union

try:
    import qiskit  # noqa: F401
except ImportError as e:
    raise ImportError(
        '`qiskit` was not found, try to `pip install "quantum-viz[qiskit]"`'
    ) from e

from qiskit.circuit import QuantumCircuit, Qubit, Clbit, ClassicalRegister
from qiskit.circuit.instruction import Instruction
from qiskit.circuit.controlledgate import ControlledGate
from qiskit.circuit.measure import Measure
from qiskit.circuit.barrier import Barrier
from qiskit.circuit.reset import Reset
from qiskit.circuit.parameter import Parameter
from qiskit.circuit.library import (
    IGate,
    XGate,
    YGate,
    ZGate,
    HGate,
    UGate,
    U1Gate,
    U2Gate,
    U3Gate,
    PhaseGate,
    RGate,
    SwapGate,
    RXGate,
    RYGate,
    RZGate,
    RXXGate,
    RYYGate,
    RZXGate,
    RZZGate,
    iSwapGate,
    DCXGate,
    SGate,
    SdgGate,
    TGate,
    TdgGate,
    SXGate,
    SXdgGate,
)
from qiskit.circuit.quantumcircuitdata import QuantumCircuitData

INSTRUCTION_TYPE_TO_NAME: Dict[Type[Instruction], str] = {
    IGate: "I",
    XGate: "X",
    YGate: "Y",
    ZGate: "Z",
    HGate: "H",
    UGate: "U",
    U1Gate: "U1",
    U2Gate: "U2",
    U3Gate: "U3",
    PhaseGate: "P",
    RGate: "R",
    SwapGate: "SWAP",
    RXGate: "Rx",
    RYGate: "Ry",
    RZGate: "Rz",
    RXXGate: "Rxx",
    RYYGate: "Ryy",
    RZXGate: "Rzx",
    RZZGate: "Rzz",
    iSwapGate: "Iswap",
    DCXGate: "Dcx",
    SGate: "S",
    SdgGate: "Sdg",
    TGate: "T",
    TdgGate: "Tdg",
    SXGate: "√X",
    SXdgGate: "√Xdg",
    Measure: "measure",
}

X_GATE_NAME = INSTRUCTION_TYPE_TO_NAME[XGate]
MEASURE_NAME = INSTRUCTION_TYPE_TO_NAME[Measure]


class RegisterType(IntEnum):  # noqa: D101
    QUBIT = 0
    CLASSICAL = 1


class ConditionalRender(IntEnum):  # noqa: D101
    ALWAYS = 0
    ON_ZERO = 1
    ON_ONE = 2
    AS_GROUP = 3


def qiskit2dict(circ: QuantumCircuit, **kwargs) -> Dict[str, List]:
    """Convert a Qiskit circuit to a qviz dictionary."""
    return QiskitCircuitParser(circ, **kwargs).qviz_dict


class QiskitCircuitParser:
    """This class parses a Qiskit circuit into a qviz dictionary."""

    QUBITS_KEY = "qubits"
    OPERATIONS_KEY = "operations"

    def __init__(
        self,
        circuit: QuantumCircuit,
        precision: int = 2,
        max_recursion_depth: Optional[int] = None,
        skip_barriers: bool = True,
    ) -> None:
        """
        Create a QiskitCircuitParser object.

        :param circuit: qiskit quantum circuit to be parsed
        :param precision: the decimal precision of float gate parameters to display
        :param max_recursion_depth: the maximal recursion depth to parse, if None -
          parse until the basis gates are reached
        :param skip_barriers: whether to omit barriers in the output or not
        """
        self.qc = circuit
        self.precision = precision
        self.max_recursion_depth = max_recursion_depth
        self.skip_barriers = skip_barriers
        self.qviz_dict: Dict[str, List] = {
            self.QUBITS_KEY: [],
            self.OPERATIONS_KEY: [],
        }
        self.qubit2id: Dict[Qubit, int] = dict()
        self._init_qubits()
        self._clbit2id: Dict[Clbit, Tuple[int, int]] = dict()
        self._update_qviz_dict()

    def _init_qubits(self) -> None:
        qubits_range = range(self.qc.num_qubits)
        self.qubit2id = dict(zip(self.qc.qubits, qubits_range))
        self.qubits = [{"id": i} for i in qubits_range]

    @property
    def qubits(self) -> List[Dict[str, int]]:
        """Get the list of qubits used by the circuit."""
        return self.qviz_dict[self.QUBITS_KEY]
        return self.qviz_dict[self.QUBITS_KEY]

    @qubits.setter
    def qubits(self, value: List[Dict[str, int]]) -> None:
        self.qviz_dict[self.QUBITS_KEY] = value

    @property
    def operations(self) -> List[Dict]:
        """Get the list of operations used by the circuit."""
        return self.qviz_dict[self.OPERATIONS_KEY]

    @operations.setter
    def operations(self, value: List[Dict]) -> None:
        self.qviz_dict[self.OPERATIONS_KEY] = value

    def _get_qubit_def(self, qubit: Qubit) -> Dict[str, int]:
        return {"qId": self.qubit2id[qubit]}

    def _get_qubit_list_def(self, qubits: List[Qubit]) -> List[Dict[str, int]]:
        return [self._get_qubit_def(qubit) for qubit in qubits]

    def _get_clbit_def(
        self, clbit: Clbit, qubit: Optional[Qubit] = None
    ) -> Dict[str, int]:
        if clbit in self._clbit2id:
            q_id, c_id = self._clbit2id[clbit]
        else:
            if qubit is None:
                raise NotImplementedError(
                    "A classical bit has to defined first as a measurement result of a "
                    "qubit"
                )
            q_id = self.qubit2id[qubit]
            c_id = self.qubits[q_id].get("numChildren", 0)
            self.qubits[q_id]["numChildren"] = c_id + 1
            self._clbit2id[clbit] = (q_id, c_id)
        return {"type": RegisterType.CLASSICAL.value, "qId": q_id, "cId": c_id}

    def _update_qviz_dict(self) -> None:
        qc = self.qc
        self.operations += [
            {
                "gate": qc.name,
                "targets": self._get_qubit_list_def(qc.qubits),
            }
        ]
        for instruction, qargs, cargs in self._filter_circuit_data(qc.data):
            self.operations[0]["children"] = self.operations[0].get("children", []) + [
                self._parse_operation(instruction, qargs, cargs, depth=1)
            ]

    def _filter_circuit_data(self, data: QuantumCircuitData) -> Iterator:
        if self.skip_barriers:
            # check whether the instruction is not a barrier
            return filter(lambda elem: not isinstance(elem[0], Barrier), data)
        return data

    def _is_recursion_depth_exceeded(self, depth: int) -> bool:
        return self.max_recursion_depth is not None and depth > self.max_recursion_depth

    def _parse_operation(
        self,
        instruction: Instruction,
        qargs: List[Qubit],
        cargs: List[Clbit],
        depth: int,
    ) -> Dict:

        op_dict: Dict = {"gate": self._get_instruction_name(instruction)}

        if instruction.params:
            self._add_params(op_dict, instruction)

        if isinstance(instruction, Reset):
            self._add_reset(op_dict, qubit=qargs[0], depth=depth)
        elif isinstance(instruction, Measure):
            self._add_measure(op_dict, qargs, cargs)
        elif isinstance(instruction, ControlledGate):
            # a controlled gate may change the gate name (i.e. CX -> X)
            self._add_controlled_gate(op_dict, instruction, qargs)
        else:
            op_dict["targets"] = self._get_qubit_list_def(qargs)

        self._add_children(op_dict, instruction, qargs, cargs, depth)

        if instruction.condition:
            # _update_condition must update op_dict last (after any other method)
            op_dict = self._update_condition(op_dict, instruction)

        return op_dict

    def _add_children(
        self,
        op_dict: Dict,
        instruction: Instruction,
        qargs: List[Qubit],
        cargs: List[Clbit],
        depth: int,
    ) -> None:
        if (instruction.definition is not None) and (
            not self._is_recursion_depth_exceeded(depth + 1)
        ):
            sub_circuit: QuantumCircuit = instruction.definition
            # Since the `index` property of bits is deprecated - create mappers between
            # the bits and their indices in the circuit.
            # Use the builtin `QuantumCircuit.find_bit` method when it is released
            qubits_mapper = dict(zip(sub_circuit.qubits, range(sub_circuit.num_qubits)))
            clbits_mapper = dict(zip(sub_circuit.clbits, range(sub_circuit.num_clbits)))
            for sub_instruction, sub_qargs, sub_cargs in self._filter_circuit_data(
                sub_circuit.data
            ):
                # Update the args to those of the containing circuit
                sub_qargs = [qargs[qubits_mapper[qubit]] for qubit in sub_qargs]
                sub_cargs = [cargs[clbits_mapper[clbit]] for clbit in sub_cargs]
                op_dict["children"] = op_dict.get("children", []) + [
                    self._parse_operation(
                        sub_instruction, sub_qargs, sub_cargs, depth=depth + 1
                    )
                ]

    def _add_controlled_gate(
        self, op_dict: Dict, cgate: ControlledGate, qargs: List[Qubit]
    ) -> None:
        ctrl_state = cgate.ctrl_state
        if not all([int(c) for c in str(ctrl_state)]):
            raise NotImplementedError(
                f"The controlled gate {cgate} is controlled by a state that "
                f"is not all 1's: {ctrl_state}"
            )
        num_ctrl_qubits = cgate.num_ctrl_qubits
        ctrl_qubits = qargs[:num_ctrl_qubits]
        target_qubits = qargs[num_ctrl_qubits:]
        op_dict["isControlled"] = True
        op_dict["gate"] = self._get_instruction_name(cgate.base_gate)
        op_dict["controls"] = self._get_qubit_list_def(ctrl_qubits)
        op_dict["targets"] = self._get_qubit_list_def(target_qubits)

    def _add_measure(
        self, op_dict: Dict, qargs: List[Qubit], cargs: List[Clbit]
    ) -> None:
        if len(qargs) != 1 or len(cargs) != 1:
            raise ValueError
        qubit = qargs[0]
        clbit = cargs[0]
        op_dict["isMeasurement"] = True
        op_dict["controls"] = [self._get_qubit_def(qubit)]
        op_dict["targets"] = [self._get_clbit_def(clbit, qubit)]

    def _format_param(self, param: Union[int, float, complex, Parameter]) -> str:
        if isinstance(param, (float, complex)):
            return f"{param:.{self.precision}f}"
        return str(param)

    def _add_params(self, op_dict: Dict, instruction: Instruction) -> None:
        params_map = map(self._format_param, instruction.params)
        op_dict["displayArgs"] = f"({', '.join(params_map)})"

    @staticmethod
    def _get_instruction_name(instruction: Instruction) -> str:
        return INSTRUCTION_TYPE_TO_NAME.get(type(instruction), instruction.name)

    def _add_reset(self, op_dict: Dict, qubit: Qubit, depth: int) -> None:
        """Reset logic - measure and apply X gate if the measurement yields 1."""
        qubit_def = self._get_qubit_def(qubit)
        op_dict["targets"] = [qubit_def]
        clbit_def = self._get_clbit_def(Clbit(), qubit)  # create a new classical bit

        if not self._is_recursion_depth_exceeded(depth + 1):
            # Add a simple logic for the reset instruction
            op_dict["children"] = [
                {
                    "gate": MEASURE_NAME,
                    "isMeasurement": True,
                    "controls": [qubit_def],
                    "targets": [clbit_def],
                },
                {
                    "gate": "Conditional",
                    "isConditional": True,
                    "controls": [clbit_def],
                    "targets": [],
                    "children": [
                        {
                            "gate": X_GATE_NAME,
                            "targets": [qubit_def],
                            "conditionalRender": ConditionalRender.ON_ONE.value,
                        }
                    ],
                },
            ]

    def _update_condition(self, op_dict: Dict, instruction: Instruction) -> Dict:
        classical, val = instruction.condition
        if isinstance(classical, ClassicalRegister) and classical.size > 1:
            raise NotImplementedError(
                "quantum-viz.js does not support conditioning an instruction on "
                "more than a single classical bit"
            )
        if not (isinstance(val, bool) or val in (0, 1)):
            raise ValueError(
                "A single classical bit can hold only 0, 1 or a boolean, but the "
                f"condition value is {val}"
            )
        if isinstance(classical, ClassicalRegister):
            clbit = Clbit(classical, index=0)
        else:
            clbit = classical

        if val:
            render_condition = ConditionalRender.ON_ONE.value
        else:
            render_condition = ConditionalRender.ON_ZERO.value

        op_dict["conditionalRender"] = render_condition

        conditioned_op_dict = {
            "gate": "Conditional",
            "isConditional": True,
            "controls": [self._get_clbit_def(clbit)],
            "targets": [],
            "children": [op_dict],
        }

        return conditioned_op_dict

from contextlib import contextmanager
from typing import Any
from typing import Dict
from typing import List


class Circuit:
    """Python representation of a quantum circuit.
    Usage:
        circ = Circuit() # Create a circuit object
        circ.operation("H", [0]) # Add a gate named "H" that acts on a qubit [0]
        circ.to_json() # Generate JSON for usage with quantum-viz.js
    """

    def __init__(self, value: Dict[str, Any] = None) -> None:
        self._value = value
        self.qubits_to_bits = {}
        self.operations = []

    @staticmethod
    def _ids_to_dicts(ids: List[int], registers: List[int] = None):
        """Convert qubit IDs to a list of dicts"""
        if registers:
            return [{"type": 1, "qId": q, "cId": c} for q, c in zip(ids, registers)]
        return [{"qId": q} for q in ids]

    def create_qubits(self):
        def to_qubit_dict(qid, num):
            if num:
                return {"id": qid, "numChildren": num}
            return {"id": qid}

        return [
            to_qubit_dict(qid, num) for qid, num in sorted(self.qubits_to_bits.items())
        ]

    @property
    def qubits(self):
        return self.create_qubits()

    def to_json(self):
        return {"qubits": self.qubits, "operations": self.operations}

    def qubit(self, qubit_id: int, num_children: int = 0):
        if qubit_id not in self.qubits_to_bits:
            self.qubits_to_bits[qubit_id] = num_children
        if num_children:
            self.qubits_to_bits[qubit_id] = num_children

    def operation(self, name: str, targets: List[int]) -> None:
        self.controlled_op(name=name, controls=None, targets=targets)

    def measure(self, qubits: List[int], registers: List[int] = None):
        if registers is None:
            registers = [0] * len(qubits)
        self.controlled_op(
            name="Measure", controls=qubits, targets=qubits, registers=registers
        )

    @contextmanager
    def conditional_op(
        self,
        name: str,
        controls: List[int],
        registers: List[int] = None,
        conditional: int = 2,
    ):
        for qid in controls:
            self.qubit(qid)
        sub_circuit = Circuit()
        yield sub_circuit
        if registers is None:
            registers = [0] * len(controls)
        _controls = self._ids_to_dicts(controls, registers)
        [
            op.update({"conditionalRender": conditional, "controls": _controls})
            for op in sub_circuit.operations
        ]
        op = {
            "gate": name,
            "isConditional": "True",
            "targets": [],
            "controls": _controls,
            "children": sub_circuit.operations,
        }
        self.qubits_to_bits.update(sub_circuit.qubits_to_bits)
        self.operations.append(op)

    def controlled_op(
        self,
        name: str,
        controls: List[int],
        targets: List[int],
        registers: List[int] = None,
    ) -> None:
        op = {"gate": name, "targets": self._ids_to_dicts(targets, registers)}
        if "Measure" in name:
            op.update(
                {"isMeasurement": "True", "controls": self._ids_to_dicts(targets)}
            )
            for qid in targets:
                self.qubit(qid, 1)
        elif controls:
            if controls is not None:
                op.update(
                    {"isControlled": "True", "controls": self._ids_to_dicts(controls)}
                )
                for qid in targets + controls:
                    self.qubit(qid)
            else:
                raise ValueError("No controls specified.")
        else:
            for qid in targets:
                self.qubit(qid)
        self.operations.append(op)

    def add_group(self, name: str, sub_circuit: "Circuit", qubits: List[int] = None):
        qubits: Dict[int, int] = sub_circuit.qubits_to_bits
        operations: List[Dict[str, Any]] = sub_circuit.operations
        op = {
            "gate": name,
            "children": operations,
            "targets": self._ids_to_dicts(qubits.keys()),
        }
        self.qubits_to_bits.update(qubits)
        self.operations.append(op)

    @contextmanager
    def group(self, name: str):
        sub_circuit = Circuit()
        yield sub_circuit
        self.add_group(name, sub_circuit)

    def _ipython_display_(self) -> None:
        from quantum_viz.widget import QViz

        return QViz(self.to_json())._ipython_display_()

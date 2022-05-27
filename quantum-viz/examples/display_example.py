# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
##
# This script shows how to display a Qiskit circuit on a new browser window rendered using the Viewer.
##
from qiskit.circuit.random import random_circuit
from qiskit.circuit.reset import Reset
from quantum_viz.utils import display

qc = random_circuit(4, 5, measure=False, reset=True, conditional=False)
qc.barrier()
qc.rccx(0, 3, 2)
qc.sxdg(1)
qc.append(Reset(), [1])

print(qc.draw())
display(qc, skip_barriers=False, style="BlackAndWhite", version="1.0.2")

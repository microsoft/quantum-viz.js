from quantum_viz.utils import display
from qiskit.circuit.random import random_circuit
from qiskit.circuit.reset import Reset

qc = random_circuit(4, 5, measure=False, reset=True, conditional=False)
qc.barrier()
qc.rccx(0, 3, 2)
qc.sxdg(1)
qc.append(Reset(), [1])

print(qc.draw())
display(qc, skip_barriers=False, style="BlackAndWhite", version="1.0.2")

import json
import qiskit

# Pass in a quantumCircuit created using IBM's Qiskit
def qc_parser(quantumCircuit):
    qbitCount = quantumCircuit.num_qubits + quantumCircuit.num_ancillas # Number of qubits and ancilla bits in Qiskit
    clbitCount = quantumCircuit.num_clbits # Number of Classical Bits
    print(quantumCircuit.parameters)
    outputCircuit = {"qubits":[], "operations":[]}

    qubits = []
    operations = []
    ignore = ["barrier"] #Terms in Qiskit that don't translate to QuantumViz

    # Add an id number for each qbit
    for i in range(qbitCount):
        qubits.append({"id": i})

    #print(quantumCircut.h(0).label)

    # Loop through each of the elements of the circuit.
    # Each element of quantumCircuit.data basically corresponds to the function call used to create that element and appears sequentially
    # https://qiskit.org/documentation/stubs/qiskit.circuit.QuantumCircuit.html#qiskit.circuit.QuantumCircuit.data
    for qc in quantumCircuit.data:

        isMeasurement = 'false'
        isConditional = 'false'
        out = {}

        # Each different type of gate has a different structure that needs to be parsed (measurement, control, etc).
        # print(qc)

        instruction = qc[0].name
        print(qc[0])
        # print("Gate " + qc[0].name)
        out['gate'] = instruction.upper()

        # Make sure it is something supported by QuantumViz
        if instruction not in ignore:

            out['controls'] = []
            out['targets'] = []
            controlOut = {}
            
            # Last element of the array in the first element of qc is the target
            qbitTarget = qc[1][-1].index

            # Add isMeasurement key for when it is measurement gate.
            if instruction == "measure":
                out['isMeasurement'] = 'true'
                out['controls'].append({'qId': qbitTarget})
            

            # Is a control qubit if the array has more than one element.
            # Example:
            # 
            # For a Qiskit command to create a controlled X Gate in ancilla 0 tied to quantum registers 0, 1, 2:
            # qc.cx(qr[0:3], anc[0])
            # You may get an element such as the following in qc[1][0]:
            # [Qubit(QuantumRegister(3, 'q'), 0), Qubit(QuantumRegister(1, 'ancilla'), 0)]
            # The index is the qbit that is controlled by the target. The target in this case being ancilla bit 0 and the controlled one being the 0th element
            # of the 3 Quantum Registers available.

            if (len(qc[1]) > 1): 

                out['isControlled'] = 'true'
                print(qc[1])
                for i in (range(len(qc[1]) - 1)):
                    qbitControlled = qc[1][i].index
                    print(qc[1][i])
                    print(qbitControlled)
                    if (qc[1][i].register.name == "ancilla"):
                        qbitControlled = qbitControlled + quantumCircuit.num_qubits - 1
                        
                    controlOut["type"] = 0
                    controlOut["qId"] = qbitControlled

                    out['controls'].append(controlOut.copy())
                    controlOut.clear()


            if (qc[1][-1].register.name == "ancilla"):
                qbitTarget = qbitTarget + quantumCircuit.num_qubits - 1

            out['targets'].append({'qId': qbitTarget})

            # print(out)
            operations.append(out.copy()) # Add instruction dict to output array
            # Clear temporary dict for next loop
            out.clear()

    outputCircuit["qubits"] = qubits
    outputCircuit["operations"] = operations
    print("output:")
    print(outputCircuit)
    jsonOutput  = json.dumps(outputCircuit, indent=2)
    outputFile = open('quantum.json', 'w') # Outputs to "quantum.json" file
    outputFile.write(jsonOutput)
    outputFile.close()

    # Post Process:
    # I have been pasting the output from quantum.json to: https://csvjson.com/json_beautifier
    # I select no quotes: on keys and quotes: single
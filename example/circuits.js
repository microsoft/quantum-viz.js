//export
const teleport = {
    "qubits": [
        {
            "id": 0,
            "numChildren": 2
        },
        {
            "id": 1,
            "numChildren": 2
        },
        {
            "id": 2,
            "numChildren": 1
        }
    ],
    "operations": [
        {
            "dataAttributes": {},
            "gate": "TeleportCircuit",
            "children": [
                {
                    "dataAttributes": {},
                    "gate": "H",
                    "isMeasurement": false,
                    "isControlled": false,
                    "isAdjoint": false,
                    "controls": [],
                    "targets": [
                        {
                            "type": 0,
                            "qId": 1
                        }
                    ]
                },
                {
                    "dataAttributes": {},
                    "gate": "X",
                    "isMeasurement": false,
                    "isControlled": true,
                    "isAdjoint": false,
                    "controls": [
                        {
                            "type": 0,
                            "qId": 1
                        }
                    ],
                    "targets": [
                        {
                            "type": 0,
                            "qId": 2
                        }
                    ]
                },
                {
                    "dataAttributes": {},
                    "gate": "Encode",
                    "children": [
                        {
                            "dataAttributes": {},
                            "gate": "PrepareRandomMessage",
                            "children": [
                                {
                                    "dataAttributes": {},
                                    "gate": "Random",
                                    "displayArgs": "([0.5, 0.5])",
                                    "children": [
                                        {
                                            "dataAttributes": {},
                                            "gate": "DrawCategorical",
                                            "displayArgs": "([0.5, 0.5])",
                                            "children": [
                                                {
                                                    "dataAttributes": {},
                                                    "gate": "DrawRandomDouble",
                                                    "displayArgs": "(0, 1)",
                                                    "isMeasurement": false,
                                                    "isControlled": false,
                                                    "isAdjoint": false,
                                                    "controls": [],
                                                    "targets": []
                                                }
                                            ],
                                            "isMeasurement": false,
                                            "isControlled": false,
                                            "isAdjoint": false,
                                            "controls": [],
                                            "targets": []
                                        }
                                    ],
                                    "isMeasurement": false,
                                    "isControlled": false,
                                    "isAdjoint": false,
                                    "controls": [],
                                    "targets": []
                                },
                                {
                                    "dataAttributes": {},
                                    "gate": "SetPlus",
                                    "children": [
                                        {
                                            "dataAttributes": {},
                                            "gate": "H",
                                            "isMeasurement": false,
                                            "isControlled": false,
                                            "isAdjoint": false,
                                            "controls": [],
                                            "targets": [
                                                {
                                                    "type": 0,
                                                    "qId": 0
                                                }
                                            ]
                                        }
                                    ],
                                    "isMeasurement": false,
                                    "isControlled": false,
                                    "isAdjoint": false,
                                    "controls": [],
                                    "targets": [
                                        {
                                            "type": 0,
                                            "qId": 0
                                        }
                                    ]
                                }
                            ],
                            "isMeasurement": false,
                            "isControlled": false,
                            "isAdjoint": false,
                            "controls": [],
                            "targets": [
                                {
                                    "type": 0,
                                    "qId": 0
                                }
                            ]
                        },
                        {
                            "dataAttributes": {},
                            "gate": "X",
                            "isMeasurement": false,
                            "isControlled": true,
                            "isAdjoint": false,
                            "controls": [
                                {
                                    "type": 0,
                                    "qId": 0
                                }
                            ],
                            "targets": [
                                {
                                    "type": 0,
                                    "qId": 1
                                }
                            ]
                        },
                        {
                            "dataAttributes": {},
                            "gate": "H",
                            "isMeasurement": false,
                            "isControlled": false,
                            "isAdjoint": false,
                            "controls": [],
                            "targets": [
                                {
                                    "type": 0,
                                    "qId": 0
                                }
                            ]
                        }
                    ],
                    "isMeasurement": false,
                    "isControlled": false,
                    "isAdjoint": false,
                    "controls": [],
                    "targets": [
                        {
                            "type": 0,
                            "qId": 0
                        },
                        {
                            "type": 0,
                            "qId": 1
                        }
                    ]
                },
                {
                    "dataAttributes": {},
                    "gate": "M",
                    "isMeasurement": true,
                    "isControlled": false,
                    "isAdjoint": false,
                    "controls": [
                        {
                            "type": 0,
                            "qId": 0
                        }
                    ],
                    "targets": [
                        {
                            "type": 1,
                            "qId": 0,
                            "cId": 0
                        }
                    ]
                },
                {
                    "gate": "measure",
                    "isMeasurement": true,
                    "isControlled": false,
                    "isAdjoint": false,
                    "controls": [
                        {
                            "type": 0,
                            "qId": 1
                        }
                    ],
                    "targets": [
                        {
                            "type": 1,
                            "qId": 1,
                            "cId": 0
                        }
                    ]
                },
                {
                    "dataAttributes": {},
                    "gate": "Decode",
                    "children": [
                        {
                            "gate": "ApplyIfElseR",
                            "isControlled": false,
                            "isAdjoint": false,
                            "isMeasurement": false,
                            "isConditional": true,
                            "controls": [
                                {
                                    "type": 1,
                                    "qId": 1,
                                    "cId": 0
                                }
                            ],
                            "targets": [],
                            "children": [
                                {
                                    "dataAttributes": {},
                                    "gate": "X",
                                    "isMeasurement": false,
                                    "isControlled": false,
                                    "isAdjoint": false,
                                    "controls": [
                                        {
                                            "type": 1,
                                            "qId": 1,
                                            "cId": 0
                                        }
                                    ],
                                    "targets": [
                                        {
                                            "type": 0,
                                            "qId": 2
                                        }
                                    ],
                                    "conditionalRender": 2
                                }
                            ]
                        },
                        {
                            "gate": "ApplyIfElseR",
                            "isControlled": false,
                            "isAdjoint": false,
                            "isMeasurement": false,
                            "isConditional": true,
                            "controls": [
                                {
                                    "type": 1,
                                    "qId": 0,
                                    "cId": 0
                                }
                            ],
                            "targets": [],
                            "children": [
                                {
                                    "dataAttributes": {},
                                    "gate": "Z",
                                    "isMeasurement": false,
                                    "isControlled": false,
                                    "isAdjoint": false,
                                    "controls": [
                                        {
                                            "type": 1,
                                            "qId": 0,
                                            "cId": 0
                                        }
                                    ],
                                    "targets": [
                                        {
                                            "type": 0,
                                            "qId": 2
                                        }
                                    ],
                                    "conditionalRender": 2
                                }
                            ]
                        }
                    ],
                    "isMeasurement": false,
                    "isControlled": false,
                    "isAdjoint": false,
                    "controls": [
                        {
                            "type": 1,
                            "qId": 0,
                            "cId": 0
                        },
                        {
                            "type": 1,
                            "qId": 1,
                            "cId": 0
                        }
                    ],
                    "targets": [
                        {
                            "type": 0,
                            "qId": 2
                        }
                    ]
                }
            ],
            "isMeasurement": false,
            "isControlled": false,
            "isAdjoint": false,
            "controls": [],
            "targets": [
                {
                    "type": 0,
                    "qId": 1
                },
                {
                    "type": 0,
                    "qId": 2
                },
                {
                    "type": 0,
                    "qId": 0
                }
            ]
        }
    ]
};

//export 
const random = {
    qubits: [{ id: 0, numChildren: 1 }, { id: 1 }, { id: 2 }, { id: 3 }],
    operations: [
        {
            gate: 'Foo',
            conditionalRender: 3,
            isControlled: false,
            isAdjoint: false,
            isMeasurement: false,
            isConditional: false,
            controls: [],
            targets: [
                { type: 0, qId: 0 },
                { type: 0, qId: 1 },
            ],
            children: [
                {
                    gate: 'H',
                    isControlled: false,
                    isAdjoint: false,
                    isMeasurement: false,
                    isConditional: false,
                    controls: [],
                    targets: [{ type: 0, qId: 1 }],
                },
                {
                    gate: 'RX',
                    displayArgs: '(0.25)',
                    isControlled: true,
                    isAdjoint: false,
                    isMeasurement: false,
                    isConditional: false,
                    controls: [{ type: 0, qId: 1 }],
                    targets: [{ type: 0, qId: 0 }],
                },
            ],
        },
        {
            gate: 'H',
            isControlled: false,
            isAdjoint: false,
            isMeasurement: false,
            isConditional: false,
            controls: [],
            targets: [{ type: 0, qId: 2 }],
        },
        {
            gate: 'X',
            isControlled: true,
            isAdjoint: false,
            isMeasurement: false,
            isConditional: false,
            controls: [{ type: 0, qId: 1 }],
            targets: [
                { type: 0, qId: 2 },
                { type: 0, qId: 3 },
            ],
        },
        {
            gate: 'X',
            isControlled: true,
            isAdjoint: false,
            isMeasurement: false,
            isConditional: false,
            controls: [
                { type: 0, qId: 2 },
                { type: 0, qId: 3 },
            ],
            targets: [{ type: 0, qId: 1 }],
        },
        {
            gate: 'X',
            isControlled: true,
            isAdjoint: false,
            isMeasurement: false,
            isConditional: false,
            controls: [
                { type: 0, qId: 1 },
                { type: 0, qId: 3 },
            ],
            targets: [{ type: 0, qId: 2 }],
        },
        {
            gate: 'X',
            isControlled: true,
            isAdjoint: false,
            isMeasurement: false,
            isConditional: false,
            controls: [{ type: 0, qId: 2 }],
            targets: [
                { type: 0, qId: 1 },
                { type: 0, qId: 3 },
            ],
        },
        {
            gate: 'measure',
            isControlled: false,
            isAdjoint: false,
            isMeasurement: true,
            controls: [{ type: 0, qId: 0 }],
            targets: [{ type: 1, qId: 0, cId: 0 }],
        },
        {
            gate: 'ApplyIfElseR',
            isControlled: false,
            isAdjoint: false,
            isMeasurement: false,
            isConditional: true,
            controls: [{ type: 1, qId: 0, cId: 0 }],
            targets: [],
            children: [
                {
                    gate: 'H',
                    isControlled: false,
                    isAdjoint: false,
                    isMeasurement: false,
                    controls: [],
                    targets: [{ type: 0, qId: 1 }],
                    conditionalRender: 1,
                },
                {
                    gate: 'X',
                    isControlled: false,
                    isAdjoint: false,
                    isMeasurement: false,
                    controls: [],
                    targets: [{ type: 0, qId: 1 }],
                    conditionalRender: 1,
                },
                {
                    gate: 'X',
                    isControlled: true,
                    isAdjoint: false,
                    isMeasurement: false,
                    controls: [{ type: 0, qId: 0 }],
                    targets: [{ type: 0, qId: 1 }],
                    conditionalRender: 2,
                },
                {
                    gate: 'Foo',
                    isControlled: false,
                    isAdjoint: false,
                    isMeasurement: false,
                    controls: [],
                    targets: [{ type: 0, qId: 3 }],
                    conditionalRender: 2,
                },
            ],
        },
        {
            gate: 'SWAP',
            isControlled: false,
            isAdjoint: false,
            isMeasurement: false,
            isConditional: false,
            controls: [],
            targets: [
                { type: 0, qId: 0 },
                { type: 0, qId: 2 },
            ],
        },
        {
            gate: 'ZZ',
            isControlled: false,
            isAdjoint: false,
            isMeasurement: false,
            isConditional: false,
            controls: [],
            targets: [
                { type: 0, qId: 1 },
                { type: 0, qId: 3 },
            ],
        },
        {
            gate: 'ZZ',
            isControlled: false,
            isAdjoint: false,
            isMeasurement: false,
            isConditional: false,
            controls: [],
            targets: [
                { type: 0, qId: 0 },
                { type: 0, qId: 1 },
            ],
        },
        {
            gate: 'XX',
            isControlled: true,
            isAdjoint: false,
            isMeasurement: false,
            isConditional: false,
            controls: [{ type: 0, qId: 0 }],
            targets: [
                { type: 0, qId: 1 },
                { type: 0, qId: 3 },
            ],
        },
        {
            gate: 'XX',
            isControlled: true,
            isAdjoint: false,
            isMeasurement: false,
            isConditional: false,
            controls: [{ type: 0, qId: 2 }],
            targets: [
                { type: 0, qId: 1 },
                { type: 0, qId: 3 },
            ],
        },
        {
            gate: 'XX',
            isControlled: true,
            isAdjoint: false,
            isMeasurement: false,
            isConditional: false,
            controls: [
                { type: 0, qId: 0 },
                { type: 0, qId: 2 },
            ],
            targets: [
                { type: 0, qId: 1 },
                { type: 0, qId: 3 },
            ],
        },
    ],
};



const div1 = document.getElementById('example');
const viz1 = new Sqore.Visualizer(div1, Sqore.STYLES['Default']);
viz1.visualize(exampleCircuit);

const div2 = document.getElementById('teleport');
const viz2 = new Sqore.Visualizer(div2, Sqore.STYLES['Default']);
viz2.visualize(teleport);

const fs = require('fs');
const path = 'app/components/SolarSystemScene.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace import
content = content.replace("import { ClassicBirthChart } from './ClassicBirthChart';", "import { SketchfabBirthChart } from './SketchfabBirthChart';");

// Replace usage
const oldWidget = `<ClassicBirthChart                 data={data}                 selectedPlanet={selectedPlanet}                 onPlanetClick={(p: any) => {                  setSelectedPlanet(p);                  if (onPlanetClick && p) {                    onPlanetClick(p.name, p.meaning || p.description);                  }                }}               />`;

const newWidget = `<SketchfabBirthChart data={data} />`;

content = content.replace(oldWidget, newWidget);

fs.writeFileSync(path, content, 'utf8');

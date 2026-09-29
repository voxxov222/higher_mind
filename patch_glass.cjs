const fs = require('fs');
const path = 'app/components/GlassDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

const importStatement = `import { SolarSystemScene } from './SolarSystemScene';\n`;
if (!content.includes('SolarSystemScene')) {
    content = content.replace("import { AstrologerStudioMatrix }", importStatement + "import { AstrologerStudioMatrix }");
    content = content.replace(
        "import {   Sun, Moon, Star, Compass, Activity, Hexagon, Fingerprint, Zap, Layers, Hash, Award, Grid} from 'lucide-react';",
        "import {   Sun, Moon, Star, Compass, Activity, Hexagon, Fingerprint, Zap, Layers, Hash, Award, Grid, Globe} from 'lucide-react';"
    );
    
    content = content.replace(
        "{ id: 'identity', type: 'identity', title: 'Cosmic Identity', icon: Fingerprint, colSpan: 2, rowSpan: 2 },",
        "{ id: 'planet3d', type: 'planet3d', title: 'Interactive Solar System', icon: Globe, colSpan: 4, rowSpan: 4 },\n    { id: 'identity', type: 'identity', title: 'Cosmic Identity', icon: Fingerprint, colSpan: 2, rowSpan: 2 },"
    );

    const widgetContent = `
      case 'planet3d':
        return (
          <div className="w-full h-full p-2 relative rounded-2xl overflow-hidden group">
             <div className="absolute top-2 left-4 z-20 opacity-50 group-hover:opacity-100 transition-opacity">
                <h4 className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest bg-black/40 px-2 py-1 rounded backdrop-blur">3D Planet Explorer</h4>
             </div>
             <div className="absolute inset-0 z-10 pointer-events-none border border-cyan-500/20 rounded-2xl shadow-[inset_0_0_40px_rgba(34,211,238,0.05)]" />
             <div className="w-full h-full pointer-events-auto rounded-xl overflow-hidden bg-black/80">
                <SolarSystemScene 
                  data={data}
                  onPlanetClick={(p) => console.log('Planet clicked', p)}
                  onResearch={() => {}}
                  onSave={() => {}}
                />
             </div>
          </div>
        );
`;
    content = content.replace("switch (widget.type) {", "switch (widget.type) {\n" + widgetContent);
    fs.writeFileSync(path, content, 'utf8');
}

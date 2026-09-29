export const CELESTIAL_CHARTS_DATA: Record<string, {
  atmosphere: { name: string; value: number; color: string }[];
  temperature: { name: string; temp: number; color: string }[];
  tempUnit: string;
}> = {
  'Mercury': {
    atmosphere: [
      { name: 'Oxygen', value: 42, color: '#10b981' },
      { name: 'Sodium', value: 29, color: '#f59e0b' },
      { name: 'Hydrogen', value: 22, color: '#3b82f6' },
      { name: 'Helium', value: 6, color: '#8b5cf6' },
      { name: 'Others', value: 1, color: '#6b7280' }
    ],
    temperature: [
      { name: 'Night', temp: -173, color: '#3b82f6' },
      { name: 'Dawn', temp: -100, color: '#60a5fa' },
      { name: 'Morning', temp: 100, color: '#fbbf24' },
      { name: 'Noon', temp: 427, color: '#ef4444' },
      { name: 'Dusk', temp: 150, color: '#f59e0b' }
    ],
    tempUnit: '°C'
  },
  'Venus': {
    atmosphere: [
      { name: 'Carbon Dioxide', value: 96.5, color: '#ef4444' },
      { name: 'Nitrogen', value: 3.5, color: '#3b82f6' },
      { name: 'Trace Gases', value: 0.1, color: '#6b7280' }
    ],
    temperature: [
      { name: '1960s', temp: 460, color: '#f59e0b' },
      { name: '1970s', temp: 475, color: '#f59e0b' },
      { name: '1980s', temp: 462, color: '#f59e0b' },
      { name: '1990s', temp: 464, color: '#f59e0b' },
      { name: '2000s', temp: 465, color: '#f59e0b' },
      { name: 'Modern', temp: 467, color: '#ef4444' }
    ],
    tempUnit: '°C'
  },
  'Earth': {
    atmosphere: [
      { name: 'Nitrogen', value: 78, color: '#3b82f6' },
      { name: 'Oxygen', value: 21, color: '#10b981' },
      { name: 'Argon', value: 0.93, color: '#8b5cf6' },
      { name: 'CO2', value: 0.04, color: '#ef4444' },
      { name: 'Others', value: 0.03, color: '#6b7280' }
    ],
    temperature: [
      { name: '1920', temp: 13.8, color: '#3b82f6' },
      { name: '1940', temp: 14.0, color: '#3b82f6' },
      { name: '1960', temp: 13.9, color: '#3b82f6' },
      { name: '1980', temp: 14.2, color: '#3b82f6' },
      { name: '2000', temp: 14.5, color: '#f59e0b' },
      { name: '2020', temp: 14.9, color: '#ef4444' }
    ],
    tempUnit: '°C'
  },
  'Mars': {
    atmosphere: [
      { name: 'Carbon Dioxide', value: 95.3, color: '#ef4444' },
      { name: 'Nitrogen', value: 2.7, color: '#3b82f6' },
      { name: 'Argon', value: 1.6, color: '#8b5cf6' },
      { name: 'Oxygen', value: 0.13, color: '#10b981' },
      { name: 'Others', value: 0.27, color: '#6b7280' }
    ],
    temperature: [
      { name: 'Winter', temp: -120, color: '#3b82f6' },
      { name: 'Spring', temp: -60, color: '#60a5fa' },
      { name: 'Summer', temp: -20, color: '#fbbf24' },
      { name: 'Autumn', temp: -50, color: '#a8a29e' }
    ],
    tempUnit: '°C'
  },
  'Jupiter': {
    atmosphere: [
      { name: 'Hydrogen', value: 89.8, color: '#60a5fa' },
      { name: 'Helium', value: 10.2, color: '#a78bfa' },
      { name: 'Methane', value: 0.3, color: '#34d399' },
      { name: 'Ammonia', value: 0.02, color: '#f59e0b' }
    ],
    temperature: [
      { name: 'Cloud Top', temp: -108, color: '#3b82f6' },
      { name: 'Deep Strat', temp: -50, color: '#60a5fa' },
      { name: '10 Bar Depth', temp: 67, color: '#fbbf24' },
      { name: 'Metallic H2', temp: 5000, color: '#ef4444' },
      { name: 'Core Boundary', temp: 20000, color: '#f43f5e' }
    ],
    tempUnit: '°C'
  },
  'Saturn': {
    atmosphere: [
      { name: 'Hydrogen', value: 96.3, color: '#60a5fa' },
      { name: 'Helium', value: 3.25, color: '#a78bfa' },
      { name: 'Methane', value: 0.45, color: '#34d399' },
      { name: 'Ammonia', value: 0.01, color: '#f59e0b' }
    ],
    temperature: [
      { name: 'Cloud Top', temp: -139, color: '#3b82f6' },
      { name: 'Deep Strat', temp: -80, color: '#60a5fa' },
      { name: '10 Bar Depth', temp: 40, color: '#fbbf24' },
      { name: 'Metallic H2', temp: 3000, color: '#ef4444' },
      { name: 'Core Boundary', temp: 11000, color: '#f43f5e' }
    ],
    tempUnit: '°C'
  },
  'Uranus': {
    atmosphere: [
      { name: 'Hydrogen', value: 82.5, color: '#60a5fa' },
      { name: 'Helium', value: 15.2, color: '#a78bfa' },
      { name: 'Methane', value: 2.3, color: '#34d399' }
    ],
    temperature: [
      { name: 'Cloud Top', temp: -197, color: '#3b82f6' },
      { name: 'Deep Strat', temp: -150, color: '#60a5fa' },
      { name: '10 Bar Depth', temp: -50, color: '#fbbf24' },
      { name: 'Mantle', temp: 2000, color: '#ef4444' },
      { name: 'Core Boundary', temp: 5000, color: '#f43f5e' }
    ],
    tempUnit: '°C'
  },
  'Neptune': {
    atmosphere: [
      { name: 'Hydrogen', value: 80, color: '#60a5fa' },
      { name: 'Helium', value: 19, color: '#a78bfa' },
      { name: 'Methane', value: 1.5, color: '#34d399' }
    ],
    temperature: [
      { name: 'Cloud Top', temp: -201, color: '#3b82f6' },
      { name: 'Deep Strat', temp: -150, color: '#60a5fa' },
      { name: '10 Bar Depth', temp: -30, color: '#fbbf24' },
      { name: 'Mantle', temp: 3000, color: '#ef4444' },
      { name: 'Core Boundary', temp: 7000, color: '#f43f5e' }
    ],
    tempUnit: '°C'
  },
  'Pluto': {
    atmosphere: [
      { name: 'Nitrogen', value: 99, color: '#3b82f6' },
      { name: 'Methane', value: 0.5, color: '#34d399' },
      { name: 'Carbon Monoxide', value: 0.5, color: '#f59e0b' }
    ],
    temperature: [
      { name: 'Aphelion', temp: -240, color: '#1e3a8a' },
      { name: 'Avg Winter', temp: -235, color: '#1e40af' },
      { name: 'Avg Summer', temp: -229, color: '#3b82f6' },
      { name: 'Perihelion', temp: -218, color: '#60a5fa' }
    ],
    tempUnit: '°C'
  },
  'Sun': {
    atmosphere: [
      { name: 'Hydrogen', value: 73.4, color: '#fbbf24' },
      { name: 'Helium', value: 24.9, color: '#f97316' },
      { name: 'Oxygen', value: 0.77, color: '#10b981' },
      { name: 'Carbon', value: 0.29, color: '#ef4444' },
      { name: 'Iron', value: 0.16, color: '#6b7280' },
      { name: 'Neon', value: 0.12, color: '#a855f7' }
    ],
    temperature: [
      { name: 'Photosphere', temp: 5500, color: '#fbbf24' },
      { name: 'Chromosphere', temp: 10000, color: '#f59e0b' },
      { name: 'Transition', temp: 100000, color: '#f97316' },
      { name: 'Inner Corona', temp: 1000000, color: '#ef4444' },
      { name: 'Outer Corona', temp: 2000000, color: '#dc2626' }
    ],
    tempUnit: '°C'
  }
};

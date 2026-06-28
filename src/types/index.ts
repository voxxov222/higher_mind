export interface UserData {
  id: string;
  name: string;
  email: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
}

export interface WorkspaceItem {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
}

export interface KarmicRecord {
  era: string;
  resonance: number;
  description: string;
}

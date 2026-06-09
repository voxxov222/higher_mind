import { CosmicData } from '../types';

export type AgentRole = 'tasks' | 'research' | 'connections' | 'mapping' | 'autonomous';

export interface ResearchFinding {
  id: string;
  agentId: string;
  agentName: string;
  category: string;
  content: string;
  timestamp: string;
  links?: string[];
  references?: string[];
}

export interface Agent {
  id: string;
  name: string;
  instructions: string;
  role: AgentRole;
  status: 'idle' | 'running' | 'completed' | 'error';
  findings: string[];
  skills: string[];
  level: number;
  memory: string[];
  targetAgents: string[];
  x: number;
  y: number;
}

export interface SwarmLog {
  time: string;
  msg: string;
}

class SwarmEngine {
  agents: Agent[] = [];
  findingsDatabase: ResearchFinding[] = [];
  isRunning: boolean = false;
  logs: SwarmLog[] = [];
  listeners: Set<() => void> = new Set();
  intervalId: NodeJS.Timeout | null = null;
  cosmicData: CosmicData | null = null;
  hasInitialized = false;

  constructor() {
    this.loadFromStorage();
  }

  saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('swarm_agents', JSON.stringify(this.agents));
        localStorage.setItem('swarm_findings', JSON.stringify(this.findingsDatabase));
      } catch (e) {
        console.error("Failed to save swarm to localStorage", e);
      }
    }
  }

  loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const savedAgents = localStorage.getItem('swarm_agents');
        const savedFindings = localStorage.getItem('swarm_findings');
        if (savedAgents) {
            const parsedAgents = JSON.parse(savedAgents);
            if (Array.isArray(parsedAgents) && parsedAgents.length > 0) {
                this.agents = parsedAgents;
                this.hasInitialized = true;
            }
        }
        if (savedFindings) {
            const parsedFindings = JSON.parse(savedFindings);
            if (Array.isArray(parsedFindings)) {
                 this.findingsDatabase = parsedFindings;
            }
        }
      } catch (e) {
        console.error("Failed to load swarm from localStorage", e);
      }
    }
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.saveToStorage();
    this.listeners.forEach(l => l());
  }

  addFinding(agentId: string, category: string, content: string) {
    const agent = this.agents.find(a => a.id === agentId);
    // Generate some mock links and references based on category
    const isResearch = category === 'Research';
    const newFinding: ResearchFinding = {
      id: `finding-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      agentId,
      agentName: agent?.name || 'Unknown',
      category,
      content,
      timestamp: new Date().toLocaleTimeString(),
      links: isResearch ? ['https://en.wikipedia.org/wiki/Astrology', 'https://solarsystem.nasa.gov/'] : undefined,
      references: isResearch ? ['Journal of Cosmic Studies, Vol 4.', 'Hermetic Kabbalah Principles, Chapter 2'] : ['System Diagnostics Record', 'Process Execution Log']
    };
    this.findingsDatabase = [newFinding, ...this.findingsDatabase].slice(0, 500);
    this.notify();
  }

  setCosmicData(data: CosmicData) {
    this.cosmicData = data;
    if (!this.hasInitialized && this.agents.length === 0) {
      this.initDefaultSwarm();
      this.hasInitialized = true;
    }
  }

  initDefaultSwarm() {
    this.agents = [
      {
        id: 'agent-1', name: 'Agent 1 (Deep Research)', role: 'research',
        instructions: `Deep research the user's name and date of birth: ${this.cosmicData?.natalChart?.firstName || 'User'}. See what you can come up with and organize your findings in categories. Higher priority is exact match. Index and continue.`,
        status: 'idle', findings: [], skills: ['Web Search', 'Data Extraction'], level: 1, memory: [], targetAgents: ['agent-4'], x: 50, y: 50
      },
      {
        id: 'agent-2', name: 'Agent 2 (Library of Babel)', role: 'connections',
        instructions: 'Search library of babel index all findings under the user\'s name and information.',
        status: 'idle', findings: [], skills: ['Pattern Recognition', 'Indexing'], level: 1, memory: [], targetAgents: ['agent-4'], x: 50, y: 150
      },
      {
        id: 'agent-3', name: 'Agent 3 (Database Scanner)', role: 'research',
        instructions: 'Search all databases looking for user.',
        status: 'idle', findings: [], skills: ['SQL Injection', 'Deep Web Scan'], level: 1, memory: [], targetAgents: ['agent-4'], x: 50, y: 250
      },
      {
        id: 'agent-4', name: 'Agent 4 (Synthesizer)', role: 'tasks',
        instructions: 'Study the findings of agent 1, 2 and 3. Create a summary and generate an infographic poster. Give options to read out loud.',
        status: 'idle', findings: [], skills: ['Natural Language Processing', 'Data Visualization'], level: 2, memory: [], targetAgents: [], x: 250, y: 150
      }
    ];
    this.notify();
  }

  addGlobalLog(msg: string) {
    this.logs = [{ time: new Date().toLocaleTimeString(), msg }, ...this.logs].slice(0, 50);
    this.notify();
  }

  async startTargetedResearch(targetContext: string, cosmicDataString: string) {
    if (!this.isRunning) this.toggleSwarm();
    const newId = this.addAgent();
    if (newId) {
      this.updateAgent(newId, {
        name: `Investigator (${targetContext.substring(0, 15)})`,
        role: 'research',
        instructions: `Conduct deep research and synthesis on ${targetContext}. Contextually tie it to user's birth data: ${cosmicDataString}.`,
        x: 150 + Math.random() * 100,
        y: 150 + Math.random() * 100
      });
      this.addGlobalLog(`Launched targeted investigation into: ${targetContext}.`);
      
      try {
        const response = await fetch('/api/targeted-research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetContext, cosmicDataString })
        });
        const data = await response.json();
        
        if (data.result) {
           const logMsg = `Research completed on ${targetContext}.`;
           this.addGlobalLog(logMsg);
           this.updateAgent(newId, { 
             status: 'idle',
             findings: [...this.agents.find(a => a.id === newId)?.findings || [], logMsg]
           });
           
           // Offload actual generated finding to our swarm database directly securely through Firebase
           import('../services/swarmService').then(({ saveSwarmFinding }) => {
               import('../firebase').then(({ auth }) => {
                   if (auth?.currentUser) {
                       saveSwarmFinding(auth.currentUser.uid, {
                           agentId: newId,
                           agentName: this.agents.find(a => a.id === newId)?.name || 'Investigator',
                           category: 'targeted_research',
                           content: data.result,
                           links: data.links || []
                       }).catch(console.error);
                   }
               });
           }).catch(console.error);
        }
      } catch (err) {
        console.error("Failed to execute targeted research:", err);
      }
    }
  }

  addAgent() {
    if (this.agents.length >= 50) {
      this.addGlobalLog("System limits reached. Maximum 50 agents allowed in the swarm.");
      return null;
    }
    const newId = `agent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newAgent: Agent = {
      id: newId,
      name: `Agent ${this.agents.length + 1}`,
      instructions: '',
      role: 'tasks',
      status: this.isRunning ? 'running' : 'idle',
      findings: [],
      skills: [],
      level: 1,
      memory: [],
      targetAgents: [],
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200
    };
    this.agents = [...this.agents, newAgent];
    this.addGlobalLog(`Agent ${this.agents.length} initialized and added to swarm.`);
    this.notify();
    return newId;
  }

  deleteAgent(id: string) {
    this.agents = this.agents.filter(a => a.id !== id).map(a => ({
      ...a,
      targetAgents: a.targetAgents.filter(targetId => targetId !== id)
    }));
    this.addGlobalLog(`Agent decommissioned.`);
    this.notify();
  }

  updateAgent(id: string, updates: Partial<Agent>) {
    this.agents = this.agents.map(a => a.id === id ? { ...a, ...updates } : a);
    this.notify();
  }

  toggleConnection(fromId: string, toId: string) {
    this.agents = this.agents.map(a => {
      if (a.id === fromId) {
        const hasConn = a.targetAgents.includes(toId);
        return {
          ...a,
          targetAgents: hasConn ? a.targetAgents.filter(id => id !== toId) : [...a.targetAgents, toId]
        };
      }
      return a;
    });
    this.notify();
  }

  upgradeAgent(id: string) {
    const agent = this.agents.find(a => a.id === id);
    if (!agent) return;
    this.updateAgent(id, { level: agent.level + 1 });
    this.addGlobalLog(`Agent ${agent.name} upgraded to level ${agent.level + 1}.`);
  }

  toggleSwarm() {
    this.isRunning = !this.isRunning;
    if (this.isRunning) {
      this.agents = this.agents.map(a => ({ ...a, status: 'running' }));
      this.startLoop();
      this.addGlobalLog("Swarm execution initiated.");
    } else {
      this.agents = this.agents.map(a => ({ ...a, status: 'idle' }));
      this.stopLoop();
      this.addGlobalLog("Swarm execution halted.");
    }
    this.notify();
  }

  startLoop() {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      let findingsAdded = false;
      this.agents = this.agents.map(agent => {
        if (agent.status === 'running' && Math.random() > 0.8) {
          findingsAdded = true;
          // Simulate different findings based on role
          let findingType = 'Discovered node sequence';
          if (agent.role === 'research') findingType = 'Extracted correlation point';
          if (agent.role === 'connections') findingType = 'Mapped conceptual parallel';
          if (agent.role === 'tasks') findingType = 'Synthesized sub-routine';
          
          const newFinding = `${findingType} [${Math.floor(Math.random()*1000)}] aligned with directive.`;
          
          const category = agent.role === 'research' ? 'Research' : agent.role === 'connections' ? 'Connections' : 'Operations';
          this.addFinding(agent.id, category, newFinding);
          
          // Limit memory size
          const newMemory = [newFinding, ...agent.memory].slice(0, 100);
          const newFindings = [newFinding, ...agent.findings].slice(0, 50);
          
          // Log globally occasionally
          if (Math.random() > 0.5) {
            this.logs = [{ time: new Date().toLocaleTimeString(), msg: `[${agent.name}] ${newFinding}` }, ...this.logs].slice(0, 50);
          }
          
          return {
            ...agent,
            memory: newMemory,
            findings: newFindings
          };
        }
        return agent;
      });
      if (findingsAdded) this.notify();
    }, 2000);
  }

  stopLoop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  clearAll() {
    this.stopLoop();
    this.agents = [];
    this.findingsDatabase = [];
    this.logs = [];
    this.isRunning = false;
    this.hasInitialized = false;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('swarm_agents');
      localStorage.removeItem('swarm_findings');
    }
    this.notify();
  }

  wipeDatabase() {
    this.findingsDatabase = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('swarm_findings');
    }
    this.notify();
  }
}

export const swarmEngine = new SwarmEngine();

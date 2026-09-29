const fs = require('fs');
const path = 'app/components/Dashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

const importStatement = `import { ChatPanel } from './chat/ChatPanel';\n`;
if (!content.includes('ChatPanel')) {
    content = content.replace("import { WorkspaceWidgets } from './WorkspaceWidgets';", importStatement + "import { WorkspaceWidgets } from './WorkspaceWidgets';");

    content = content.replace(
        "<Tab active={activeTab === 'ai_agents'} tabId=\"ai_agents\" onClick={() => setActiveTab('ai_agents')} icon={<Cpu className=\"w-4 h-4 text-emerald-400\"/>}>AI Agents Swarm</Tab>",
        "<Tab active={activeTab === 'ai_agents'} tabId=\"ai_agents\" onClick={() => setActiveTab('ai_agents')} icon={<Cpu className=\"w-4 h-4 text-emerald-400\"/>}>AI Agents Swarm</Tab>\n              <Tab active={activeTab === 'astrology_chatbot'} tabId=\"astrology_chatbot\" onClick={() => setActiveTab('astrology_chatbot')} icon={<MessageCircle className=\"w-4 h-4 text-pink-400 animate-pulse\"/>}>Astrology Chatbot</Tab>"
    );

    const chatbotContent = `
                {activeTab === 'astrology_chatbot' && (
                  <motion.div key="astrology_chatbot" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="h-full min-h-[700px]">
                     <ChatPanel />
                  </motion.div>
                )}
`;
    content = content.replace("{activeTab === 'ai_agents' && (", chatbotContent + "\n                {activeTab === 'ai_agents' && (");
    fs.writeFileSync(path, content, 'utf8');
}

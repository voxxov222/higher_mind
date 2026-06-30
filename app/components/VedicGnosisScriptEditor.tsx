import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Terminal, Code, BookOpen, Copy, Check, Sparkles, RefreshCw, Trash2, HelpCircle
} from 'lucide-react';

interface ExampleCode {
  title: string;
  desc: string;
  code: string;
}

const EXAMPLES: ExampleCode[] = [
  {
    title: "नमस्कार (Hello World)",
    desc: "Prints a cosmic greeting to the console using Devanagari variables.",
    code: `# Vedic Hello World script
मान संदेश = "ॐ नमः शिवाय! वैदिक प्रणाली सक्रिय अस्ति।";
वद(संदेश);
`
  },
  {
    title: "फाइबोनैचि (Fibonacci Series)",
    desc: "Generates the Fibonacci sequence using a while loop (पर्यन्त) and Sanskrit numerals.",
    code: `# Fibonacci sequence generator
मान सीमा = १०; # Generates up to 10 terms
मान पूर्व = ०;
मान वर्तमान = १;

वद("वैदिक फाइबोनैचि अनुक्रमः:");
वद(पूर्व);
वद(वर्तमान);

मान गणना = २;
पर्यन्त (गणना < सीमा) {
    मान अग्रिम = पूर्व + वर्तमान;
    वद(अग्रिम);
    पूर्व = वर्तमान;
    वर्तमान = अग्रिम;
    गणना = गणना + १;
}
`
  },
  {
    title: "सूत्र योग (Functions & Sum)",
    desc: "Defines a mathematical function (सूत्र) in Sanskrit and evaluates it.",
    code: `# Function definition and evaluation
सूत्र योग(अ, ब) {
    फल अ + ब;
}

मान परिणाम = योग(२५, ७५);
वद("योगस्य परिणामः (25 + 75) =", परिणाम);
`
  },
  {
    title: "लभ्यते (Substring Search)",
    desc: "Checks if a string contains another substring using the 'लभ्यते' built-in function.",
    code: `# Substring check with लभ्यते
मान वाक्य_पूर्ण = "वैदिक भाषा अत्यंत वैज्ञानिकी अस्ति।";
मान शोध_शब्द = "वैज्ञानिकी";

यदि (लभ्यते(वाक्य_पूर्ण, शोध_शब्द)) {
    वद("लभ्यते! '" + शोध_शब्द + "' वाक्ये उपस्थितम अस्ति।");
} अथ {
    वद("न लभ्यते! '" + शोध_शब्द + "' वाक्ये नास्ति।");
}
`
  },
  {
    title: "प्रकार ज्ञानी (Type Gnosis)",
    desc: "Discovers and prints variable data types (प्रकार) such as Ank, Vakya, or Tarka.",
    code: `# Checking types inside the Vedic environment
मान संख्या = ४२;
मान पाठ = "अमृतम्";
मान तर्क_सत्य = सत्य;

वद("संख्या प्रकार (Ank):", प्रकार(संख्या));
वद("पाठ प्रकार (Vakya):", प्रकार(पाठ));
वद("तर्क प्रकार (Tarka):", प्रकार(तर्क_सत्य));
`
  }
];

const CHEATSHEET = [
  { sanskrit: "मान (Maan)", translation: "let / var", purpose: "Variable declaration", example: "मान क = १०;" },
  { sanskrit: "यदि (Yadi)", translation: "if", purpose: "Conditional block", example: "यदि (क > ५) { ... }" },
  { sanskrit: "अथ (Atha)", translation: "else", purpose: "Alternative conditional", example: "यदि (क) { ... } अथ { ... }" },
  { sanskrit: "सत्य (Satya)", translation: "true", purpose: "Boolean True literal", example: "मान क = सत्य;" },
  { sanskrit: "असत्य (Asatya)", translation: "false", purpose: "Boolean False literal", example: "मान क = असत्य;" },
  { sanskrit: "न (Na)", translation: "null", purpose: "Null value", example: "मान क = न;" },
  { sanskrit: "सूत्र (Sutra)", translation: "function", purpose: "Function declaration", example: "सूत्र योग(अ) { ... }" },
  { sanskrit: "फल (Phala)", translation: "return", purpose: "Function output value", example: "फल अ + १;" },
  { sanskrit: "चक्र (Chakra)", translation: "for", purpose: "Looping structure", example: "चक्र ( ... ) { ... }" },
  { sanskrit: "पर्यन्त (Paryant)", translation: "while", purpose: "Loop while condition holds", example: "पर्यन्त (क < १०) { ... }" },
  { sanskrit: "विराम (Viram)", translation: "break", purpose: "Break loop execution", example: "विराम;" },
  { sanskrit: "अग्रिम (Agrim)", translation: "continue", purpose: "Skip current loop iteration", example: "अग्रिम;" },
  { sanskrit: "वद (Vad)", translation: "console.log()", purpose: "Print parameters to console", example: "वद(\"नमस्कारः\");" },
  { sanskrit: "लभ्यते (Labhyate)", translation: "String.includes()", purpose: "Checks if substring exists", example: "लभ्यते(\"सत्य\", \"त\");" },
  { sanskrit: "प्रकार (Prakaar)", translation: "typeof", purpose: "Checks the data type name", example: "प्रकार(क);" },
  { sanskrit: "शब्द (Shabd)", translation: "String()", purpose: "Converts value to String", example: "शब्द(१०);" },
  { sanskrit: "अंक (Ank)", translation: "Number()", purpose: "Converts value to Number", example: "अंक(\"१०\");" },
  { sanskrit: "समय (Samay)", translation: "Date.now()", purpose: "Gets current epoch timestamp", example: "समय();" }
];

export const VedicGnosisScriptEditor: React.FC = () => {
  const [code, setCode] = useState<string>(EXAMPLES[0].code);
  const [logs, setLogs] = useState<Array<{ type: 'log' | 'error' | 'system'; text: string; time: string }>>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'reference'>('editor');

  useEffect(() => {
    // Standard system startup message
    addSystemLog("Vedic Sanskrit Compiler/Interpreter System Online. Ready for invocation.");
  }, []);

  const addSystemLog = (text: string) => {
    setLogs(prev => [...prev, {
      type: 'system',
      text,
      time: new Date().toLocaleTimeString()
    }]);
  };

  const addLog = (type: 'log' | 'error', text: string) => {
    setLogs(prev => [...prev, {
      type,
      text,
      time: new Date().toLocaleTimeString()
    }]);
  };

  const clearLogs = () => {
    setLogs([]);
    addSystemLog("Console log cleared.");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectExample = (ex: ExampleCode) => {
    setCode(ex.code);
    addSystemLog(`Loaded code example: "${ex.title}"`);
  };

  const executeCode = () => {
    setIsRunning(true);
    addSystemLog("Compiling Sanskrit structures into active executable script...");

    // Delay execution slightly to make compilation feel holographic and authentic
    setTimeout(() => {
      const logBuffer: string[] = [];
      const customLog = (...args: any[]) => {
        const formattedArgs = args.map(arg => {
          if (arg === null) return 'न (Na)';
          if (typeof arg === 'object') return JSON.stringify(arg);
          return String(arg);
        }).join(' ');
        logBuffer.push(formattedArgs);
      };

      let errorMsg: string | null = null;

      try {
        // Replace comments
        let jsCode = code;
        jsCode = jsCode.replace(/#.*/g, (match) => match.replace('#', '//'));

        // Translate Devanagari numerals to standard numerals
        const devanagariDigits: Record<string, string> = {
          '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
          '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
        };
        for (const [dev, std] of Object.entries(devanagariDigits)) {
          jsCode = jsCode.split(dev).join(std);
        }

        // Replacements for grammar keywords with boundaries to support Sanskrit identifier names
        const replacements = [
          { s: "मान", r: "let" },
          { s: "यदि", r: "if" },
          { s: "अथ", r: "else" },
          { s: "सत्य", r: "true" },
          { s: "असत्य", r: "false" },
          { s: "न", r: "null" },
          { s: "सूत्र", r: "function" },
          { s: "फल", r: "return" },
          { s: "विधि", r: "class" },
          { s: "सन्धि", r: "extends" },
          { s: "मित्र", r: "super" },
          { s: "मम", r: "this" },
          { s: "चक्र", r: "for" },
          { s: "पर्यन्त", r: "while" },
          { s: "विराम", r: "break" },
          { s: "अग्रिम", r: "continue" },
          { s: "निर्देश", r: "switch" },
          { s: "अवहन", r: "import" },
          
          // Functions mapping
          { s: "वद", r: "__vad" },
          { s: "पठन", r: "__pathan" },
          { s: "समय", r: "__samay" },
          { s: "कुल", r: "__kul" },
          { s: "प्रकार", r: "__prakaar" },
          { s: "निर्गम", r: "__nirgam" },
          { s: "त्रुटि", r: "__truti" },
          { s: "लभ्यते", r: "__labhyate" },
          { s: "शब्द", r: "__shabd" },
          { s: "अंक", r: "__ank" }
        ];

        for (const item of replacements) {
          const regexStr = `(?<![\\u0900-\\u097Fa-zA-Z0-9_])${item.s}(?![\\u0900-\\u097Fa-zA-Z0-9_])`;
          const regex = new RegExp(regexStr, 'g');
          jsCode = jsCode.replace(regex, item.r);
        }

        // Secure runner sandbox config
        const sandbox = {
          __vad: customLog,
          __pathan: (msg?: string) => {
            const input = prompt(msg || "Vedic Input Required:");
            customLog("> Input read:", input);
            return input;
          },
          __samay: () => Date.now(),
          __shabd: (val: any) => String(val),
          __ank: (val: any) => Number(val),
          __labhyate: (str: any, needle: any) => {
            const s = String(str || "");
            const n = String(needle || "");
            return s.includes(n);
          },
          __truti: (msg: any) => {
            throw new Error(String(msg || "Vedic Core Truti"));
          },
          __nirgam: () => {
            throw new Error("VEDIC_EXIT_SIGNAL");
          },
          __prakaar: (val: any) => {
            if (val === null) return "न";
            const t = typeof val;
            if (t === "number") return "अंक (Ank)";
            if (t === "string") return "वाक्य (Vakya)";
            if (t === "boolean") return "तर्क (Tarka)";
            if (t === "function") return "सूत्र (Sutra)";
            if (t === "object") {
              if (Array.isArray(val)) return "सूची (List)";
              return "उदाहरण (Instance)";
            }
            return "अज्ञात (Unknown)";
          },
          __kul: (val: any) => {
            if (val && val.constructor) return val.constructor.name;
            return "न";
          }
        };

        const runner = new Function(
          "__vad", "__pathan", "__samay", "__shabd", "__ank", "__labhyate", "__truti", "__nirgam", "__prakaar", "__kul",
          `
          try {
            ${jsCode}
          } catch (err) {
            if (err.message === "VEDIC_EXIT_SIGNAL") {
              __vad("[प्रस्थान] कार्यक्रम समाप्त।");
            } else {
              throw err;
            }
          }
          `
        );

        runner(
          sandbox.__vad,
          sandbox.__pathan,
          sandbox.__samay,
          sandbox.__shabd,
          sandbox.__ank,
          sandbox.__labhyate,
          sandbox.__truti,
          sandbox.__nirgam,
          sandbox.__prakaar,
          sandbox.__kul
        );

      } catch (err: any) {
        errorMsg = err.message || String(err);
      }

      // Render buffered outputs
      if (logBuffer.length > 0) {
        logBuffer.forEach(line => addLog('log', line));
      }
      if (errorMsg) {
        addLog('error', `दोषः (Error): ${errorMsg}`);
      } else {
        addSystemLog("Vedic execution completed successfully (सफलतापूर्वक सम्पादितम्)।");
      }
      setIsRunning(false);
    }, 600);
  };

  return (
    <div id="vedic-sandbox-panel" className="flex flex-col lg:flex-row gap-5 w-full h-full text-white">
      {/* Sidebar: Control Panel & Examples */}
      <div className="flex flex-col w-full lg:w-[280px] shrink-0 gap-4">
        {/* Navigation / Mode tabs */}
        <div className="flex gap-1 p-1 bg-black/40 border border-white/5 rounded-xl">
          <button 
            onClick={() => setActiveTab('editor')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase transition-all ${activeTab === 'editor' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-stone-500 hover:text-white'}`}
          >
            <Code size={11} /> Gnosis IDE
          </button>
          <button 
            onClick={() => setActiveTab('reference')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase transition-all ${activeTab === 'reference' ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30' : 'text-stone-500 hover:text-white'}`}
          >
            <BookOpen size={11} /> Sutra Codex
          </button>
        </div>

        {/* Examples List */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
          <h4 className="text-xs font-mono font-black text-cyan-400 tracking-widest uppercase flex items-center gap-2">
            <Sparkles size={12} className="animate-pulse" /> SCRIPT TEMPLATES
          </h4>
          <p className="text-[10px] text-stone-400 font-sans leading-relaxed">
            Select an ancient program template to load into the workspace compiler.
          </p>
          <div className="flex flex-col gap-2 mt-1">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => handleSelectExample(ex)}
                className="w-full text-left p-2 rounded-xl bg-black/30 border border-white/5 hover:border-cyan-500/40 hover:bg-cyan-950/20 transition-all group cursor-pointer"
              >
                <div className="text-[11px] font-mono font-bold text-stone-200 group-hover:text-cyan-300 transition-colors">
                  {ex.title}
                </div>
                <div className="text-[9px] text-stone-500 leading-tight mt-0.5 font-sans group-hover:text-stone-400">
                  {ex.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Informative Note */}
        <div className="bg-gradient-to-br from-fuchsia-950/20 to-cyan-950/20 border border-white/5 p-4 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-fuchsia-400 font-mono text-[10px] uppercase font-bold tracking-wider">
            <HelpCircle size={12} /> Divine Logic
          </div>
          <p className="text-[10px] text-stone-400 font-sans leading-relaxed">
            Vedic merges <strong>Sanskrit lexical linguistics</strong> with <strong>Rust-based runtime safety</strong>. In this web interface, we transpile your pure Devanagari code variables, loops, and conditions into active Sandboxed JavaScript executing live.
          </p>
        </div>
      </div>

      {/* Main Area: Editor & Output or Reference Panel */}
      <div className="flex-1 flex flex-col gap-4">
        {activeTab === 'editor' ? (
          <>
            {/* Editor Console Header */}
            <div className="bg-black/40 border border-white/5 rounded-2xl flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5 shrink-0">
                <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
                  <Terminal size={12} /> app_script.vd
                </div>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={handleCopyCode} 
                    title="Copy Code"
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white rounded-lg transition-all"
                  >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                  <button 
                    onClick={() => { setCode(''); addSystemLog("Workspace cleared."); }} 
                    title="Clear Workspace"
                    className="p-1.5 bg-white/5 hover:bg-rose-950/30 text-stone-400 hover:text-rose-400 rounded-lg transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Code text-area */}
              <div className="relative flex">
                {/* Visual Line Numbers */}
                <div className="w-10 bg-black/60 font-mono text-[10px] text-stone-600 text-right pr-2 py-4 select-none border-r border-white/5">
                  {Array.from({ length: code.split('\n').length || 1 }).map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 min-h-[220px] md:min-h-[260px] bg-transparent font-mono text-xs text-stone-200 p-4 outline-none resize-y selection:bg-cyan-500/30 leading-relaxed overflow-y-auto"
                  placeholder="अत्र संस्कृत संहितां लिखन्तु... (Write Sanskrit Vedic code here)"
                  spellCheck={false}
                />
              </div>

              {/* Execution Drawer Controls */}
              <div className="flex items-center justify-between p-3 bg-black/60 border-t border-white/5">
                <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest">
                  Ready to compile & parse
                </span>
                <button
                  onClick={executeCode}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-600 hover:to-fuchsia-600 text-black font-black text-xs uppercase tracking-widest transition-all disabled:opacity-40 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" /> Compiling...
                    </>
                  ) : (
                    <>
                      <Play size={12} fill="currentColor" /> Invoke Gnosis (प्रचल)
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Logs Terminal Console */}
            <div className="flex-1 min-h-[180px] bg-black/80 border border-white/10 rounded-2xl flex flex-col overflow-hidden font-mono">
              <div className="flex items-center justify-between p-3 bg-white/5 border-b border-white/10 shrink-0">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider flex items-center gap-2">
                  <Terminal size={12} /> EXECUTOR OUTPUT / परिणामः
                </span>
                <button 
                  onClick={clearLogs}
                  className="text-[9px] text-stone-500 hover:text-stone-300 transition-colors uppercase font-bold"
                >
                  Clear Log
                </button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-1.5 text-xs select-text">
                <AnimatePresence>
                  {logs.map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex gap-3 leading-relaxed ${
                        log.type === 'error' ? 'text-rose-400' :
                        log.type === 'system' ? 'text-cyan-500' :
                        'text-stone-100'
                      }`}
                    >
                      <span className="text-stone-600 select-none text-[10px] shrink-0 mt-0.5">[{log.time}]</span>
                      <div className="flex-1 whitespace-pre-wrap break-all">
                        {log.type === 'system' && <span className="text-cyan-600 mr-1">◆</span>}
                        {log.type === 'error' && <span className="text-rose-600 mr-1">▲ दोषः (Dosa):</span>}
                        {log.text}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {logs.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-stone-600 py-12 gap-2 select-none">
                    <Terminal size={24} className="text-stone-800" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Console Empty</span>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* References Panel */
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 overflow-hidden h-full">
            <div>
              <h3 className="text-sm font-mono font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <BookOpen size={14} /> VEDIC SUTRA CODEX
              </h3>
              <p className="text-[11px] text-stone-400 leading-relaxed mt-1 font-sans">
                Review the divine keywords of the Vedic programming language syntax. Map them to classical javascript or Rust equivalents.
              </p>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
                {CHEATSHEET.map((item, i) => (
                  <div key={i} className="p-3 bg-black/40 border border-white/5 rounded-xl flex flex-col gap-1.5 hover:border-cyan-500/20 transition-all">
                    <div className="flex justify-between items-center border-b border-white/5 pb-1">
                      <span className="text-[11px] font-mono font-bold text-cyan-300">{item.sanskrit}</span>
                      <span className="text-[9px] font-mono bg-fuchsia-500/10 text-fuchsia-300 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">{item.translation}</span>
                    </div>
                    <div className="text-[10px] text-stone-400 font-sans leading-tight">
                      {item.purpose}
                    </div>
                    <div className="text-[9px] font-mono text-emerald-400 bg-emerald-950/10 p-1.5 rounded-lg border border-emerald-500/10 mt-1">
                      {item.example}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Activity, X } from 'lucide-react';

interface VoiceCommanderProps {
  setActiveTab: (tab: any) => void;
}

export const VoiceCommander: React.FC<VoiceCommanderProps> = ({ setActiveTab }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [statusText, setStatusText] = useState('Standby');
  const [isOpen, setIsOpen] = useState(false);
  const recognitionRef = useRef<any>(null);
  const visualizerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
          setStatusText('Processing Signal...');
        };

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          setStatusText('Listening...');
          setTranscript('');
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setStatusText(`Error: ${event.error}`);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      } else {
        setStatusText('Voice control offline (unsupported)');
      }
    }
  }, []);

  useEffect(() => {
    if (!isListening && transcript) {
      processCommand(transcript);
    }
  }, [isListening]);

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium')) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.rate = 0.95;
      utterance.pitch = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const processCommand = (cmd: string) => {
    const lowerCmd = cmd.toLowerCase();
    let handled = false;
    let responseText = '';

    // Command matching logic
    if (lowerCmd.includes('torus') || lowerCmd.includes('field')) {
      setActiveTab('torus'); handled = true; responseText = 'Accessing Torus Field Dynamics.';
    } else if (lowerCmd.includes('planets') || lowerCmd.includes('solar system')) {
      setActiveTab('planets'); handled = true; responseText = 'Initializing planetary alignment sequence.';
    } else if (lowerCmd.includes('numbers') || lowerCmd.includes('numerology')) {
      setActiveTab('numbers'); handled = true; responseText = 'Calculating numerological resonance.';
    } else if (lowerCmd.includes('kabbalah') || lowerCmd.includes('tree of life')) {
      setActiveTab('kabbalah'); handled = true; responseText = 'Opening Tree of Life matrix.';
    } else if (lowerCmd.includes('chakras') || lowerCmd.includes('energy centers')) {
      setActiveTab('chakras'); handled = true; responseText = 'Scanning energy centers.';
    } else if (lowerCmd.includes('dna') || lowerCmd.includes('celestial') || lowerCmd.includes('blueprint')) {
      setActiveTab('celestial_dna'); handled = true; responseText = 'Accessing Celestial DNA structures.';
    } else if (lowerCmd.includes('angel') || lowerCmd.includes('sync')) {
      setActiveTab('angel_numbers'); handled = true; responseText = 'Decrypting synchronistic markers.';
    } else if (lowerCmd.includes('vortex') || lowerCmd.includes('math')) {
      setActiveTab('vortex'); handled = true; responseText = 'Initializing vortex mathematics sequence.';
    } else if (lowerCmd.includes('gematria') || lowerCmd.includes('cipher')) {
      setActiveTab('gematria_calc'); handled = true; responseText = 'Opening quantum gematria cipher.';
    } else if (lowerCmd.includes('grid') || lowerCmd.includes('ratio') || lowerCmd.includes('kathara')) {
      setActiveTab('golden_ratio'); handled = true; responseText = 'Rendering Kathara Grid architecture.';
    } else if (lowerCmd.includes('sky map') || lowerCmd.includes('atlas') || lowerCmd.includes('stars')) {
      setActiveTab('sky_map'); handled = true; responseText = 'Accessing deep space telemetry.';
    } else if (lowerCmd.includes('soul path') || lowerCmd.includes('north node') || lowerCmd.includes('past life')) {
      setActiveTab('soul_path'); handled = true; responseText = 'Visualizing Karmic Journey and Destiny Arc.';
    } else if (lowerCmd.includes('brain') || lowerCmd.includes('neural')) {
      setActiveTab('brain'); handled = true; responseText = 'Accessing Neural Interface core.';
    } else if (lowerCmd.includes('synthesis') || lowerCmd.includes('higher mind') || lowerCmd.includes('deep')) {
      setActiveTab('synthesis'); handled = true; responseText = 'Connecting to Higher Mind deep synthesis.';
    } else if (lowerCmd.includes('sandbox') || lowerCmd.includes('create')) {
      setActiveTab('sandbox'); handled = true; responseText = 'Opening creation sandbox environments.';
    } 

    if (handled) {
      setStatusText('Command Recognized');
      speakResponse(responseText);
    } else {
      if (lowerCmd.length > 5 && (lowerCmd.includes('why') || lowerCmd.includes('what') || lowerCmd.includes('how') || lowerCmd.includes('who') || lowerCmd.includes('explain'))) {
         setActiveTab('synthesis');
         setStatusText('Processing Query via Higher Mind...');
         speakResponse('Routing complex query to Higher Mind synthesis.');
      } else {
         setStatusText('Unknown Command');
         speakResponse('Command unrecognized. Please recalibrate.');
      }
    }

    setTimeout(() => {
        setTranscript('');
        setStatusText(recognitionRef.current ? 'Standby' : 'Offline');
        setIsOpen(false);
    }, 2500);
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        setIsOpen(true);
        try {
          recognitionRef.current.start();
        } catch (e) {
          // If already started
        }
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-stone-900/90 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-4 w-[300px] shadow-[0_0_30px_rgba(99,102,241,0.1)] overflow-hidden relative"
          >
            {/* Holographic grid background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.5) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
            }}/>
            
            <div className="relative z-10 flex justify-between items-center mb-3 border-b border-indigo-500/20 pb-2">
              <span className="text-[10px] text-indigo-400 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                {isListening ? <Activity size={12} className="animate-pulse" /> : <Mic size={12} />}
                Neural Voice Interface
              </span>
              <button onClick={() => { setIsOpen(false); recognitionRef.current?.stop(); }} className="text-stone-500 hover:text-indigo-400">
                <X size={14} />
              </button>
            </div>

            <div className="h-20 flex items-center justify-center relative">
              {isListening ? (
                <div className="flex gap-1 items-end justify-center h-full">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 bg-indigo-500 rounded-t-full"
                      animate={{ height: ['20%', '80%', '20%'] }}
                      transition={{ 
                        duration: 0.5 + Math.random() * 0.5, 
                        repeat: Infinity, 
                        repeatType: 'reverse',
                        delay: i * 0.1
                      }}
                      style={{ 
                        boxShadow: '0 0 10px rgba(99,102,241,0.5)',
                        opacity: 0.5 + Math.random() * 0.5 
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-stone-600 font-mono text-xs text-center">
                   Awaiting uplink...
                </div>
              )}
            </div>

            <div className="mt-3 bg-black/40 rounded-xl p-3 min-h-[60px] border border-white/5 relative overflow-hidden flex flex-col justify-between">
              <p className="text-sm font-light text-stone-200 tracking-wide break-words">{transcript || '...'}</p>
              <div className="mt-2 text-[9px] text-stone-500 uppercase tracking-widest font-bold flex justify-between items-end">
                <span>STATUS</span>
                <span className={statusText.includes('Command Recognized') ? 'text-emerald-400' : 'text-indigo-400'}>
                  {statusText}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleListen}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all border
          ${isListening 
            ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.5)]' 
            : 'bg-stone-900 border-white/10 text-stone-400 hover:text-white hover:border-indigo-500/50 hover:bg-stone-800'
          }`}
      >
        <div className="relative">
          <Mic size={24} />
          {isListening && (
            <motion.div 
              className="absolute inset-0 rounded-full border-2 border-indigo-400"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>
      </motion.button>
    </div>
  );
};

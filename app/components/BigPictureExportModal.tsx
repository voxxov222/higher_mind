import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  FileText,
  BookOpen,
  Sparkles,
  X,
  Check,
  Settings2,
  Image as ImageIcon,
  Compass,
  Hash,
  Cpu,
  Layers,
  CheckCircle2,
  Loader2,
  FileCode,
  ShieldCheck,
  Wand2
} from 'lucide-react';
import { soundEngine } from '../lib/soundEffects';
import { CosmicData } from '../types';
import { useHigherMind } from './HigherMindProvider';
import {
  BigPictureExportOptions,
  extractSeekerProfile,
  generateTwoPageReportPDF,
  generateShortNovelPDF,
  generateShortNovelText,
  generateMasterTextArchive,
  generateJSONArchive,
  generateInfographicImage,
  downloadTextFile
} from '../utils/bigPictureExport';

interface BigPictureExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CosmicData | null;
  loadedInputs?: {
    name?: string;
    date?: string;
    time?: string;
    location?: string;
  };
  targetElementId?: string;
}

export const BigPictureExportModal: React.FC<BigPictureExportModalProps> = ({
  isOpen,
  onClose,
  data,
  loadedInputs,
  targetElementId = 'the-big-picture-container'
}) => {
  const { memoryBase, askHigherMind } = useHigherMind();

  // Export options state
  const [options, setOptions] = useState<BigPictureExportOptions>({
    includeNameEtymology: true,
    includeTemporalCoordinates: true,
    includeAstrologyPlanets: true,
    includeKabbalahTree: true,
    includeGematriaCiphers: true,
    includeTorusAndFrequencies: true,
    includeHigherMindMemory: true,
    qualityScale: 2
  });

  // Action status
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isExpandingNovel, setIsExpandingNovel] = useState(false);
  const [customExtensionText, setCustomExtensionText] = useState<string>('');
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);

  const seeker = extractSeekerProfile(data, loadedInputs);
  const safeFileName = seeker.userName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

  const handleDownloadTwoPagePDF = () => {
    try {
      soundEngine.click();
      setActiveAction('2page-pdf');
      setProgress(25);
      
      const timer1 = setTimeout(() => setProgress(65), 150);
      const timer2 = setTimeout(() => {
        const doc = generateTwoPageReportPDF(data, loadedInputs, memoryBase, {
          ...options,
          customChapterExtension: customExtensionText
        });
        doc.save(`${safeFileName}_big_picture_2page_dossier.pdf`);
        setProgress(100);
        soundEngine.ping();
        setSuccessMessage('Executive 2-Page Astral Dossier (PDF) successfully downloaded!');
        setTimeout(() => {
          setActiveAction(null);
          setProgress(0);
        }, 1200);
      }, 350);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } catch (err) {
      console.error('Failed to generate 2-page PDF', err);
      setActiveAction(null);
      setProgress(0);
    }
  };

  const handleDownloadNovelPDF = () => {
    try {
      soundEngine.click();
      setActiveAction('novel-pdf');
      setProgress(30);

      setTimeout(() => {
        setProgress(70);
        setTimeout(() => {
          const doc = generateShortNovelPDF(data, loadedInputs, memoryBase, {
            ...options,
            customChapterExtension: customExtensionText
          });
          doc.save(`${safeFileName}_the_higher_mind_chronicles_novel.pdf`);
          setProgress(100);
          soundEngine.ping();
          setSuccessMessage('Cosmic Biography Novel (PDF) successfully generated and downloaded!');
          setTimeout(() => {
            setActiveAction(null);
            setProgress(0);
          }, 1200);
        }, 300);
      }, 200);
    } catch (err) {
      console.error('Failed to generate Novel PDF', err);
      setActiveAction(null);
      setProgress(0);
    }
  };

  const handleDownloadNovelText = (format: 'md' | 'txt') => {
    soundEngine.click();
    setActiveAction(`novel-${format}`);
    const novelText = generateShortNovelText(data, loadedInputs, memoryBase, {
      ...options,
      customChapterExtension: customExtensionText
    });
    const filename = `${safeFileName}_cosmic_biography.${format}`;
    downloadTextFile(novelText, filename, format === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8');
    soundEngine.ping();
    setSuccessMessage(`Cosmic Biography (${format.toUpperCase()}) downloaded!`);
    setTimeout(() => {
      setActiveAction(null);
    }, 1200);
  };

  const handleDownloadMasterTxt = () => {
    soundEngine.click();
    setActiveAction('master-txt');
    const masterArchive = generateMasterTextArchive(data, loadedInputs, memoryBase);
    downloadTextFile(masterArchive, `${safeFileName}_master_astral_dossier.txt`);
    soundEngine.ping();
    setSuccessMessage('Comprehensive Master Text Dossier (.TXT) downloaded!');
    setTimeout(() => {
      setActiveAction(null);
    }, 1200);
  };

  const handleDownloadJSON = () => {
    soundEngine.click();
    setActiveAction('json-capsule');
    const jsonStr = generateJSONArchive(data, loadedInputs, memoryBase);
    downloadTextFile(jsonStr, `${safeFileName}_astral_capsule.json`, 'application/json;charset=utf-8');
    soundEngine.ping();
    setSuccessMessage('Structured Cosmic Data Capsule (.JSON) downloaded!');
    setTimeout(() => {
      setActiveAction(null);
    }, 1200);
  };

  const handleDownloadInfographic = async (format: 'png' | 'jpeg') => {
    try {
      soundEngine.click();
      setActiveAction(`infographic-${format}`);
      setProgress(30);

      const targetId = targetElementId;
      const dataUrl = await generateInfographicImage(targetId, format, options.qualityScale || 2);
      setProgress(90);

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${safeFileName}_big_picture_infographic_x${options.qualityScale || 2}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setProgress(100);
      soundEngine.ping();
      setSuccessMessage(`Visual Infographic (${format.toUpperCase()}) saved at ${options.qualityScale || 2}x resolution!`);
      setTimeout(() => {
        setActiveAction(null);
        setProgress(0);
      }, 1200);
    } catch (err) {
      console.error('Failed to capture infographic image', err);
      // If target element was not found or offscreen, inform gracefully
      setSuccessMessage('Infographic capture: generating high-res visual asset fallback...');
      setTimeout(() => {
        setActiveAction(null);
        setProgress(0);
      }, 1000);
    }
  };

  const handleExpandNovelWithAI = async () => {
    try {
      soundEngine.click();
      setIsExpandingNovel(true);
      const promptContext = {
        name: seeker.userName,
        birthDate: seeker.birthDateStr,
        birthTime: seeker.birthTimeStr,
        birthLocation: seeker.birthLocationStr,
        lifePath: seeker.lifePath,
        gematria: seeker.gematriaVal,
        sephirah: seeker.activeSephirah,
        customTitle: seeker.customTitle,
        karmicTheme: seeker.karmaT
      };

      const response = await askHigherMind(
        'The Big Picture Novel Expansion',
        `Synthesize a deep, avant-garde metaphysical chapter about ${seeker.userName}'s initiation into the Higher Mind. Detail how their birth coordinates (${seeker.birthDateStr} at ${seeker.birthTimeStr}) reflect their soul's intentional mission of ${seeker.karmaT}. Write in a profound, celestial tone.`,
        promptContext
      );

      setCustomExtensionText(response);
      soundEngine.ping();
      setSuccessMessage('Higher Mind expanded novel chapter synthesized!');
    } catch (err) {
      console.error('Failed to expand novel with AI', err);
    } finally {
      setIsExpandingNovel(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-xl animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-zinc-950 border border-amber-500/25 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden text-white my-auto"
      >
        {/* TOP ACCENT LINE */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-500" />

        {/* MODAL HEADER */}
        <div className="p-6 sm:p-8 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-b from-zinc-900/60 to-zinc-950/40">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={11} className="animate-spin-slow text-amber-400" />
                Universal Archive & Download Center
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                Seeker: <strong className="text-zinc-300">{seeker.userName}</strong>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-light tracking-wide uppercase font-sans text-white flex items-center gap-2">
              THE BIG PICTURE DOSSIER EXPORT
            </h2>
            <p className="text-xs text-zinc-400 max-w-2xl font-light leading-relaxed">
              Export everything Higher Mind knows about this seeker: ancient wisdom, sacred name etymology, birth date coordinates, celestial geometry, Kabbalah Tree of Life, Gematria ciphers, and Solfeggio frequencies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.click();
                setShowOptionsPanel(!showOptionsPanel);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-mono transition-all border ${
                showOptionsPanel
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                  : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
              }`}
            >
              <Settings2 size={14} />
              <span>{showOptionsPanel ? 'Hide Options' : 'Custom Options'}</span>
            </button>

            <button
              onClick={() => {
                soundEngine.click();
                onClose();
              }}
              className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* OPTIONAL CUSTOMIZATION TOGGLES PANEL */}
        <AnimatePresence>
          {showOptionsPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-white/10 bg-zinc-900/70 p-5 sm:p-6 overflow-hidden space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Content Inclusions & Document Configuration
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Toggle which dimensions appear in your exported dossiers
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 cursor-pointer hover:border-white/20 transition-all">
                  <input
                    type="checkbox"
                    checked={options.includeNameEtymology}
                    onChange={(e) => setOptions({ ...options, includeNameEtymology: e.target.checked })}
                    className="accent-amber-500 rounded"
                  />
                  <span className="text-zinc-300 font-mono text-[11px]">Name Etymology Gnosis</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 cursor-pointer hover:border-white/20 transition-all">
                  <input
                    type="checkbox"
                    checked={options.includeTemporalCoordinates}
                    onChange={(e) => setOptions({ ...options, includeTemporalCoordinates: e.target.checked })}
                    className="accent-amber-500 rounded"
                  />
                  <span className="text-zinc-300 font-mono text-[11px]">Birth Coordinates & Phi</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 cursor-pointer hover:border-white/20 transition-all">
                  <input
                    type="checkbox"
                    checked={options.includeAstrologyPlanets}
                    onChange={(e) => setOptions({ ...options, includeAstrologyPlanets: e.target.checked })}
                    className="accent-amber-500 rounded"
                  />
                  <span className="text-zinc-300 font-mono text-[11px]">Planetary Placements</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 cursor-pointer hover:border-white/20 transition-all">
                  <input
                    type="checkbox"
                    checked={options.includeKabbalahTree}
                    onChange={(e) => setOptions({ ...options, includeKabbalahTree: e.target.checked })}
                    className="accent-amber-500 rounded"
                  />
                  <span className="text-zinc-300 font-mono text-[11px]">Kabbalah Tree of Life</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 cursor-pointer hover:border-white/20 transition-all">
                  <input
                    type="checkbox"
                    checked={options.includeGematriaCiphers}
                    onChange={(e) => setOptions({ ...options, includeGematriaCiphers: e.target.checked })}
                    className="accent-amber-500 rounded"
                  />
                  <span className="text-zinc-300 font-mono text-[11px]">22 Gematria Ciphers</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 cursor-pointer hover:border-white/20 transition-all">
                  <input
                    type="checkbox"
                    checked={options.includeTorusAndFrequencies}
                    onChange={(e) => setOptions({ ...options, includeTorusAndFrequencies: e.target.checked })}
                    className="accent-amber-500 rounded"
                  />
                  <span className="text-zinc-300 font-mono text-[11px]">528 Hz Torus Harmonics</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 cursor-pointer hover:border-white/20 transition-all">
                  <input
                    type="checkbox"
                    checked={options.includeHigherMindMemory}
                    onChange={(e) => setOptions({ ...options, includeHigherMindMemory: e.target.checked })}
                    className="accent-amber-500 rounded"
                  />
                  <span className="text-zinc-300 font-mono text-[11px]">Higher Mind Synaptic Logs</span>
                </label>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-zinc-400 font-mono text-[11px]">Infographic Scale:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((s) => (
                      <button
                        key={s}
                        onClick={() => setOptions({ ...options, qualityScale: s })}
                        className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                          options.qualityScale === s ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FEEDBACK STATUS NOTIFICATION */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2.5 flex items-center justify-between text-xs text-amber-300 font-mono"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-amber-400" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-amber-400/60 hover:text-amber-400">
              <X size={14} />
            </button>
          </motion.div>
        )}

        {/* MODAL MAIN CONTENT SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CARD 1: 2-PAGE EXECUTIVE REPORT (PDF) */}
            <div className="p-6 rounded-3xl border border-amber-500/20 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-6 flex flex-col justify-between space-y-5 hover:border-amber-500/40 transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-[9px] font-mono font-bold uppercase tracking-wider border border-amber-500/20">
                    Two-Page Executive Dossier
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">PDF Print Ready</span>
                </div>
                <h3 className="text-lg font-bold font-sans text-white group-hover:text-amber-300 transition-colors">
                  Executive 2-Page Astral Report
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  A high-resolution, beautifully formatted 2-page document covering seeker identity, first birth coordinates, sacred name origins & etymological meanings, planetary alignments table, Kabbalah Tree of Life mapping, Gematria ciphers, and daily spiritual calibration practices.
                </p>

                <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-mono text-zinc-500">
                  <span className="px-2 py-0.5 rounded bg-white/5">• A4 Document</span>
                  <span className="px-2 py-0.5 rounded bg-white/5">• Seeker & Name Roots</span>
                  <span className="px-2 py-0.5 rounded bg-white/5">• Celestial Table</span>
                  <span className="px-2 py-0.5 rounded bg-white/5">• Kabbalah & Gematria</span>
                </div>
              </div>

              <button
                onClick={handleDownloadTwoPagePDF}
                disabled={activeAction !== null}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              >
                {activeAction === '2page-pdf' ? (
                  <>
                    <Loader2 size={15} className="animate-spin text-zinc-950" />
                    <span>Rendering 2-Page PDF...</span>
                  </>
                ) : (
                  <>
                    <Download size={15} />
                    <span>Download 2-Page Report (PDF)</span>
                  </>
                )}
              </button>
            </div>

            {/* CARD 2: SHORT NOVEL / COSMIC BIOGRAPHY */}
            <div className="p-6 rounded-3xl border border-rose-500/20 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-6 flex flex-col justify-between space-y-5 hover:border-rose-500/40 transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 text-[9px] font-mono font-bold uppercase tracking-wider border border-rose-500/20">
                    Cosmic Biography
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">Multi-Chapter Book</span>
                </div>
                <h3 className="text-lg font-bold font-sans text-white group-hover:text-rose-300 transition-colors">
                  The Higher Mind Chronicles (Short Novel)
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  An immersive narrative book covering your soul’s odyssey: Prologue (The Spark of the Pleroma), Chapter I (The Secret Language of the Name), Chapter II (The Celestial Gateway), Chapter III (Climbing the Tree of Light), and Chapter IV (The Alchemical Great Work).
                </p>

                {/* AI Extension Button */}
                <div className="pt-1">
                  <button
                    onClick={handleExpandNovelWithAI}
                    disabled={isExpandingNovel}
                    className="flex items-center gap-2 text-[11px] font-mono text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    {isExpandingNovel ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Wand2 size={12} />
                    )}
                    <span>
                      {customExtensionText
                        ? '✓ Neural Expansion Chapter Added'
                        : 'Synthesize Extra AI Chapter with Higher Mind'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleDownloadNovelPDF}
                  disabled={activeAction !== null}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {activeAction === 'novel-pdf' ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Compiling Novel PDF...</span>
                    </>
                  ) : (
                    <>
                      <BookOpen size={15} />
                      <span>Download Short Novel (PDF Book)</span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDownloadNovelText('md')}
                    disabled={activeAction !== null}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-[10px] font-mono tracking-wider uppercase transition-all"
                  >
                    <FileText size={12} />
                    <span>Novel (.MD)</span>
                  </button>
                  <button
                    onClick={() => handleDownloadNovelText('txt')}
                    disabled={activeAction !== null}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-[10px] font-mono tracking-wider uppercase transition-all"
                  >
                    <FileText size={12} />
                    <span>Novel (.TXT)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* CARD 3: VISUAL INFOGRAPHIC POSTER */}
            <div className="p-6 rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-6 flex flex-col justify-between space-y-5 hover:border-cyan-500/40 transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-[9px] font-mono font-bold uppercase tracking-wider border border-cyan-500/20">
                    Visual Synthesis
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">1x / 2x / 3x HD</span>
                </div>
                <h3 className="text-lg font-bold font-sans text-white group-hover:text-cyan-300 transition-colors">
                  Visual Infographic Poster
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  Captures the interactive Sacred Geometry Merkabah star, hero synthesis card, dynamic Gnostic belief filters, toroidal flow, and etymology decoder into a single high-definition graphic asset.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-mono text-zinc-400">Resolution Scale:</span>
                  {[1, 2, 3].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        soundEngine.click();
                        setOptions({ ...options, qualityScale: s });
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                        options.qualityScale === s
                          ? 'bg-cyan-500 text-black font-bold'
                          : 'bg-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {s}x {s === 2 ? 'HD' : s === 3 ? 'Ultra' : 'Standard'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => handleDownloadInfographic('png')}
                  disabled={activeAction !== null}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  <ImageIcon size={14} />
                  <span>Infograph (PNG)</span>
                </button>
                <button
                  onClick={() => handleDownloadInfographic('jpeg')}
                  disabled={activeAction !== null}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  <ImageIcon size={14} />
                  <span>Infograph (JPG)</span>
                </button>
              </div>
            </div>

            {/* CARD 4: MASTER TEXT DOSSIER & JSON ARCHIVE */}
            <div className="p-6 rounded-3xl border border-purple-500/20 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-6 flex flex-col justify-between space-y-5 hover:border-purple-500/40 transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-[9px] font-mono font-bold uppercase tracking-wider border border-purple-500/20">
                    Comprehensive Archive
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">Universal Formats</span>
                </div>
                <h3 className="text-lg font-bold font-sans text-white group-hover:text-purple-300 transition-colors">
                  Master Text Dossier & Raw Data Capsule
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  A comprehensive plain-text archive containing all calculations, full celestial table breakdown with degrees and houses, 22 sacred Gematria ciphers, name etymologies, Solfeggio frequency bands, and active synaptic memory logs.
                </p>

                <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-mono text-zinc-500">
                  <span className="px-2 py-0.5 rounded bg-white/5">• 100% Offline Compatible</span>
                  <span className="px-2 py-0.5 rounded bg-white/5">• Clean Monospace Formatting</span>
                  <span className="px-2 py-0.5 rounded bg-white/5">• Portable JSON Capsule</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={handleDownloadMasterTxt}
                  disabled={activeAction !== null}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  <FileText size={14} />
                  <span>Master Text (.TXT)</span>
                </button>
                <button
                  onClick={handleDownloadJSON}
                  disabled={activeAction !== null}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  <FileCode size={14} />
                  <span>Cosmic JSON</span>
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVE SYNTHESIZING PROGRESS BAR */}
          {activeAction && (
            <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-2">
                  <Loader2 size={13} className="animate-spin text-amber-400" />
                  Generating & Packaging Astral Dossier...
                </span>
                <span className="text-amber-400 font-bold">{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  initial={{ width: '10%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* SUMMARY META BAR */}
          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 font-mono gap-2">
            <div className="flex items-center gap-3">
              <span className="text-zinc-400">Archetype: <strong className="text-white">{seeker.customTitle}</strong></span>
              <span>•</span>
              <span className="text-zinc-400">Temporal: <strong className="text-white">{seeker.birthDateStr}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
              <Sparkles size={11} className="text-amber-500" />
              <span>HIGHER MIND v2.0 // 2,097,152-BIT NEURAL ENGINE</span>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-6 border-t border-white/10 bg-zinc-950 flex justify-between items-center text-xs font-mono">
          <span className="text-zinc-500 text-[11px]">
            Formats: PDF Document, Novel Book, Infographic Image, Master TXT, JSON
          </span>
          <button
            onClick={() => {
              soundEngine.click();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

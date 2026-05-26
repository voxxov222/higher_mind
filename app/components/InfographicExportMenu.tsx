import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, FileText, Image as ImageIcon, Film, X, ChevronDown, Check } from 'lucide-react';
import { toJpeg, toPng, toBlob } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

interface ExportMenuProps {
  targetId: string;
  fileName: string;
  onClose: () => void;
}

export const InfographicExportMenu = ({ targetId, fileName, onClose }: ExportMenuProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async (format: 'pdf' | 'jpeg' | 'png' | 'gif') => {
    const element = document.getElementById(targetId);
    if (!element) return;

    setIsExporting(true);
    setProgress(10);

    try {
      if (format === 'jpeg' || format === 'png') {
        const dataUrl = format === 'jpeg' 
          ? await toJpeg(element, { quality: 0.95, backgroundColor: '#09090b' })
          : await toPng(element, { backgroundColor: '#09090b' });
        
        setProgress(100);
        const link = document.createElement('a');
        link.download = `${fileName}.${format}`;
        link.href = dataUrl;
        link.click();
      } else if (format === 'pdf') {
        const dataUrl = await toPng(element, { quality: 1, backgroundColor: '#09090b' });
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${fileName}.pdf`);
        setProgress(100);
      } else if (format === 'gif') {
        const gif = new GIFEncoder();
        
        const frames = 30; // Increased frames
        const fps = 15;
        
        for (let i = 0; i < frames; i++) {
          setProgress(Math.floor((i / frames) * 90) + 10);
          const canvas = await toBlob(element, { backgroundColor: '#09090b', quality: 0.8 });
          if (!canvas) continue;
          
          const img = await new Promise<HTMLImageElement>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.src = e.target?.result as string;
            };
            reader.readAsDataURL(canvas);
          });

          const drawCanvas = document.createElement('canvas');
          drawCanvas.width = img.width / 1.5; 
          drawCanvas.height = img.height / 1.5;
          const ctx = drawCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, drawCanvas.width, drawCanvas.height);
            const { data } = ctx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
            const palette = quantize(data, 256);
            const index = applyPalette(data, palette);
            gif.writeFrame(index, drawCanvas.width, drawCanvas.height, { palette, delay: 1000 / fps });
          }
          
          await new Promise(r => setTimeout(r, 60)); 
        }
        
        gif.finish();
        const blob = new Blob([gif.bytes()], { type: 'image/gif' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${fileName}.gif`;
        link.href = url;
        link.click();
        setProgress(100);
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setProgress(0);
        onClose();
      }, 500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      className="absolute top-16 right-4 z-50 w-72 bg-zinc-900/90 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Export Matrix</h3>
        <button onClick={onClose} className="p-1 hover:text-white text-zinc-500">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-2">
        <ExportButton 
          icon={<FileText size={16} />} 
          label="Document (PDF)" 
          sub="High fidelity printing"
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
        />
        <ExportButton 
          icon={<ImageIcon size={16} />} 
          label="Image (JPEG)" 
          sub="95% Quality • Social Ready"
          onClick={() => handleExport('jpeg')}
          disabled={isExporting}
        />
        <ExportButton 
          icon={<ImageIcon size={16} />} 
          label="Asset (PNG)" 
          sub="Lossless • Transparent"
          onClick={() => handleExport('png')}
          disabled={isExporting}
        />
        <ExportButton 
          icon={<Film size={16} />} 
          label="Sequence (GIF)" 
          sub="Animated Canvas Only"
          onClick={() => handleExport('gif')}
          disabled={isExporting}
        />
      </div>

      {isExporting && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>SYNTHESIZING...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

const ExportButton = ({ icon, label, sub, onClick, disabled }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all text-left disabled:opacity-50"
  >
    <div className="p-2 bg-zinc-800 rounded-lg text-purple-400">
      {icon}
    </div>
    <div className="flex-1">
      <div className="text-xs font-bold text-zinc-200">{label}</div>
      <div className="text-[10px] text-zinc-500">{sub}</div>
    </div>
  </button>
);

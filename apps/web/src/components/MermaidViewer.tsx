import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  FileCode2 
} from 'lucide-react';

interface MermaidViewerProps {
  chart: string;
  className?: string;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ chart, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [zoom, setZoom] = useState<number>(1);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        primaryColor: '#0e2439',
        primaryTextColor: '#22d3ee',
        primaryBorderColor: '#0891b2',
        lineColor: '#64748b',
        secondaryColor: '#1e1b4b',
        tertiaryColor: '#0f172a'
      },
      securityLevel: 'loose'
    });
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const renderChart = async () => {
      if (!chart) return;
      try {
        setRenderError(null);
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        if (!isCancelled) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.warn('Mermaid render error:', err);
          setRenderError('Generating UML diagram...');
        }
      }
    };

    renderChart();
    return () => {
      isCancelled = true;
    };
  }, [chart]);

  const handleCopy = () => {
    navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 2.5));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.4));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className={`relative flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden transition-all ${
      isFullScreen ? 'fixed inset-4 z-50 shadow-2xl bg-slate-950/95 backdrop-blur-xl' : ''
    } ${className}`}>
      {/* Controls toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 bg-slate-900/60 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-mono">
          <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Live UML Architecture</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomIn}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-slate-800 mx-1" />
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono text-[11px]"
            title="Copy Mermaid Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[300px] engineering-grid"
      >
        {renderError ? (
          <div className="text-center text-slate-500 font-mono text-xs">
            <p>{renderError}</p>
          </div>
        ) : svgContent ? (
          <div 
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.15s ease-out' }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
            className="select-none [&_svg]:max-w-none"
          />
        ) : (
          <div className="text-center text-slate-500 font-mono text-xs animate-pulse">
            Rendering Class Diagram...
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="px-3 py-1.5 border-t border-slate-800/80 bg-slate-900/40 text-[10px] text-slate-500 font-mono flex items-center justify-between">
        <span>Generated polymorphically from structured design model</span>
        <span>Zoom: {Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
};

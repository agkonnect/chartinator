'use client';
import { useEffect, useRef, useState } from 'react';
import { Copy, Check, Download, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface Props {
  code: string;
  indicatorName: string;
  valid: boolean;
  warnings?: string[];
}

export default function CodePreview({ code, indicatorName, valid, warnings = [] }: Props) {
  const [copied, setCopied] = useState(false);
  const [hlReady, setHlReady] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  // Dynamically load highlight.js (client only - avoids SSR mismatch)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const hljs = (await import('highlight.js/lib/core')).default;
        const cpp = (await import('highlight.js/lib/languages/cpp')).default;
        hljs.registerLanguage('cpp', cpp);
        if (!cancelled && codeRef.current) {
          codeRef.current.textContent = code;
          hljs.highlightElement(codeRef.current);
          setHlReady(true);
        }
      } catch {
        // fallback: just show plain text
        if (!cancelled && codeRef.current) {
          codeRef.current.textContent = code;
          setHlReady(true);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [code]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fname = indicatorName
      .replace(/[^a-zA-Z0-9_\-]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 64);
    a.href = url;
    a.download = `${fname || 'indicator'}.mq5`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const lineCount = code.split('
').length;

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-white text-lg">{indicatorName}</h3>
          {valid ? (
            <span className="flex items-center gap-1 text-xs text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/30 px-2.5 py-1 rounded-full">
              <CheckCircle size={11} />
              Valid
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/30 px-2.5 py-1 rounded-full">
              <AlertTriangle size={11} />
              Check warnings
            </span>
          )}
          <span className="text-xs text-[#475569]">{lineCount} lines</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-[#1e3a5f]
              text-[#94a3b8] hover:text-white hover:border-[#00D4FF]/40 transition-all"
          >
            {copied ? <Check size={13} className="text-[#10b981]" /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg
              bg-[#00D4FF] text-[#0a0e1a] font-bold hover:bg-[#00b8d9] transition-colors"
          >
            <Download size={13} />
            Download .mq5
          </button>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mb-3 space-y-1.5">
          {warnings.map((w, i) => (
            <div
              key={i}
              className="flex items-start gap-2 px-3 py-2 bg-[#f59e0b]/8 border border-[#f59e0b]/25 rounded-lg text-xs text-[#f59e0b]"
            >
              <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
              {w}
            </div>
          ))}
        </div>
      )}

      {/* Code block */}
      <div className="relative bg-[#0d1117] border border-[#1e3a5f] rounded-2xl overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1e3a5f] bg-[#0a0e1a]">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ef4444]/60" />
            <span className="w-3 h-3 rounded-full bg-[#f59e0b]/60" />
            <span className="w-3 h-3 rounded-full bg-[#10b981]/60" />
          </div>
          <span className="text-xs text-[#475569] font-mono">{indicatorName}.mq5</span>
          <span className="text-xs text-[#334155]">MQL5</span>
        </div>

        {/* Scrollable code */}
        <div className="overflow-auto max-h-[520px]">
          {!hlReady && (
            <div className="p-6 space-y-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-4 rounded shimmer"
                  style={{ width: `${40 + Math.sin(i * 1.3) * 30}%` }}
                />
              ))}
            </div>
          )}
          <pre
            className="p-5 text-xs font-mono leading-relaxed m-0"
            style={{ display: hlReady ? 'block' : 'none' }}
          >
            <code ref={codeRef} className="language-cpp hljs" />
          </pre>
        </div>
      </div>

      {/* Install hint */}
      <p className="text-xs text-[#334155] mt-2 text-center">
        Drop the .mq5 file into your MetaTrader 5 → <span className="font-mono text-[#475569]">MQL5/Indicators/</span> folder and recompile.
      </p>
    </div>
  );
}

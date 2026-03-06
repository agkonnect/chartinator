'use client';
import { useState } from 'react';
import { Download, Trash2, Code2, Clock, ChevronDown, ChevronUp, X } from 'lucide-react';

export interface IndicatorRecord {
  id: string;
  name: string;
  description: string | null;
  indicator_type: string;
  timeframe: string | null;
  code: string;
  is_valid: boolean;
  created_at: string;
}

interface Props {
  indicators: IndicatorRecord[];
  onDelete: (id: string) => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function downloadCode(code: string, name: string) {
  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/[^a-zA-Z0-9_\-]/g, '_')}.mq5`;
  a.click();
  URL.revokeObjectURL(url);
}

function CodeModal({ record, onClose }: { record: IndicatorRecord; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#111827] border border-[#1e3a5f] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e3a5f]">
          <div>
            <h3 className="font-bold text-white">{record.name}</h3>
            <p className="text-xs text-[#475569] mt-0.5">{formatDate(record.created_at)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadCode(record.code, record.name)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#00D4FF] text-[#0a0e1a] font-bold rounded-lg hover:bg-[#00b8d9] transition-colors"
            >
              <Download size={12} />Download
            </button>
            <button onClick={onClose} className="text-[#475569] hover:text-white p-1 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="overflow-auto flex-1 p-5">
          <pre className="text-xs font-mono text-[#c9d1d9] leading-relaxed whitespace-pre-wrap">
            {record.code}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function IndicatorHistory({ indicators, onDelete }: Props) {
  const [viewCode, setViewCode] = useState<IndicatorRecord | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (indicators.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-[#111827] border border-[#1e3a5f] flex items-center justify-center mx-auto mb-4">
          <Code2 size={24} className="text-[#334155]" />
        </div>
        <h3 className="font-bold text-white mb-2">No indicators yet</h3>
        <p className="text-sm text-[#475569] mb-5">Generate your first indicator to see it here.</p>
        <a
          href="/generate"
          className="inline-flex items-center gap-2 text-sm font-semibold bg-[#00D4FF] text-[#0a0e1a] px-5 py-2.5 rounded-xl hover:bg-[#00b8d9] transition-colors"
        >
          Start Generating ⚡
        </a>
      </div>
    );
  }

  return (
    <>
      {viewCode && <CodeModal record={viewCode} onClose={() => setViewCode(null)} />}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {indicators.map((ind) => (
          <div
            key={ind.id}
            className="bg-[#111827] border border-[#1e3a5f] rounded-2xl p-5 card-hover flex flex-col gap-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-sm truncate">{ind.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a2235] text-[#94a3b8] capitalize">
                    {ind.indicator_type}
                  </span>
                  {ind.timeframe && ind.timeframe !== 'any' && (
                    <span className="text-xs text-[#475569]">{ind.timeframe}</span>
                  )}
                  {!ind.is_valid && (
                    <span className="text-xs text-[#f59e0b]">⚠ warnings</span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {ind.description && (
              <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">
                {ind.description}
              </p>
            )}

            {/* Timestamp */}
            <div className="flex items-center gap-1.5 text-xs text-[#334155]">
              <Clock size={11} />
              {formatDate(ind.created_at)}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1 border-t border-[#1e3a5f] mt-auto">
              <button
                onClick={() => setViewCode(ind)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg border border-[#1e3a5f] text-[#94a3b8] hover:text-white hover:border-[#00D4FF]/40 transition-all"
              >
                <Code2 size={12} />View Code
              </button>
              <button
                onClick={() => downloadCode(ind.code, ind.name)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF] hover:bg-[#00D4FF]/20 transition-all font-semibold"
              >
                <Download size={12} />.mq5
              </button>
              {confirmDelete === ind.id ? (
                <div className="flex gap-1">
                  <button
                    onClick={() => { onDelete(ind.id); setConfirmDelete(null); }}
                    className="text-xs px-2 py-2 rounded-lg bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30 hover:bg-[#ef4444]/30 transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="text-xs px-2 py-2 rounded-lg border border-[#1e3a5f] text-[#475569] hover:text-white transition-colors"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(ind.id)}
                  className="p-2 rounded-lg border border-[#1e3a5f] text-[#334155] hover:text-[#ef4444] hover:border-[#ef4444]/40 transition-all"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

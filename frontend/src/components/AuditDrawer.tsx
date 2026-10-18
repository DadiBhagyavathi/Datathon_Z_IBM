import { X, Download, ClipboardList, CheckCircle, XCircle, Clock, Shield } from 'lucide-react';
import type { AuditEvent } from '../types';
import { PolicyBadge } from './PolicyBadge';

function rel(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

function ts(d: Date): string {
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export default function AuditDrawer({ 
  isOpen, 
  onClose, 
  events 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  events: AuditEvent[]; 
}) {
  if (!isOpen) return null;
  const allowed = events.filter(e => e.outcome === 'ALLOWED').length;
  const denied  = events.filter(e => e.outcome === 'DENIED').length;

  const exportJSON = () => {
    const blob = new Blob(
      [JSON.stringify(events.map(e => ({ ...e, timestamp: e.timestamp.toISOString() })), null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: `audit-log-${Date.now()}.json` }).click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-4xl bg-[#0b1220] border-l border-cyan-500/30 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              <ClipboardList size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Privacy-Preserving Audit Trail
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/50">
                  IMMUTABLE
                </span>
              </h2>
              <p className="text-xs text-slate-300">Decision records contain user pseudonym & outcome — raw PII never stored</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="flex items-center gap-5 px-6 py-3 bg-slate-950 border-b border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-300 font-bold">{allowed} ALLOWED</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span className="text-rose-300 font-bold">{denied} DENIED</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="font-bold">{events.length} TOTAL EVENTS</span>
          </div>
          <button 
            onClick={exportJSON} 
            className="btn-secure-secondary ml-auto text-xs py-1.5 px-3"
          >
            <Download size={13} className="text-cyan-400" />
            Export JSON
          </button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
              <Shield size={44} className="opacity-40" />
              <p className="text-sm font-mono text-slate-400">No audit events generated in this session yet</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-[#070d18] border-b border-slate-800 text-slate-300 font-mono text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Outcome</th>
                  <th className="py-3 px-4">Policy Action</th>
                  <th className="py-3 px-4">User Pseudonym</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4">Reason Code</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {events.map((ev) => (
                  <tr key={ev.eventId} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4">
                      {ev.outcome === 'ALLOWED' ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                          <CheckCircle size={13} /> Allowed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-rose-400 font-bold">
                          <XCircle size={13} /> Denied
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4"><PolicyBadge action={ev.policyAction} /></td>
                    <td className="py-3 px-4 text-cyan-300 font-semibold">{ev.userReference}</td>
                    <td className="py-3 px-4 text-slate-200">{ev.targetResource}</td>
                    <td className="py-3 px-4">
                      <span className={ev.reasonCode.includes('DENY') || ev.reasonCode.includes('INJECT') ? 'text-rose-400 font-bold' : 'text-slate-300 font-semibold'}>
                        {ev.reasonCode}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1">
                        <Clock size={11} className="text-slate-400" />
                        <span className={ev.latencyMs < 20 ? 'text-emerald-400 font-bold' : 'text-slate-200 font-medium'}>
                          {ev.latencyMs}ms
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div>{ts(ev.timestamp)}</div>
                      <div className="text-[10px] text-slate-400">{rel(ev.timestamp)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Audit Disclaimer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#070d18] text-[11px] font-mono text-slate-400">
          Enforces ISO 27701 & GDPR Article 25 (Privacy by Design). Raw query parameters, credentials, and customer records are suppressed from log persistent storage.
        </div>
      </div>
    </>
  );
}

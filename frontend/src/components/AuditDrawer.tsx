import { X, Download, ClipboardList, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { AuditEvent } from '../types';
import { PolicyBadge } from './PolicyBadge';

interface AuditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  events: AuditEvent[];
}

function relativeTime(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}
function fmtTs(date: Date): string {
  return date.toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false });
}

export default function AuditDrawer({ isOpen, onClose, events }: AuditDrawerProps) {
  if (!isOpen) return null;

  const allowed = events.filter(e => e.outcome === 'ALLOWED').length;
  const denied  = events.filter(e => e.outcome === 'DENIED').length;

  const handleExport = () => {
    const blob = new Blob(
      [JSON.stringify(events.map(e => ({ ...e, timestamp: e.timestamp.toISOString() })), null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: `audit-${Date.now()}.json` }).click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Overlay */}
      <div className="drawer-overlay fixed inset-0 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-[780px] z-50 flex flex-col animate-slide-right"
        style={{ background: '#090912', borderLeft: '1px solid rgba(255,255,255,0.07)', boxShadow: '-32px 0 80px rgba(0,0,0,0.7)' }}>

        {/* Top accent */}
        <div className="h-[2px] policy-bar-idle" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(15,98,254,0.1)', border: '1px solid rgba(15,98,254,0.25)' }}>
              <ClipboardList size={16} style={{ color: '#4589ff' }} />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-white">Privacy-Conscious Audit Log</h2>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Decision metadata only — no raw prompts or sensitive values stored
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-all duration-200"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { (e.target as HTMLElement).closest('button')!.style.background = 'rgba(255,255,255,0.06)'; (e.target as HTMLElement).closest('button')!.style.color = '#fff'; }}
            onMouseLeave={e => { (e.target as HTMLElement).closest('button')!.style.background = 'transparent'; (e.target as HTMLElement).closest('button')!.style.color = 'var(--text-muted)'; }}>
            <X size={16} />
          </button>
        </div>

        {/* Summary bar */}
        <div className="flex items-center gap-5 px-6 py-3 flex-shrink-0"
          style={{ background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <Chip dot="#42be65" label={`${allowed} ALLOWED`} />
          <Chip dot="#fa4d56" label={`${denied} DENIED`} />
          <Chip dot="#5a5a72" label={`${events.length} TOTAL`} />
          <button onClick={handleExport}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'var(--text-secondary)' }}
            onMouseEnter={e => { (e.currentTarget).style.color = '#fff'; (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.14)'; }}
            onMouseLeave={e => { (e.currentTarget).style.color = 'var(--text-secondary)'; (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.07)'; }}>
            <Download size={12} />Export JSON
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--text-muted)' }}>
              <ClipboardList size={36} opacity={0.3} />
              <p className="text-sm font-mono">No audit events yet</p>
            </div>
          ) : (
            <table className="w-full audit-table">
              <thead className="sticky top-0 z-10">
                <tr>
                  {['Outcome', 'Policy', 'User', 'Resource', 'Reason', 'Latency', 'Timestamp', 'Event ID'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((ev, i) => (
                  <tr key={ev.eventId}
                    style={{ opacity: 0, animation: `msgSlideUp 0.3s ease-out ${Math.min(i * 25, 400)}ms forwards` }}>
                    <td>
                      {ev.outcome === 'ALLOWED'
                        ? <div className="flex items-center gap-1.5"><CheckCircle size={11} style={{ color: '#42be65' }} /><span style={{ color: '#42be65', fontWeight: 600 }}>ALLOWED</span></div>
                        : <div className="flex items-center gap-1.5"><XCircle  size={11} style={{ color: '#fa4d56' }} /><span style={{ color: '#fa4d56', fontWeight: 600 }}>DENIED</span></div>
                      }
                    </td>
                    <td><PolicyBadge action={ev.policyAction} size="sm" /></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{ev.userReference}</td>
                    <td style={{ color: '#82cfff' }}>{ev.targetResource}</td>
                    <td style={{ color: ev.reasonCode.includes('NO_PERM') || ev.reasonCode.includes('INJECT') || ev.reasonCode.includes('DENY') ? '#fa4d56' : 'var(--text-secondary)', fontWeight: 600 }}>
                      {ev.reasonCode}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Clock size={9} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ color: ev.latencyMs < 20 ? '#42be65' : 'var(--text-secondary)' }}>{ev.latencyMs}ms</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ color: 'var(--text-secondary)' }}>{fmtTs(ev.timestamp)}</div>
                      <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{relativeTime(ev.timestamp)}</div>
                    </td>
                    <td style={{ color: '#2a2a3a' }}>{ev.eventId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.2)' }}>
          <p className="text-[10px] font-mono" style={{ color: '#2a2a3a' }}>
            Audit contains: event ID · timestamp · pseudonymous user ref · policy action · reason code · latency. Raw prompts intentionally excluded.
          </p>
        </div>
      </div>
    </>
  );
}

function Chip({ dot, label }: { dot: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full" style={{ background: dot, boxShadow: `0 0 6px ${dot}80` }} />
      <span className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  );
}

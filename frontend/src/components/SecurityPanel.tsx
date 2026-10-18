import { useEffect, useRef, useState } from 'react';
import { ShieldOff, EyeOff, Activity, Database, Cpu } from 'lucide-react';
import type { Employee, SecurityMeta, SessionStats } from '../types';
import { PolicyBadge } from './PolicyBadge';

/* ─── Animated Number ──────────────────────────────────────────── */
function Num({ value }: { value: number }) {
  const [disp, setDisp] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const start = prev.current, end = value;
    if (start === end) return;
    const t0 = performance.now();
    const go = (now: number) => {
      const p = Math.min((now - t0) / 350, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisp(Math.round(start + (end - start) * e));
      if (p < 1) requestAnimationFrame(go); else { setDisp(end); prev.current = end; }
    };
    requestAnimationFrame(go);
  }, [value]);
  return <>{disp}</>;
}

/* ─── Stat Card ────────────────────────────────────────────────── */
function StatCard({ label, value, accent, icon: Icon }: { label:string; value:number; accent?:string; icon:React.ElementType }) {
  const color = accent && value > 0 ? accent : '#374151';
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-2">
        <Icon size={12} style={{ color: accent||'#9ca3af' }} />
      </div>
      <div className="font-bold font-mono leading-none mb-1.5 animate-count" style={{ fontSize:22, color }}>
        <Num value={value} />
      </div>
      <div className="text-[10px] font-medium uppercase tracking-wide" style={{ color:'#9ca3af' }}>{label}</div>
    </div>
  );
}

/* ─── Access Bar ───────────────────────────────────────────────── */
function AccessBar({ level }: { level:'full'|'aggregate'|'none' }) {
  const w = level==='full'?'100%':level==='aggregate'?'50%':'4%';
  const color = level==='full'?'#059669':level==='aggregate'?'#d97706':'#dc2626';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between">
        <span className="text-[10px]" style={{ color:'#9ca3af' }}>Data Access</span>
        <span className="text-[10px] font-medium" style={{ color }}>
          {level==='full'?'Full':level==='aggregate'?'Aggregate':'None'}
        </span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width:w, background:color }} />
      </div>
    </div>
  );
}

/* ─── Info Row ─────────────────────────────────────────────────── */
function Row({ label, value }: { label:string; value:string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px]" style={{ color:'#9ca3af' }}>{label}</span>
      <span className="text-[10px] font-mono truncate max-w-[140px]" style={{ color:'#6b7280' }}>{value}</span>
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────────────── */
export default function SecurityPanel({ employee, lastSecurity, stats, isProcessing }: {
  employee:Employee; lastSecurity:SecurityMeta|null; stats:SessionStats; isProcessing:boolean;
}) {
  return (
    <aside className="security-sidebar overflow-y-auto">
      {/* Header */}
      <div className="sidebar-section flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full live-pulse"
            style={{ background: isProcessing?'#0f62fe':'#059669', transition:'background 0.3s' }} />
          <span className="text-xs font-semibold" style={{ color:'#111827' }}>Security Context</span>
        </div>
        <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-full"
          style={{ background: isProcessing?'#eff6ff':'#ecfdf5', color: isProcessing?'#0f62fe':'#059669',
            border:`1px solid ${isProcessing?'#bfdbfe':'#6ee7b7'}` }}>
          {isProcessing?'PROCESSING':'LIVE'}
        </span>
      </div>

      {/* Identity */}
      <div className="sidebar-section space-y-3">
        <p className="sidebar-label">Active Identity</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0"
            style={{ background:'#eff6ff', color:'#0f62fe', border:'1px solid #bfdbfe' }}>
            {employee.avatarInitials}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color:'#111827' }}>{employee.displayName}</p>
            <p className="text-[11px]" style={{ color:'#6b7280' }}>{employee.roleName}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {employee.permissions.length > 0
            ? employee.permissions.map(p => (
              <span key={p} className="px-2 py-0.5 rounded-full text-[9px] font-mono font-medium"
                style={{ background:'#ecfdf5', color:'#059669', border:'1px solid #6ee7b7' }}>{p}</span>
            ))
            : <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-medium"
              style={{ background:'#fef2f2', color:'#dc2626', border:'1px solid #fca5a5' }}>NO_PERMISSIONS</span>
          }
        </div>
        <AccessBar level={employee.accessLevel} />
      </div>

      {/* Last Request */}
      {lastSecurity && (
        <div className="sidebar-section space-y-3 animate-fade">
          <p className="sidebar-label">Last Request</p>
          <PolicyBadge action={lastSecurity.policyAction} size="md" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {[
              ['PII Detected', lastSecurity.piiDetected, lastSecurity.piiDetected>0],
              ['PII Redacted', lastSecurity.piiRedacted, false],
              ['Fields Stripped', lastSecurity.fieldsStripped, false],
              ['Latency', `${lastSecurity.latencyMs}ms`, false],
              ...(lastSecurity.dbRowsFetched!==undefined ? [['DB Rows', lastSecurity.dbRowsFetched, false]] : []),
            ].map(([label, val, alert], i) => (
              <div key={i}>
                <p className="text-[9px] uppercase tracking-wide" style={{ color:'#9ca3af' }}>{label as string}</p>
                <p className="text-[13px] font-mono font-semibold mt-0.5" style={{ color:(alert as boolean)?'#dc2626':'#374151' }}>{val as string|number}</p>
              </div>
            ))}
          </div>

          {lastSecurity.piiTypes.length > 0 && (
            <div>
              <p className="text-[9px] uppercase tracking-wide mb-1.5" style={{ color:'#9ca3af' }}>PII Types</p>
              <div className="flex flex-wrap gap-1">
                {lastSecurity.piiTypes.map(t => (
                  <span key={t} className="badge badge-redact text-[9px]">{t}</span>
                ))}
              </div>
            </div>
          )}

          {lastSecurity.injectionAttemptDetected && (
            <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg"
              style={{ background:'#fef2f2', border:'1px solid #fca5a5' }}>
              <ShieldOff size={11} style={{ color:'#dc2626' }} />
              <span className="text-[9px] font-mono font-semibold" style={{ color:'#dc2626' }}>INJECTION_BLOCKED</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 pt-2" style={{ borderTop:'1px solid #f3f4f6' }}>
            <span className="text-[9px]" style={{ color:'#d1d5db' }}>Audit:</span>
            <span className="text-[9px] font-mono truncate" style={{ color:'#d1d5db' }}>{lastSecurity.auditEventId}</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="sidebar-section space-y-2">
        <p className="sidebar-label">Session Statistics</p>
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="Total"     value={stats.totalRequests}           icon={Activity}  />
          <StatCard label="Blocked"   value={stats.blockedRequests}          icon={ShieldOff} accent="#dc2626" />
          <StatCard label="PII Found" value={stats.piiValuesDetected}        icon={EyeOff}    accent="#ea580c" />
          <StatCard label="Injections" value={stats.injectionAttemptsBlocked} icon={ShieldOff} accent="#dc2626" />
        </div>
      </div>

      {/* Model */}
      <div className="sidebar-section space-y-2">
        <p className="sidebar-label">Model Adapter</p>
        <div className="p-3 rounded-xl space-y-2" style={{ background:'#f9fafb', border:'1px solid #f3f4f6' }}>
          <div className="flex items-center gap-2">
            <Cpu size={13} style={{ color:'#0f62fe' }} />
            <span className="text-xs font-semibold" style={{ color:'#374151' }}>mock-inference-v1</span>
            <span className="ml-auto badge badge-aggregate text-[8px]">DEV</span>
          </div>
          <div className="space-y-1.5">
            <Row label="Target"   value="granite-13b-chat-v2" />
            <Row label="Platform" value="IBM LinuxONE s390x" />
            <Row label="PII"      value="MS Presidio" />
            <Row label="DB"       value="PostgreSQL 16" />
          </div>
        </div>
      </div>

      <div className="px-4 py-3">
        <p className="text-[10px] leading-relaxed" style={{ color:'#d1d5db' }}>
          Advisory prototype · Synthetic data · IBM Z Datathon 2026
        </p>
      </div>
    </aside>
  );
}

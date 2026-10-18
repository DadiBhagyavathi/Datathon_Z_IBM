import { useEffect, useRef, useState } from 'react';
import { ShieldOff, EyeOff, Activity, Database, Cpu, CheckCircle } from 'lucide-react';
import type { Employee, SecurityMeta, SessionStats } from '../types';
import { PolicyBadge } from './PolicyBadge';

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

function StatCard({ 
  label, 
  value, 
  accent, 
  icon: Icon 
}: { 
  label: string; 
  value: number; 
  accent?: string; 
  icon: React.ElementType 
}) {
  const color = accent && value > 0 ? accent : '#00f0ff';
  return (
    <div className="secure-stat-card">
      <div className="flex items-center justify-between mb-2">
        <Icon size={13} style={{ color: accent || '#38bdf8' }} />
      </div>
      <div className="font-bold font-mono leading-none mb-1 text-2xl" style={{ color }}>
        <Num value={value} />
      </div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{label}</div>
    </div>
  );
}

function AccessBar({ level }: { level: 'full' | 'aggregate' | 'none' }) {
  const w = level === 'full' ? '100%' : level === 'aggregate' ? '50%' : '5%';
  const color = level === 'full' ? '#10b981' : level === 'aggregate' ? '#f59e0b' : '#ef4444';
  return (
    <div className="space-y-1.5 pt-2 border-t border-slate-700/60">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-300 font-mono">Data Scope:</span>
        <span className="font-bold font-mono" style={{ color }}>
          {level === 'full' ? 'FULL ROW-LEVEL' : level === 'aggregate' ? 'AGGREGATE STATS' : 'BLOCKED (ZERO)'}
        </span>
      </div>
      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700">
        <div 
          className="h-full rounded-full transition-all duration-500" 
          style={{ width: w, background: color, boxShadow: `0 0 8px ${color}` }} 
        />
      </div>
    </div>
  );
}

export default function SecurityPanel({ 
  employee, 
  lastSecurity, 
  stats, 
  isProcessing 
}: {
  employee: Employee; 
  lastSecurity: SecurityMeta | null; 
  stats: SessionStats; 
  isProcessing: boolean;
}) {
  return (
    <aside className="secure-sidebar">
      {/* Sidebar Header */}
      <div className="secure-sidebar-section flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Security Context</span>
        </div>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
          isProcessing ? 'bg-cyan-950 text-cyan-300 border-cyan-500' : 'bg-emerald-950 text-emerald-300 border-emerald-500'
        }`}>
          {isProcessing ? 'SCANNING' : 'ENFORCING'}
        </span>
      </div>

      {/* Authenticated Identity */}
      <div className="secure-sidebar-section space-y-3">
        <p className="secure-sidebar-label">Active Session Identity</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs bg-slate-800 text-cyan-300 border border-cyan-500/30 shadow-inner">
            {employee.avatarInitials}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{employee.displayName}</p>
            <p className="text-xs text-slate-300 font-medium">{employee.roleName}</p>
          </div>
        </div>

        {/* Permissions */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {employee.permissions.length > 0 ? (
            employee.permissions.map(p => (
              <span key={p} className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600/40">
                {p}
              </span>
            ))
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-600/40">
              NO_PERMISSIONS
            </span>
          )}
        </div>

        <AccessBar level={employee.accessLevel} />
      </div>

      {/* Last Request Metrics */}
      {lastSecurity && (
        <div className="secure-sidebar-section space-y-3">
          <p className="secure-sidebar-label">Last Policy Decision</p>
          <PolicyBadge action={lastSecurity.policyAction} />
          
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[9px] font-mono text-slate-400 uppercase">PII Masked</span>
              <p className={`text-sm font-mono font-bold ${lastSecurity.piiDetected > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
                {lastSecurity.piiRedacted} / {lastSecurity.piiDetected}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[9px] font-mono text-slate-400 uppercase">Latency</span>
              <p className="text-sm font-mono font-bold text-cyan-400">
                {lastSecurity.latencyMs}ms
              </p>
            </div>
          </div>

          {lastSecurity.injectionAttemptDetected && (
            <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-rose-950/80 border border-rose-500/50">
              <ShieldOff size={13} className="text-rose-400 flex-shrink-0" />
              <span className="text-[11px] font-mono font-bold text-rose-200">INJECTION_BLOCKED</span>
            </div>
          )}
        </div>
      )}

      {/* Session Cumulative Stats */}
      <div className="secure-sidebar-section space-y-2">
        <p className="secure-sidebar-label">Session Telemetry</p>
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="Total Requests" value={stats.totalRequests} icon={Activity} />
          <StatCard label="Blocked Requests" value={stats.blockedRequests} icon={ShieldOff} accent="#ef4444" />
          <StatCard label="PII Detected" value={stats.piiValuesDetected} icon={EyeOff} accent="#f97316" />
          <StatCard label="Injections Thwarted" value={stats.injectionAttemptsBlocked} icon={ShieldOff} accent="#ef4444" />
        </div>
      </div>

      {/* Hardware & System Info */}
      <div className="secure-sidebar-section space-y-2">
        <p className="secure-sidebar-label">Target Infrastructure</p>
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
            <Cpu size={14} />
            <span>IBM Granite 13B on LinuxONE</span>
          </div>
          <div className="text-[11px] font-mono text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Arch:</span>
              <span className="text-white">s390x High Security</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">PII Engine:</span>
              <span className="text-white">Microsoft Presidio</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Data Vault:</span>
              <span className="text-white">PostgreSQL (Separated)</span>
            </div>
          </div>
        </div>
      </div>

    </aside>
  );
}

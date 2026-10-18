import { useEffect, useRef, useState } from 'react';
import {
  ShieldOff, ShieldCheck, BarChart2, EyeOff,
  Cpu, Database, Activity, TrendingUp,
} from 'lucide-react';
import type { Employee, SecurityMeta, SessionStats } from '../types';
import { PolicyBadge } from './PolicyBadge';

/* ─── Count-up Number ──────────────────────────────────────────── */
function AnimatedNumber({ value, duration = 400 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const start = prev.current;
    const end = value;
    if (start === end) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (t < 1) requestAnimationFrame(step);
      else { setDisplay(end); prev.current = end; }
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  return <>{display}</>;
}

/* ─── Access Level Segments ────────────────────────────────────── */
function AccessSegments({ level }: { level: 'full' | 'aggregate' | 'none' }) {
  const SEGS = [
    { active: level !== 'none', color: '#42be65', label: 'Read' },
    { active: level !== 'none', color: '#42be65', label: 'Aggregate' },
    { active: level === 'full', color: '#4589ff', label: 'Details' },
    { active: level === 'full', color: '#4589ff', label: 'Write' },
  ];
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Data Access</span>
        <span className="text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>
          {level === 'full' ? 'Full' : level === 'aggregate' ? 'Aggregate' : 'None'}
        </span>
      </div>
      <div className="flex gap-1">
        {SEGS.map((seg, i) => (
          <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-700"
            style={{
              background: seg.active ? seg.color : 'rgba(255,255,255,0.07)',
              boxShadow: seg.active ? `0 0 6px ${seg.color}80` : 'none',
            }} />
        ))}
      </div>
      <div className="flex gap-1">
        {SEGS.map((seg, i) => (
          <div key={i} className="flex-1 text-center text-[8px] font-mono"
            style={{ color: seg.active ? seg.color : 'var(--text-muted)' }}>
            {seg.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Stat Card ────────────────────────────────────────────────── */
function StatCard({
  label, value, icon: Icon, alertColor,
}: {
  label: string; value: number; icon: React.ElementType; alertColor?: string;
}) {
  const color = alertColor && value > 0 ? alertColor : 'var(--text-primary)';
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-2">
        <Icon size={12} style={{ color: alertColor || 'var(--text-muted)' }} />
        {value > 0 && alertColor && (
          <TrendingUp size={10} style={{ color: alertColor }} />
        )}
      </div>
      <div className="text-[22px] font-mono font-bold leading-none transition-all duration-300"
        style={{ color, textShadow: alertColor && value > 0 ? `0 0 12px ${alertColor}60` : 'none' }}>
        <AnimatedNumber value={value} />
      </div>
      <div className="text-[9px] font-mono uppercase tracking-wider mt-1.5" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
    </div>
  );
}

/* ─── Info Row ─────────────────────────────────────────────────── */
function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className={`text-[10px] text-right truncate max-w-[140px] ${mono ? 'font-mono' : ''}`}
        style={{ color: 'var(--text-secondary)' }}>{value}</span>
    </div>
  );
}

/* ─── Mini Stat ────────────────────────────────────────────────── */
function MiniStat({ label, value, alert }: { label: string; value: string | number; alert?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-mono uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="text-[13px] font-mono font-semibold"
        style={{ color: alert ? '#fa4d56' : 'var(--text-secondary)' }}>{value}</span>
    </div>
  );
}

/* ─── Main Panel ─────────────────────────────────────────────────── */
interface SecurityPanelProps {
  employee: Employee;
  lastSecurity: SecurityMeta | null;
  stats: SessionStats;
  isProcessing: boolean;
}

export default function SecurityPanel({ employee, lastSecurity, stats, isProcessing }: SecurityPanelProps) {
  return (
    <aside className="w-[288px] flex-shrink-0 flex flex-col overflow-hidden"
      style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', background: 'rgba(8,8,16,0.5)' }}>

      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <div className="relative w-2.5 h-2.5">
            <div className="absolute inset-0 rounded-full"
              style={{ background: isProcessing ? '#4589ff' : '#42be65', transition: 'background 0.4s' }} />
            <div className="absolute inset-0 rounded-full"
              style={{
                border: `1px solid ${isProcessing ? '#4589ff' : '#42be65'}`,
                opacity: 0.5,
                animation: 'liveRing 1.6s cubic-bezier(0,0,0.2,1) infinite',
              }} />
          </div>
          <span className="text-[12px] font-semibold text-white">Security Context</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md"
          style={{ background: isProcessing ? 'rgba(69,137,255,0.08)' : 'rgba(66,190,101,0.08)', border: `1px solid ${isProcessing ? 'rgba(69,137,255,0.2)' : 'rgba(66,190,101,0.2)'}` }}>
          <span className="text-[9px] font-mono font-semibold"
            style={{ color: isProcessing ? '#4589ff' : '#42be65' }}>
            {isProcessing ? 'PROCESSING' : 'LIVE'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2a3e transparent' }}>

        {/* ── Identity ── */}
        <section>
          <p className="text-[9px] font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            Active Identity
          </p>
          <div className="rounded-xl p-3.5 space-y-3"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: `${employee.accentColor}18`,
                  border: `1px solid ${employee.accentColor}44`,
                  color: employee.accentColor,
                  boxShadow: `0 0 16px ${employee.accentColor}20`,
                }}>
                {employee.avatarInitials}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-white truncate">{employee.displayName}</p>
                <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{employee.roleName}</p>
              </div>
            </div>
            {/* Permissions */}
            <div className="flex flex-wrap gap-1">
              {employee.permissions.length > 0
                ? employee.permissions.map(p => (
                  <span key={p} className="px-2 py-0.5 rounded-md text-[9px] font-mono"
                    style={{ background: 'rgba(66,190,101,0.08)', border: '1px solid rgba(66,190,101,0.2)', color: '#42be65' }}>
                    {p}
                  </span>
                ))
                : <span className="px-2 py-0.5 rounded-md text-[9px] font-mono"
                  style={{ background: 'rgba(250,77,86,0.08)', border: '1px solid rgba(250,77,86,0.2)', color: '#fa4d56' }}>
                  NO_PERMISSIONS
                </span>
              }
            </div>
            <AccessSegments level={employee.accessLevel} />
          </div>
        </section>

        {/* ── Last Request ── */}
        {lastSecurity && (
          <section className="animate-fade">
            <p className="text-[9px] font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
              Last Request
            </p>
            <div className="rounded-xl p-3.5 space-y-3"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <PolicyBadge action={lastSecurity.policyAction} size="md" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                <MiniStat label="PII Detected" value={lastSecurity.piiDetected} alert={lastSecurity.piiDetected > 0} />
                <MiniStat label="PII Redacted" value={lastSecurity.piiRedacted} />
                <MiniStat label="Fields Stripped" value={lastSecurity.fieldsStripped} />
                <MiniStat label="Latency" value={`${lastSecurity.latencyMs}ms`} />
                {lastSecurity.dbRowsFetched !== undefined && <MiniStat label="DB Rows" value={lastSecurity.dbRowsFetched} />}
                {lastSecurity.promptTokens !== undefined && <MiniStat label="Tokens" value={lastSecurity.promptTokens} />}
              </div>

              {lastSecurity.piiTypes.length > 0 && (
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    PII Types
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {lastSecurity.piiTypes.map(t => (
                      <span key={t} className="badge-redact px-2 py-0.5 rounded-md text-[9px] font-mono">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {lastSecurity.strippedFields.length > 0 && (
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Stripped Fields
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {lastSecurity.strippedFields.map(f => (
                      <span key={f} className="px-2 py-0.5 rounded-md text-[9px] font-mono"
                        style={{ background: 'rgba(190,149,255,0.08)', border: '1px solid rgba(190,149,255,0.2)', color: '#be95ff' }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {lastSecurity.injectionAttemptDetected && (
                <div className="flex items-center gap-2 p-2 rounded-lg"
                  style={{ background: 'rgba(250,77,86,0.07)', border: '1px solid rgba(250,77,86,0.2)' }}>
                  <ShieldOff size={11} style={{ color: '#fa4d56' }} />
                  <span className="text-[9px] font-mono" style={{ color: '#fa4d56' }}>INJECTION_ATTEMPT_BLOCKED</span>
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#fa4d56] animate-pulse" />
                </div>
              )}

              {/* Audit ID */}
              <div className="flex items-center gap-2 pt-1"
                style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>Audit:</span>
                <span className="text-[9px] font-mono truncate" style={{ color: '#3a3a52' }}>{lastSecurity.auditEventId}</span>
              </div>
            </div>
          </section>
        )}

        {/* ── Session Stats ── */}
        <section>
          <p className="text-[9px] font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            Session Statistics
          </p>
          <div className="grid grid-cols-2 gap-2">
            <StatCard label="Requests"   value={stats.totalRequests}            icon={Activity}  />
            <StatCard label="Blocked"    value={stats.blockedRequests}           icon={ShieldOff} alertColor="#fa4d56" />
            <StatCard label="PII Found"  value={stats.piiValuesDetected}         icon={EyeOff}    alertColor="#ff832b" />
            <StatCard label="Injections" value={stats.injectionAttemptsBlocked}  icon={ShieldOff} alertColor="#fa4d56" />
          </div>
        </section>

        {/* ── Model adapter ── */}
        <section>
          <p className="text-[9px] font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            Model Adapter
          </p>
          <div className="rounded-xl p-3 space-y-3"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2">
              <Cpu size={13} style={{ color: '#4589ff' }} />
              <span className="text-[12px] font-mono text-white">mock-inference-v1</span>
              <span className="ml-auto px-1.5 py-0.5 rounded text-[8px] font-mono badge-aggregate">DEV</span>
            </div>
            <div className="space-y-2">
              <InfoRow label="Target"   value="granite-13b-chat-v2" mono />
              <InfoRow label="Platform" value="IBM LinuxONE (s390x)" />
              <InfoRow label="PII"      value="MS Presidio" />
              <InfoRow label="DB"       value="PostgreSQL 16" />
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Set <code className="code-inline">AI_ADAPTER=granite</code> to connect live inference.
            </p>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
          <p className="text-[9px] font-mono leading-relaxed" style={{ color: '#2a2a3a' }}>
            Advisory prototype · Synthetic data · Not production-certified
          </p>
        </div>
      </div>
    </aside>
  );
}

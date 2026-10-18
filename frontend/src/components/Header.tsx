import { Shield, Users, ClipboardList, LogOut, ChevronDown, Activity, Cpu } from 'lucide-react';
import type { Employee } from '../types';
import type { PolicyAction } from '../types';

interface HeaderProps {
  employee: Employee;
  onSwitchPersona: () => void;
  onOpenAudit: () => void;
  onLogout: () => void;
  requestCount: number;
  lastPolicy: PolicyAction | null;
  isProcessing: boolean;
}

const POLICY_BAR: Record<PolicyAction, string> = {
  ALLOW_MINIMAL_FIELDS: 'policy-bar-allow',
  AGGREGATE:            'policy-bar-aggregate',
  REDACT:               'policy-bar-redact',
  DENY:                 'policy-bar-deny',
};
const ACCESS_LABEL: Record<string, string> = { full: 'FULL', aggregate: 'AGG', none: 'DENY' };
const ACCESS_COLOR: Record<string, string> = {
  full:      'text-[#42be65]',
  aggregate: 'text-[#f1c21b]',
  none:      'text-[#fa4d56]',
};

export default function Header({
  employee, onSwitchPersona, onOpenAudit, onLogout,
  requestCount, lastPolicy, isProcessing,
}: HeaderProps) {
  const barClass = lastPolicy ? POLICY_BAR[lastPolicy] : 'policy-bar-idle';

  return (
    <header className="flex-shrink-0 relative z-20">
      {/* Policy-state accent line */}
      <div className="h-[2px] w-full overflow-hidden">
        <div className={`h-full w-full ${barClass} transition-all duration-700`} />
      </div>

      {/* Nav row */}
      <div
        className="h-[58px] flex items-center justify-between px-5 border-b"
        style={{
          background: 'rgba(8,8,16,0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderColor: 'rgba(255,255,255,0.055)',
        }}
      >
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <svg width="26" height="26" viewBox="0 0 72 72" fill="none"
                className={isProcessing ? 'shield-glow-processing' : 'shield-glow'}>
                <defs>
                  <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#82cfff" />
                    <stop offset="100%" stopColor="#0f62fe" />
                  </linearGradient>
                </defs>
                <path d="M36 6L10 17v18c0 16.6 11.1 32.1 26 36 14.9-3.9 26-19.4 26-36V17L36 6z"
                  fill="rgba(15,98,254,0.18)" stroke="url(#hg)" strokeWidth="1.5" />
                <path d="M26 36l6 6 14-14" stroke="white" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {isProcessing && (
                <div className="absolute inset-[-4px] rounded-full border border-[rgba(15,98,254,0.5)]"
                  style={{ animation: 'liveRing 1s ease-out infinite' }} />
              )}
            </div>

            <div className="leading-none">
              <span className="text-white font-bold text-[16px] tracking-tight">SecureAI</span>
              <span className="font-bold text-[16px] tracking-tight" style={{ color: '#4589ff' }}> Gateway</span>
            </div>
          </div>

          {/* Sub-label */}
          <div className="hidden sm:flex items-center gap-1.5 ml-1 px-2.5 py-1 rounded-md"
            style={{ background: 'rgba(15,98,254,0.07)', border: '1px solid rgba(15,98,254,0.15)' }}>
            <Activity size={9} style={{ color: '#4589ff' }} />
            <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#4589ff' }}>
              IBM Z · Datathon 2026
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Request counter */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>REQUESTS</span>
            <span
              className="text-xs font-mono font-bold"
              style={{ color: '#82cfff', animation: requestCount > 0 ? 'countUp 0.3s ease-out' : 'none' }}
            >{requestCount}</span>
          </div>

          {/* Processing badge */}
          {isProcessing && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg animate-fade"
              style={{ background: 'rgba(15,98,254,0.08)', border: '1px solid rgba(15,98,254,0.2)' }}>
              <div className="live-dot" style={{ color: '#4589ff', background: '#4589ff', width: 6, height: 6, borderRadius: '50%' }} />
              <span className="text-[10px] font-mono" style={{ color: '#4589ff' }}>PROCESSING</span>
            </div>
          )}

          {/* Audit log */}
          <button onClick={onOpenAudit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
          >
            <ClipboardList size={13} />
            <span className="hidden sm:inline">Audit Log</span>
          </button>

          {/* Persona chip */}
          <button onClick={onSwitchPersona}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 group"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
              style={{
                background: `${employee.accentColor}18`,
                border: `1px solid ${employee.accentColor}44`,
                color: employee.accentColor,
              }}>
              {employee.avatarInitials}
            </div>
            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className="text-[12px] text-white font-medium">{employee.displayName}</span>
              <span className={`text-[9px] font-mono mt-0.5 ${ACCESS_COLOR[employee.accessLevel]}`}>
                {ACCESS_LABEL[employee.accessLevel]}
              </span>
            </div>
            <ChevronDown size={11} style={{ color: 'var(--text-muted)' }} className="ml-1 group-hover:text-white transition-colors" />
          </button>

          {/* Logout */}
          <button onClick={onLogout}
            className="p-2 rounded-lg transition-all duration-200"
            style={{ color: 'var(--text-muted)' }}
            title="Sign out"
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fa4d56'; (e.currentTarget as HTMLElement).style.background = 'rgba(250,77,86,0.08)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}

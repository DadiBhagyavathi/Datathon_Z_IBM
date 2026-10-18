import { ClipboardList, LogOut, ChevronDown, Shield } from 'lucide-react';
import type { Employee, PolicyAction } from '../types';

interface HeaderProps {
  employee: Employee;
  onSwitchPersona: () => void;
  onOpenAudit: () => void;
  onLogout: () => void;
  requestCount: number;
  lastPolicy: PolicyAction | null;
  isProcessing: boolean;
}

const STRIP_COLOR: Record<PolicyAction, string> = {
  ALLOW_MINIMAL_FIELDS: '#10b981',
  AGGREGATE:            '#f59e0b',
  REDACT:               '#f97316',
  DENY:                 '#ef4444',
};

const ACCESS_COLOR: Record<string, string> = { 
  full: '#34d399', 
  aggregate: '#fbbf24', 
  none: '#f87171' 
};

const ACCESS_LABEL: Record<string, string> = { 
  full: 'Full Access', 
  aggregate: 'Aggregate', 
  none: 'No Access' 
};

export default function Header({ 
  employee, 
  onSwitchPersona, 
  onOpenAudit, 
  onLogout, 
  requestCount, 
  lastPolicy, 
  isProcessing 
}: HeaderProps) {
  const stripColor = lastPolicy ? STRIP_COLOR[lastPolicy] : '#00f0ff';

  return (
    <header className="secure-header">
      {/* Dynamic Security Policy Status Bar */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-300"
        style={{ background: stripColor, boxShadow: `0 0 8px ${stripColor}` }} 
      />

      {/* Brand & Platform */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-500 shadow-md shadow-cyan-500/20">
          <Shield size={16} className="text-slate-950 stroke-[2.5]" />
        </div>
        <div>
          <span className="font-bold text-white text-[15px] tracking-tight">
            SecureAI <span className="text-cyan-400">Gateway</span>
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 ml-2 px-2.5 py-0.5 rounded-full bg-slate-900 border border-cyan-500/30">
          <span className="text-[10px] font-mono font-semibold text-cyan-300">IBM LinuxONE</span>
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex items-center gap-3">
        {/* Request Counter */}
        {requestCount > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700">
            <span className="text-[10px] font-mono text-slate-300 uppercase">Requests</span>
            <span className="text-[11px] font-mono font-bold text-cyan-300">{requestCount}</span>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/50">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-spin" />
            <span className="text-[10px] font-mono font-bold text-cyan-300">Sanitizing Context</span>
          </div>
        )}

        {/* Audit Log Drawer Trigger */}
        <button onClick={onOpenAudit} className="btn-secure-secondary">
          <ClipboardList size={14} className="text-cyan-400" />
          <span className="hidden sm:inline">Audit Log</span>
        </button>

        {/* Persona Switcher Chip */}
        <button 
          onClick={onSwitchPersona}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 transition-all"
        >
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
            {employee.avatarInitials}
          </div>
          <div className="hidden sm:flex flex-col items-start leading-none text-left">
            <span className="text-xs font-bold text-white">{employee.displayName}</span>
            <span className="text-[9px] mt-0.5 font-bold" style={{ color: ACCESS_COLOR[employee.accessLevel] }}>
              {ACCESS_LABEL[employee.accessLevel]}
            </span>
          </div>
          <ChevronDown size={13} className="text-slate-400" />
        </button>

        {/* Logout */}
        <button 
          onClick={onLogout}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all"
          title="Sign out"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}

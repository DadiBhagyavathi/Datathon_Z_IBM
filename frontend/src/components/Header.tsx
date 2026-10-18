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
  ALLOW_MINIMAL_FIELDS: '#059669',
  AGGREGATE:            '#d97706',
  REDACT:               '#ea580c',
  DENY:                 '#dc2626',
};
const ACCESS_COLOR: Record<string, string> = { full: '#059669', aggregate: '#d97706', none: '#dc2626' };
const ACCESS_LABEL: Record<string, string> = { full: 'Full Access', aggregate: 'Aggregate', none: 'No Access' };

export default function Header({ employee, onSwitchPersona, onOpenAudit, onLogout, requestCount, lastPolicy, isProcessing }: HeaderProps) {
  const stripColor = lastPolicy ? STRIP_COLOR[lastPolicy] : '#0f62fe';

  return (
    <header className="app-header">
      {/* Policy strip at bottom of header */}
      <div className="policy-strip" style={{ background: stripColor, opacity: lastPolicy ? 1 : 0.3 }} />

      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: '#0f62fe' }}>
          <Shield size={14} color="white" strokeWidth={2} />
        </div>
        <span className="font-semibold" style={{ color: '#111827', fontSize: 14 }}>SecureAI Gateway</span>
        <div className="hidden sm:flex items-center gap-1.5 ml-1 px-2 py-0.5 rounded-full"
          style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <span className="text-[10px] font-mono font-medium" style={{ color: '#0f62fe' }}>IBM Z · 2026</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Request count */}
        {requestCount > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: '#f3f4f6', border: '1px solid #e5e7eb' }}>
            <span className="text-[10px] font-mono" style={{ color: '#9ca3af' }}>Requests</span>
            <span className="text-[11px] font-mono font-bold" style={{ color: '#374151' }}>{requestCount}</span>
          </div>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full animate-fade"
            style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#0f62fe', animation: 'spin 1s linear infinite' }} />
            <span className="text-[10px] font-mono" style={{ color: '#0f62fe' }}>Processing</span>
          </div>
        )}

        {/* Audit log */}
        <button onClick={onOpenAudit} className="btn-secondary text-xs gap-1.5">
          <ClipboardList size={13} />
          <span className="hidden sm:inline">Audit Log</span>
        </button>

        {/* Persona chip */}
        <button onClick={onSwitchPersona}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-150"
          style={{ background: '#f9fafb', border: '1.5px solid #e5e7eb' }}
          onMouseEnter={e => { (e.currentTarget).style.borderColor = '#d1d5db'; (e.currentTarget).style.background = '#f3f4f6'; }}
          onMouseLeave={e => { (e.currentTarget).style.borderColor = '#e5e7eb'; (e.currentTarget).style.background = '#f9fafb'; }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
            style={{ background: '#eff6ff', color: '#0f62fe' }}>
            {employee.avatarInitials}
          </div>
          <div className="hidden sm:flex flex-col items-start leading-none">
            <span className="text-xs font-semibold" style={{ color: '#111827' }}>{employee.displayName}</span>
            <span className="text-[9px] mt-0.5 font-medium" style={{ color: ACCESS_COLOR[employee.accessLevel] }}>
              {ACCESS_LABEL[employee.accessLevel]}
            </span>
          </div>
          <ChevronDown size={12} style={{ color: '#9ca3af' }} />
        </button>

        {/* Logout */}
        <button onClick={onLogout}
          className="p-2 rounded-lg transition-all duration-150"
          style={{ color: '#9ca3af' }}
          title="Sign out"
          onMouseEnter={e => { (e.currentTarget).style.color = '#dc2626'; (e.currentTarget).style.background = '#fef2f2'; }}
          onMouseLeave={e => { (e.currentTarget).style.color = '#9ca3af'; (e.currentTarget).style.background = 'transparent'; }}>
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}

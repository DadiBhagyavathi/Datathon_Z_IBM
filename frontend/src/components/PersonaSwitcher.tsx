import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Employee } from '../types';
import { EMPLOYEES } from '../data/employees';

interface PersonaSwitcherProps {
  isOpen: boolean;
  currentEmployee: Employee;
  onSelect: (emp: Employee) => void;
  onClose: () => void;
}

const ACCESS = {
  full:      { label: 'FULL ACCESS',     cls: 'badge-allow' },
  aggregate: { label: 'AGGREGATE ONLY',  cls: 'badge-aggregate' },
  none:      { label: 'NO ACCESS',       cls: 'badge-deny' },
} as const;

export default function PersonaSwitcher({ isOpen, currentEmployee, onSelect, onClose }: PersonaSwitcherProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-[520px]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[17px] font-semibold text-white">Switch Persona</h3>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Each persona demonstrates different security outcomes
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-all duration-200"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.color = 'var(--text-muted)'; }}>
            <X size={16} />
          </button>
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {EMPLOYEES.map((emp, idx) => {
            const isActive = emp.id === currentEmployee.id;
            const access = ACCESS[emp.accessLevel];

            return (
              <button key={emp.id} onClick={() => { onSelect(emp); onClose(); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-250"
                style={{
                  opacity: 0,
                  animation: `slideInUp 0.35s cubic-bezier(0.16,1,0.3,1) ${idx * 80}ms forwards`,
                  background: isActive ? `${emp.accentColor}08` : 'rgba(255,255,255,0.02)',
                  borderColor: isActive ? `${emp.accentColor}50` : 'rgba(255,255,255,0.06)',
                  boxShadow: isActive ? `0 0 24px ${emp.accentColor}15` : 'none',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; } }}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    background: `${emp.accentColor}18`,
                    border: `1px solid ${emp.accentColor}44`,
                    color: emp.accentColor,
                    boxShadow: isActive ? `0 0 16px ${emp.accentColor}25` : 'none',
                  }}>
                  {emp.avatarInitials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-semibold text-white">{emp.displayName}</p>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold ${access.cls}`}>
                      {access.label}
                    </span>
                    {isActive && <span className="ml-auto text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>ACTIVE</span>}
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{emp.roleName}</p>
                  <p className="text-[11px] mt-1 leading-relaxed" style={{ color: '#3a3a52' }}>{emp.description}</p>
                </div>

                {/* Check */}
                {isActive
                  ? <CheckCircle size={18} style={{ color: emp.accentColor, flexShrink: 0 }} />
                  : <div className="w-[18px] h-[18px] rounded-full border flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                }
              </button>
            );
          })}
        </div>

        {/* Warning note */}
        <div className="mt-5 flex items-start gap-2.5 p-3 rounded-xl"
          style={{ background: 'rgba(241,194,27,0.04)', border: '1px solid rgba(241,194,27,0.15)' }}>
          <AlertTriangle size={13} style={{ color: '#f1c21b', flexShrink: 0, marginTop: 1 }} />
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Switching persona resets the conversation but preserves the audit log — simulating a new employee session.
          </p>
        </div>
      </div>
    </div>
  );
}

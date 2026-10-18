import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Employee } from '../types';
import { EMPLOYEES } from '../data/employees';

const ACC = {
  full:      { label: 'Full Access',    color: '#34d399', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)' },
  aggregate: { label: 'Aggregate Only', color: '#fbbf24', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)' },
  none:      { label: 'No Access',      color: '#f87171', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)' },
} as const;

export default function PersonaSwitcher({ 
  isOpen, 
  currentEmployee, 
  onSelect, 
  onClose 
}: {
  isOpen: boolean; 
  currentEmployee: Employee; 
  onSelect: (e: Employee) => void; 
  onClose: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0b1220] border border-cyan-500/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Switch Persona Identity</h3>
            <p className="text-xs text-slate-300 mt-0.5">Test policy enforcement across different employee roles</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Persona Options */}
        <div className="space-y-3">
          {EMPLOYEES.map((emp) => {
            const isActive = emp.id === currentEmployee.id;
            const acc = ACC[emp.accessLevel];
            return (
              <button
                key={emp.id}
                onClick={() => { onSelect(emp); onClose(); }}
                className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all ${
                  isActive 
                    ? 'bg-slate-800/90 border-cyan-400 shadow-md shadow-cyan-500/20' 
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm bg-slate-950 text-cyan-300 border border-cyan-500/30 flex-shrink-0">
                  {emp.avatarInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white">{emp.displayName}</p>
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                      style={{ background: acc.bg, color: acc.color, borderColor: acc.border }}
                    >
                      {acc.label}
                    </span>
                    {isActive && (
                      <span className="ml-auto text-[10px] font-mono font-bold text-cyan-300">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">{emp.roleName}</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{emp.description}</p>
                </div>
                {isActive ? (
                  <CheckCircle size={18} className="text-cyan-400 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-600 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Note */}
        <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/40 border border-amber-600/30">
          <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200 leading-relaxed font-medium">
            Switching identity starts a clean session while persisting the immutable audit log for compliance evaluation.
          </p>
        </div>
      </div>
    </div>
  );
}

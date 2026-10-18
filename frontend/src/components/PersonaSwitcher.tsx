import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Employee } from '../types';
import { EMPLOYEES } from '../data/employees';

const ACC = {
  full:      { label:'Full Access',    cls:'text-[#059669]', bg:'#ecfdf5', border:'#6ee7b7' },
  aggregate: { label:'Aggregate Only', cls:'text-[#d97706]', bg:'#fffbeb', border:'#fde68a' },
  none:      { label:'No Access',      cls:'text-[#dc2626]', bg:'#fef2f2', border:'#fca5a5' },
} as const;

export default function PersonaSwitcher({ isOpen, currentEmployee, onSelect, onClose }: {
  isOpen:boolean; currentEmployee:Employee; onSelect:(e:Employee)=>void; onClose:()=>void;
}) {
  if (!isOpen) return null;
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold" style={{ color:'#111827', fontSize:16 }}>Switch Persona</h3>
            <p className="text-xs mt-0.5" style={{ color:'#9ca3af' }}>Each persona shows a different security outcome</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ color:'#9ca3af' }}
            onMouseEnter={e=>{(e.currentTarget).style.background='#f3f4f6';}}
            onMouseLeave={e=>{(e.currentTarget).style.background='transparent';}}>
            <X size={15} />
          </button>
        </div>

        <div className="space-y-2.5">
          {EMPLOYEES.map((emp, idx) => {
            const isActive = emp.id === currentEmployee.id;
            const acc = ACC[emp.accessLevel];
            return (
              <button key={emp.id} onClick={()=>{ onSelect(emp); onClose(); }}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all"
                style={{
                  opacity:0, animation:`slideUp 0.25s ease ${idx*60}ms forwards`,
                  background: isActive?'#eff6ff':'#f9fafb',
                  border:`1.5px solid ${isActive?'#bfdbfe':'#e5e7eb'}`,
                  boxShadow: isActive?'0 0 0 3px rgba(15,98,254,0.08)':'none',
                }}
                onMouseEnter={e=>{ if(!isActive){ (e.currentTarget).style.background='#f3f4f6'; (e.currentTarget).style.borderColor='#d1d5db'; }}}
                onMouseLeave={e=>{ if(!isActive){ (e.currentTarget).style.background='#f9fafb'; (e.currentTarget).style.borderColor='#e5e7eb'; }}}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background: isActive?'#dbeafe':'#f3f4f6', color: isActive?'#0f62fe':'#6b7280' }}>
                  {emp.avatarInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold" style={{ color:'#111827' }}>{emp.displayName}</p>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background:acc.bg, color:acc.cls.replace('text-[','').replace(']',''), border:`1px solid ${acc.border}` }}>
                      {acc.label}
                    </span>
                    {isActive && <span className="ml-auto text-[9px] font-mono" style={{ color:'#9ca3af' }}>ACTIVE</span>}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color:'#9ca3af' }}>{emp.roleName}</p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color:'#9ca3af' }}>{emp.description}</p>
                </div>
                {isActive
                  ? <CheckCircle size={18} style={{ color:'#0f62fe', flexShrink:0 }} />
                  : <div className="w-4.5 h-4.5 rounded-full border flex-shrink-0" style={{ borderColor:'#d1d5db', width:18, height:18 }} />
                }
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl" style={{ background:'#fffbeb', border:'1px solid #fde68a' }}>
          <AlertTriangle size={13} style={{ color:'#d97706', flexShrink:0, marginTop:1 }} />
          <p className="text-xs leading-relaxed" style={{ color:'#92400e' }}>
            Switching persona resets the conversation but preserves the audit log — simulating a new employee session.
          </p>
        </div>
      </div>
    </div>
  );
}

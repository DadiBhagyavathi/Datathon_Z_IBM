import { X, Download, ClipboardList, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { AuditEvent } from '../types';
import { PolicyBadge } from './PolicyBadge';

function rel(d:Date):string { const s=Math.floor((Date.now()-d.getTime())/1000); if(s<60)return`${s}s ago`; const m=Math.floor(s/60); if(m<60)return`${m}m ago`; return`${Math.floor(m/60)}h ago`; }
function ts(d:Date):string { return d.toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}); }

export default function AuditDrawer({ isOpen, onClose, events }: { isOpen:boolean; onClose:()=>void; events:AuditEvent[] }) {
  if (!isOpen) return null;
  const allowed = events.filter(e=>e.outcome==='ALLOWED').length;
  const denied  = events.filter(e=>e.outcome==='DENIED').length;

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(events.map(e=>({...e,timestamp:e.timestamp.toISOString()})),null,2)],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'),{href:url,download:`audit-${Date.now()}.json`}).click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="drawer-bg" onClick={onClose} />
      <div className="drawer-panel">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom:'1px solid #e5e7eb' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'#eff6ff', border:'1px solid #bfdbfe' }}>
              <ClipboardList size={16} style={{ color:'#0f62fe' }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color:'#111827' }}>Privacy-Conscious Audit Log</h2>
              <p className="text-xs" style={{ color:'#9ca3af' }}>Decision metadata only — no raw prompts stored</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-all"
            style={{ color:'#9ca3af' }}
            onMouseEnter={e=>{(e.currentTarget).style.background='#f3f4f6';(e.currentTarget).style.color='#374151';}}
            onMouseLeave={e=>{(e.currentTarget).style.background='transparent';(e.currentTarget).style.color='#9ca3af';}}>
            <X size={16} />
          </button>
        </div>

        {/* Summary */}
        <div className="flex items-center gap-5 px-6 py-3 flex-shrink-0" style={{ background:'#f9fafb', borderBottom:'1px solid #e5e7eb' }}>
          <Dot color="#059669" label={`${allowed} Allowed`} />
          <Dot color="#dc2626" label={`${denied} Denied`} />
          <Dot color="#9ca3af" label={`${events.length} Total`} />
          <button onClick={exportJSON} className="btn-secondary ml-auto text-xs">
            <Download size={11} />Export JSON
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {events.length === 0
            ? <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color:'#d1d5db' }}>
                <ClipboardList size={40} />
                <p className="text-sm">No audit events yet</p>
              </div>
            : <table className="w-full audit-table">
                <thead className="sticky top-0 z-10">
                  <tr>{['Outcome','Policy','User','Resource','Reason','Latency','Timestamp','Event ID'].map(h=><th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {events.map((ev,i)=>(
                    <tr key={ev.eventId} style={{ opacity:0, animation:`msgIn 0.2s ease ${Math.min(i*20,400)}ms forwards` }}>
                      <td>
                        {ev.outcome==='ALLOWED'
                          ? <div className="flex items-center gap-1.5"><CheckCircle size={11} style={{color:'#059669'}}/><span style={{color:'#059669',fontWeight:600}}>Allowed</span></div>
                          : <div className="flex items-center gap-1.5"><XCircle     size={11} style={{color:'#dc2626'}}/><span style={{color:'#dc2626',fontWeight:600}}>Denied</span></div>
                        }
                      </td>
                      <td><PolicyBadge action={ev.policyAction} /></td>
                      <td>{ev.userReference}</td>
                      <td style={{color:'#0f62fe'}}>{ev.targetResource}</td>
                      <td style={{color:ev.reasonCode.includes('NO_PERM')||ev.reasonCode.includes('INJECT')||ev.reasonCode.includes('DENY')?'#dc2626':'#374151',fontWeight:500}}>{ev.reasonCode}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Clock size={9} style={{color:'#d1d5db'}}/>
                          <span style={{color:ev.latencyMs<20?'#059669':'#374151'}}>{ev.latencyMs}ms</span>
                        </div>
                      </td>
                      <td>
                        <p style={{color:'#374151'}}>{ts(ev.timestamp)}</p>
                        <p className="text-[10px]" style={{color:'#9ca3af'}}>{rel(ev.timestamp)}</p>
                      </td>
                      <td style={{color:'#d1d5db'}}>{ev.eventId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>

        {/* Footer */}
        <div className="px-6 py-3 flex-shrink-0" style={{ borderTop:'1px solid #f3f4f6', background:'#f9fafb' }}>
          <p className="text-[10px]" style={{ color:'#9ca3af' }}>
            Audit contains: event ID · timestamp · pseudonymous user ref · policy action · reason code. Raw prompts excluded.
          </p>
        </div>
      </div>
    </>
  );
}

function Dot({ color, label }: { color:string; label:string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full" style={{ background:color }} />
      <span className="text-xs font-medium" style={{ color:'#374151' }}>{label}</span>
    </div>
  );
}

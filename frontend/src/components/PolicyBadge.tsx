import { ShieldOff, ShieldCheck, BarChart2, EyeOff, Clock, Cpu, Database, AlertTriangle } from 'lucide-react';
import type { PolicyAction } from '../types';

/* ─── Policy Badge ────────────────────────────────────────────── */
const PCFG: Record<PolicyAction, { label: string; icon: React.ElementType; cls: string; desc: string }> = {
  ALLOW_MINIMAL_FIELDS: { label:'ALLOW', icon:ShieldCheck, cls:'badge-allow',     desc:'Approved fields only' },
  AGGREGATE:            { label:'AGGREGATE', icon:BarChart2, cls:'badge-aggregate', desc:'Summary stats only' },
  REDACT:               { label:'REDACT', icon:EyeOff,    cls:'badge-redact',     desc:'Identifiers tokenized' },
  DENY:                 { label:'DENY', icon:ShieldOff,   cls:'badge-deny',       desc:'Request blocked' },
};

export function PolicyBadge({ action, size='sm' }: { action: PolicyAction; size?:'sm'|'md' }) {
  const c = PCFG[action]; const Icon = c.icon;
  return (
    <span className={`badge ${c.cls} ${size==='md' ? 'text-[11px] px-2.5 py-1' : ''}`} title={c.desc}>
      <Icon size={size==='md'?12:10} />{c.label}
    </span>
  );
}

/* ─── Meta Strip ──────────────────────────────────────────────── */
export function SecurityMetaStrip({ piiDetected, piiRedacted, fieldsStripped, latencyMs, auditEventId, modelAdapter, dbRowsFetched, promptTokens }: {
  piiDetected:number; piiRedacted:number; fieldsStripped:number;
  latencyMs:number; auditEventId:string; modelAdapter:string;
  dbRowsFetched?:number; promptTokens?:number;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {piiDetected > 0 && <M icon={<EyeOff size={9}/>} text={`PII ${piiRedacted}/${piiDetected}`} color="#ea580c" />}
      {fieldsStripped > 0 && <M icon={<Database size={9}/>} text={`${fieldsStripped} stripped`} color="#7c3aed" />}
      {dbRowsFetched !== undefined && <M icon={<Database size={9}/>} text={`${dbRowsFetched} rows`} color="#0f62fe" />}
      {promptTokens !== undefined && <M icon={<Cpu size={9}/>} text={`${promptTokens} tok`} color="#6b7280" />}
      <M icon={<Clock size={9}/>} text={`${latencyMs}ms`} color="#6b7280" />
      <M icon={<span className="text-[8px]">#</span>} text={auditEventId} color="#d1d5db" mono />
    </div>
  );
}

function M({ icon, text, color, mono }: { icon:React.ReactNode; text:string; color:string; mono?:boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] ${mono?'font-mono':''}`}
      style={{ background:`${color}12`, color, border:`1px solid ${color}25` }}>
      {icon}{text}
    </span>
  );
}

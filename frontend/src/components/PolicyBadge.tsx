import { ShieldOff, ShieldCheck, BarChart2, EyeOff, Clock, Cpu, Database } from 'lucide-react';
import type { PolicyAction } from '../types';

const PCFG: Record<PolicyAction, { label: string; icon: React.ElementType; cls: string; desc: string }> = {
  ALLOW_MINIMAL_FIELDS: { label: 'ALLOW_MINIMAL', icon: ShieldCheck, cls: 'badge-allow', desc: 'Authorized fields only' },
  AGGREGATE:            { label: 'AGGREGATE',     icon: BarChart2,   cls: 'badge-aggregate', desc: 'Statistical summary' },
  REDACT:               { label: 'REDACT',        icon: EyeOff,      cls: 'badge-redact', desc: 'Identifiers tokenized' },
  DENY:                 { label: 'DENY',          icon: ShieldOff,   cls: 'badge-deny', desc: 'Request rejected' },
};

export function PolicyBadge({ action }: { action: PolicyAction; size?: 'sm' | 'md' }) {
  const c = PCFG[action];
  const Icon = c.icon;
  return (
    <span className={`secure-badge ${c.cls}`} title={c.desc}>
      <Icon size={11} className="stroke-[2.5]" />
      {c.label}
    </span>
  );
}

export function SecurityMetaStrip({ 
  piiDetected, 
  piiRedacted, 
  fieldsStripped, 
  latencyMs, 
  auditEventId, 
  dbRowsFetched, 
  promptTokens 
}: {
  piiDetected: number; 
  piiRedacted: number; 
  fieldsStripped: number;
  latencyMs: number; 
  auditEventId: string; 
  modelAdapter: string;
  dbRowsFetched?: number; 
  promptTokens?: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {piiDetected > 0 && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
          <EyeOff size={10} /> PII Masked: {piiRedacted}/{piiDetected}
        </span>
      )}
      {fieldsStripped > 0 && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-500/40">
          <Database size={10} /> {fieldsStripped} Fields Dropped
        </span>
      )}
      {dbRowsFetched !== undefined && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
          <Database size={10} /> {dbRowsFetched} DB Rows
        </span>
      )}
      {promptTokens !== undefined && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-700">
          <Cpu size={10} /> {promptTokens} Tokens
        </span>
      )}
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-700">
        <Clock size={10} /> {latencyMs}ms
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-400 bg-slate-950 border border-slate-800">
        #{auditEventId.slice(-6)}
      </span>
    </div>
  );
}

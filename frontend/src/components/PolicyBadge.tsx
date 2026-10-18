import { ShieldOff, ShieldCheck, BarChart2, EyeOff, Clock, Cpu, Database, Zap, AlertTriangle } from 'lucide-react';
import type { PolicyAction } from '../types';

// ─── Policy Badge ────────────────────────────────────────────────
interface PolicyBadgeProps {
  action: PolicyAction;
  size?: 'sm' | 'md';
}

const POLICY_CFG: Record<PolicyAction, {
  label: string; icon: React.ElementType; cls: string; description: string;
}> = {
  ALLOW_MINIMAL_FIELDS: {
    label: 'ALLOW_MINIMAL_FIELDS', icon: ShieldCheck, cls: 'badge-allow',
    description: 'Approved fields only — notes and identifiers stripped',
  },
  AGGREGATE: {
    label: 'AGGREGATE', icon: BarChart2, cls: 'badge-aggregate',
    description: 'Summary statistics — no row-level records transmitted',
  },
  REDACT: {
    label: 'REDACT', icon: EyeOff, cls: 'badge-redact',
    description: 'Identifiers replaced with surrogate tokens (ACCT-XXXX)',
  },
  DENY: {
    label: 'DENY', icon: ShieldOff, cls: 'badge-deny',
    description: 'Request blocked — zero records fetched, no AI call made',
  },
};

export function PolicyBadge({ action, size = 'sm' }: PolicyBadgeProps) {
  const cfg = POLICY_CFG[action];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg font-mono font-semibold ${cfg.cls} ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
      }`}
      title={cfg.description}
    >
      <Icon size={size === 'sm' ? 10 : 12} />
      {cfg.label}
    </span>
  );
}

// ─── Security Meta Strip ─────────────────────────────────────────
interface SecurityMetaStripProps {
  piiDetected: number;
  piiRedacted: number;
  fieldsStripped: number;
  latencyMs: number;
  auditEventId: string;
  modelAdapter: string;
  dbRowsFetched?: number;
  promptTokens?: number;
}

export function SecurityMetaStrip({
  piiDetected, piiRedacted, fieldsStripped, latencyMs,
  auditEventId, modelAdapter, dbRowsFetched, promptTokens,
}: SecurityMetaStripProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      {piiDetected > 0 && <MetaChip icon={<EyeOff size={9} />} label={`PII ${piiRedacted}/${piiDetected}`} color="#ff832b" />}
      {fieldsStripped > 0 && <MetaChip icon={<Database size={9} />} label={`${fieldsStripped} stripped`} color="#be95ff" />}
      {dbRowsFetched !== undefined && <MetaChip icon={<Database size={9} />} label={`${dbRowsFetched} rows`} color="#82cfff" />}
      {promptTokens !== undefined && <MetaChip icon={<Cpu size={9} />} label={`${promptTokens} tokens`} color="#9898b0" />}
      <MetaChip icon={<Clock size={9} />} label={`${latencyMs}ms`} color="#9898b0" />
      <MetaChip icon={<Zap size={9} />} label={modelAdapter} color="#5a5a72" />
      <MetaChip icon={<span className="text-[8px] font-mono">#</span>} label={auditEventId} color="#3a3a52" mono />
    </div>
  );
}

function MetaChip({ icon, label, color, mono }: { icon: React.ReactNode; label: string; color: string; mono?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-[3px] rounded-md text-[9px] ${mono ? 'font-mono' : ''}`}
      style={{
        color,
        background: `${color}10`,
        border: `1px solid ${color}20`,
      }}
    >
      {icon}{label}
    </span>
  );
}

import { ShieldOff, AlertTriangle } from 'lucide-react';
import type { Message } from '../types';
import { PolicyBadge, SecurityMetaStrip } from './PolicyBadge';

function InlineMD({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={last}>{text.slice(last, m.index)}</span>);
    const t = m[0];
    if (t.startsWith('**')) parts.push(<strong key={m.index} style={{ color: '#111827' }}>{t.slice(2,-2)}</strong>);
    else parts.push(<code key={m.index} className="px-1.5 py-0.5 rounded text-xs font-mono"
      style={{ background:'#f3f4f6', color:'#374151', border:'1px solid #e5e7eb' }}>{t.slice(1,-1)}</code>);
    last = m.index + t.length;
  }
  if (last < text.length) parts.push(<span key={last}>{text.slice(last)}</span>);
  return <>{parts}</>;
}

function Prose({ content }: { content: string }) {
  return (
    <div className="space-y-2">
      {content.split('\n').map((line, i) => {
        if (line.trim().startsWith('|')) {
          const cells = line.split('|').filter(c=>c.trim());
          if (cells.every(c=>/^[-: ]+$/.test(c))) return null;
          return (
            <div key={i} className="flex overflow-x-auto">
              {cells.map((cell,j) => (
                <div key={j} className="flex-1 px-3 py-1.5 text-xs min-w-[70px]"
                  style={{ borderBottom:`1px solid #f3f4f6`, fontWeight: i===0?600:400, color: i===0?'#374151':'#6b7280', background: i===0?'#f9fafb':'transparent' }}>
                  <InlineMD text={cell.trim()} />
                </div>
              ))}
            </div>
          );
        }
        if (line.startsWith('- ')||line.startsWith('* ')) return (
          <div key={i} className="flex gap-2">
            <span className="mt-1.5 text-[8px] flex-shrink-0" style={{ color:'#0f62fe' }}>●</span>
            <p className="text-sm" style={{ color:'#374151' }}><InlineMD text={line.slice(2)} /></p>
          </div>
        );
        if (line.startsWith('## ')) return <p key={i} className="text-sm font-bold mt-1" style={{ color:'#111827' }}><InlineMD text={line.slice(3)} /></p>;
        if (line.trim()==='') return <div key={i} className="h-1" />;
        return <p key={i} className="text-sm leading-relaxed" style={{ color:'#374151' }}><InlineMD text={line} /></p>;
      })}
    </div>
  );
}

export default function MessageBubble({ message, employeeAvatar }: {
  message: Message; employeeAvatar: string;
}) {
  const isUser = message.role === 'user';
  const meta   = message.securityMeta;
  const time   = message.timestamp.toLocaleTimeString('en-US',{ hour:'2-digit', minute:'2-digit', hour12:true });

  const wrapStyle: React.CSSProperties = {
    opacity: 0,
    animation: 'msgIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
  };

  if (isUser) {
    return (
      <div className="flex justify-end gap-2.5" style={wrapStyle}>
        <div className="flex flex-col items-end gap-1 max-w-[70%]">
          <span className="text-[10px]" style={{ color:'#9ca3af' }}>{time}</span>
          <div className="msg-user">
            <p className="text-sm text-white leading-relaxed">{message.content}</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-5"
          style={{ background:'#eff6ff', color:'#0f62fe', border:'1px solid #bfdbfe' }}>
          {employeeAvatar}
        </div>
      </div>
    );
  }

  const isBlocked   = meta?.isBlocked;
  const isInjection = meta?.injectionAttemptDetected;
  const isAggregate = meta?.policyAction === 'AGGREGATE';

  return (
    <div className="flex gap-2.5" style={wrapStyle}>
      {/* AI avatar */}
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-5"
        style={{ background:'#eff6ff', border:'1px solid #bfdbfe' }}>
        <ShieldOff size={14} style={{ color: isBlocked?'#dc2626':'#0f62fe', display: isBlocked?undefined:'none' }} />
        <svg style={{ display: isBlocked?'none':undefined }} width="14" height="14" viewBox="0 0 72 72" fill="none">
          <path d="M36 6L10 17v18c0 16.6 11.1 32.1 26 36 14.9-3.9 26-19.4 26-36V17L36 6z" fill="#bfdbfe" stroke="#0f62fe" strokeWidth="2"/>
          <path d="M26 36l6 6 14-14" stroke="#0f62fe" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div className="flex flex-col gap-1 max-w-[78%] min-w-0">
        <span className="text-[10px]" style={{ color:'#9ca3af' }}>{time} {meta && `· ${meta.modelAdapter}`}</span>

        {/* Bubble */}
        {isBlocked ? (
          <div className="msg-deny">
            <div className="flex items-center gap-2 mb-2.5">
              {isInjection
                ? <AlertTriangle size={14} style={{ color:'#dc2626' }} />
                : <ShieldOff     size={14} style={{ color:'#dc2626' }} />}
              <span className="text-xs font-semibold" style={{ color:'#dc2626' }}>
                {isInjection ? 'Prompt Injection Blocked' : 'Access Denied by Policy'}
              </span>
            </div>
            <Prose content={message.content} />
          </div>
        ) : isAggregate ? (
          <div className="msg-aggregate">
            <div className="flex items-center gap-2 mb-2.5 pb-2" style={{ borderBottom:'1px solid rgba(217,119,6,0.15)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background:'#d97706' }} />
              <span className="text-[10px] font-semibold" style={{ color:'#d97706' }}>AGGREGATE VIEW — individual records withheld</span>
            </div>
            <Prose content={message.content} />
          </div>
        ) : (
          <div className="msg-assistant">
            <Prose content={message.content} />
          </div>
        )}

        {/* Meta strip */}
        {meta && (
          <div className="flex items-center flex-wrap gap-1.5">
            <PolicyBadge action={meta.policyAction} />
            <SecurityMetaStrip
              piiDetected={meta.piiDetected} piiRedacted={meta.piiRedacted}
              fieldsStripped={meta.fieldsStripped} latencyMs={meta.latencyMs}
              auditEventId={meta.auditEventId} modelAdapter={meta.modelAdapter}
              dbRowsFetched={meta.dbRowsFetched} promptTokens={meta.promptTokens}
            />
          </div>
        )}
      </div>
    </div>
  );
}

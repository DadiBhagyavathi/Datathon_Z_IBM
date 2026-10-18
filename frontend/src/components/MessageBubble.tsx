import { ShieldOff, AlertTriangle } from 'lucide-react';
import type { Message } from '../types';
import { PolicyBadge, SecurityMetaStrip } from './PolicyBadge';

interface MessageBubbleProps {
  message: Message;
  employeeAvatar: string;
  employeeColor: string;
  animationDelay?: number;
}

/* ─── Inline markdown renderer ─────────────────────────────────── */
function InlineMD({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={last}>{text.slice(last, m.index)}</span>);
    const t = m[0];
    if (t.startsWith('**')) parts.push(<strong key={m.index} className="font-semibold text-white">{t.slice(2,-2)}</strong>);
    else if (t.startsWith('`')) parts.push(<code key={m.index} className="code-inline">{t.slice(1,-1)}</code>);
    else parts.push(<em key={m.index} style={{ color: 'var(--text-secondary)' }}>{t.slice(1,-1)}</em>);
    last = m.index + t.length;
  }
  if (last < text.length) parts.push(<span key={last}>{text.slice(last)}</span>);
  return <>{parts}</>;
}

function RenderContent({ content }: { content: string }) {
  return (
    <div className="space-y-2 leading-relaxed">
      {content.split('\n').map((line, i) => {
        if (line.trim().startsWith('|')) {
          const cells = line.split('|').filter(c => c.trim());
          const isSep = cells.every(c => /^[-: ]+$/.test(c));
          if (isSep) return null;
          return (
            <div key={i} className="flex gap-0 overflow-x-auto">
              {cells.map((cell, j) => (
                <div key={j} className={`flex-1 px-3 py-2 text-[12px] font-mono border-b min-w-[80px]
                  ${i === 0
                    ? 'font-semibold text-[var(--text-primary)] border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]'
                    : 'text-[var(--text-secondary)] border-[rgba(255,255,255,0.04)]'
                  }`}>
                  <InlineMD text={cell.trim()} />
                </div>
              ))}
            </div>
          );
        }
        if (line.startsWith('> ')) return (
          <div key={i} className="flex gap-2 pl-3 border-l-2 border-[rgba(15,98,254,0.6)] my-1">
            <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}><InlineMD text={line.slice(2)} /></p>
          </div>
        );
        if (line.startsWith('- ') || line.startsWith('* ')) return (
          <div key={i} className="flex gap-2 pl-1">
            <span className="mt-2 text-[8px] flex-shrink-0" style={{ color: '#4589ff' }}>◆</span>
            <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}><InlineMD text={line.slice(2)} /></p>
          </div>
        );
        if (line.startsWith('## ')) return <p key={i} className="text-[13px] font-bold text-white mt-1"><InlineMD text={line.slice(3)} /></p>;
        if (line.startsWith('# '))  return <p key={i} className="text-[14px] font-bold text-white mt-1"><InlineMD text={line.slice(2)} /></p>;
        if (line.trim() === '')     return <div key={i} className="h-1" />;
        return <p key={i} className="text-[13px]" style={{ color: '#d4d4d8' }}><InlineMD text={line} /></p>;
      })}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function MessageBubble({ message, employeeAvatar, employeeColor, animationDelay = 0 }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const meta   = message.securityMeta;
  const isBlocked   = meta?.isBlocked;
  const isInjection = meta?.injectionAttemptDetected;
  const isAggregate = meta?.policyAction === 'AGGREGATE';

  const time = message.timestamp.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  const wrapStyle: React.CSSProperties = {
    opacity: 0,
    animation: `msgSlideUp 0.45s cubic-bezier(0.16,1,0.3,1) ${animationDelay}ms forwards`,
  };

  if (isUser) {
    return (
      <div className="flex justify-end gap-3" style={wrapStyle}>
        <div className="max-w-[74%] space-y-1">
          <div className="flex justify-end">
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{time}</span>
          </div>
          <div className="msg-user px-4 py-3">
            <p className="text-[13.5px] text-white leading-relaxed">{message.content}</p>
          </div>
        </div>
        {/* Avatar */}
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-6"
          style={{ background: `${employeeColor}18`, border: `1px solid ${employeeColor}44`, color: employeeColor }}>
          {employeeAvatar}
        </div>
      </div>
    );
  }

  // ── Assistant message ──
  return (
    <div className="flex gap-3" style={wrapStyle}>
      {/* AI avatar */}
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-6 relative"
        style={{ background: 'rgba(15,98,254,0.1)', border: '1px solid rgba(15,98,254,0.25)' }}>
        <svg width="15" height="15" viewBox="0 0 72 72" fill="none">
          <path d="M36 6L10 17v18c0 16.6 11.1 32.1 26 36 14.9-3.9 26-19.4 26-36V17L36 6z"
            fill="rgba(15,98,254,0.4)" stroke="#0f62fe" strokeWidth="2" />
          <path d="M26 36l6 6 14-14" stroke="#82cfff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="max-w-[80%] space-y-1 min-w-0">
        {/* Timestamp + adapter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{time}</span>
          {meta && <span className="text-[9px] font-mono" style={{ color: '#3a3a52' }}>· {meta.modelAdapter}</span>}
        </div>

        {/* Bubble */}
        {isBlocked ? (
          <div className={`msg-deny px-4 py-4 ${isInjection ? 'border-[rgba(250,77,86,0.5)]' : ''}`}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              {isInjection
                ? <AlertTriangle size={15} style={{ color: '#fa4d56' }} />
                : <ShieldOff size={15} style={{ color: '#fa4d56' }} />}
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider" style={{ color: '#fa4d56' }}>
                {isInjection ? 'Prompt Injection Blocked' : 'Access Denied by Policy'}
              </span>
              <div className="ml-auto w-2 h-2 rounded-full bg-[#fa4d56] animate-pulse" />
            </div>
            <RenderContent content={message.content} />
          </div>
        ) : isAggregate ? (
          <div className="msg-aggregate px-4 py-4">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[rgba(241,194,27,0.12)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#f1c21b]" style={{ boxShadow: '0 0 8px rgba(241,194,27,0.7)' }} />
              <span className="text-[10px] font-mono" style={{ color: '#f1c21b' }}>
                AGGREGATE VIEW — Individual records not transmitted to model
              </span>
            </div>
            <RenderContent content={message.content} />
          </div>
        ) : (
          <div className="msg-assistant px-4 py-4">
            <RenderContent content={message.content} />
          </div>
        )}

        {/* Security meta strip */}
        {meta && (
          <div className="px-1">
            <div className="flex items-center gap-2 flex-wrap">
              <PolicyBadge action={meta.policyAction} size="sm" />
              <SecurityMetaStrip
                piiDetected={meta.piiDetected}
                piiRedacted={meta.piiRedacted}
                fieldsStripped={meta.fieldsStripped}
                latencyMs={meta.latencyMs}
                auditEventId={meta.auditEventId}
                modelAdapter={meta.modelAdapter}
                dbRowsFetched={meta.dbRowsFetched}
                promptTokens={meta.promptTokens}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

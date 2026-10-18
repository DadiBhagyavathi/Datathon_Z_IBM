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
    if (t.startsWith('**')) {
      parts.push(<strong key={m.index} className="text-white font-bold">{t.slice(2, -2)}</strong>);
    } else {
      parts.push(
        <code key={m.index} className="px-1.5 py-0.5 rounded text-xs font-mono bg-slate-900 text-cyan-300 border border-slate-700">
          {t.slice(1, -1)}
        </code>
      );
    }
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
          const cells = line.split('|').filter(c => c.trim());
          if (cells.every(c => /^[-: ]+$/.test(c))) return null;
          return (
            <div key={i} className="flex overflow-x-auto my-1">
              {cells.map((cell, j) => (
                <div 
                  key={j} 
                  className={`flex-1 px-3 py-1.5 text-xs min-w-[80px] border border-slate-700 ${
                    i === 0 ? 'font-bold text-cyan-300 bg-slate-900/90' : 'text-slate-200 bg-slate-950/40'
                  }`}
                >
                  <InlineMD text={cell.trim()} />
                </div>
              ))}
            </div>
          );
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className="mt-1.5 text-[8px] flex-shrink-0 text-cyan-400">●</span>
              <p className="text-sm text-slate-100 leading-relaxed font-normal">
                <InlineMD text={line.slice(2)} />
              </p>
            </div>
          );
        }
        if (line.startsWith('## ')) {
          return <h4 key={i} className="text-sm font-bold text-white mt-2 mb-1"><InlineMD text={line.slice(3)} /></h4>;
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        return (
          <p key={i} className="text-sm text-slate-100 leading-relaxed font-normal">
            <InlineMD text={line} />
          </p>
        );
      })}
    </div>
  );
}

export default function MessageBubble({ 
  message, 
  employeeAvatar 
}: {
  message: Message; 
  employeeAvatar: string;
}) {
  const isUser = message.role === 'user';
  const meta = message.securityMeta;
  const time = message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 items-end">
        <div className="flex flex-col items-end gap-1 max-w-[75%]">
          <span className="text-[10px] font-mono text-slate-400">{time}</span>
          <div className="msg-user-secure">
            <p className="text-sm text-white font-medium leading-relaxed">{message.content}</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0 bg-blue-600 text-white border border-cyan-400/50 shadow-md">
          {employeeAvatar}
        </div>
      </div>
    );
  }

  const isBlocked = meta?.isBlocked;
  const isInjection = meta?.injectionAttemptDetected;
  const isAggregate = meta?.policyAction === 'AGGREGATE';

  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-5 bg-slate-900 border border-cyan-500/30 text-cyan-400 shadow-md">
        {isBlocked ? (
          <ShieldOff size={15} className="text-rose-400" />
        ) : (
          <svg width="15" height="15" viewBox="0 0 72 72" fill="none">
            <path d="M36 6L10 17v18c0 16.6 11.1 32.1 26 36 14.9-3.9 26-19.4 26-36V17L36 6z" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" strokeWidth="2.5"/>
            <path d="M26 36l6 6 14-14" stroke="#00f0ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>

      <div className="flex flex-col gap-1.5 max-w-[80%] min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400">{time}</span>
          {meta && <span className="text-[10px] font-mono text-cyan-400/80">· {meta.modelAdapter}</span>}
        </div>

        {/* Dynamic Bubble by Policy Outcome */}
        {isBlocked ? (
          <div className="msg-deny-secure">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-rose-900/60">
              {isInjection ? (
                <AlertTriangle size={15} className="text-rose-400" />
              ) : (
                <ShieldOff size={15} className="text-rose-400" />
              )}
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                {isInjection ? 'Prompt Injection Blocked' : 'Access Denied by Policy'}
              </span>
            </div>
            <Prose content={message.content} />
          </div>
        ) : isAggregate ? (
          <div className="msg-aggregate-secure">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-amber-900/50">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                Aggregate View — Individual Records Withheld
              </span>
            </div>
            <Prose content={message.content} />
          </div>
        ) : (
          <div className="msg-assistant-secure">
            <Prose content={message.content} />
          </div>
        )}

        {/* Security Meta Strip */}
        {meta && (
          <div className="flex items-center flex-wrap gap-2 pt-0.5">
            <PolicyBadge action={meta.policyAction} />
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
        )}
      </div>
    </div>
  );
}

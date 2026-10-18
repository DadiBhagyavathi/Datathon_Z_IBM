import { useRef, useEffect } from 'react';
import { Shield, Lock, Database, CheckCircle } from 'lucide-react';
import type { Message, Employee } from '../types';
import MessageBubble from './MessageBubble';

/* ─── Typing Indicator ─────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex gap-2.5 animate-fade">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
        style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <Shield size={14} style={{ color: '#0f62fe' }} />
      </div>
      <div className="msg-assistant flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          {[0,1,2].map(i => (
            <div key={i} className="typing-dot"
              style={{ animation: `bounce3 1.2s ease-in-out ${i * 0.15}s infinite` }} />
          ))}
        </div>
        <span className="text-xs" style={{ color: '#9ca3af' }}>Processing through security gateway…</span>
      </div>
    </div>
  );
}

/* ─── Empty State ──────────────────────────────────────────────── */
function EmptyState({ employee }: { employee: Employee }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 py-16 px-6">
      {/* Illustration */}
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe', boxShadow: '0 8px 24px rgba(15,98,254,0.12)' }}>
          <Shield size={36} style={{ color: '#0f62fe' }} strokeWidth={1.5} />
        </div>
        {/* Status */}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center live-pulse"
          style={{ background: '#059669' }}>
          <CheckCircle size={12} color="white" strokeWidth={2.5} />
        </div>
      </div>

      <div className="text-center max-w-sm">
        <h3 className="font-semibold mb-2" style={{ fontSize: 17, color: '#111827' }}>
          Welcome, {employee.firstName}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
          You're signed in as <strong style={{ color: '#374151' }}>{employee.roleName}</strong>.{' '}
          {employee.accessLevel === 'full' && 'You have full access to transaction records and analytics.'}
          {employee.accessLevel === 'aggregate' && 'You can query aggregate summaries. Individual records are restricted.'}
          {employee.accessLevel === 'none' && 'All production data queries will be denied by RBAC policy.'}
        </p>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2 max-w-sm">
        {[
          { icon: Shield,   label: 'Gateway Active',  color: '#059669', bg: '#ecfdf5', border: '#6ee7b7' },
          { icon: Lock,     label: 'Presidio Ready',  color: '#0f62fe', bg: '#eff6ff', border: '#bfdbfe' },
          { icon: Database, label: 'Audit Enabled',   color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' },
        ].map(chip => (
          <div key={chip.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: chip.bg, color: chip.color, border: `1px solid ${chip.border}` }}>
            <chip.icon size={12} />
            {chip.label}
          </div>
        ))}
      </div>

      <p className="text-xs" style={{ color: '#d1d5db' }}>
        Type a question below or select a suggested query ↓
      </p>
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────────────── */
export default function ChatWindow({ messages, isLoading, employee }: {
  messages: Message[]; isLoading: boolean; employee: Employee;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="chat-messages">
      {messages.length === 0 && !isLoading
        ? <EmptyState employee={employee} />
        : messages.map(msg => (
          <MessageBubble
            key={msg.id}
            message={msg}
            employeeAvatar={employee.avatarInitials}
          />
        ))
      }
      {isLoading && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}

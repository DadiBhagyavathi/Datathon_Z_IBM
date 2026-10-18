import { useRef, useEffect } from 'react';
import { Shield, Lock, Database, CheckCircle } from 'lucide-react';
import type { Message, Employee } from '../types';
import MessageBubble from './MessageBubble';

function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade items-start">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-900 border border-cyan-500/40">
        <Shield size={16} className="text-cyan-400 animate-pulse" />
      </div>
      <div className="msg-assistant-secure flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
        </div>
        <span className="text-xs text-slate-300 font-mono">
          Security gateway running PII inspection & authorization checks...
        </span>
      </div>
    </div>
  );
}

function EmptyState({ employee }: { employee: Employee }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 py-12 px-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-slate-900 border-2 border-cyan-500/40 shadow-xl shadow-cyan-500/20">
          <Shield size={38} className="text-cyan-400" strokeWidth={1.75} />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-slate-950 flex items-center justify-center bg-emerald-500 shadow-md">
          <CheckCircle size={14} className="text-slate-950 stroke-[3]" />
        </div>
      </div>

      <div className="text-center max-w-md">
        <h3 className="font-extrabold text-white text-xl mb-2 tracking-tight">
          Welcome to the Gateway, {employee.firstName}
        </h3>
        <p className="text-sm text-slate-200 leading-relaxed font-normal">
          You are authenticated as <strong className="text-cyan-300">{employee.roleName}</strong>.{' '}
          {employee.accessLevel === 'full' && 'Your role permits access to transaction queries with automated PII masking.'}
          {employee.accessLevel === 'aggregate' && 'Your role restricts data to high-level statistical summaries.'}
          {employee.accessLevel === 'none' && 'Your role has no production access. Queries are immediately rejected by policy.'}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 max-w-md">
        {[
          { icon: Shield, label: 'Gateway Active', color: '#34d399', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
          { icon: Lock, label: 'Presidio PII Vault', color: '#38bdf8', bg: 'rgba(56,189,248,0.15)', border: 'rgba(56,189,248,0.3)' },
          { icon: Database, label: 'Safe Audit Trail', color: '#c084fc', bg: 'rgba(192,132,252,0.15)', border: 'rgba(192,132,252,0.3)' },
        ].map(chip => (
          <div 
            key={chip.label} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: chip.bg, color: chip.color, border: `1px solid ${chip.border}` }}
          >
            <chip.icon size={12} />
            {chip.label}
          </div>
        ))}
      </div>

      <p className="text-xs font-mono text-cyan-400/80">
        ↓ Select a suggested prompt below or enter an analytical request
      </p>
    </div>
  );
}

export default function ChatWindow({ 
  messages, 
  isLoading, 
  employee 
}: {
  messages: Message[]; 
  isLoading: boolean; 
  employee: Employee;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="secure-chat-messages">
      {messages.length === 0 && !isLoading ? (
        <EmptyState employee={employee} />
      ) : (
        messages.map(msg => (
          <MessageBubble
            key={msg.id}
            message={msg}
            employeeAvatar={employee.avatarInitials}
          />
        ))
      )}
      {isLoading && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}

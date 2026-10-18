import { useRef, useEffect } from 'react';
import { Shield, Lock, Eye, Database, Cpu } from 'lucide-react';
import type { Message, Employee } from '../types';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  employee: Employee;
}

/* ─── Typing Indicator ─────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade" style={{ animationDuration: '0.3s' }}>
      {/* AI avatar */}
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 relative"
        style={{ background: 'rgba(15,98,254,0.1)', border: '1px solid rgba(15,98,254,0.25)' }}>
        <svg width="15" height="15" viewBox="0 0 72 72" fill="none" className="shield-glow-processing">
          <path d="M36 6L10 17v18c0 16.6 11.1 32.1 26 36 14.9-3.9 26-19.4 26-36V17L36 6z"
            fill="rgba(15,98,254,0.4)" stroke="#0f62fe" strokeWidth="2" />
          <path d="M26 36l6 6 14-14" stroke="#82cfff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {/* scan line */}
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#4589ff] to-transparent opacity-70"
            style={{ animation: 'scanLine 1.4s linear infinite' }} />
        </div>
      </div>

      <div className="msg-assistant px-4 py-3.5 flex items-center gap-3 min-w-[220px]">
        {/* Animated dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="typing-dot"
              style={{ animation: `bounceTyping 1.4s ease-in-out ${i * 0.16}s infinite` }} />
          ))}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
            Security gateway processing
          </span>
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
            PII scan · Policy check · IBM Granite
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Floating Icon ────────────────────────────────────────────── */
function FloatingIcon({ icon: Icon, x, y, delay, size = 28 }: {
  icon: React.ElementType; x: number; y: number; delay: number; size?: number;
}) {
  return (
    <div className="absolute pointer-events-none"
      style={{
        left: `${x}%`, top: `${y}%`,
        opacity: 0.04,
        color: '#4589ff',
        animation: `floatSoft ${6 + delay}s ease-in-out ${delay}s infinite`,
        transform: 'translate(-50%, -50%)',
      }}>
      <Icon size={size} />
    </div>
  );
}

/* ─── Empty State ──────────────────────────────────────────────── */
function EmptyState({ employee }: { employee: Employee }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-7 py-12 relative">
      {/* Floating background icons */}
      <FloatingIcon icon={Shield} x={12}  y={20} delay={0}   size={48} />
      <FloatingIcon icon={Lock}   x={88}  y={15} delay={2}   size={36} />
      <FloatingIcon icon={Eye}    x={8}   y={70} delay={1.5} size={40} />
      <FloatingIcon icon={Database} x={90} y={65} delay={3}  size={44} />
      <FloatingIcon icon={Cpu}    x={50}  y={85} delay={0.8} size={32} />
      <FloatingIcon icon={Shield} x={75}  y={40} delay={4}   size={28} />

      {/* Center shield */}
      <div className="relative flex items-center justify-center">
        {/* Rings */}
        <div className="absolute w-24 h-24 rounded-full border border-[rgba(15,98,254,0.15)]"
          style={{ animation: 'rotateRing 16s linear infinite' }} />
        <div className="absolute w-16 h-16 rounded-full border border-[rgba(15,98,254,0.1)]"
          style={{ animation: 'rotateRingReverse 10s linear infinite' }} />

        <div className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center relative"
          style={{ background: 'rgba(15,98,254,0.07)', border: '1px solid rgba(15,98,254,0.2)' }}>
          <svg width="40" height="40" viewBox="0 0 72 72" fill="none" className="shield-glow">
            <defs>
              <linearGradient id="esg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#82cfff" />
                <stop offset="100%" stopColor="#0f62fe" />
              </linearGradient>
            </defs>
            <path d="M36 6L10 17v18c0 16.6 11.1 32.1 26 36 14.9-3.9 26-19.4 26-36V17L36 6z"
              fill="rgba(15,98,254,0.25)" stroke="url(#esg)" strokeWidth="1.5" />
            <path d="M26 36l6 6 14-14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {/* Status dot */}
          <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: '#42be65', boxShadow: '0 0 12px rgba(66,190,101,0.7)' }}>
            <div className="w-2 h-2 rounded-full bg-white opacity-80" />
          </div>
        </div>
      </div>

      {/* Text */}
      <div className="text-center space-y-3 max-w-sm px-4">
        <p className="text-white font-semibold text-xl">
          Welcome, {employee.firstName}
        </p>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
          Signed in as{' '}
          <span className="font-semibold" style={{ color: employee.accentColor }}>{employee.roleName}</span>.
          {' '}{employee.accessLevel === 'full' && 'Full access to transaction records and aggregate summaries.'}
          {employee.accessLevel === 'aggregate' && 'Aggregate summaries only — individual records are restricted.'}
          {employee.accessLevel === 'none' && 'All production record queries will be denied per RBAC policy.'}
        </p>
      </div>

      {/* Security context chips */}
      <div className="flex flex-wrap justify-center gap-2 max-w-sm">
        {[
          { label: 'Gateway Active', color: '#42be65' },
          { label: 'Presidio Ready', color: '#4589ff' },
          { label: 'Audit Enabled', color: '#be95ff' },
          { label: 'Granite Adapter', color: '#3ddbd9' },
        ].map(chip => (
          <div key={chip.label} className="tech-badge">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: chip.color, boxShadow: `0 0 6px ${chip.color}` }} />
            {chip.label}
          </div>
        ))}
      </div>

      {/* Hint text */}
      <p className="text-[var(--text-muted)] text-xs font-mono animate-[blink_2s_step-end_infinite]">
        ↓  Ask a question or select a suggested query below
      </p>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────── */
export default function ChatWindow({ messages, isLoading, employee }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 relative"
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2a3e transparent' }}>
      {/* Fine grid overlay */}
      <div className="absolute inset-0 security-grid-fine opacity-40 pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {messages.length === 0 && !isLoading
          ? <EmptyState employee={employee} />
          : messages.map((msg, idx) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              employeeAvatar={employee.avatarInitials}
              employeeColor={employee.accentColor}
              animationDelay={idx === messages.length - 1 ? 0 : 0}
            />
          ))
        }
        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} className="h-1" />
      </div>
    </div>
  );
}

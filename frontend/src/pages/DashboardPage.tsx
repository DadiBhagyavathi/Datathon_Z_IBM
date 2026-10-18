import { useState, useCallback, useRef, useEffect } from 'react';
import { Send, Trash2, Shield } from 'lucide-react';
import type { Employee, Message, SecurityMeta, SessionStats, AuditEvent, PolicyAction } from '../types';
import { sendChatMessage, getAuditEvents } from '../services/mockApi';
import Header from '../components/Header';
import ChatWindow from '../components/ChatWindow';
import SecurityPanel from '../components/SecurityPanel';
import AuditDrawer from '../components/AuditDrawer';
import PersonaSwitcher from '../components/PersonaSwitcher';
import SuggestedQueries from '../components/SuggestedQueries';

interface DashboardPageProps {
  employee: Employee;
  onLogout: () => void;
}

const EMPTY_STATS: SessionStats = {
  totalRequests: 0,
  blockedRequests: 0,
  allowedRequests: 0,
  aggregateRequests: 0,
  redactedRequests: 0,
  piiValuesDetected: 0,
  piiValuesRedacted: 0,
  injectionAttemptsBlocked: 0,
};

export default function DashboardPage({ employee: initEmp, onLogout }: DashboardPageProps) {
  const [employee, setEmployee]           = useState<Employee>(initEmp);
  const [messages, setMessages]           = useState<Message[]>([]);
  const [input, setInput]                 = useState('');
  const [isLoading, setIsLoading]         = useState(false);
  const [auditOpen, setAuditOpen]         = useState(false);
  const [personaOpen, setPersonaOpen]     = useState(false);
  const [lastSecurity, setLastSecurity]   = useState<SecurityMeta | null>(null);
  const [lastPolicy, setLastPolicy]       = useState<PolicyAction | null>(null);
  const [stats, setStats]                 = useState<SessionStats>(EMPTY_STATS);
  const [auditEvents, setAuditEvents]     = useState<AuditEvent[]>(getAuditEvents());
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const msgId    = useRef(0);

  // Auto-resize textarea
  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = 'auto';
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 160)}px`;
  }, [input]);

  // Refresh audit events
  useEffect(() => {
    const id = setInterval(() => setAuditEvents(getAuditEvents()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleSend = useCallback(async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || isLoading) return;

    setInput('');
    setIsLoading(true);

    const userMsg: Message = {
      id: `msg_${++msgId.current}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await sendChatMessage(employee, text, history);

      const assistantMsg: Message = {
        id: `msg_${++msgId.current}`,
        role: 'assistant',
        content: res.error ?? res.answer ?? 'Unexpected error.',
        timestamp: new Date(),
        securityMeta: res.security,
        isError: !!res.error,
      };
      setMessages(prev => [...prev, assistantMsg]);
      setLastSecurity(res.security);
      setLastPolicy(res.security.policyAction);

      setStats(prev => ({
        totalRequests:           prev.totalRequests + 1,
        blockedRequests:         prev.blockedRequests + (res.security.isBlocked ? 1 : 0),
        allowedRequests:         prev.allowedRequests + (!res.security.isBlocked && res.security.policyAction === 'ALLOW_MINIMAL_FIELDS' ? 1 : 0),
        aggregateRequests:       prev.aggregateRequests + (res.security.policyAction === 'AGGREGATE' ? 1 : 0),
        redactedRequests:        prev.redactedRequests + (res.security.policyAction === 'REDACT' ? 1 : 0),
        piiValuesDetected:       prev.piiValuesDetected + res.security.piiDetected,
        piiValuesRedacted:       prev.piiValuesRedacted + res.security.piiRedacted,
        injectionAttemptsBlocked: prev.injectionAttemptsBlocked + (res.security.injectionAttemptDetected ? 1 : 0),
      }));

      setAuditEvents(getAuditEvents());
    } catch {
      setMessages(prev => [...prev, {
        id: `msg_${++msgId.current}`,
        role: 'assistant',
        content: '**Gateway Error** — Unable to process request. Please try again.',
        timestamp: new Date(),
        isError: true,
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, isLoading, messages, employee]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  const handleSwitchPersona = useCallback((emp: Employee) => {
    setEmployee(emp);
    setMessages([]);
    setLastSecurity(null);
    setLastPolicy(null);
    setStats(EMPTY_STATS);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Fine grid */}
      <div className="absolute inset-0 security-grid-fine opacity-30 pointer-events-none" />

      <Header
        employee={employee}
        onSwitchPersona={() => setPersonaOpen(true)}
        onOpenAudit={() => setAuditOpen(true)}
        onLogout={onLogout}
        requestCount={stats.totalRequests}
        lastPolicy={lastPolicy}
        isProcessing={isLoading}
      />

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Chat column */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <ChatWindow messages={messages} isLoading={isLoading} employee={employee} />

          {/* Divider */}
          <div className="flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <SuggestedQueries employee={employee} onSelect={q => handleSend(q)} disabled={isLoading} />
          </div>

          {/* Input area */}
          <div className="flex-shrink-0 px-4 pb-4 pt-1">
            <div className="flex flex-col gap-2 rounded-2xl p-3 glass"
              style={{ boxShadow: isLoading ? '0 0 0 1px rgba(15,98,254,0.2), 0 0 20px rgba(15,98,254,0.06)' : 'none', transition: 'box-shadow 0.3s ease' }}>

              {/* Processing label */}
              {isLoading && (
                <div className="flex items-center gap-2 px-1 animate-fade">
                  <Shield size={11} style={{ color: '#4589ff', animation: 'shieldPulse 0.8s ease-in-out infinite alternate' }} />
                  <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                    PII scan → Policy check → Granite inference...
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(15,98,254,0.4), transparent)' }} />
                </div>
              )}

              <div className="flex gap-3 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a business question... (Enter to send · Shift+Enter for new line)"
                  className="chat-input flex-1"
                  rows={1}
                  disabled={isLoading}
                  style={{ minHeight: '44px', maxHeight: '160px' }}
                />

                <div className="flex items-end gap-2 flex-shrink-0 pb-0.5">
                  {messages.length > 0 && (
                    <button
                      onClick={() => { setMessages([]); setLastSecurity(null); }}
                      className="p-2.5 rounded-xl transition-all duration-200"
                      style={{ color: 'var(--text-muted)' }}
                      title="Clear"
                      onMouseEnter={e => { (e.currentTarget).style.color = 'var(--text-secondary)'; (e.currentTarget).style.background = 'rgba(255,255,255,0.06)'; }}
                      onMouseLeave={e => { (e.currentTarget).style.color = 'var(--text-muted)'; (e.currentTarget).style.background = 'transparent'; }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}

                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className={`p-2.5 rounded-xl transition-all duration-250 ${input.trim() && !isLoading ? 'send-btn-active' : ''}`}
                    style={!input.trim() || isLoading
                      ? { background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', cursor: 'not-allowed' }
                      : { color: 'white' }}
                  >
                    {isLoading
                      ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'rgba(255,255,255,0.8)' }} />
                      : <Send size={15} />
                    }
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-1">
                <p className="text-[9px] font-mono" style={{ color: '#2a2a3a' }}>
                  All queries routed through SecureAI Gateway · Granite on IBM LinuxONE
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: isLoading ? '#4589ff' : '#42be65',
                      boxShadow: `0 0 6px ${isLoading ? '#4589ff' : '#42be65'}`,
                      animation: isLoading ? 'glowPulseBlue 0.8s ease-in-out infinite' : 'none',
                      transition: 'background 0.3s',
                    }} />
                  <span className="text-[9px] font-mono" style={{ color: '#3a3a52' }}>
                    {isLoading ? 'Processing' : 'Gateway Ready'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security panel */}
        <SecurityPanel
          employee={employee}
          lastSecurity={lastSecurity}
          stats={stats}
          isProcessing={isLoading}
        />
      </div>

      <AuditDrawer isOpen={auditOpen} onClose={() => setAuditOpen(false)} events={auditEvents} />
      <PersonaSwitcher isOpen={personaOpen} currentEmployee={employee} onSelect={handleSwitchPersona} onClose={() => setPersonaOpen(false)} />
    </div>
  );
}

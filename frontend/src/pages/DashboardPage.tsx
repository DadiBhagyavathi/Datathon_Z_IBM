import { useState, useCallback, useRef, useEffect } from 'react';
import { Send, Trash2, Shield, Lock } from 'lucide-react';
import type { Employee, Message, SecurityMeta, SessionStats, AuditEvent, PolicyAction } from '../types';
import { sendChatMessage, getAuditEvents } from '../services/mockApi';
import Header from '../components/Header';
import ChatWindow from '../components/ChatWindow';
import SecurityPanel from '../components/SecurityPanel';
import AuditDrawer from '../components/AuditDrawer';
import PersonaSwitcher from '../components/PersonaSwitcher';
import SuggestedQueries from '../components/SuggestedQueries';

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

export default function DashboardPage({ 
  employee: initEmp, 
  onLogout 
}: { 
  employee: Employee; 
  onLogout: () => void; 
}) {
  const [employee, setEmployee] = useState<Employee>(initEmp);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [personaOpen, setPersonaOpen] = useState(false);
  const [lastSecurity, setLastSecurity] = useState<SecurityMeta | null>(null);
  const [lastPolicy, setLastPolicy] = useState<PolicyAction | null>(null);
  const [stats, setStats] = useState<SessionStats>(EMPTY_STATS);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(getAuditEvents());
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const msgId = useRef(0);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = 'auto';
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
  }, [input]);

  useEffect(() => {
    const id = setInterval(() => setAuditEvents(getAuditEvents()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleSend = useCallback(async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || isLoading) return;
    setInput('');
    setIsLoading(true);

    setMessages(prev => [
      ...prev, 
      { id: `msg_${++msgId.current}`, role: 'user', content: text, timestamp: new Date() }
    ]);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await sendChatMessage(employee, text, history);
      
      setMessages(prev => [
        ...prev, 
        {
          id: `msg_${++msgId.current}`,
          role: 'assistant',
          content: res.error ?? res.answer ?? 'Unexpected gateway response.',
          timestamp: new Date(),
          securityMeta: res.security,
          isError: !!res.error,
        }
      ]);

      setLastSecurity(res.security);
      setLastPolicy(res.security.policyAction);

      setStats(prev => ({
        totalRequests: prev.totalRequests + 1,
        blockedRequests: prev.blockedRequests + (res.security.isBlocked ? 1 : 0),
        allowedRequests: prev.allowedRequests + (!res.security.isBlocked && res.security.policyAction === 'ALLOW_MINIMAL_FIELDS' ? 1 : 0),
        aggregateRequests: prev.aggregateRequests + (res.security.policyAction === 'AGGREGATE' ? 1 : 0),
        redactedRequests: prev.redactedRequests + (res.security.policyAction === 'REDACT' ? 1 : 0),
        piiValuesDetected: prev.piiValuesDetected + res.security.piiDetected,
        piiValuesRedacted: prev.piiValuesRedacted + res.security.piiRedacted,
        injectionAttemptsBlocked: prev.injectionAttemptsBlocked + (res.security.injectionAttemptDetected ? 1 : 0),
      }));

      setAuditEvents(getAuditEvents());
    } catch {
      setMessages(prev => [
        ...prev, 
        { 
          id: `msg_${++msgId.current}`, 
          role: 'assistant', 
          content: '**Gateway Communication Error** — Security policy service timed out.', 
          timestamp: new Date(), 
          isError: true 
        }
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, isLoading, messages, employee]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const switchPersona = useCallback((emp: Employee) => {
    setEmployee(emp);
    setMessages([]);
    setLastSecurity(null);
    setLastPolicy(null);
    setStats(EMPTY_STATS);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#050811]">
      <Header
        employee={employee}
        onSwitchPersona={() => setPersonaOpen(true)}
        onOpenAudit={() => setAuditOpen(true)}
        onLogout={onLogout}
        requestCount={stats.totalRequests}
        lastPolicy={lastPolicy}
        isProcessing={isLoading}
      />

      <div className="secure-chat-layout">
        {/* Main Chat Column */}
        <div className="secure-chat-main">
          <ChatWindow messages={messages} isLoading={isLoading} employee={employee} />

          {/* Quick Query Suggestion Chips */}
          <SuggestedQueries employee={employee} onSelect={q => handleSend(q)} disabled={isLoading} />

          {/* Prompt Entry Box */}
          <div className="secure-chat-input-wrap">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                {isLoading && (
                  <div className="flex items-center gap-2 mb-2 px-1 text-cyan-300 font-mono text-xs">
                    <Shield size={13} className="animate-pulse" />
                    <span>Enforcing RBAC filter, evaluating prompt injection & stripping PII...</span>
                  </div>
                )}
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a business inquiry... (Press Enter to execute query with gateway sanitization)"
                  className="secure-chat-input"
                  rows={1}
                  disabled={isLoading}
                  style={{ minHeight: 46, maxHeight: 150 }}
                />
              </div>

              <div className="flex items-end gap-2 flex-shrink-0 pb-1">
                {messages.length > 0 && (
                  <button 
                    onClick={() => { setMessages([]); setLastSecurity(null); }}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
                    title="Clear history"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <button 
                  onClick={() => handleSend()} 
                  disabled={!input.trim() || isLoading}
                  className="p-3 rounded-xl transition-all flex items-center justify-center font-bold"
                  style={{
                    background: input.trim() && !isLoading ? 'linear-gradient(135deg, #00f0ff 0%, #0f62fe 100%)' : '#1e293b',
                    color: input.trim() && !isLoading ? '#050811' : '#64748b',
                    cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
                    boxShadow: input.trim() && !isLoading ? '0 0 15px rgba(0, 240, 255, 0.4)' : 'none',
                  }}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={16} className="stroke-[2.5]" />
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Status Ribbon */}
            <div className="flex items-center justify-between mt-2 px-1 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Lock size={12} className="text-cyan-400" />
                Requests filtered through IBM LinuxONE Hardware-Assisted Security Gateway
              </span>
              <div className="flex items-center gap-2 font-bold">
                <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400'}`} />
                <span className={isLoading ? 'text-cyan-300' : 'text-emerald-300'}>
                  {isLoading ? 'GATEWAY_BUSY' : 'GATEWAY_READY'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Security Sidebar */}
        <SecurityPanel 
          employee={employee} 
          lastSecurity={lastSecurity} 
          stats={stats} 
          isProcessing={isLoading} 
        />
      </div>

      <AuditDrawer isOpen={auditOpen} onClose={() => setAuditOpen(false)} events={auditEvents} />
      <PersonaSwitcher isOpen={personaOpen} currentEmployee={employee} onSelect={switchPersona} onClose={() => setPersonaOpen(false)} />
    </div>
  );
}

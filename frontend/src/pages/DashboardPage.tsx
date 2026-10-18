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

const EMPTY_STATS: SessionStats = {
  totalRequests:0, blockedRequests:0, allowedRequests:0,
  aggregateRequests:0, redactedRequests:0,
  piiValuesDetected:0, piiValuesRedacted:0, injectionAttemptsBlocked:0,
};

export default function DashboardPage({ employee: initEmp, onLogout }: { employee:Employee; onLogout:()=>void }) {
  const [employee, setEmployee]         = useState<Employee>(initEmp);
  const [messages, setMessages]         = useState<Message[]>([]);
  const [input, setInput]               = useState('');
  const [isLoading, setIsLoading]       = useState(false);
  const [auditOpen, setAuditOpen]       = useState(false);
  const [personaOpen, setPersonaOpen]   = useState(false);
  const [lastSecurity, setLastSecurity] = useState<SecurityMeta|null>(null);
  const [lastPolicy, setLastPolicy]     = useState<PolicyAction|null>(null);
  const [stats, setStats]               = useState<SessionStats>(EMPTY_STATS);
  const [auditEvents, setAuditEvents]   = useState<AuditEvent[]>(getAuditEvents());
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const msgId    = useRef(0);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = 'auto';
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
  }, [input]);

  useEffect(() => {
    const id = setInterval(()=>setAuditEvents(getAuditEvents()), 1000);
    return ()=>clearInterval(id);
  }, []);

  const handleSend = useCallback(async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || isLoading) return;
    setInput(''); setIsLoading(true);

    setMessages(prev => [...prev, { id:`msg_${++msgId.current}`, role:'user', content:text, timestamp:new Date() }]);

    try {
      const history = messages.map(m=>({ role:m.role, content:m.content }));
      const res = await sendChatMessage(employee, text, history);
      setMessages(prev => [...prev, {
        id:`msg_${++msgId.current}`, role:'assistant',
        content: res.error ?? res.answer ?? 'Unexpected error.',
        timestamp:new Date(), securityMeta:res.security, isError:!!res.error,
      }]);
      setLastSecurity(res.security); setLastPolicy(res.security.policyAction);
      setStats(prev => ({
        totalRequests: prev.totalRequests+1,
        blockedRequests: prev.blockedRequests+(res.security.isBlocked?1:0),
        allowedRequests: prev.allowedRequests+(!res.security.isBlocked&&res.security.policyAction==='ALLOW_MINIMAL_FIELDS'?1:0),
        aggregateRequests: prev.aggregateRequests+(res.security.policyAction==='AGGREGATE'?1:0),
        redactedRequests: prev.redactedRequests+(res.security.policyAction==='REDACT'?1:0),
        piiValuesDetected: prev.piiValuesDetected+res.security.piiDetected,
        piiValuesRedacted: prev.piiValuesRedacted+res.security.piiRedacted,
        injectionAttemptsBlocked: prev.injectionAttemptsBlocked+(res.security.injectionAttemptDetected?1:0),
      }));
      setAuditEvents(getAuditEvents());
    } catch {
      setMessages(prev => [...prev, { id:`msg_${++msgId.current}`, role:'assistant', content:'**Gateway Error** — Unable to process request.', timestamp:new Date(), isError:true }]);
    } finally {
      setIsLoading(false);
      setTimeout(()=>inputRef.current?.focus(), 50);
    }
  }, [input, isLoading, messages, employee]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  const switchPersona = useCallback((emp:Employee) => {
    setEmployee(emp); setMessages([]); setLastSecurity(null); setLastPolicy(null); setStats(EMPTY_STATS);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background:'#f9fafb' }}>
      <Header
        employee={employee} onSwitchPersona={()=>setPersonaOpen(true)}
        onOpenAudit={()=>setAuditOpen(true)} onLogout={onLogout}
        requestCount={stats.totalRequests} lastPolicy={lastPolicy} isProcessing={isLoading}
      />

      <div className="chat-layout">
        {/* Chat column */}
        <div className="chat-main">
          <ChatWindow messages={messages} isLoading={isLoading} employee={employee} />

          <SuggestedQueries employee={employee} onSelect={q=>handleSend(q)} disabled={isLoading} />

          {/* Input */}
          <div className="chat-input-wrap">
            <div className="flex gap-2.5 items-end">
              <div className="flex-1">
                {isLoading && (
                  <div className="flex items-center gap-2 mb-1.5 px-1 animate-fade">
                    <Shield size={11} style={{ color:'#0f62fe' }} />
                    <span className="text-[10px]" style={{ color:'#9ca3af' }}>
                      PII scan · Policy check · Granite inference…
                    </span>
                  </div>
                )}
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e=>setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a business question… (Enter to send, Shift+Enter for new line)"
                  className="chat-input"
                  rows={1}
                  disabled={isLoading}
                  style={{ minHeight:44, maxHeight:150 }}
                />
              </div>

              <div className="flex items-end gap-1.5 flex-shrink-0 pb-0.5">
                {messages.length > 0 && (
                  <button onClick={()=>{setMessages([]);setLastSecurity(null);}}
                    className="p-2.5 rounded-xl transition-all" style={{ color:'#9ca3af' }}
                    title="Clear"
                    onMouseEnter={e=>{(e.currentTarget).style.background='#f3f4f6';(e.currentTarget).style.color='#374151';}}
                    onMouseLeave={e=>{(e.currentTarget).style.background='transparent';(e.currentTarget).style.color='#9ca3af';}}>
                    <Trash2 size={15} />
                  </button>
                )}
                <button onClick={()=>handleSend()} disabled={!input.trim()||isLoading}
                  className="p-2.5 rounded-xl transition-all flex items-center justify-center"
                  style={{
                    background: input.trim()&&!isLoading?'#0f62fe':'#f3f4f6',
                    color: input.trim()&&!isLoading?'white':'#d1d5db',
                    cursor: !input.trim()||isLoading?'not-allowed':'pointer',
                    boxShadow: input.trim()&&!isLoading?'0 2px 8px rgba(15,98,254,0.3)':'none',
                    transition: 'all 0.15s ease',
                  }}>
                  {isLoading
                    ? <div className="w-4 h-4 border-2 rounded-full" style={{ borderColor:'rgba(255,255,255,0.3)',borderTopColor:'white',animation:'spin 0.7s linear infinite' }}/>
                    : <Send size={15} />
                  }
                </button>
              </div>
            </div>

            {/* Footer hint */}
            <div className="flex items-center justify-between mt-2 px-0.5">
              <p className="text-[10px]" style={{ color:'#d1d5db' }}>
                All queries route through SecureAI Gateway · IBM LinuxONE
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full"
                  style={{ background:isLoading?'#0f62fe':'#059669', transition:'background 0.3s',
                    boxShadow:`0 0 4px ${isLoading?'rgba(15,98,254,0.6)':'rgba(5,150,105,0.6)'}` }} />
                <span className="text-[10px]" style={{ color:'#9ca3af' }}>
                  {isLoading?'Processing':'Gateway Ready'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <SecurityPanel employee={employee} lastSecurity={lastSecurity} stats={stats} isProcessing={isLoading} />
      </div>

      <AuditDrawer isOpen={auditOpen} onClose={()=>setAuditOpen(false)} events={auditEvents} />
      <PersonaSwitcher isOpen={personaOpen} currentEmployee={employee} onSelect={switchPersona} onClose={()=>setPersonaOpen(false)} />
    </div>
  );
}

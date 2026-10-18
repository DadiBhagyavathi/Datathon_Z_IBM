import { useState, useCallback } from 'react';
import { Shield, CheckCircle, AlertTriangle, Lock, Activity, ArrowRight } from 'lucide-react';
import type { Employee } from '../types';
import { EMPLOYEES } from '../data/employees';

interface LoginPageProps {
  onLogin: (employee: Employee) => void;
}

const ACCESS = {
  full:      { label: 'Full Access',      color: '#059669', bg: '#ecfdf5', border: '#6ee7b7', dot: '#059669' },
  aggregate: { label: 'Aggregate Only',   color: '#d97706', bg: '#fffbeb', border: '#fde68a', dot: '#d97706' },
  none:      { label: 'No Access',        color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', dot: '#dc2626' },
} as const;

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [entering, setEntering] = useState(false);

  const selectedEmp = EMPLOYEES.find(e => e.id === selected);

  const handleEnter = useCallback(async () => {
    if (!selected || entering || !selectedEmp) return;
    setEntering(true);
    await new Promise(r => setTimeout(r, 500));
    onLogin(selectedEmp);
  }, [selected, entering, selectedEmp, onLogin]);

  return (
    <div className="login-page">
      {/* ── Nav ── */}
      <nav className="login-nav">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center" style={{ background: '#0f62fe' }}>
            <Shield size={16} color="white" />
          </div>
          <span className="font-semibold text-[15px]" style={{ color: '#111827' }}>SecureAI Gateway</span>
        </div>
        <div className="hidden sm:flex items-center gap-5">
          {['Docs', 'Architecture', 'Security'].map(item => (
            <a key={item} href="#" className="text-sm font-medium" style={{ color: '#6b7280' }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = '#111827'}
              onMouseLeave={e => (e.target as HTMLElement).style.color = '#6b7280'}>
              {item}
            </a>
          ))}
          <span className="text-xs font-mono px-2.5 py-1 rounded-full" style={{ background: '#eff6ff', color: '#0f62fe', border: '1px solid #bfdbfe' }}>
            IBM Z Datathon 2026
          </span>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="login-hero">
        {/* Floating abstract visual */}
        <div className="relative mb-10 animate-float">
          <div className="relative mx-auto" style={{ width: 120, height: 120 }}>
            {/* Outer ring */}
            <svg className="absolute inset-0" width="120" height="120" viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="58" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="6 4" />
              <circle cx="60" cy="60" r="44" stroke="#dbeafe" strokeWidth="1" />
              <circle cx="60" cy="2" r="4" fill="#0f62fe" />
              <circle cx="60" cy="118" r="3" fill="#bfdbfe" />
              <circle cx="2" cy="60" r="3" fill="#bfdbfe" />
              <circle cx="118" cy="60" r="3" fill="#0f62fe" opacity="0.4" />
            </svg>
            {/* Shield center */}
            <div className="absolute inset-6 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0f62fe 0%, #0043ce 100%)', boxShadow: '0 12px 32px rgba(15,98,254,0.35)' }}>
              <Shield size={36} color="white" strokeWidth={1.5} />
            </div>
            {/* Status dot */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center"
              style={{ background: '#059669' }}>
              <CheckCircle size={11} color="white" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="text-center mb-3 max-w-2xl px-4">
          <h1 className="font-bold leading-tight mb-3" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#111827', letterSpacing: '-0.02em' }}>
            Privacy-Preserving Enterprise AI<br />
            <span style={{ color: '#0f62fe' }}>on IBM LinuxONE</span>
          </h1>
          <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
            SecureAI Gateway enforces identity, RBAC, PII redaction, and audit controls
            before and after IBM Granite inference.
          </p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-8 mb-10 mt-4">
          {[
            { val: '4', label: 'Policy Actions' },
            { val: '9', label: 'Security Tests' },
            { val: '100%', label: 'Audit Coverage' },
            { val: '0', label: 'Raw Data Exposed' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="font-bold" style={{ fontSize: 22, color: '#0f62fe', letterSpacing: '-0.02em' }}>{s.val}</div>
              <div className="text-xs" style={{ color: '#9ca3af', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Persona Cards ── */}
        <div className="w-full max-w-4xl px-4 mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4 text-center" style={{ color: '#9ca3af' }}>
            Select your identity to begin a secure session
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {EMPLOYEES.map((emp, idx) => {
              const isSelected = selected === emp.id;
              const acc = ACCESS[emp.accessLevel];
              return (
                <button
                  key={emp.id}
                  onClick={() => setSelected(emp.id)}
                  className={`persona-card ${isSelected ? 'selected' : ''}`}
                  style={{
                    opacity: 0,
                    animation: `slideUp 0.35s cubic-bezier(0.16,1,0.3,1) ${idx * 80 + 100}ms forwards`,
                  }}
                >
                  {/* Selected ring */}
                  {isSelected && (
                    <div className="absolute top-3.5 right-3.5">
                      <CheckCircle size={18} style={{ color: '#0f62fe' }} />
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ background: emp.accessLevel === 'full' ? '#eff6ff' : emp.accessLevel === 'aggregate' ? '#fffbeb' : '#fef2f2',
                        color: emp.accessLevel === 'full' ? '#0f62fe' : emp.accessLevel === 'aggregate' ? '#d97706' : '#dc2626',
                        fontSize: 14 }}>
                      {emp.avatarInitials}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: '#111827', fontSize: 14 }}>{emp.displayName}</p>
                      <p className="text-xs" style={{ color: '#9ca3af' }}>{emp.roleName}</p>
                    </div>
                  </div>

                  {/* Access badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-3"
                    style={{ background: acc.bg, color: acc.color, border: `1px solid ${acc.border}` }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: acc.dot }} />
                    {acc.label}
                  </div>

                  {/* Description */}
                  <p className="text-xs mb-4 leading-relaxed" style={{ color: '#6b7280' }}>{emp.description}</p>

                  {/* Permissions */}
                  <div className="space-y-1.5">
                    {emp.permissions.length > 0
                      ? emp.permissions.map(p => (
                        <div key={p} className="flex items-center gap-1.5">
                          <CheckCircle size={11} style={{ color: '#059669', flexShrink: 0 }} />
                          <span className="text-xs font-mono" style={{ color: '#374151' }}>{p}</span>
                        </div>
                      ))
                      : <div className="flex items-center gap-1.5">
                        <AlertTriangle size={11} style={{ color: '#dc2626', flexShrink: 0 }} />
                        <span className="text-xs font-mono" style={{ color: '#9ca3af' }}>NO_PERMISSIONS</span>
                      </div>
                    }
                  </div>

                  <p className="mt-4 text-xs font-mono truncate" style={{ color: '#d1d5db' }}>{emp.email}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleEnter}
            disabled={!selected || entering}
            className="btn-primary text-base"
            style={{ minWidth: 220 }}
          >
            {entering ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: 'spin 0.7s linear infinite' }} />
                Authenticating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {selected ? `Continue as ${selectedEmp?.firstName}` : 'Select a Persona'}
                {selected && <ArrowRight size={16} />}
              </span>
            )}
          </button>
          {selected && (
            <p className="text-xs animate-fade" style={{ color: '#9ca3af' }}>
              Signing in as <strong style={{ color: '#374151' }}>{selectedEmp?.displayName}</strong> · {selectedEmp?.roleName}
            </p>
          )}
        </div>

        {/* Tech stack */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {['IBM LinuxONE · s390x', 'IBM Granite 13B', 'Go + FastAPI', 'PostgreSQL 16', 'MS Presidio'].map(t => (
            <span key={t} className="tech-tag">{t}</span>
          ))}
        </div>

        <p className="mt-6 text-xs" style={{ color: '#d1d5db' }}>
          Advisory prototype · Synthetic data only · Apache 2.0
        </p>
      </div>
    </div>
  );
}

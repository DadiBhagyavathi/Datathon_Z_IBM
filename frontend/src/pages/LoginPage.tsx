import { useState, useCallback } from 'react';
import { Shield, CheckCircle, AlertTriangle, ArrowRight, Lock, Key, Cpu, Database } from 'lucide-react';
import type { Employee } from '../types';
import { EMPLOYEES } from '../data/employees';

interface LoginPageProps {
  onLogin: (employee: Employee) => void;
}

const ACCESS_CONFIG = {
  full: {
    label: 'Full Access',
    color: '#34d399',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.4)',
    dot: '#10b981'
  },
  aggregate: {
    label: 'Aggregate Only',
    color: '#fbbf24',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.4)',
    dot: '#f59e0b'
  },
  none: {
    label: 'No Access',
    color: '#f87171',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.4)',
    dot: '#ef4444'
  },
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
    <div className="secure-theme-page">
      {/* ── Top Navigation Bar ── */}
      <nav className="secure-nav">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
            <Shield size={18} className="text-slate-950 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-[15px] tracking-tight flex items-center gap-1.5">
              SecureAI <span className="text-cyan-400">Gateway</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider">IBM LinuxONE · s390x</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono text-cyan-300 font-semibold tracking-wide">
              IBM Z Datathon 2026
            </span>
          </div>
        </div>
      </nav>

      {/* ── Hero Section with Secure Lock Visual ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-6xl mx-auto w-full">
        
        {/* Floating Lock Visual (Second Image from UI PICS) */}
        <div className="relative mb-6 flex justify-center items-center">
          <div className="relative rounded-2xl overflow-hidden p-1 border-2 border-cyan-400/50 shadow-2xl shadow-cyan-500/30 neon-border-pulse bg-slate-900/80">
            <img 
              src="/secure-lock.jpg" 
              alt="Secure Lock IBM Z" 
              className="w-48 h-32 sm:w-64 sm:h-40 object-cover rounded-xl neon-glow-lock"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
            
            {/* Overlay Status Badge */}
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-cyan-200 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-400/30">
              <span className="flex items-center gap-1.5">
                <Lock size={12} className="text-cyan-400" />
                Hardware-Enforced Cryptography
              </span>
              <span className="text-emerald-400 font-bold">ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Title and Subtitle with 100% High-Contrast Legibility */}
        <div className="text-center max-w-2xl mb-8">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
            Privacy-Preserving Enterprise AI <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              on IBM LinuxONE
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-normal">
            SecureAI Gateway enforces identity, RBAC, PII redaction, and audit controls 
            before and after IBM Granite inference.
          </p>

          {/* 4 Key Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 max-w-xl mx-auto">
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 shadow-md">
              <div className="text-xl font-bold font-mono text-cyan-400">4</div>
              <div className="text-[11px] font-semibold text-slate-200 uppercase tracking-wider mt-0.5">Policy Actions</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 shadow-md">
              <div className="text-xl font-bold font-mono text-sky-400">9</div>
              <div className="text-[11px] font-semibold text-slate-200 uppercase tracking-wider mt-0.5">Security Tests</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 shadow-md">
              <div className="text-xl font-bold font-mono text-emerald-400">100%</div>
              <div className="text-[11px] font-semibold text-slate-200 uppercase tracking-wider mt-0.5">Audit Coverage</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 shadow-md">
              <div className="text-xl font-bold font-mono text-amber-400">0</div>
              <div className="text-[11px] font-semibold text-slate-200 uppercase tracking-wider mt-0.5">Raw Data Leaked</div>
            </div>
          </div>
        </div>

        {/* Persona Selection Header */}
        <div className="w-full text-center mb-4">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-300 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/60">
            Select Your Identity to Begin a Secure Session
          </span>
        </div>

        {/* 3 Persona Cards in High-Contrast Dark Blue */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mb-8">
          {EMPLOYEES.map((emp) => {
            const isSelected = selected === emp.id;
            const acc = ACCESS_CONFIG[emp.accessLevel];
            return (
              <button
                key={emp.id}
                onClick={() => setSelected(emp.id)}
                className={`secure-card ${isSelected ? 'selected' : ''}`}
              >
                {/* Checkmark when active */}
                {isSelected && (
                  <div className="absolute top-4 right-4 bg-cyan-400 text-slate-950 p-1 rounded-full shadow-lg shadow-cyan-400/50">
                    <CheckCircle size={16} className="stroke-[3]" />
                  </div>
                )}

                {/* Avatar and Info Header */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm bg-slate-800 border border-cyan-500/30 text-cyan-300 shadow-inner">
                    {emp.avatarInitials}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-[15px] leading-snug">{emp.displayName}</h3>
                    <p className="text-xs text-slate-300 font-medium">{emp.roleName}</p>
                  </div>
                </div>

                {/* Access Level Badge */}
                <div 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 border shadow-sm"
                  style={{ background: acc.bg, color: acc.color, borderColor: acc.border }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: acc.dot }} />
                  {acc.label}
                </div>

                {/* Persona Description */}
                <p className="text-xs text-slate-200 leading-relaxed mb-4 font-normal">
                  {emp.description}
                </p>

                {/* Permissions Breakdown */}
                <div className="space-y-1.5 pt-2 border-t border-slate-700/60">
                  {emp.permissions.length > 0 ? (
                    emp.permissions.map(perm => (
                      <div key={perm} className="flex items-center gap-2">
                        <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />
                        <span className="text-xs font-mono font-medium text-slate-100">{perm}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={13} className="text-rose-400 flex-shrink-0" />
                      <span className="text-xs font-mono font-medium text-rose-300">NO_PERMISSIONS</span>
                    </div>
                  )}
                </div>

                {/* Email in Clear, Legible Monospace */}
                <p className="mt-4 text-xs font-mono text-cyan-400/80 truncate">
                  {emp.email}
                </p>
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleEnter}
            disabled={!selected || entering}
            className="btn-secure-primary"
            style={{ minWidth: 260 }}
          >
            {entering ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                Authenticating Session...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2 w-full">
                {selected ? `Enter as ${selectedEmp?.firstName}` : 'Select a Persona to Enter'}
                <ArrowRight size={16} />
              </span>
            )}
          </button>

          {selected && (
            <p className="text-xs font-mono text-slate-300">
              Session Identity: <strong className="text-cyan-300">{selectedEmp?.displayName}</strong> ({selectedEmp?.roleName})
            </p>
          )}
        </div>

        {/* Footer Badges */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {[
            'IBM LinuxONE · s390x',
            'IBM Granite 13B',
            'Microsoft Presidio PII',
            'Go Gateway Core',
            'PostgreSQL 16'
          ].map(tag => (
            <span key={tag} className="text-xs font-mono px-3 py-1 rounded-md bg-slate-900/90 text-slate-300 border border-slate-800">
              {tag}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
}

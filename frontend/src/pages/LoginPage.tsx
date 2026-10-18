import { useState, useCallback, useMemo } from 'react';
import { Shield, CheckCircle, AlertTriangle, Lock, Activity } from 'lucide-react';
import type { Employee } from '../types';
import { EMPLOYEES } from '../data/employees';

interface LoginPageProps {
  onLogin: (employee: Employee) => void;
}

// Fixed particle data — deterministic so no layout shift
const PARTICLES = [
  { id:0, left:8,  delay:0,    dur:16, size:2.5, opacity:0.5 },
  { id:1, left:18, delay:2.5,  dur:12, size:2,   opacity:0.4 },
  { id:2, left:27, delay:5,    dur:18, size:3,   opacity:0.35 },
  { id:3, left:35, delay:1,    dur:14, size:1.5, opacity:0.45 },
  { id:4, left:42, delay:7,    dur:11, size:2,   opacity:0.3 },
  { id:5, left:50, delay:3.5,  dur:15, size:2.5, opacity:0.5 },
  { id:6, left:58, delay:9,    dur:13, size:1.5, opacity:0.35 },
  { id:7, left:65, delay:0.5,  dur:17, size:3,   opacity:0.4 },
  { id:8, left:73, delay:6,    dur:12, size:2,   opacity:0.45 },
  { id:9, left:82, delay:4,    dur:14, size:1.5, opacity:0.3 },
  { id:10,left:90, delay:8,    dur:16, size:2.5, opacity:0.4 },
  { id:11,left:12, delay:10,   dur:13, size:2,   opacity:0.35 },
  { id:12,left:22, delay:1.5,  dur:15, size:1.5, opacity:0.5 },
  { id:13,left:38, delay:11,   dur:11, size:3,   opacity:0.3 },
  { id:14,left:55, delay:4.5,  dur:18, size:2,   opacity:0.45 },
  { id:15,left:70, delay:7.5,  dur:14, size:2.5, opacity:0.4 },
  { id:16,left:85, delay:2,    dur:12, size:1.5, opacity:0.35 },
  { id:17,left:95, delay:9.5,  dur:16, size:2,   opacity:0.5 },
  { id:18,left:3,  delay:6.5,  dur:13, size:2.5, opacity:0.3 },
  { id:19,left:47, delay:12,   dur:15, size:1.5, opacity:0.45 },
];

const ACCESS_CONFIG = {
  full:      { label:'FULL ACCESS',     badgeCls:'badge-allow',     dotColor:'#42be65' },
  aggregate: { label:'AGGREGATE ONLY',  badgeCls:'badge-aggregate', dotColor:'#f1c21b' },
  none:      { label:'NO ACCESS',       badgeCls:'badge-deny',      dotColor:'#fa4d56' },
} as const;

const CARD_SELECTED = {
  blue:   'selected-blue',
  yellow: 'selected-yellow',
  red:    'selected-red',
} as const;

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [entering, setEntering] = useState(false);

  const selectedEmp = useMemo(() => EMPLOYEES.find(e => e.id === selected), [selected]);

  const handleEnter = useCallback(async () => {
    if (!selected || entering || !selectedEmp) return;
    setEntering(true);
    await new Promise(r => setTimeout(r, 700));
    onLogin(selectedEmp);
  }, [selected, entering, selectedEmp, onLogin]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Noise */}
      <div className="noise-overlay" />

      {/* Security grid */}
      <div className="absolute inset-0 security-grid opacity-100 pointer-events-none" />

      {/* Orbs */}
      <div className="orb orb-blue w-[700px] h-[700px] -top-56 -left-56 opacity-50 animate-[floatSoft_10s_ease-in-out_infinite]" />
      <div className="orb orb-purple w-[500px] h-[500px] -bottom-40 -right-40 opacity-40 animate-[floatSoft_14s_ease-in-out_infinite_-5s]" />
      <div className="orb orb-teal w-[350px] h-[350px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-25 animate-[floatSoft_8s_ease-in-out_infinite_-3s]" />

      {/* Rising particles */}
      {PARTICLES.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `rgba(15, 98, 254, ${p.opacity})`,
            boxShadow: `0 0 ${p.size * 2}px rgba(15, 98, 254, ${p.opacity * 0.8})`,
            animationName: 'particleRise',
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
          }}
        />
      ))}

      {/* Vignette */}
      <div className="absolute inset-0 vignette pointer-events-none" />

      {/* ── Main content ── */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-10 flex flex-col items-center gap-10 animate-slide-up">

        {/* Logo + Title */}
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Animated Shield */}
          <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>
            {/* Outer ring */}
            <div
              className="absolute inset-0 rounded-full border border-[rgba(15,98,254,0.25)]"
              style={{ animation: 'rotateRing 12s linear infinite' }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-ibm-blue" />
            </div>
            {/* Middle ring */}
            <div
              className="absolute inset-[10px] rounded-full border border-[rgba(190,149,255,0.2)]"
              style={{ animation: 'rotateRingReverse 8s linear infinite' }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent-purple" style={{ '--accent-purple': '#be95ff' } as React.CSSProperties} />
            </div>
            {/* Inner glow ring */}
            <div className="absolute inset-[22px] rounded-full border border-[rgba(61,219,217,0.15)]" style={{ animation: 'rotateRing 5s linear infinite' }} />

            {/* Shield center */}
            <div className="relative z-10">
              <ShieldSVG />
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-5xl font-bold tracking-tight leading-none">
              <span className="text-white">Secure</span>
              <span className="text-gradient-blue">AI</span>
              <span className="text-white"> Gateway</span>
            </h1>
            <p className="text-[var(--text-muted)] text-xs font-mono tracking-[0.2em] uppercase">
              IBM Z Datathon 2026 &nbsp;·&nbsp; Theme 2: AI Secured – Innovation Without Exposure
            </p>
            <p className="text-[var(--text-secondary)] text-[15px] max-w-md leading-relaxed">
              Privacy-preserving enterprise AI on IBM LinuxONE.
              <br />
              <span className="text-[var(--text-muted)]">Select your identity to begin a secure session.</span>
            </p>
          </div>

          {/* Trust bar */}
          <div className="flex items-center gap-6">
            {[
              { val: '9', label: 'Security Tests' },
              { val: '4', label: 'Policy Actions' },
              { val: '0', label: 'Raw Data Exposed' },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center">
                <span className="text-2xl font-bold text-gradient-blue">{item.val}</span>
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-0.5">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Persona Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          {EMPLOYEES.map((emp, idx) => {
            const isSelected = selected === emp.id;
            const access = ACCESS_CONFIG[emp.accessLevel];

            return (
              <button
                key={emp.id}
                onClick={() => setSelected(emp.id)}
                className={`persona-card text-left ${isSelected ? CARD_SELECTED[emp.cardColor] : ''}`}
                style={{
                  opacity: 0,
                  animation: `slideInUp 0.5s cubic-bezier(0.16,1,0.3,1) ${idx * 100 + 200}ms forwards`,
                }}
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-6 right-6 h-px rounded-full"
                  style={{ background: isSelected ? `linear-gradient(90deg, transparent, ${emp.accentColor}, transparent)` : 'rgba(255,255,255,0.05)' }}
                />

                {/* Selected check */}
                {isSelected && (
                  <div className="absolute top-4 right-4 animate-fade" style={{ color: emp.accentColor }}>
                    <CheckCircle size={18} />
                  </div>
                )}

                {/* Avatar row */}
                <div className="flex items-start gap-4 mb-5">
                  <div
                    className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${emp.accentColor}20, ${emp.accentColor}08)`,
                      border: `1px solid ${emp.accentColor}40`,
                      color: emp.accentColor,
                      fontSize: 15,
                      boxShadow: isSelected ? `0 0 20px ${emp.accentColor}30` : 'none',
                    }}
                  >
                    {emp.avatarInitials}
                    {/* Live dot */}
                    <div
                      className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center"
                      style={{ background: 'var(--surface-1, #0e0e1a)', borderColor: 'var(--bg,#080810)' }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: access.dotColor, boxShadow: `0 0 6px ${access.dotColor}` }}
                      />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="text-white font-semibold text-base leading-tight">{emp.displayName}</p>
                    <p className="text-[var(--text-muted)] text-xs mt-1">{emp.roleName}</p>
                    <p className="text-[var(--text-muted)] text-[11px] font-mono mt-0.5 truncate">{emp.email}</p>
                  </div>
                </div>

                {/* Access badge */}
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold mb-4 ${access.badgeCls}`}>
                  {emp.accessLevel === 'full' && <Shield size={10} />}
                  {emp.accessLevel === 'aggregate' && <Activity size={10} />}
                  {emp.accessLevel === 'none' && <Lock size={10} />}
                  {access.label}
                </div>

                {/* Description */}
                <p className="text-[var(--text-muted)] text-xs leading-relaxed mb-4 min-h-[36px]">{emp.description}</p>

                {/* Permissions */}
                <div className="space-y-2">
                  {emp.permissions.length > 0 ? (
                    emp.permissions.map(perm => (
                      <div key={perm} className="flex items-center gap-2">
                        <CheckCircle size={11} className="flex-shrink-0" style={{ color: '#42be65' }} />
                        <span className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>{perm}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={11} className="flex-shrink-0" style={{ color: '#fa4d56' }} />
                      <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>NO_PERMISSIONS_GRANTED</span>
                    </div>
                  )}
                </div>

                {/* Bottom shimmer on hover */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${emp.accentColor}30, transparent)`, opacity: isSelected ? 1 : 0, transition: 'opacity 0.3s' }}
                />
              </button>
            );
          })}
        </div>

        {/* ── Enter Button ── */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleEnter}
            disabled={!selected || entering}
            className={`
              relative px-12 py-4 rounded-2xl font-semibold text-[15px] transition-all duration-300 overflow-hidden
              ${selected && !entering
                ? 'send-btn-active text-white cursor-pointer'
                : 'bg-[rgba(255,255,255,0.04)] text-[var(--text-muted)] cursor-not-allowed border border-[rgba(255,255,255,0.06)]'
              }
            `}
          >
            {/* Shimmer sweep on active */}
            {selected && !entering && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
                  animation: 'shimmerText 2.5s ease-in-out infinite',
                  backgroundSize: '200% 100%',
                }}
              />
            )}

            <span className="relative flex items-center gap-2.5">
              {entering ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield size={17} />
                  {selected ? `Enter as ${selectedEmp?.firstName}` : 'Select a Persona'}
                </>
              )}
            </span>
          </button>

          {selected && !entering && (
            <p className="text-[var(--text-muted)] text-xs animate-fade font-mono">
              Session will authenticate as{' '}
              <span style={{ color: selectedEmp?.accentColor }} className="font-semibold">{selectedEmp?.displayName}</span>
            </p>
          )}
        </div>

        {/* ── Tech badges ── */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {['IBM LinuxONE · s390x', 'IBM Granite 13B', 'Go Backend', 'Python + FastAPI', 'PostgreSQL 16', 'MS Presidio PII'].map(t => (
            <span key={t} className="tech-badge">{t}</span>
          ))}
        </div>

        <p className="text-[var(--text-muted)] text-[11px] font-mono opacity-40 text-center">
          Prototype · Synthetic data only · Apache 2.0 · No real credentials used
        </p>
      </div>
    </div>
  );
}

function ShieldSVG() {
  return (
    <svg width="52" height="52" viewBox="0 0 72 72" fill="none" className="shield-glow">
      <defs>
        <linearGradient id="sg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#82cfff" />
          <stop offset="100%" stopColor="#0f62fe" />
        </linearGradient>
        <radialGradient id="sg2" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="rgba(130,207,255,0.3)" />
          <stop offset="100%" stopColor="rgba(15,98,254,0.05)" />
        </radialGradient>
      </defs>
      <path d="M36 6L10 17v18c0 16.6 11.1 32.1 26 36 14.9-3.9 26-19.4 26-36V17L36 6z"
        fill="url(#sg2)" stroke="url(#sg1)" strokeWidth="1.5" />
      <path d="M36 14L18 23v12c0 11 7.4 21.3 18 24 10.6-2.7 18-13 18-24V23L36 14z"
        fill="rgba(15,98,254,0.15)" />
      <path d="M26 36l6 6 14-14"
        stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

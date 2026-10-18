import { Shield, BarChart2, Zap, AlertTriangle } from 'lucide-react';
import type { Employee } from '../types';
import { getSuggestedQueries } from '../services/mockApi';

interface SuggestedQueriesProps {
  employee: Employee;
  onSelect: (q: string) => void;
  disabled: boolean;
}

const TAG_CFG = {
  normal:    { icon: Shield,        color: '#4589ff',  bg: 'rgba(15,98,254,0.07)',   border: 'rgba(15,98,254,0.2)'   },
  aggregate: { icon: BarChart2,     color: '#f1c21b',  bg: 'rgba(241,194,27,0.06)',  border: 'rgba(241,194,27,0.2)'  },
  pii:       { icon: Zap,           color: '#ff832b',  bg: 'rgba(255,131,43,0.06)',  border: 'rgba(255,131,43,0.2)'  },
  injection: { icon: AlertTriangle, color: '#fa4d56',  bg: 'rgba(250,77,86,0.06)',   border: 'rgba(250,77,86,0.2)'   },
  denied:    { icon: AlertTriangle, color: '#fa4d56',  bg: 'rgba(250,77,86,0.06)',   border: 'rgba(250,77,86,0.2)'   },
} as const;

export default function SuggestedQueries({ employee, onSelect, disabled }: SuggestedQueriesProps) {
  const queries = getSuggestedQueries(employee);

  return (
    <div className="px-4 pb-2 pt-2">
      <p className="text-[9px] font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
        Suggested Queries
      </p>
      <div className="flex flex-wrap gap-1.5">
        {queries.map((q, i) => {
          const cfg = TAG_CFG[q.tag];
          const Icon = cfg.icon;
          return (
            <button
              key={q.query}
              onClick={() => !disabled && onSelect(q.query)}
              disabled={disabled}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] border transition-all duration-200"
              style={{
                opacity: 0,
                animation: `slideInUp 0.3s ease-out ${i * 50 + 100}ms forwards`,
                color: cfg.color,
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                cursor: disabled ? 'not-allowed' : 'pointer',
                filter: disabled ? 'opacity(0.5)' : 'none',
              }}
              onMouseEnter={e => { if (!disabled) { (e.currentTarget).style.background = `${cfg.bg.replace('0.07','0.12').replace('0.06','0.1')}`; (e.currentTarget).style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { (e.currentTarget).style.background = cfg.bg; (e.currentTarget).style.transform = 'translateY(0)'; }}
            >
              <Icon size={10} />
              <span>{q.label}</span>
              <span className="text-[8px] font-mono opacity-50">{q.tagLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

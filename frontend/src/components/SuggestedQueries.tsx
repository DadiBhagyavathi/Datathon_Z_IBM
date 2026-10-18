import { Shield, BarChart2, Zap, AlertTriangle } from 'lucide-react';
import type { Employee } from '../types';
import { getSuggestedQueries } from '../services/mockApi';

const TAG_CONFIG = {
  normal:    { icon: Shield,        cls: 'chip-cyan'   },
  aggregate: { icon: BarChart2,     cls: 'chip-amber'  },
  pii:       { icon: Zap,           cls: 'chip-orange' },
  injection: { icon: AlertTriangle, cls: 'chip-red'    },
  denied:    { icon: AlertTriangle, cls: 'chip-red'    },
} as const;

export default function SuggestedQueries({ 
  employee, 
  onSelect, 
  disabled 
}: {
  employee: Employee; 
  onSelect: (q: string) => void; 
  disabled: boolean;
}) {
  const queries = getSuggestedQueries(employee);

  return (
    <div className="secure-suggested-wrap">
      {queries.map((q) => {
        const cfg = TAG_CONFIG[q.tag];
        const Icon = cfg.icon;
        return (
          <button 
            key={q.query} 
            disabled={disabled}
            onClick={() => !disabled && onSelect(q.query)}
            className={`secure-chip ${cfg.cls}`}
          >
            <Icon size={12} className="stroke-[2.5]" />
            <span>{q.label}</span>
            <span className="text-[10px] font-mono opacity-80 bg-black/30 px-1.5 py-0.2 rounded">
              {q.tagLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}

import { Shield, BarChart2, Zap, AlertTriangle } from 'lucide-react';
import type { Employee } from '../types';
import { getSuggestedQueries } from '../services/mockApi';

const TAG = {
  normal:    { icon:Shield,        cls:'chip-blue'   },
  aggregate: { icon:BarChart2,     cls:'chip-amber'  },
  pii:       { icon:Zap,           cls:'chip-orange' },
  injection: { icon:AlertTriangle, cls:'chip-red'    },
  denied:    { icon:AlertTriangle, cls:'chip-red'    },
} as const;

export default function SuggestedQueries({ employee, onSelect, disabled }: {
  employee:Employee; onSelect:(q:string)=>void; disabled:boolean;
}) {
  const queries = getSuggestedQueries(employee);
  return (
    <div className="suggested-wrap py-2">
      {queries.map((q, i) => {
        const cfg = TAG[q.tag]; const Icon = cfg.icon;
        return (
          <button key={q.query} disabled={disabled}
            onClick={() => !disabled && onSelect(q.query)}
            className={`chip ${cfg.cls}`}
            style={{ opacity:0, animation:`fadeIn 0.25s ease ${i*50+80}ms forwards` }}>
            <Icon size={10} />{q.label}
            <span style={{ opacity:0.5, fontSize:9 }}>{q.tagLabel}</span>
          </button>
        );
      })}
    </div>
  );
}

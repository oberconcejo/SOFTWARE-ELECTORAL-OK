import React from 'react';
import { 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';

export type GovProgramSubTab = 'ejes' | 'aiAssistant' | 'legalMatrix' | 'previewDoc';

interface GovProgramNavigationProps {
  activeSubTab: GovProgramSubTab;
  onSelectSubTab: (tab: GovProgramSubTab) => void;
  axesCount: number;
  proposalsCount: number;
  legalCompliancePercentage: number;
}

export function GovProgramNavigation({
  activeSubTab,
  onSelectSubTab,
  axesCount,
  proposalsCount,
  legalCompliancePercentage
}: GovProgramNavigationProps) {
  const tabs: Array<{
    id: GovProgramSubTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    {
      id: 'ejes',
      label: 'Ejes Estratégicos & Propuestas',
      icon: Layers,
      badge: `${axesCount} Ejes / ${proposalsCount} Prop.`,
      badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
    },
    {
      id: 'aiAssistant',
      label: 'Asistente IA de Redacción',
      icon: Sparkles,
      badge: 'IA Contextual',
      badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
    },
    {
      id: 'legalMatrix',
      label: 'Matriz Voto Programático & Ley CNE',
      icon: ShieldCheck,
      badge: `${legalCompliancePercentage}% Cumplimiento`,
      badgeColor: legalCompliancePercentage === 100 
        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
        : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
    },
    {
      id: 'previewDoc',
      label: 'Vista Previa & Documento Final',
      icon: FileText,
      badge: 'Exportar',
      badgeColor: 'bg-white/10 text-slate-200 border-white/10'
    }
  ];

  return (
    <div className="flex items-center gap-2 p-1.5 bg-[#141418] border border-white/5 rounded-2xl overflow-x-auto scrollbar-none">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeSubTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectSubTab(tab.id)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              isActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
            {tab.badge && (
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${
                  isActive
                    ? 'bg-black/20 text-indigo-100 border-white/20'
                    : tab.badgeColor
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

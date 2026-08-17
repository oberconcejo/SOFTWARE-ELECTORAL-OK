import React, { useState } from 'react';
import { 
  Users, 
  Mic, 
  BookOpen, 
  Plus, 
  Star, 
  Phone, 
  Mail, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Radio, 
  Tv, 
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  Spokesperson, 
  TalkingPoint, 
  PublicIntervention 
} from '@/src/types/communications';

interface SpokespersonsSectionProps {
  spokespersons: Spokesperson[];
  talkingPoints: TalkingPoint[];
  interventions: PublicIntervention[];
  onAddSpokesperson: () => void;
  onEditSpokesperson: (spk: Spokesperson) => void;
  onDeleteSpokesperson: (id: string) => void;
  onAddTalkingPoint: () => void;
  onEditTalkingPoint: (tp: TalkingPoint) => void;
  onDeleteTalkingPoint: (id: string) => void;
  onAddIntervention: () => void;
  onEditIntervention: (inv: PublicIntervention) => void;
  onDeleteIntervention: (id: string) => void;
}

export const SpokespersonsSection: React.FC<SpokespersonsSectionProps> = ({
  spokespersons,
  talkingPoints,
  interventions,
  onAddSpokesperson,
  onEditSpokesperson,
  onDeleteSpokesperson,
  onAddTalkingPoint,
  onEditTalkingPoint,
  onDeleteTalkingPoint,
  onAddIntervention,
  onEditIntervention,
  onDeleteIntervention
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'voceros' | 'argumentarios' | 'bitacora'>('voceros');
  const [expandedTp, setExpandedTp] = useState<string | null>(talkingPoints[0]?.id || null);

  const toggleExpandTp = (id: string) => {
    setExpandedTp(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Sub navigation bar */}
      <div className="bg-[#12121e] border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex rounded-xl bg-[#18182a] border border-white/10 p-1 w-full md:w-auto">
          <button
            onClick={() => setActiveSubTab('voceros')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'voceros' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Voceros Oficiales ({spokespersons.length})
          </button>

          <button
            onClick={() => setActiveSubTab('argumentarios')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'argumentarios' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Guiones & Talking Points ({talkingPoints.length})
          </button>

          <button
            onClick={() => setActiveSubTab('bitacora')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'bitacora' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
            Bitácora de Intervenciones ({interventions.length})
          </button>
        </div>

        {/* Action Button based on sub-tab */}
        {activeSubTab === 'voceros' && (
          <button
            onClick={onAddSpokesperson}
            className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            + Registrar Vocero Oficial
          </button>
        )}
        {activeSubTab === 'argumentarios' && (
          <button
            onClick={onAddTalkingPoint}
            className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            + Nuevo Guion / Talking Point
          </button>
        )}
        {activeSubTab === 'bitacora' && (
          <button
            onClick={onAddIntervention}
            className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            + Registrar Intervención
          </button>
        )}
      </div>

      {/* 1. VOCEROS OFICIALES */}
      {activeSubTab === 'voceros' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {spokespersons.map((spk) => (
            <div
              key={spk.id}
              className="bg-[#12121e] border border-white/10 hover:border-violet-500/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 transition-all group"
            >
              <div className="space-y-3">
                {/* Avatar & Status */}
                <div className="flex items-start justify-between">
                  <div className="relative">
                    <img
                      src={spk.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                      alt={spk.fullName}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-violet-500/40 shadow-md"
                    />
                    <span 
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#12121e] ${
                        spk.status === 'activo' ? 'bg-emerald-400' : spk.status === 'entrenamiento' ? 'bg-amber-400' : 'bg-rose-400'
                      }`}
                      title={spk.status}
                    />
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{spk.mediaRating || 4.8}</span>
                  </div>
                </div>

                {/* Name & Role */}
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-violet-200 transition-colors">
                    {spk.fullName}
                  </h4>
                  <p className="text-xs text-violet-400 font-semibold">{spk.role}</p>
                </div>

                {/* Authorized Topics */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Temas Habilitados:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {spk.authorizedTopics.map((top, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium bg-[#18182a] text-slate-300 px-2 py-0.5 rounded-md border border-white/5"
                      >
                        {top}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact info */}
                <div className="pt-2 border-t border-white/5 space-y-1 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{spk.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3 h-3 text-slate-500" />
                    <span>{spk.email}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-medium">
                  <strong>{spk.interventionsCount}</strong> intervenciones
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditSpokesperson(spk)}
                    className="p-1 text-slate-400 hover:text-violet-300 rounded transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteSpokesperson(spk.id)}
                    className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. GUIONES & TALKING POINTS */}
      {activeSubTab === 'argumentarios' && (
        <div className="space-y-4">
          {talkingPoints.map((tp) => {
            const isExpanded = expandedTp === tp.id;

            return (
              <div
                key={tp.id}
                className="bg-[#12121e] border border-white/10 rounded-2xl overflow-hidden shadow-xl transition-all"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleExpandTp(tp.id)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{tp.topic}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {tp.keyMessage}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-500 hidden sm:inline">
                      Actualizado: {tp.lastUpdated}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTalkingPoint(tp);
                      }}
                      className="p-1.5 text-slate-400 hover:text-amber-300 rounded-lg hover:bg-white/5"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTalkingPoint(tp.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-1 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-white/5 space-y-4">
                    {/* Key Message Glowing Box */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-[#18182a] border border-emerald-500/30 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Mensaje Clave Oficial:
                      </span>
                      <p className="text-xs font-semibold text-white leading-relaxed">
                        "{tp.keyMessage}"
                      </p>
                    </div>

                    {/* 3 Columns: Arguments, Crisis Playbook, Forbidden phrases */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                      {/* Column 1: Supporting Arguments */}
                      <div className="p-4 rounded-xl bg-[#18182a] border border-white/5 space-y-2.5">
                        <h5 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                          Argumentos de Soporte & Cifras
                        </h5>
                        <ul className="space-y-2">
                          {tp.supportingArguments.map((arg, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                              <span className="text-cyan-400 font-bold">•</span>
                              <span>{arg}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Column 2: Crisis Defense */}
                      <div className="p-4 rounded-xl bg-[#18182a] border border-amber-500/20 space-y-2.5">
                        <h5 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          Blindaje & Manejo de Crisis
                        </h5>
                        <ul className="space-y-2">
                          {tp.crisisResponses.map((res, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                              <span className="text-amber-400 font-bold">🛡️</span>
                              <span>{res}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Column 3: Forbidden Phrases */}
                      <div className="p-4 rounded-xl bg-[#18182a] border border-rose-500/20 space-y-2.5">
                        <h5 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                          Frases Prohibidas (NO Decir)
                        </h5>
                        <ul className="space-y-2">
                          {tp.forbiddenPhrases.map((ph, idx) => (
                            <li key={idx} className="text-xs text-rose-200 flex items-start gap-2 leading-relaxed">
                              <span className="text-rose-400 font-bold">✕</span>
                              <span>{ph}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 3. BITÁCORA DE INTERVENCIONES PÚBLICAS */}
      {activeSubTab === 'bitacora' && (
        <div className="space-y-4">
          <div className="bg-[#12121e] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#18182a] text-slate-400 border-b border-white/10 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Vocero</th>
                    <th className="px-4 py-3">Medio / Emisora</th>
                    <th className="px-4 py-3">Tema Debatido</th>
                    <th className="px-4 py-3">Sentimiento</th>
                    <th className="px-4 py-3">Alcance</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {interventions.map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-slate-400">{inv.date}</td>
                      <td className="px-4 py-3 font-bold text-white">{inv.spokespersonName}</td>
                      <td className="px-4 py-3 text-cyan-300 font-semibold">{inv.outletName}</td>
                      <td className="px-4 py-3 max-w-xs truncate">{inv.topic}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          inv.sentiment === 'positivo'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : inv.sentiment === 'neutro'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        }`}>
                          {inv.sentiment}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-200">
                        {inv.impactReach.toLocaleString('es-CO')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.recordingUrl && (
                            <a
                              href={inv.recordingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-slate-400 hover:text-cyan-400 rounded transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => onEditIntervention(inv)}
                            className="p-1 text-slate-400 hover:text-violet-300 rounded transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteIntervention(inv.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

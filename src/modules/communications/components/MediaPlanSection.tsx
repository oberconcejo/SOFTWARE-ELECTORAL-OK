import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Radio, 
  Tv, 
  Globe, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  MessageSquare,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { 
  MediaPiece, 
  MediaType, 
  MediaPieceStatus, 
  SentimentType 
} from '@/src/types/communications';

interface MediaPlanSectionProps {
  mediaPieces: MediaPiece[];
  onAddPiece: () => void;
  onEditPiece: (piece: MediaPiece) => void;
  onDeletePiece: (id: string) => void;
  onChangeStatus: (id: string, status: MediaPieceStatus) => void;
  onOpenAICopy: () => void;
}

const MEDIA_TYPE_FILTERS: { id: string; label: string; icon: any }[] = [
  { id: 'todos', label: 'Todos los Medios', icon: Layers },
  { id: 'prensa', label: 'Prensa Escrita', icon: FileText },
  { id: 'radio', label: 'Radio', icon: Radio },
  { id: 'tv', label: 'Televisión', icon: Tv },
  { id: 'digital', label: 'Digital / Web', icon: Globe },
  { id: 'podcast', label: 'Podcast & Streaming', icon: Radio }
];

const STATUS_CONFIG: Record<MediaPieceStatus, { label: string; badge: string; dot: string }> = {
  borrador: { label: 'Borrador', badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30', dot: 'bg-slate-400' },
  revision: { label: 'En Revisión', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
  enviado: { label: 'Enviado a Medios', badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', dot: 'bg-cyan-400' },
  publicado: { label: 'Publicado / Al Aire', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
  archivado: { label: 'Archivado', badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30', dot: 'bg-rose-400' }
};

export const MediaPlanSection: React.FC<MediaPlanSectionProps> = ({
  mediaPieces,
  onAddPiece,
  onEditPiece,
  onDeletePiece,
  onChangeStatus,
  onOpenAICopy
}) => {
  const [selectedType, setSelectedType] = useState('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filtered pieces
  const filteredPieces = useMemo(() => {
    return mediaPieces.filter(piece => {
      const matchType = selectedType === 'todos' || piece.mediaType === selectedType;
      const matchStatus = selectedStatus === 'todos' || piece.status === selectedStatus;
      const matchSearch = searchQuery === '' || 
        piece.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        piece.targetOutlet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        piece.responsible.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (piece.keyMessage && piece.keyMessage.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchType && matchStatus && matchSearch;
    });
  }, [mediaPieces, selectedType, selectedStatus, searchQuery]);

  const totalEstimatedReach = useMemo(() => {
    return filteredPieces.reduce((acc, p) => acc + (p.estimatedReach || 0), 0);
  }, [filteredPieces]);

  const publishedCount = useMemo(() => {
    return filteredPieces.filter(p => p.status === 'publicado').length;
  }, [filteredPieces]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="bg-[#12121e] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-400" />
            Plan Estratégico de Medios & Relacionamiento con Prensa
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Administra comunicados, ruedas de prensa, entrevistas exclusivas y columnas de opinión
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#18182a] border border-white/5 text-xs text-slate-300">
            <span>Piezas: <strong className="text-white">{filteredPieces.length}</strong></span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span>Al Aire: <strong className="text-emerald-400">{publishedCount}</strong></span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span>Alcance: <strong className="text-violet-300">{(totalEstimatedReach / 1000).toLocaleString('es-CO')}k</strong></span>
          </div>

          <button
            onClick={onAddPiece}
            className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Nueva Pieza de Medios
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#12121e] border border-white/10 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por titular, medio (El Tiempo, Caracol...), vocero o mensaje..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#18182a] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          {/* Status filter dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#18182a] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
            >
              <option value="todos">Todos los Estados</option>
              <option value="borrador">Borradores</option>
              <option value="revision">En Revisión</option>
              <option value="enviado">Enviados</option>
              <option value="publicado">Publicados / Al Aire</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex rounded-xl bg-[#18182a] border border-white/10 p-0.5">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'cards' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tarjetas
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'table' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tabla
              </button>
            </div>
          </div>
        </div>

        {/* Media Type Chips */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
          {MEDIA_TYPE_FILTERS.map((f) => {
            const Icon = f.icon;
            const isSelected = selectedType === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedType(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all border ${
                  isSelected
                    ? 'bg-violet-600/30 border-violet-400 text-white shadow-sm'
                    : 'bg-[#18182a]/60 border-white/5 text-slate-400 hover:text-white hover:border-white/15'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Media Pieces Content */}
      {filteredPieces.length === 0 ? (
        /* Empty State */
        <div className="bg-[#12121e] border border-white/10 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h4 className="text-base font-bold text-white">No se encontraron piezas de comunicación</h4>
            <p className="text-xs text-slate-400">
              {searchQuery || selectedType !== 'todos' || selectedStatus !== 'todos'
                ? 'Intenta ajustar los filtros o el término de búsqueda.'
                : 'Aún no has registrado piezas en el plan de medios. Crea comunicados, notas de prensa o agenda entrevistas.'}
            </p>
          </div>
          <button
            onClick={onAddPiece}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/30 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            + Crear Primer Plan de Medios
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPieces.map((piece) => {
            const statusInfo = STATUS_CONFIG[piece.status] || STATUS_CONFIG.borrador;
            const MediaIcon = piece.mediaType === 'radio' ? Radio : piece.mediaType === 'tv' ? Tv : piece.mediaType === 'digital' ? Globe : FileText;

            return (
              <div
                key={piece.id}
                className="bg-[#12121e] border border-white/10 hover:border-violet-500/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 transition-all group relative overflow-hidden"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-300 text-[10px] font-bold border border-violet-500/30 capitalize flex items-center gap-1">
                        <MediaIcon className="w-3 h-3" />
                        {piece.mediaType}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-400 text-[10px] font-medium capitalize">
                        {piece.pieceType.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Status Dropdown / Pill */}
                    <div className="relative group/status">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1.5 ${statusInfo.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Title & Target Outlet */}
                  <div>
                    <span className="text-[11px] font-bold text-cyan-400 block mb-0.5">
                      {piece.targetOutlet}
                    </span>
                    <h4 className="text-sm font-bold text-white group-hover:text-violet-200 transition-colors leading-snug">
                      {piece.title}
                    </h4>
                  </div>

                  {/* Key Message */}
                  {piece.keyMessage && (
                    <div className="p-2.5 rounded-xl bg-[#18182a] border border-white/5 text-xs text-slate-300 leading-relaxed">
                      <span className="text-[10px] font-bold text-violet-400 block uppercase mb-0.5">
                        Mensaje Clave:
                      </span>
                      "{piece.keyMessage}"
                    </div>
                  )}

                  {/* Responsible & Reach */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span className="truncate max-w-[140px]" title={piece.responsible}>
                      👤 {piece.responsible}
                    </span>
                    <span className="font-semibold text-slate-300">
                      🎯 {(piece.estimatedReach || 0).toLocaleString('es-CO')} imp.
                    </span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Calendar className="w-3 h-3" />
                    <span>{piece.date}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {piece.url && (
                      <a
                        href={piece.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-cyan-400 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                        title="Abrir enlace de la publicación"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => onEditPiece(piece)}
                      className="p-1.5 text-slate-400 hover:text-violet-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      title="Editar pieza"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePiece(piece.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      title="Eliminar pieza"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-[#12121e] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#18182a] text-slate-400 border-b border-white/10 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="px-4 py-3">Titular & Asunto</th>
                  <th className="px-4 py-3">Medio Objetivo</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Responsable</th>
                  <th className="px-4 py-3">Alcance</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPieces.map((piece) => {
                  const statusInfo = STATUS_CONFIG[piece.status] || STATUS_CONFIG.borrador;
                  return (
                    <tr key={piece.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-white max-w-xs">
                        <div className="truncate">{piece.title}</div>
                      </td>
                      <td className="px-4 py-3 text-cyan-300 font-semibold">{piece.targetOutlet}</td>
                      <td className="px-4 py-3 capitalize">{piece.mediaType}</td>
                      <td className="px-4 py-3 text-slate-400">{piece.date}</td>
                      <td className="px-4 py-3 text-slate-400 truncate max-w-[120px]">{piece.responsible}</td>
                      <td className="px-4 py-3 font-semibold text-slate-200">
                        {(piece.estimatedReach || 0).toLocaleString('es-CO')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusInfo.badge}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {piece.url && (
                            <a
                              href={piece.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-slate-400 hover:text-cyan-400 rounded transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => onEditPiece(piece)}
                            className="p-1 text-slate-400 hover:text-violet-300 rounded transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeletePiece(piece.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Check, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Shield,
  TrendingUp,
  AlertTriangle,
  Flame,
  HelpCircle
} from 'lucide-react';
import { useCandidateProfile, SWOTCategoryKey } from '@/src/hooks/useCandidateProfile';

interface EditingState {
  category: SWOTCategoryKey | null;
  oldValue: string;
  currentValue: string;
}

export function SWOTSection() {
  const {
    swot,
    loading,
    canEdit,
    message,
    setMessage,
    toggleVariable,
    addVariable,
    removeVariable,
    updateVariable
  } = useCandidateProfile();

  const [newVarInputs, setNewVarInputs] = useState<Record<SWOTCategoryKey, string>>({
    fortalezas: '',
    oportunidades: '',
    debilidades: '',
    amenazas: ''
  });

  // State for inline editing
  const [inlineEditing, setInlineEditing] = useState<EditingState>({
    category: null,
    oldValue: '',
    currentValue: ''
  });

  // State for delete confirmation modal or modal editing if preferred
  const [editingModal, setEditingModal] = useState<EditingState | null>(null);

  const handleAddVar = (catKey: SWOTCategoryKey) => {
    const text = newVarInputs[catKey];
    if (!text.trim()) return;
    const success = addVariable(catKey, text.trim());
    if (success) {
      setNewVarInputs(prev => ({ ...prev, [catKey]: '' }));
    }
  };

  const handleStartInlineEdit = (category: SWOTCategoryKey, val: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setInlineEditing({
      category,
      oldValue: val,
      currentValue: val
    });
  };

  const handleSaveInlineEdit = () => {
    if (!inlineEditing.category || !inlineEditing.currentValue.trim()) return;
    updateVariable(inlineEditing.category, inlineEditing.oldValue, inlineEditing.currentValue.trim());
    setInlineEditing({ category: null, oldValue: '', currentValue: '' });
  };

  const handleCancelInlineEdit = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setInlineEditing({ category: null, oldValue: '', currentValue: '' });
  };

  const handleOpenEditModal = (category: SWOTCategoryKey, val: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingModal({
      category,
      oldValue: val,
      currentValue: val
    });
  };

  const handleSaveModalEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModal || !editingModal.category || !editingModal.currentValue.trim()) return;
    updateVariable(editingModal.category, editingModal.oldValue, editingModal.currentValue.trim());
    setEditingModal(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Cargando matriz estratégica DOFA...</p>
      </div>
    );
  }

  // Categories configuration with strict design tokens
  const categoriesConfig: {
    key: SWOTCategoryKey;
    title: string;
    badge: string;
    badgeIcon: React.ReactNode;
    cardBg: string;
    borderColor: string;
    accentColor: string;
    badgeClass: string;
    descBoxClass: string;
    inputBg: string;
    btnClass: string;
    selectedRowClass: string;
    unselectedRowClass: string;
    hoverBorder: string;
    checkIconClass: string;
    placeholder: string;
  }[] = [
    {
      key: 'fortalezas',
      title: 'Fortalezas (Internas):',
      badge: 'Ventajas',
      badgeIcon: <Shield className="w-3 h-3" />,
      cardBg: 'bg-[#09181d]/90',
      borderColor: 'border-emerald-500/30',
      accentColor: 'text-emerald-400',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      descBoxClass: 'bg-[#061e1b]/80 border-emerald-500/30 text-emerald-100/90',
      inputBg: 'bg-[#061214] border-emerald-500/30 focus:border-emerald-400 text-white',
      btnClass: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20',
      selectedRowClass: 'bg-emerald-950/70 border-emerald-400/80 text-emerald-200 font-semibold shadow-sm',
      unselectedRowClass: 'bg-[#071d22]/50 border-emerald-500/20 text-slate-300 hover:bg-[#071d22] hover:border-emerald-400/40',
      hoverBorder: 'hover:border-emerald-400/50',
      checkIconClass: 'bg-emerald-500/20 text-emerald-400',
      placeholder: '+ Agregar nueva variable de fortaleza...'
    },
    {
      key: 'oportunidades',
      title: 'Oportunidades (Externas):',
      badge: 'Entorno',
      badgeIcon: <TrendingUp className="w-3 h-3" />,
      cardBg: 'bg-[#081827]/90',
      borderColor: 'border-cyan-500/30',
      accentColor: 'text-cyan-400',
      badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      descBoxClass: 'bg-[#082236]/80 border-cyan-500/30 text-cyan-100/90',
      inputBg: 'bg-[#05111c] border-cyan-500/30 focus:border-cyan-400 text-white',
      btnClass: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-cyan-500/20',
      selectedRowClass: 'bg-cyan-950/70 border-cyan-400/80 text-cyan-200 font-semibold shadow-sm',
      unselectedRowClass: 'bg-[#091e30]/50 border-cyan-500/20 text-slate-300 hover:bg-[#091e30] hover:border-cyan-400/40',
      hoverBorder: 'hover:border-cyan-400/50',
      checkIconClass: 'bg-cyan-500/20 text-cyan-400',
      placeholder: '+ Agregar nueva variable de oportunidad...'
    },
    {
      key: 'debilidades',
      title: 'Debilidades (Internas):',
      badge: 'A reforzar',
      badgeIcon: <AlertTriangle className="w-3 h-3" />,
      cardBg: 'bg-[#18140b]/90',
      borderColor: 'border-amber-500/30',
      accentColor: 'text-amber-400',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      descBoxClass: 'bg-[#241a0b]/80 border-amber-500/30 text-amber-100/90',
      inputBg: 'bg-[#100d07] border-amber-500/30 focus:border-amber-400 text-white',
      btnClass: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20',
      selectedRowClass: 'bg-amber-950/70 border-amber-400/80 text-amber-200 font-semibold shadow-sm',
      unselectedRowClass: 'bg-[#1f190e]/50 border-amber-500/20 text-slate-300 hover:bg-[#1f190e] hover:border-amber-400/40',
      hoverBorder: 'hover:border-amber-400/50',
      checkIconClass: 'bg-amber-500/20 text-amber-400',
      placeholder: '+ Agregar nueva variable de debilidad...'
    },
    {
      key: 'amenazas',
      title: 'Amenazas (Externas):',
      badge: 'Riesgos',
      badgeIcon: <Flame className="w-3 h-3" />,
      cardBg: 'bg-[#1c0c13]/90',
      borderColor: 'border-rose-500/30',
      accentColor: 'text-rose-400',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      descBoxClass: 'bg-[#290e1b]/80 border-rose-500/30 text-rose-100/90',
      inputBg: 'bg-[#12060c] border-rose-500/30 focus:border-rose-400 text-white',
      btnClass: 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-rose-500/20',
      selectedRowClass: 'bg-rose-950/70 border-rose-400/80 text-rose-200 font-semibold shadow-sm',
      unselectedRowClass: 'bg-[#220e18]/50 border-rose-500/20 text-slate-300 hover:bg-[#220e18] hover:border-rose-400/40',
      hoverBorder: 'hover:border-rose-400/50',
      checkIconClass: 'bg-rose-500/20 text-rose-400',
      placeholder: '+ Agregar nueva variable de amenaza...'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Toast message */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3.5 rounded-xl flex items-center justify-between text-xs font-semibold border ${
              message.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300 shadow-lg shadow-emerald-950/40'
                : 'bg-rose-950/80 border-rose-500/30 text-rose-300 shadow-lg shadow-rose-950/40'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
              <span>{message.text}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setMessage(null)} 
              className="text-slate-400 hover:text-white p-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categoriesConfig.map((cat) => {
          const categoryData = swot[cat.key];
          const variables = categoryData.availableVariables;
          const selected = categoryData.selectedVariables;

          return (
            <div 
              key={cat.key}
              className={`${cat.cardBg} border ${cat.borderColor} rounded-2xl p-5 shadow-2xl flex flex-col justify-between space-y-4 backdrop-blur-sm transition-all duration-200`}
            >
              <div className="space-y-3">
                {/* Quadrant Header */}
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-bold ${cat.accentColor} flex items-center gap-2`}>
                    {cat.title}
                  </h4>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${cat.badgeClass}`}>
                    {cat.badgeIcon}
                    {cat.badge}
                  </span>
                </div>

                {/* Description Box */}
                <div className={`border rounded-xl p-3 text-xs leading-relaxed font-medium ${cat.descBoxClass}`}>
                  {categoryData.description}
                </div>

                {/* Subtitle */}
                <div className="flex items-center justify-between pt-1">
                  <p className={`text-[10px] font-bold ${cat.accentColor} tracking-wider uppercase`}>
                    VARIABLES EVALUABLES (HAZ CLIC PARA SELECCIONAR O QUITAR):
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {selected.length}/{variables.length} activas
                  </span>
                </div>

                {/* Variables List */}
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1.5 scrollbar-thin scrollbar-thumb-white/10">
                  {variables.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-xs text-slate-500">
                      No hay variables registradas en esta categoría.
                    </div>
                  ) : (
                    variables.map((variable, idx) => {
                      const isSelected = selected.includes(variable);
                      const isCurrentlyEditing = inlineEditing.category === cat.key && inlineEditing.oldValue === variable;

                      if (isCurrentlyEditing) {
                        return (
                          <div 
                            key={idx}
                            className="p-2 rounded-xl bg-slate-900 border-2 border-teal-400 flex items-center gap-2 shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              autoFocus
                              value={inlineEditing.currentValue}
                              onChange={(e) => setInlineEditing(prev => ({ ...prev, currentValue: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveInlineEdit();
                                } else if (e.key === 'Escape') {
                                  handleCancelInlineEdit();
                                }
                              }}
                              className="flex-1 bg-transparent text-xs text-white outline-none px-2 py-1"
                              placeholder="Escribe el nuevo texto..."
                            />
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={handleSaveInlineEdit}
                                title="Guardar cambios (Enter)"
                                className="p-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5 font-bold" />
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelInlineEdit}
                                title="Cancelar (Esc)"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={idx}
                          onClick={() => toggleVariable(cat.key, variable)}
                          className={`group relative p-2.5 rounded-xl text-xs transition-all flex items-center justify-between border cursor-pointer select-none ${
                            isSelected
                              ? cat.selectedRowClass
                              : cat.unselectedRowClass
                          }`}
                        >
                          {/* Left: Check / Plus & Text */}
                          <div className="flex items-center gap-2.5 min-w-0 pr-3 flex-1">
                            {isSelected ? (
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${cat.checkIconClass}`}>
                                <Check className="w-3 h-3" />
                              </div>
                            ) : (
                              <span className={`${cat.accentColor} font-bold text-sm leading-none shrink-0 w-4 text-center`}>
                                +
                              </span>
                            )}
                            <span 
                              className="leading-snug break-words"
                              title="Haz clic para seleccionar/deseleccionar o usa el lápiz para editar"
                            >
                              {variable}
                            </span>
                          </div>

                          {/* Right: CRUD Actions (Edit & Delete) */}
                          {canEdit && (
                            <div 
                              className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Edit Button (Pencil) */}
                              <button
                                type="button"
                                onClick={(e) => handleStartInlineEdit(cat.key, variable, e)}
                                title="Editar variable"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Button (Trash) */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeVariable(cat.key, variable);
                                }}
                                title="Eliminar variable"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Bottom: Add new variable input & button */}
              {canEdit && (
                <div className={`flex gap-2 pt-3 border-t ${cat.borderColor}`}>
                  <input
                    type="text"
                    placeholder={cat.placeholder}
                    value={newVarInputs[cat.key]}
                    onChange={(e) => setNewVarInputs(prev => ({ ...prev, [cat.key]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddVar(cat.key))}
                    className={`flex-1 rounded-xl px-3 py-2 text-xs placeholder-slate-500 outline-none border transition-colors ${cat.inputBg}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddVar(cat.key)}
                    className={`px-4 py-2 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0 ${cat.btnClass}`}
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal for detailed editing if needed */}
      <AnimatePresence>
        {editingModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Editar Variable DOFA</h3>
                    <p className="text-[11px] text-slate-400 capitalize">Categoría: {editingModal.category}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingModal(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveModalEdit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Descripción de la variable *
                  </label>
                  <textarea
                    rows={3}
                    required
                    autoFocus
                    value={editingModal.currentValue}
                    onChange={(e) => setEditingModal(prev => prev ? ({ ...prev, currentValue: e.target.value }) : null)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-teal-400 focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setEditingModal(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold shadow-lg shadow-teal-500/20 transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Guardar Cambios
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

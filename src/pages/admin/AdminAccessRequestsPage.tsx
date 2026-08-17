import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserCheck, 
  UserX, 
  Clock, 
  ShieldAlert, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Mail, 
  Phone, 
  AtSign, 
  Calendar, 
  FileText, 
  Loader2,
  Check,
  X,
  Shield,
  UserPlus
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';
import { AdminAccessRequest } from '@/src/types';

export default function AdminAccessRequestsPage() {
  const { sessionToken, user } = useAuth();
  const [requests, setRequests] = useState<AdminAccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'>('ALL');

  // Selected request for detail modal
  const [selectedRequest, setSelectedRequest] = useState<AdminAccessRequest | null>(null);

  // Approval modal state
  const [approvingRequest, setApprovingRequest] = useState<AdminAccessRequest | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  // Rejection modal state
  const [rejectingRequest, setRejectingRequest] = useState<AdminAccessRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Notification feedback
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const getAuthToken = async (): Promise<string> => {
    if (sessionToken) return sessionToken;
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) return session.access_token;
    }
    return '';
  };

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      if (!token) {
        // In case session is still loading
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/admin/access-requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al obtener solicitudes');
      }

      const data = await response.json();
      // Map API response fields to client interface
      const mapped = data.map((item: any) => ({
        id: item.id,
        fullName: item.full_name,
        email: item.email,
        phone: item.phone,
        requestedUsername: item.requested_username,
        reason: item.reason,
        status: item.status,
        rejectionReason: item.rejection_reason,
        reviewedBy: item.reviewed_by,
        reviewedAt: item.reviewed_at,
        ipAddress: item.ip_address,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
      setRequests(mapped);
    } catch (err: any) {
      console.error('Fetch requests error:', err);
      setError(err.message || 'No fue posible cargar las solicitudes de acceso.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [sessionToken]);

  // Show temporary feedback toast
  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  // Handle Approve Request
  const handleApprove = async () => {
    if (!approvingRequest) return;
    setIsApproving(true);

    try {
      const token = await getAuthToken();
      const response = await fetch(`/api/admin/access-requests/${approvingRequest.id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al autorizar la solicitud.');
      }

      showFeedback('success', data.message || 'Solicitud aprobada con éxito. Se ha habilitado la cuenta de administrador.');
      setApprovingRequest(null);
      if (selectedRequest?.id === approvingRequest.id) {
        setSelectedRequest(null);
      }
      fetchRequests();
    } catch (err: any) {
      showFeedback('error', err.message || 'Ocurrió un error al aprobar la solicitud.');
    } finally {
      setIsApproving(false);
    }
  };

  // Handle Reject Request
  const handleReject = async () => {
    if (!rejectingRequest) return;
    setIsRejecting(true);

    try {
      const token = await getAuthToken();
      const response = await fetch(`/api/admin/access-requests/${rejectingRequest.id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason: rejectionReason.trim() })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al rechazar la solicitud.');
      }

      showFeedback('success', data.message || 'Solicitud rechazada correctamente.');
      setRejectingRequest(null);
      setRejectionReason('');
      if (selectedRequest?.id === rejectingRequest.id) {
        setSelectedRequest(null);
      }
      fetchRequests();
    } catch (err: any) {
      showFeedback('error', err.message || 'Ocurrió un error al rechazar la solicitud.');
    } finally {
      setIsRejecting(false);
    }
  };

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    const matchesSearch = 
      req.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requestedUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.phone && req.phone.includes(searchTerm));
    return matchesStatus && matchesSearch;
  });

  const pendingCount = requests.filter(r => r.status === 'PENDIENTE').length;
  const approvedCount = requests.filter(r => r.status === 'APROBADA').length;
  const rejectedCount = requests.filter(r => r.status === 'RECHAZADA').length;

  return (
    <div className="space-y-6">
      {/* Feedback Toast */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-2xl flex items-center justify-between shadow-xl ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/20 border border-red-500/30 text-red-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <span className="text-sm font-semibold">{feedbackMessage.text}</span>
            </div>
            <button onClick={() => setFeedbackMessage(null)} className="p-1 hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Solicitudes de Administradores</h1>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold animate-pulse">
                {pendingCount} Pendiente{pendingCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Revisión, autorización y control de seguridad para solicitudes de registro de nuevos administradores.
          </p>
        </div>

        <Button
          onClick={fetchRequests}
          disabled={isLoading}
          className="h-10 px-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl border border-white/10 text-xs font-semibold flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar Lista
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#111114] border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Solicitudes</span>
            <div className="p-2.5 rounded-2xl bg-white/5 text-slate-300">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-white">{requests.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Registros totales recibidos</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#111114] border border-amber-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pendientes</span>
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-amber-400">{pendingCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Requieren revisión y decisión</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#111114] border border-emerald-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Aprobadas</span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-400">{approvedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Cuentas creadas y activas</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#111114] border border-red-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Rechazadas</span>
            <div className="p-2.5 rounded-2xl bg-red-500/10 text-red-400">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-red-400">{rejectedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Acceso no autorizado</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-[#111114] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Buscar por nombre, correo, usuario o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 bg-white/5 border-white/10 text-xs text-white w-full rounded-2xl"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/5 w-full md:w-auto overflow-x-auto">
          {(['ALL', 'PENDIENTE', 'APROBADA', 'RECHAZADA'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === status
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {status === 'ALL' && 'Todas'}
              {status === 'PENDIENTE' && `Pendientes (${pendingCount})`}
              {status === 'APROBADA' && `Aprobadas (${approvedCount})`}
              {status === 'RECHAZADA' && `Rechazadas (${rejectedCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="rounded-3xl bg-[#111114] border border-white/5 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Cargando solicitudes de administradores...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <UserCheck className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No se encontraron solicitudes</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'ALL'
                ? 'No hay solicitudes que coincidan con los filtros de búsqueda aplicados.'
                : 'Aún no se han recibido solicitudes de acceso de administradores.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white/[0.02]">
                  <th className="py-4 px-6">Solicitante</th>
                  <th className="py-4 px-6">Usuario Solicitado</th>
                  <th className="py-4 px-6">Teléfono</th>
                  <th className="py-4 px-6">Fecha Solicitud</th>
                  <th className="py-4 px-6">Estado</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-white text-sm">{req.fullName}</div>
                      <div className="text-slate-400 text-xs flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        {req.email}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-xl border border-indigo-500/20">
                        <AtSign className="w-3 h-3" />
                        {req.requestedUsername}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {req.phone || '—'}
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      <div>{new Date(req.createdAt).toLocaleDateString('es-CO')}</div>
                      <div className="text-[10px] text-slate-500">{new Date(req.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="py-4 px-6">
                      {req.status === 'PENDIENTE' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-[11px]">
                          <Clock className="w-3 h-3" />
                          Pendiente
                        </span>
                      )}
                      {req.status === 'APROBADA' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                          <CheckCircle2 className="w-3 h-3" />
                          Aprobada
                        </span>
                      )}
                      {req.status === 'RECHAZADA' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-[11px]">
                          <XCircle className="w-3 h-3" />
                          Rechazada
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Ver Solicitud */}
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1"
                          title="Ver detalles de la solicitud"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Ver</span>
                        </button>

                        {/* Botones de acción directa si está PENDIENTE */}
                        {req.status === 'PENDIENTE' && (
                          <>
                            <button
                              onClick={() => setApprovingRequest(req)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-300 hover:text-white font-bold transition-all text-xs flex items-center gap-1.5 shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Aprobar</span>
                            </button>
                            <button
                              onClick={() => {
                                setRejectingRequest(req);
                                setRejectionReason('');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/30 text-red-300 hover:text-white font-bold transition-all text-xs flex items-center gap-1.5 shadow-sm"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Rechazar</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* MODAL: VER DETALLE DE LA SOLICITUD */}
      {/* ========================================== */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-[#111114] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl my-8 text-left space-y-6"
            >
              <button
                onClick={() => setSelectedRequest(null)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedRequest.fullName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-indigo-400 font-mono">@{selectedRequest.requestedUsername}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-400">{selectedRequest.email}</span>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                selectedRequest.status === 'PENDIENTE'
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                  : selectedRequest.status === 'APROBADA'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/20 text-red-300'
              }`}>
                <div className="flex items-center gap-2 font-bold text-xs">
                  {selectedRequest.status === 'PENDIENTE' && <Clock className="w-4 h-4" />}
                  {selectedRequest.status === 'APROBADA' && <CheckCircle2 className="w-4 h-4" />}
                  {selectedRequest.status === 'RECHAZADA' && <XCircle className="w-4 h-4" />}
                  <span>ESTADO: {selectedRequest.status}</span>
                </div>
                <div className="text-xs text-slate-400">
                  ID: {selectedRequest.id.slice(0, 8)}...
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Teléfono de Contacto</span>
                  <div className="text-sm font-semibold text-white">{selectedRequest.phone || 'No registrado'}</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fecha de Envío</span>
                  <div className="text-sm font-semibold text-white">
                    {new Date(selectedRequest.createdAt).toLocaleString('es-CO')}
                  </div>
                </div>
              </div>

              {/* Reason Box */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Motivo Expresado por el Solicitante</span>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedRequest.reason}
                </p>
              </div>

              {/* If Rejected, show reason */}
              {selectedRequest.status === 'RECHAZADA' && selectedRequest.rejectionReason && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Motivo del Rechazo</span>
                  <p className="text-xs">{selectedRequest.rejectionReason}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cerrar
                </button>

                {selectedRequest.status === 'PENDIENTE' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingRequest(selectedRequest);
                        setRejectionReason('');
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-red-600/20 hover:bg-red-600 border border-red-500/30 text-red-300 hover:text-white font-bold transition-all text-xs"
                    >
                      Rechazar Solicitud
                    </button>
                    <Button
                      type="button"
                      onClick={() => setApprovingRequest(selectedRequest)}
                      className="h-10 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 text-xs"
                    >
                      Aprobar Solicitud
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* MODAL: CONFIRMAR APROBACIÓN */}
      {/* ========================================== */}
      <AnimatePresence>
        {approvingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#111114] border border-emerald-500/20 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5 text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">¿Aprobar solicitud de administrador?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ¿Está seguro de que desea aprobar la solicitud de <strong className="text-white">{approvingRequest.fullName}</strong> ({approvingRequest.email})?
                </p>
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 mt-3">
                  ✓ Se creará o activará su cuenta en el panel administrativo.<br />
                  ✓ Se enviará un correo de confirmación de acceso al solicitante.
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isApproving}
                  onClick={() => setApprovingRequest(null)}
                  className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <Button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="h-10 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 text-xs"
                >
                  {isApproving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Aprobando...
                    </span>
                  ) : (
                    'Confirmar y Autorizar'
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* MODAL: CONFIRMAR RECHAZO */}
      {/* ========================================== */}
      <AnimatePresence>
        {rejectingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#111114] border border-red-500/20 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5 text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <XCircle className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Rechazar solicitud de acceso</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Indique el motivo por el cual no se autoriza el acceso a <strong className="text-white">{rejectingRequest.fullName}</strong>.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Motivo del Rechazo
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ej: No cumple con los requerimientos de autorización para este periodo..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isRejecting}
                  onClick={() => setRejectingRequest(null)}
                  className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <Button
                  onClick={handleReject}
                  disabled={isRejecting}
                  className="h-10 px-6 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-600/20 text-xs"
                >
                  {isRejecting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Rechazando...
                    </span>
                  ) : (
                    'Confirmar Rechazo'
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

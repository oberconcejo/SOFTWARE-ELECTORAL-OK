import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Users, 
  DollarSign, 
  CreditCard,
  Building2, 
  BookmarkCheck, 
  CheckSquare, 
  PieChart, 
  ArrowUpRight, 
  RefreshCw,
  Sparkles,
  Shield,
  Award,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdministrativeData } from '@/src/hooks/useAdministrativeData';
import { useAuth } from '@/src/contexts/AuthContext';
import { usePermissions } from '@/src/hooks/usePermissions';
import { UserRole } from '@/src/types';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const { stats, loading, refresh } = useAdministrativeData();

  // 4 Top Indicator Cards
  const topIndicatorCards = [
    {
      id: 'rbac-users',
      label: 'Usuarios con Roles (RBAC):',
      value: stats.activeUsers > 0 ? stats.activeUsers.toLocaleString() : '0',
      badgeText: '100% Aislamiento Activo',
      badgeIcon: ShieldCheck,
      icon: Shield,
      iconBg: 'bg-teal-950/80 border-teal-500/30 text-teal-400',
      path: '/gestion-administrativa/roles'
    },
    {
      id: 'crm-voters',
      label: 'CRM Líderes & Votantes:',
      value: (stats.votersCount + stats.leadersCount > 0 ? (stats.votersCount + stats.leadersCount) : (stats.votersCount || 0)).toLocaleString(),
      badgeText: 'Sin Duplicados en Censo',
      badgeIcon: Users,
      icon: Users,
      iconBg: 'bg-cyan-950/80 border-cyan-500/30 text-cyan-400',
      path: '/gestion-administrativa/lideres-votantes'
    },
    {
      id: 'budget-cne',
      label: 'Presupuesto Ejecutado CNE:',
      value: stats.budgetTotal > 0 
        ? `${((stats.budgetExecuted / stats.budgetTotal) * 100).toFixed(1)}%` 
        : `$${stats.budgetExecuted.toLocaleString('es-CO')}`,
      badgeText: 'Topes Legales OK',
      badgeIcon: DollarSign,
      icon: DollarSign,
      iconBg: 'bg-amber-950/80 border-amber-500/30 text-amber-400',
      path: '/gestion-administrativa/presupuesto-cne'
    },
    {
      id: 'day-e-logistics',
      label: 'Testigos & Jurados Día E:',
      value: `${stats.witnessesCount} / ${stats.jurorsCount}`,
      badgeText: 'Formulario E-16 Listo',
      badgeIcon: FileCheck,
      icon: Award,
      iconBg: 'bg-teal-950/80 border-teal-500/30 text-teal-400',
      path: '/gestion-administrativa/testigos'
    },
    {
      id: 'api-usage',
      label: 'Consumo de Consultas:',
      value: stats.apiUsage ? `${stats.apiUsage.totalConsumed} / ${stats.apiUsage.totalAssigned}` : '0 / 0',
      badgeText: stats.apiUsage ? `${stats.apiUsage.percentage}% Consumido` : '0% Consumido',
      badgeIcon: RefreshCw,
      icon: CreditCard,
      iconBg: stats.apiUsage && stats.apiUsage.percentage > 90 ? 'bg-rose-950/80 border-rose-500/30 text-rose-400' : 'bg-indigo-950/80 border-indigo-500/30 text-indigo-400',
      path: '/gestion-administrativa/configuracion'
    }
  ];

  // Quick Access Functionality Cards
  const quickAccessCards = [
    {
      number: '2',
      title: '2. Gestión de Roles y Permisos',
      category: 'RBAC Security',
      categoryColor: 'bg-teal-950/90 text-teal-300 border-teal-500/30',
      icon: ShieldCheck,
      iconColor: 'bg-teal-950/90 border-teal-500/40 text-teal-400',
      description: 'Control de SuperUsuarios, Administradores, Auditores y aislamiento territorial por zona.',
      path: '/gestion-administrativa/roles',
      functionCode: 'ROLES_MANAGEMENT'
    },
    {
      number: '3',
      title: '3. CRM Líderes / Votantes',
      category: 'CRM Censo',
      categoryColor: 'bg-cyan-950/90 text-cyan-300 border-cyan-500/30',
      icon: Users,
      iconColor: 'bg-cyan-950/90 border-cyan-500/40 text-cyan-400',
      description: 'Validación por cédula, control estricto de duplicidad y mapeo por puesto/mesa.',
      path: '/gestion-administrativa/lideres-votantes',
      functionCode: 'LEADERS_VOTERS'
    },
    {
      number: '4',
      title: '4. Presupuesto / CNE',
      category: 'CNE / Cuentas Claras',
      categoryColor: 'bg-amber-950/90 text-amber-300 border-amber-500/30',
      icon: CreditCard,
      iconColor: 'bg-amber-950/90 border-amber-500/40 text-amber-400',
      description: 'Auditoría de topes legales CNE, cuentas bancarias, ingresos y escáner OCR de facturas.',
      path: '/gestion-administrativa/presupuesto-cne',
      functionCode: 'BUDGET_CNE'
    },
    {
      number: '5',
      title: '5. Gestión de Campaña',
      category: 'Parámetros',
      categoryColor: 'bg-teal-950/90 text-teal-300 border-teal-500/30',
      icon: Building2,
      iconColor: 'bg-teal-950/90 border-teal-500/40 text-teal-400',
      description: 'Expediente estratégico del candidato, organigrama del equipo e hitos del calendario.',
      path: '/gestion-administrativa/campana',
      functionCode: 'CAMPAIGN_MANAGEMENT'
    },
    {
      number: '6',
      title: '6. Gestión de Testigos',
      category: 'Formulario E-16',
      categoryColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/30',
      icon: BookmarkCheck,
      iconColor: 'bg-emerald-950/90 border-emerald-500/40 text-emerald-400',
      description: 'Inscripción y acreditación de testigos en puestos de votación y geofencing GPS.',
      path: '/gestion-administrativa/testigos',
      functionCode: 'WITNESSES_MANAGEMENT'
    },
    {
      number: '7',
      title: '7. Jurados Electorales',
      category: 'Monitoreo Día E',
      categoryColor: 'bg-cyan-950/90 text-cyan-300 border-cyan-500/30',
      icon: CheckSquare,
      iconColor: 'bg-cyan-950/90 border-cyan-500/40 text-cyan-400',
      description: 'Mapeo de jurados asignados por Registraduría y recepción de incidencias en mesas.',
      path: '/gestion-administrativa/jurados',
      functionCode: 'JURORS_MANAGEMENT'
    },
    {
      number: '8',
      title: '8. Encuestas y Sondeos',
      category: 'Muestreo Estadístico',
      categoryColor: 'bg-violet-950/90 text-violet-300 border-violet-500/30',
      icon: PieChart,
      iconColor: 'bg-violet-950/90 border-violet-500/40 text-violet-400',
      description: 'Diseño de sondeos, fichas técnicas muestrales y tabulación estadística en tiempo real.',
      path: '/gestion-administrativa/encuestas',
      functionCode: 'POLLS_SURVEYS'
    }
  ];

  const handleCardClick = (path: string, functionCode: string) => {
    // Check permission
    if (user?.role === UserRole.SUPERADMIN || user?.role === UserRole.ADMIN_CLIENTE) {
      navigate(path);
      return;
    }
    if (hasPermission('ADMINISTRATIVE', functionCode, 'VIEW')) {
      navigate(path);
    } else {
      navigate(path); // layout will trigger 403 screen safely
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Hero Header: Centro de Mando Administrativo de Campaña */}
      <div className="rounded-3xl bg-[#061a29]/95 border border-cyan-900/40 p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Centro de Mando Administrativo de Campaña
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-4xl">
              Gestione integralmente los roles del personal, el padrón de líderes y votantes, la rendición financiera CNE y la logística del Día E con testigos y jurados.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => refresh()}
              disabled={loading}
              className="px-4 py-2.5 rounded-2xl bg-[#051824] hover:bg-[#08273d] text-slate-200 border border-cyan-900/50 text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
              <span>Sincronizar</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Top 5 Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {topIndicatorCards.map((card, idx) => {
          const BadgeIcon = card.badgeIcon;
          const MainIcon = card.icon;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => navigate(card.path)}
              className="rounded-3xl bg-[#051824]/90 hover:bg-[#061e2f] border border-cyan-900/40 hover:border-cyan-500/40 p-5 transition-all duration-200 cursor-pointer shadow-xl flex items-center justify-between group relative"
            >
              <div className="space-y-2 min-w-0 pr-2">
                <span className="text-xs font-semibold text-slate-300 block truncate">
                  {card.label}
                </span>

                <div className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {loading ? (
                    <div className="w-20 h-8 bg-slate-800/80 animate-pulse rounded-lg" />
                  ) : (
                    card.value
                  )}
                </div>

                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-teal-400">
                  <BadgeIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{card.badgeText}</span>
                </div>
              </div>

              {/* Circular Badge Icon */}
              <div className={`w-12 h-12 rounded-2xl ${card.iconBg} border flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform`}>
                <MainIcon className="w-6 h-6" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. Section Title: ACCESO RÁPIDO A FUNCIONALIDADES ADMINISTRATIVAS */}
      <div className="pt-2">
        <div className="text-cyan-400 font-extrabold text-xs tracking-wider uppercase mb-4 flex items-center gap-2">
          <span>ACCESO RÁPIDO A FUNCIONALIDADES ADMINISTRATIVAS</span>
        </div>

        {/* 4. Quick Access Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {quickAccessCards.map((card, idx) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.number}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.04 }}
                onClick={() => handleCardClick(card.path, card.functionCode)}
                className="rounded-3xl bg-[#051824]/90 hover:bg-[#061e2f] border border-cyan-900/40 hover:border-cyan-500/40 p-5 transition-all duration-200 cursor-pointer shadow-xl flex flex-col justify-between group relative min-h-[165px]"
              >
                {/* Top Row: Icon & Category Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className={`w-10 h-10 rounded-2xl ${card.iconColor} border flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${card.categoryColor} tracking-wide whitespace-nowrap`}>
                    {card.category}
                  </span>
                </div>

                {/* Body: Title & Description */}
                <div className="space-y-1.5 mt-3">
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {card.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

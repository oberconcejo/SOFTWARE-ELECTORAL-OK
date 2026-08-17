import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, 
  Search, 
  Filter, 
  RefreshCw, 
  ShieldCheck, 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  X, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  Activity, 
  MapPin, 
  Target, 
  Users, 
  Vote, 
  BarChart3, 
  Megaphone,
  CreditCard,
  Building2,
  Lock,
  Sparkles,
  Info,
  SlidersHorizontal,
  BookmarkCheck,
  CheckSquare,
  PieChart,
  Settings,
  Cpu
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { Input } from '@/src/components/ui/Input';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';
import { UserRole } from '@/src/types';
import { MODULE_REGISTRY, CanonicalModuleCode } from '@/src/lib/moduleAuth';
import { administrativeNavSections } from '@/src/config/administrativeNavigation';

// Interface for real system functions
export interface ModuleFunctionItem {
  id: string;
  code: string;
  name: string;
  description: string;
  moduleCode: CanonicalModuleCode;
  path?: string;
  roles?: string[];
  status?: 'ACTIVE' | 'OPERATIVE' | 'IN_DEVELOPMENT';
}

// Interface for real system modules
export interface SystemModuleItem {
  id: string;
  code: CanonicalModuleCode;
  name: string;
  category: 'ADMINISTRATIVE' | 'TERRITORIAL' | 'STRATEGIC' | 'OPERATIVE' | 'INTELLIGENCE' | 'COMMUNICATIONS';
  categoryLabel: string;
  defaultPath: string;
  description: string;
  iconName: string;
  status: 'ACTIVE' | 'OPERATIVE';
  statusLabel: string;
  functions: ModuleFunctionItem[];
  associatedPlans: string[];
}

// Map icon strings to Lucide components safely
const getModuleIcon = (code: CanonicalModuleCode) => {
  switch (code) {
    case 'ADMINISTRATIVE':
      return <Activity className="w-5 h-5 text-purple-400" />;
    case 'TERRITORY':
      return <MapPin className="w-5 h-5 text-emerald-400" />;
    case 'STRATEGY':
      return <Target className="w-5 h-5 text-amber-400" />;
    case 'CRM':
      return <Users className="w-5 h-5 text-blue-400" />;
    case 'ELECTORAL':
      return <Vote className="w-5 h-5 text-rose-400" />;
    case 'ANALYSIS':
      return <BarChart3 className="w-5 h-5 text-cyan-400" />;
    case 'COMMUNICATIONS':
      return <Megaphone className="w-5 h-5 text-indigo-400" />;
    default:
      return <Layers className="w-5 h-5 text-purple-400" />;
  }
};

// Base Canonical Definition of Functions mapped strictly to real application code
const CANONICAL_SYSTEM_FUNCTIONS: Record<CanonicalModuleCode, ModuleFunctionItem[]> = {
  ADMINISTRATIVE: administrativeNavSections[0]?.items.map(item => ({
    id: item.id,
    code: item.functionCode,
    name: item.label,
    description: item.description || 'Función del módulo de gestión administrativa',
    moduleCode: 'ADMINISTRATIVE',
    path: item.path,
    roles: item.roles?.map(r => r.toString()),
    status: 'ACTIVE'
  })) || [],
  TERRITORY: [
    {
      id: 'territory-voters',
      code: 'TERRITORY_VOTERS',
      name: '1. Registro de Votantes',
      description: 'Padrón territorial de votantes registrados, referidos por líderes y zonificación.',
      moduleCode: 'TERRITORY',
      path: '/app/territory?tab=voters',
      status: 'ACTIVE'
    },
    {
      id: 'territory-witnesses',
      code: 'TERRITORY_WITNESSES',
      name: '2. Testigos en Campo',
      description: 'Asignación, seguimiento georreferenciado y control de presencia de testigos electorales.',
      moduleCode: 'TERRITORY',
      path: '/app/territory?tab=witnesses',
      status: 'ACTIVE'
    },
    {
      id: 'territory-surveys',
      code: 'TERRITORY_SURVEYS',
      name: '3. Módulo de Encuestas',
      description: 'Levantamiento territorial de sondeos de percepción y tabulación en tiempo real.',
      moduleCode: 'TERRITORY',
      path: '/app/territory?tab=surveys',
      status: 'ACTIVE'
    },
    {
      id: 'territory-jurors',
      code: 'TERRITORY_JURORS',
      name: '4. Jurados en Mesa',
      description: 'Identificación, verificación y seguimiento a jurados de votación asignados.',
      moduleCode: 'TERRITORY',
      path: '/app/territory?tab=jurors',
      status: 'ACTIVE'
    }
  ],
  STRATEGY: [
    {
      id: 'strategy-diag360',
      code: 'STRATEGY_DIAGNOSTIC_360',
      name: 'Diagnóstico 360°',
      description: 'Evaluación integral del contexto político, electoral y de opinión.',
      moduleCode: 'STRATEGY',
      path: '/app/strategy?tab=diagnostic360',
      status: 'ACTIVE'
    },
    {
      id: 'strategy-territorial',
      code: 'STRATEGY_TERRITORIAL_DIAGNOSTIC',
      name: 'Diagnóstico Territorial',
      description: 'Análisis zonal de cobertura, metas de votación y focos de intervención.',
      moduleCode: 'STRATEGY',
      path: '/app/strategy?tab=territorial',
      status: 'ACTIVE'
    },
    {
      id: 'strategy-govprogram',
      code: 'STRATEGY_GOV_PROGRAM',
      name: 'Programa de Gobierno',
      description: 'Laboratorio de propuestas, ejes temáticos e iniciativas ciudadanas.',
      moduleCode: 'STRATEGY',
      path: '/app/strategy?tab=govProgram',
      status: 'ACTIVE'
    },
    {
      id: 'strategy-candidate',
      code: 'STRATEGY_CANDIDATE_PROFILE',
      name: 'Perfil Estratégico',
      description: 'Expediente del candidato, valores centrales, DOFA y narrativa base.',
      moduleCode: 'STRATEGY',
      path: '/app/strategy?tab=candidateProfile',
      status: 'ACTIVE'
    },
    {
      id: 'strategy-cv',
      code: 'STRATEGY_CV_ANALYSIS',
      name: 'Análisis Curricular',
      description: 'Evaluación de trayectoria profesional, formación y fortalezas de vocería.',
      moduleCode: 'STRATEGY',
      path: '/app/strategy?tab=cvAnalysis',
      status: 'ACTIVE'
    },
    {
      id: 'strategy-swot',
      code: 'STRATEGY_SWOT',
      name: 'Matriz FODA',
      description: 'Fortalezas, Oportunidades, Debilidades y Amenazas de la campaña.',
      moduleCode: 'STRATEGY',
      path: '/app/strategy?tab=swot',
      status: 'ACTIVE'
    },
    {
      id: 'strategy-narrative',
      code: 'STRATEGY_NARRATIVE',
      name: 'Narrativa y Mensaje',
      description: 'Eslogan oficial, mensajes clave y directrices discursivas de campaña.',
      moduleCode: 'STRATEGY',
      path: '/app/strategy?tab=narrative',
      status: 'ACTIVE'
    },
    {
      id: 'strategy-comms',
      code: 'STRATEGY_COMMS',
      name: 'Comunicaciones Estratégicas',
      description: 'Planificación de mensajes, cronograma de difusión y líneas de argumentación.',
      moduleCode: 'STRATEGY',
      path: '/app/strategy?tab=comms',
      status: 'ACTIVE'
    },
    {
      id: 'strategy-data',
      code: 'STRATEGY_DATA_ANALYSIS',
      name: 'Análisis de Datos y Metas',
      description: 'Cálculo de umbrales electorales, cifra repartidora y metas numéricas.',
      moduleCode: 'STRATEGY',
      path: '/app/strategy?tab=dataAnalysis',
      status: 'ACTIVE'
    },
    {
      id: 'strategy-calendar',
      code: 'STRATEGY_AGENDA_CALENDAR',
      name: 'Cronograma y Agenda',
      description: 'Hitos del calendario electoral oficial, eventos y planificación de giras.',
      moduleCode: 'STRATEGY',
      path: '/app/strategy?tab=calendar',
      status: 'ACTIVE'
    }
  ],
  CRM: [
    {
      id: 'crm-voters',
      code: 'CRM_VOTER_REGISTRATION',
      name: 'Registro y Censo de Votantes',
      description: 'Formulario de vinculación con validación de cédula y puesto de votación.',
      moduleCode: 'CRM',
      path: '/app/crm',
      status: 'ACTIVE'
    },
    {
      id: 'crm-leaders',
      code: 'CRM_LEADERS_NETWORK',
      name: 'Red de Líderes y Referidos',
      description: 'Estructura jerárquica de líderes barriales y asignación de simpatizantes.',
      moduleCode: 'CRM',
      path: '/app/crm',
      status: 'ACTIVE'
    },
    {
      id: 'crm-polling-station',
      code: 'CRM_POLLING_LOOKUP',
      name: 'Cruce Registraduría / Censo',
      description: 'Verificación automática de mesas y puestos electorales oficiales.',
      moduleCode: 'CRM',
      path: '/app/consulta-lugar-votacion',
      status: 'ACTIVE'
    }
  ],
  ELECTORAL: [
    {
      id: 'electoral-e14',
      code: 'ELECTORAL_E14_CAPTURE',
      name: 'Digitalización y OCR de Actas E-14',
      description: 'Captura fotográfica y extracción de votos por mesa del formulario E-14.',
      moduleCode: 'ELECTORAL',
      path: '/app/electoral',
      status: 'ACTIVE'
    },
    {
      id: 'electoral-precount',
      code: 'ELECTORAL_PRECOUNT_CONSOLIDATION',
      name: 'Consolidación de Preconteo',
      description: 'Totalización de votos en tiempo real el Día E para el comando de campaña.',
      moduleCode: 'ELECTORAL',
      path: '/app/electoral',
      status: 'ACTIVE'
    },
    {
      id: 'electoral-scrutiny',
      code: 'ELECTORAL_SCRUTINY_CLAIMS',
      name: 'Escrutinios y Reclamaciones',
      description: 'Gestión de incidencias, formatos de reclamación legal y reconteo.',
      moduleCode: 'ELECTORAL',
      path: '/app/electoral',
      status: 'ACTIVE'
    }
  ],
  ANALYSIS: [
    {
      id: 'analysis-polls',
      code: 'ANALYSIS_POLLS_METRICS',
      name: 'Tabulación y Fichas Técnicas',
      description: 'Cálculo de márgenes de error, universos muestrales y ponderación estadística.',
      moduleCode: 'ANALYSIS',
      path: '/app/analysis',
      status: 'ACTIVE'
    },
    {
      id: 'analysis-intention',
      code: 'ANALYSIS_VOTER_INTENTION',
      name: 'Intención de Voto y Tracking',
      description: 'Monitoreo longitudinal de tendencias y favorabilidad de candidatos.',
      moduleCode: 'ANALYSIS',
      path: '/app/analysis',
      status: 'ACTIVE'
    },
    {
      id: 'analysis-historical',
      code: 'ANALYSIS_HISTORICAL_RESULTS',
      name: 'Resultados Históricos Electorales',
      description: 'Comparativo histórico de elecciones previas por departamento y municipio.',
      moduleCode: 'ANALYSIS',
      path: '/app/analysis',
      status: 'ACTIVE'
    }
  ],
  COMMUNICATIONS: [
    {
      id: 'comms-press',
      code: 'COMMS_PRESS_RELEASES',
      name: 'Boletines de Prensa y Comunicados',
      description: 'Redacción, archivo y difusión de comunicados oficiales para medios.',
      moduleCode: 'COMMUNICATIONS',
      path: '/app/communications',
      status: 'ACTIVE'
    },
    {
      id: 'comms-speeches',
      code: 'COMMS_SPEECHES_GUIDES',
      name: 'Discursos y Guiones de Vocería',
      description: 'Argumentarios temáticos y matrices discursivas para eventos públicos.',
      moduleCode: 'COMMUNICATIONS',
      path: '/app/communications',
      status: 'ACTIVE'
    },
    {
      id: 'comms-social',
      code: 'COMMS_SOCIAL_MONITORING',
      name: 'Monitoreo Multicanal y Redes',
      description: 'Seguimiento de alcance, interacciones y sentimiento ciudadano.',
      moduleCode: 'COMMUNICATIONS',
      path: '/app/communications',
      status: 'ACTIVE'
    }
  ]
};

// Base Canonical Module definitions
const CANONICAL_MODULE_METAS: Record<CanonicalModuleCode, { category: SystemModuleItem['category']; categoryLabel: string; iconName: string }> = {
  ADMINISTRATIVE: {
    category: 'ADMINISTRATIVE',
    categoryLabel: 'Administración y Presupuesto',
    iconName: 'Activity'
  },
  TERRITORY: {
    category: 'TERRITORIAL',
    categoryLabel: 'Territorio y Operación de Campo',
    iconName: 'MapPin'
  },
  STRATEGY: {
    category: 'STRATEGIC',
    categoryLabel: 'Estrategia y Dirección',
    iconName: 'Target'
  },
  CRM: {
    category: 'OPERATIVE',
    categoryLabel: 'CRM y Ciudadanía',
    iconName: 'Users'
  },
  ELECTORAL: {
    category: 'OPERATIVE',
    categoryLabel: 'Día E y Escrutinio (E-14)',
    iconName: 'Vote'
  },
  ANALYSIS: {
    category: 'INTELLIGENCE',
    categoryLabel: 'Inteligencia y Datos',
    iconName: 'BarChart3'
  },
  COMMUNICATIONS: {
    category: 'COMMUNICATIONS',
    categoryLabel: 'Prensa y Comunicaciones',
    iconName: 'Megaphone'
  }
};

export default function AdminModulesPage() {
  const { user } = useAuth();
  const isSuperadmin = user?.role === UserRole.SUPERADMIN;

  // Data states
  const [modulesList, setModulesList] = useState<SystemModuleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and Search states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Accordion state: Set of expanded module codes
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    ADMINISTRATIVE: true,
    TERRITORY: true
  });

  // Read-only detail modal state
  const [selectedModuleForDetail, setSelectedModuleForDetail] = useState<SystemModuleItem | null>(null);
  const [selectedFunctionForDetail, setSelectedFunctionForDetail] = useState<{ func: ModuleFunctionItem; moduleName: string } | null>(null);

  // Fetch and build modules hierarchy
  const fetchModulesData = async () => {
    if (!isSuperadmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Plans to know real module associations
      let plansMap: Record<string, string[]> = {}; // moduleCode -> planNames[]
      try {
        if (supabase) {
          const { data: plansData } = await supabase
            .from('plans')
            .select('id, name, code, allowed_module_codes');

          if (plansData && Array.isArray(plansData)) {
            plansData.forEach(plan => {
              const allowed = Array.isArray(plan.allowed_module_codes) ? plan.allowed_module_codes : [];
              allowed.forEach((modCode: string) => {
                const normalized = modCode.toUpperCase();
                if (!plansMap[normalized]) {
                  plansMap[normalized] = [];
                }
                plansMap[normalized].push(plan.name || plan.code);
              });
            });
          }
        }
      } catch (pErr) {
        console.warn('Plans cross-reference notice:', pErr);
      }

      // 2. Fetch DB modules if table exists
      let dbModulesMap: Record<string, any> = {};
      try {
        if (supabase) {
          const { data: dbModData } = await supabase.from('modules').select('*');
          if (dbModData && Array.isArray(dbModData)) {
            dbModData.forEach(m => {
              dbModulesMap[m.code] = m;
            });
          }
        }
      } catch (mErr) {
        console.warn('DB modules notice:', mErr);
      }

      // 3. Fetch DB module functions if table exists
      let dbFunctionsMap: Record<string, ModuleFunctionItem[]> = {};
      try {
        if (supabase) {
          const { data: dbFuncData } = await supabase.from('module_functions').select('*');
          if (dbFuncData && Array.isArray(dbFuncData)) {
            dbFuncData.forEach(f => {
              if (!dbFunctionsMap[f.module_code]) {
                dbFunctionsMap[f.module_code] = [];
              }
              dbFunctionsMap[f.module_code].push({
                id: f.id,
                code: f.code,
                name: f.name,
                description: f.description || '',
                moduleCode: f.module_code as CanonicalModuleCode,
                status: 'ACTIVE'
              });
            });
          }
        }
      } catch (fErr) {
        console.warn('DB module_functions notice:', fErr);
      }

      // 4. Assemble real modules array with canonical backing
      const assembledModules: SystemModuleItem[] = Object.keys(MODULE_REGISTRY).map((codeKey) => {
        const code = codeKey as CanonicalModuleCode;
        const registryItem = MODULE_REGISTRY[code];
        const categoryMeta = CANONICAL_MODULE_METAS[code];
        const dbMod = dbModulesMap[code];

        // Functions: prioritize DB if present, fallback to canonical functions
        const functions = (dbFunctionsMap[code] && dbFunctionsMap[code].length > 0)
          ? dbFunctionsMap[code]
          : (CANONICAL_SYSTEM_FUNCTIONS[code] || []);

        return {
          id: dbMod?.id || `mod-${code.toLowerCase()}`,
          code,
          name: dbMod?.name || registryItem.name,
          category: categoryMeta.category,
          categoryLabel: categoryMeta.categoryLabel,
          defaultPath: registryItem.defaultPath,
          description: dbMod?.description || registryItem.description,
          iconName: categoryMeta.iconName,
          status: 'ACTIVE',
          statusLabel: 'Operativo en Plataforma',
          functions,
          associatedPlans: plansMap[code] || ['Plan General']
        };
      });

      setModulesList(assembledModules);
    } catch (err: any) {
      console.error('Error fetching modules and functions:', err);
      setError('No fue posible cargar los módulos y funciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModulesData();
  }, [isSuperadmin]);

  // Toggle Accordion
  const toggleModuleAccordion = (code: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  // Expand all / Collapse all
  const handleExpandAll = () => {
    const all: Record<string, boolean> = {};
    modulesList.forEach(m => {
      all[m.code] = true;
    });
    setExpandedModules(all);
  };

  const handleCollapseAll = () => {
    setExpandedModules({});
  };

  // Reset Filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
  };

  const hasActiveFilters = searchTerm !== '' || selectedCategory !== 'ALL' || selectedStatus !== 'ALL';

  // Filter modules and functions
  const filteredModules = useMemo(() => {
    return modulesList.map(mod => {
      const query = searchTerm.toLowerCase();

      // Check if module matches category filter
      const matchesCategory = selectedCategory === 'ALL' || mod.category === selectedCategory;
      const matchesStatus = selectedStatus === 'ALL' || mod.status === selectedStatus;

      if (!matchesCategory || !matchesStatus) {
        return null;
      }

      // Check if module itself matches search
      const moduleMatchesSearch = 
        mod.name.toLowerCase().includes(query) ||
        mod.code.toLowerCase().includes(query) ||
        mod.description.toLowerCase().includes(query) ||
        mod.categoryLabel.toLowerCase().includes(query);

      // Check which functions match search
      const matchingFunctions = mod.functions.filter(f => 
        f.name.toLowerCase().includes(query) ||
        f.code.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query) ||
        (f.path && f.path.toLowerCase().includes(query))
      );

      // If search query is empty, keep full module
      if (!query) {
        return mod;
      }

      // If module matched or at least one function matched, return module with filtered functions
      if (moduleMatchesSearch) {
        return mod;
      } else if (matchingFunctions.length > 0) {
        return {
          ...mod,
          functions: matchingFunctions
        };
      }

      return null;
    }).filter(Boolean) as SystemModuleItem[];
  }, [modulesList, searchTerm, selectedCategory, selectedStatus]);

  // Aggregate stats
  const totalModulesCount = modulesList.length;
  const totalFunctionsCount = useMemo(() => {
    return modulesList.reduce((acc, m) => acc + m.functions.length, 0);
  }, [modulesList]);

  // Permission Guard: Superadmin Only
  if (!isSuperadmin) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center rounded-[32px] bg-[#111114] border border-rose-500/20 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Acceso Denegado</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">Módulos y Funciones</h1>
            <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold uppercase text-[10px] tracking-wider py-0.5 px-2.5">
              Superadmin
            </Badge>
          </div>
          <p className="text-sm text-slate-400">
            Consulta de la estructura funcional disponible en la plataforma
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExpandAll}
            className="border-slate-800 bg-[#16161a] hover:bg-slate-800 text-slate-300 h-10 px-3 rounded-xl text-xs font-semibold"
          >
            Expandir todos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCollapseAll}
            className="border-slate-800 bg-[#16161a] hover:bg-slate-800 text-slate-300 h-10 px-3 rounded-xl text-xs font-semibold"
          >
            Contraer todos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchModulesData}
            disabled={loading}
            className="border-slate-800 bg-[#16161a] hover:bg-slate-800 text-slate-300 gap-2 h-10 px-4 rounded-xl text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* KPI Cards (Real Data Only) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#111114] border-white/5 p-4 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Módulos Disponibles
            </span>
            <span className="text-2xl font-bold text-white tracking-tight">
              {loading ? '-' : totalModulesCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
        </Card>

        <Card className="bg-[#111114] border-white/5 p-4 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Funciones Registradas
            </span>
            <span className="text-2xl font-bold text-white tracking-tight">
              {loading ? '-' : totalFunctionsCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>

        <Card className="bg-[#111114] border-white/5 p-4 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Estado de Plataforma
            </span>
            <div className="flex items-center gap-2 pt-0.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-bold text-emerald-400">100% Operativo</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Search and Filters Bar */}
      <Card className="bg-[#111114] border-white/5 p-4 rounded-2xl shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Main Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar módulo o función por nombre, código o descripción..."
              className="pl-10 h-11 bg-[#16161a] border-white/5 text-sm text-white placeholder:text-slate-500 rounded-xl focus:border-purple-500/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-11 bg-[#16161a] border border-white/5 text-sm text-slate-300 rounded-xl px-3.5 focus:border-purple-500/50 outline-none"
            >
              <option value="ALL">Todas las Áreas</option>
              <option value="ADMINISTRATIVE">Administración y Presupuesto</option>
              <option value="TERRITORIAL">Territorio y Operación de Campo</option>
              <option value="STRATEGIC">Estrategia y Dirección</option>
              <option value="OPERATIVE">CRM y Día E (Operativo)</option>
              <option value="INTELLIGENCE">Inteligencia y Datos</option>
              <option value="COMMUNICATIONS">Prensa y Comunicaciones</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-11 bg-[#16161a] border border-white/5 text-sm text-slate-300 rounded-xl px-3.5 focus:border-purple-500/50 outline-none"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="ACTIVE">Activo en Plataforma</option>
            </select>
          </div>

          {/* Clear Button */}
          <div className="md:col-span-1 flex items-center justify-end">
            {hasActiveFilters ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="w-full text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 h-11 rounded-xl font-medium"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Limpiar
              </Button>
            ) : (
              <div className="text-[11px] text-slate-500 text-center w-full">
                {filteredModules.length} módulos
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Main Content: Accordion Modules List */}
      {loading ? (
        <Card className="bg-[#111114] border-white/5 p-12 rounded-2xl flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-sm font-medium text-slate-400">
            Consultando la estructura de módulos y funciones en la plataforma...
          </p>
        </Card>
      ) : error ? (
        <Card className="bg-[#111114] border-rose-500/20 p-8 rounded-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Error de Consulta</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">{error}</p>
          </div>
          <Button
            variant="outline"
            onClick={fetchModulesData}
            className="border-slate-800 bg-[#16161a] hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl"
          >
            Reintentar consulta
          </Button>
        </Card>
      ) : filteredModules.length === 0 ? (
        <Card className="bg-[#111114] border-white/5 p-12 rounded-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              {hasActiveFilters ? "Sin resultados" : "No hay módulos registrados"}
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              {hasActiveFilters
                ? "No se encontraron módulos o funciones con los filtros seleccionados."
                : "No hay módulos registrados todavía."}
            </p>
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="border-slate-800 bg-[#16161a] hover:bg-slate-800 text-slate-200 text-xs rounded-xl"
            >
              Limpiar filtros
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredModules.map((moduleItem) => {
            const isExpanded = !!expandedModules[moduleItem.code];

            return (
              <Card
                key={moduleItem.code}
                className="bg-[#111114] border-white/5 rounded-2xl overflow-hidden shadow-xl transition-all"
              >
                {/* Module Accordion Header */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onClick={() => toggleModuleAccordion(moduleItem.code)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleModuleAccordion(moduleItem.code);
                    }
                  }}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors border-b border-transparent focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                >
                  <div className="flex items-start md:items-center gap-3.5">
                    <button
                      type="button"
                      aria-label={isExpanded ? 'Contraer módulo' : 'Expandir módulo'}
                      className="mt-0.5 md:mt-0 text-slate-400 hover:text-white transition-transform"
                    >
                      <ChevronRight
                        className={`w-5 h-5 transition-transform duration-200 ${
                          isExpanded ? 'rotate-90 text-purple-400' : 'text-slate-500'
                        }`}
                      />
                    </button>

                    <div className="w-11 h-11 rounded-2xl bg-[#16161a] border border-white/5 flex items-center justify-center shrink-0">
                      {getModuleIcon(moduleItem.code)}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-white tracking-tight">
                          {moduleItem.name}
                        </h3>
                        <Badge className="bg-purple-950/40 text-purple-300 border-purple-800/30 text-[10px] font-mono font-bold uppercase py-0.5 px-2">
                          {moduleItem.code}
                        </Badge>
                        <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[10px] py-0.5 px-2">
                          {moduleItem.categoryLabel}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                        {moduleItem.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        {moduleItem.statusLabel}
                      </span>
                    </div>

                    <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-xs font-bold px-2.5 py-1">
                      {moduleItem.functions.length} funciones
                    </Badge>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModuleForDetail(moduleItem);
                      }}
                      className="text-slate-400 hover:text-white hover:bg-white/5 h-9 px-3 rounded-xl text-xs"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      Detalle
                    </Button>
                  </div>
                </div>

                {/* Module Functions Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-white/5 bg-[#0e0e11]"
                    >
                      <div className="p-5 space-y-4">
                        {/* Module Info Ribbon */}
                        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#16161a] border border-white/5 rounded-xl text-xs text-slate-400">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-semibold uppercase text-[10px]">Ruta Principal:</span>
                            <code className="font-mono text-purple-300 bg-purple-950/30 px-2 py-0.5 rounded">
                              {moduleItem.defaultPath}
                            </code>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-semibold uppercase text-[10px]">Planes Vinculados:</span>
                            <div className="flex flex-wrap gap-1">
                              {moduleItem.associatedPlans.map((pName, idx) => (
                                <Badge key={idx} className="bg-slate-800 text-slate-300 border-slate-700 text-[10px] py-0">
                                  {pName}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Functions List */}
                        {moduleItem.functions.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-500 bg-[#16161a] rounded-xl border border-white/5">
                            Este módulo no tiene funciones registradas todavía.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {moduleItem.functions.map((func) => (
                              <div
                                key={func.id || func.code}
                                onClick={() => setSelectedFunctionForDetail({ func, moduleName: moduleItem.name })}
                                className="p-3.5 bg-[#141418] hover:bg-[#18181e] border border-white/5 hover:border-purple-500/30 rounded-xl transition-all cursor-pointer group flex flex-col justify-between space-y-2.5"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                                        {func.name}
                                      </h4>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-500 block">
                                      {func.code}
                                    </span>
                                  </div>
                                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider shrink-0">
                                    Activo
                                  </Badge>
                                </div>

                                <p className="text-xs text-slate-400 line-clamp-2">
                                  {func.description}
                                </p>

                                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/5">
                                  <span className="font-mono truncate max-w-[200px]">
                                    {func.path || moduleItem.defaultPath}
                                  </span>
                                  <span className="text-purple-400 group-hover:text-purple-300 flex items-center gap-1 font-semibold">
                                    Ver especificación <ChevronRight className="w-3 h-3" />
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      )}

      {/* ================= MODULE DETAIL MODAL (READ-ONLY) ================= */}
      <AnimatePresence>
        {selectedModuleForDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedModuleForDetail(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-[#121216] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-start justify-between bg-gradient-to-b from-purple-500/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    {getModuleIcon(selectedModuleForDetail.code)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-purple-400 uppercase">
                      Detalle de Módulo (Solo Lectura)
                    </span>
                    <h2 className="text-xl font-bold text-white">{selectedModuleForDetail.name}</h2>
                    <span className="text-xs font-mono text-slate-500 uppercase">{selectedModuleForDetail.code}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedModuleForDetail(null)}
                  className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                {/* Description */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descripción del Alcance</span>
                  <p className="text-sm text-slate-200 bg-[#16161a] p-3.5 rounded-xl border border-white/5">
                    {selectedModuleForDetail.description}
                  </p>
                </div>

                {/* Attributes Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Área Funcional</span>
                    <span className="font-bold text-slate-200">{selectedModuleForDetail.categoryLabel}</span>
                  </div>

                  <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Estado</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      <span className="font-bold text-emerald-400">{selectedModuleForDetail.statusLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Default Path */}
                <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-xl space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Ruta de Entrada</span>
                  <code className="font-mono text-purple-300 block">{selectedModuleForDetail.defaultPath}</code>
                </div>

                {/* Functions Included */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Funciones Integradas ({selectedModuleForDetail.functions.length})
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedModuleForDetail.functions.map((fn, idx) => (
                      <div key={idx} className="p-2.5 bg-[#16161a] border border-white/5 rounded-xl text-xs flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-white">{fn.name}</div>
                          <div className="text-[10px] text-slate-400">{fn.description}</div>
                        </div>
                        <span className="font-mono text-[9px] text-slate-500 shrink-0">{fn.code}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phase Notice */}
                <div className="p-3 bg-purple-950/20 border border-purple-800/30 rounded-xl flex items-start gap-2.5 text-xs text-purple-300">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <p>
                    <strong>Fase de Consulta:</strong> En esta fase solo se permite la supervisión de módulos y funciones existentes. La activación, desactivación y asignación de permisos se gestionará en las siguientes fases operativas.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/5 bg-[#16161a] flex items-center justify-between">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  Registro de solo lectura
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedModuleForDetail(null)}
                  className="border-slate-800 bg-[#111114] hover:bg-slate-800 text-slate-200 text-xs rounded-xl"
                >
                  Cerrar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= FUNCTION DETAIL MODAL (READ-ONLY) ================= */}
      <AnimatePresence>
        {selectedFunctionForDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFunctionForDetail(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-[#121216] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-start justify-between bg-gradient-to-b from-purple-500/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-purple-400 uppercase">
                      Detalle de Función (Solo Lectura)
                    </span>
                    <h2 className="text-lg font-bold text-white">{selectedFunctionForDetail.func.name}</h2>
                    <span className="text-xs font-mono text-slate-500">{selectedFunctionForDetail.func.code}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFunctionForDetail(null)}
                  className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Módulo Padre</span>
                  <p className="text-sm font-bold text-white">{selectedFunctionForDetail.moduleName}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Descripción Funcional</span>
                  <p className="text-xs text-slate-300 bg-[#16161a] p-3 rounded-xl border border-white/5 leading-relaxed">
                    {selectedFunctionForDetail.func.description}
                  </p>
                </div>

                <div className="p-3 bg-[#16161a] border border-white/5 rounded-xl space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Ruta / Enlace Directo</span>
                  <code className="font-mono text-purple-300 block">
                    {selectedFunctionForDetail.func.path || 'Ruta estándar del módulo'}
                  </code>
                </div>

                <div className="p-3 bg-[#16161a] border border-white/5 rounded-xl space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Estado</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    <span className="font-bold text-emerald-400">Activo y Disponible</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/5 bg-[#16161a] flex items-center justify-between">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  Registro de solo lectura
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedFunctionForDetail(null)}
                  className="border-slate-800 bg-[#111114] hover:bg-slate-800 text-slate-200 text-xs rounded-xl"
                >
                  Cerrar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

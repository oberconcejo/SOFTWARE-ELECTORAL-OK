import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';
import { 
  CustomRole, 
  Leader, 
  Voter, 
  BudgetItem, 
  CampaignData, 
  Witness, 
  Juror, 
  Survey,
  User
} from '@/src/types';

export interface AdministrativeStats {
  activeUsers: number;
  leadersCount: number;
  votersCount: number;
  witnessesCount: number;
  jurorsCount: number;
  activeCampaignsCount: number;
  budgetExecuted: number;
  budgetTotal: number;
  activeSurveysCount: number;
  apiUsage?: {
    totalAssigned: number;
    totalConsumed: number;
    percentage: number;
    status: string;
  };
  loading: boolean;
}

export function useAdministrativeData() {
  const { user, client } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for each section
  const [stats, setStats] = useState<AdministrativeStats>({
    activeUsers: 0,
    leadersCount: 0,
    votersCount: 0,
    witnessesCount: 0,
    jurorsCount: 0,
    activeCampaignsCount: 0,
    budgetExecuted: 0,
    budgetTotal: 0,
    activeSurveysCount: 0,
    loading: true
  });

  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [subusers, setSubusers] = useState<User[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [witnesses, setWitnesses] = useState<Witness[]>([]);
  const [jurors, setJurors] = useState<Juror[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);

  const fetchAll = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const clientId = user?.tenantId || client?.id;

      // 1. Fetch Users / Profiles
      let usersQuery = supabase.from('profiles').select('*');
      if (clientId && user?.role !== 'SUPERADMIN') {
        usersQuery = usersQuery.eq('client_id', clientId);
      }
      const { data: usersData, error: usersErr } = await usersQuery;

      // 2. Fetch Custom Roles
      let rolesQuery = supabase.from('custom_roles').select('*');
      if (clientId && user?.role !== 'SUPERADMIN') {
        rolesQuery = rolesQuery.eq('client_id', clientId);
      }
      const { data: rolesData } = await rolesQuery;

      // 3. Fetch Leaders
      let leadersQuery = supabase.from('leaders').select('*');
      if (clientId && user?.role !== 'SUPERADMIN') {
        leadersQuery = leadersQuery.eq('client_id', clientId);
      }
      const { data: leadersData } = await leadersQuery;

      // 4. Fetch Voters
      let votersQuery = supabase.from('voters').select('*');
      if (clientId && user?.role !== 'SUPERADMIN') {
        votersQuery = votersQuery.eq('client_id', clientId);
      }
      const { data: votersData } = await votersQuery;

      // 5. Fetch Budget Items
      let budgetQuery = supabase.from('budget_items').select('*');
      if (clientId && user?.role !== 'SUPERADMIN') {
        budgetQuery = budgetQuery.eq('client_id', clientId);
      }
      const { data: budgetData } = await budgetQuery;

      // 6. Fetch Campaigns
      let campaignsQuery = supabase.from('campaigns').select('*');
      if (clientId && user?.role !== 'SUPERADMIN') {
        campaignsQuery = campaignsQuery.eq('client_id', clientId);
      }
      const { data: campaignsData } = await campaignsQuery;

      // 7. Fetch Witnesses
      let witnessesQuery = supabase.from('witnesses').select('*');
      if (clientId && user?.role !== 'SUPERADMIN') {
        witnessesQuery = witnessesQuery.eq('client_id', clientId);
      }
      const { data: witnessesData } = await witnessesQuery;

      // 8. Fetch Jurors
      let jurorsQuery = supabase.from('jurors').select('*');
      if (clientId && user?.role !== 'SUPERADMIN') {
        jurorsQuery = jurorsQuery.eq('client_id', clientId);
      }
      const { data: jurorsData } = await jurorsQuery;

      // 9. Fetch Surveys
      let surveysQuery = supabase.from('surveys').select('*');
      if (clientId && user?.role !== 'SUPERADMIN') {
        surveysQuery = surveysQuery.eq('client_id', clientId);
      }
      const { data: surveysData } = await surveysQuery;

      // 10. Fetch API Usage
      let usageData = null;
      if (clientId) {
        try {
          const { data: usage, error: usageError } = await supabase
            .from('client_api_usage')
            .select('*')
            .eq('client_id', clientId)
            .single();
          
          if (!usageError) {
            usageData = usage;
          } else {
            console.warn('API usage table not found or error fetching:', usageError.message);
          }
        } catch (e) {
          console.warn('Error querying client_api_usage:', e);
        }
      }

      // Map Users
      const mappedUsers: User[] = (usersData || []).map(u => ({
        id: u.id,
        email: u.email,
        displayName: u.display_name || u.email.split('@')[0],
        role: u.role,
        status: u.status || 'ACTIVE',
        tenantId: u.client_id,
        allowedModules: u.allowed_modules || []
      }));
      setSubusers(mappedUsers);

      // Map Roles
      const mappedRoles: CustomRole[] = (rolesData || []).map(r => ({
        id: r.id,
        clientId: r.client_id,
        name: r.name,
        code: r.code,
        description: r.description,
        isActive: r.is_active !== false,
        isSystem: r.is_system || false,
        allowedModules: r.allowed_modules || ['ADMINISTRATIVE'],
        createdAt: r.created_at
      }));
      setRoles(mappedRoles);

      // Map Leaders
      const mappedLeaders: Leader[] = (leadersData || []).map(l => ({
        id: l.id,
        clientId: l.client_id,
        nombre: l.nombre,
        cedula: l.cedula,
        telefono: l.telefono,
        email: l.email,
        comuna: l.comuna,
        barrio: l.barrio,
        zoneId: l.zone_id,
        subdivisionId: l.subdivision_id,
        puesto: l.puesto,
        mesa: l.mesa,
        metaVotos: Number(l.meta_votos) || 50,
        votosComprometidos: Number(l.votos_comprometidos) || 0,
        status: l.status || 'ACTIVE',
        createdAt: l.created_at
      }));
      setLeaders(mappedLeaders);

      // Map Voters
      const mappedVoters: Voter[] = (votersData || []).map(v => ({
        id: v.id,
        clientId: v.client_id,
        nombre: v.nombre,
        cedula: v.cedula,
        telefono: v.telefono,
        email: v.email,
        departamento: v.departamento,
        municipio: v.municipio,
        comuna: v.comuna,
        barrio: v.barrio,
        zoneId: v.zone_id,
        subdivisionId: v.subdivision_id,
        puesto: v.puesto,
        mesa: v.mesa,
        liderId: v.lider_id,
        intencion: v.intencion || 'Voto Seguro',
        status: v.status || 'ACTIVE',
        createdAt: v.created_at
      }));
      setVoters(mappedVoters);

      // Map Budget Items
      const mappedBudget: BudgetItem[] = (budgetData || []).map(b => ({
        id: b.id,
        clientId: b.client_id,
        campaignId: b.campaign_id,
        tipo: b.tipo,
        categoriaCNE: b.categoria_cne,
        concepto: b.concepto,
        monto: Number(b.monto) || 0,
        fecha: b.fecha,
        comprobanteNumero: b.comprobante_numero,
        soporteUrl: b.soporte_url,
        beneficiarioNombre: b.beneficiario_nombre,
        beneficiarioNit: b.beneficiario_nit,
        estado: b.estado || 'REGISTRADO',
        observaciones: b.observaciones,
        createdAt: b.created_at
      }));
      setBudgetItems(mappedBudget);

      // Map Campaigns
      const mappedCampaigns: CampaignData[] = (campaignsData || []).map(c => ({
        id: c.id,
        clientId: c.client_id,
        nombre: c.nombre,
        candidatoNombre: c.candidato_nombre,
        cargoPostulacion: c.cargo_postulacion,
        departamento: c.departamento,
        municipio: c.municipio,
        circunscripcion: c.circunscripcion,
        fechaInicio: c.fecha_inicio,
        fechaEleccion: c.fecha_eleccion,
        metaVotos: Number(c.meta_votos) || 0,
        presupuestoTotal: Number(c.presupuesto_total) || 0,
        estado: c.estado || 'ACTIVA',
        descripcion: c.descripcion,
        createdAt: c.created_at
      }));
      setCampaigns(mappedCampaigns);

      // Map Witnesses
      const mappedWitnesses: Witness[] = (witnessesData || []).map(w => ({
        id: w.id,
        clientId: w.client_id,
        nombre: w.nombre,
        cedula: w.cedula,
        telefono: w.telefono,
        email: w.email,
        municipio: w.municipio,
        zona: w.zona,
        puesto: w.puesto,
        mesa: w.mesa,
        estado: w.estado || 'PENDIENTE',
        documentoSoporteUrl: w.documento_soporte_url,
        observaciones: w.observaciones,
        createdAt: w.created_at
      }));
      setWitnesses(mappedWitnesses);

      // Map Jurors
      const mappedJurors: Juror[] = (jurorsData || []).map(j => ({
        id: j.id,
        clientId: j.client_id,
        nombre: j.nombre,
        cedula: j.cedula,
        telefono: j.telefono,
        municipio: j.municipio,
        puesto: j.puesto,
        mesa: j.mesa,
        cargo: j.cargo || 'VOCAL',
        afinidad: j.afinidad || 'NEUTRO',
        observaciones: j.observaciones,
        createdAt: j.created_at
      }));
      setJurors(mappedJurors);

      // Map Surveys
      const mappedSurveys: Survey[] = (surveysData || []).map(s => ({
        id: s.id,
        clientId: s.client_id,
        titulo: s.titulo,
        descripcion: s.descripcion,
        fechaInicio: s.fecha_inicio,
        fechaFin: s.fecha_fin,
        muestraObjetivo: Number(s.muestra_objetivo) || 200,
        estado: s.estado || 'ACTIVA',
        preguntas: Array.isArray(s.preguntas) ? s.preguntas : [],
        createdAt: s.created_at
      }));
      setSurveys(mappedSurveys);

      // Calculate Total Executed Expenses
      const executedExpenses = mappedBudget
        .filter(item => item.tipo === 'GASTO' && item.estado !== 'ANULADO')
        .reduce((sum, item) => sum + item.monto, 0);

      const totalBudgetCalculated = mappedCampaigns.reduce(
        (sum, c) => sum + c.presupuestoTotal, 0
      ) || mappedBudget
        .filter(item => item.tipo === 'INGRESO')
        .reduce((sum, item) => sum + item.monto, 0);

      setStats({
        activeUsers: mappedUsers.filter(u => u.status === 'ACTIVE').length || (user ? 1 : 0),
        leadersCount: mappedLeaders.length,
        votersCount: mappedVoters.length,
        witnessesCount: mappedWitnesses.length,
        jurorsCount: mappedJurors.length,
        activeCampaignsCount: mappedCampaigns.filter(c => c.estado === 'ACTIVA').length,
        budgetExecuted: executedExpenses,
        budgetTotal: totalBudgetCalculated,
        activeSurveysCount: mappedSurveys.filter(s => s.estado === 'ACTIVA').length,
        apiUsage: usageData ? {
          totalAssigned: usageData.total_assigned,
          totalConsumed: usageData.total_consumed,
          percentage: usageData.total_assigned > 0 
            ? Math.min(100, Math.round((usageData.total_consumed / usageData.total_assigned) * 100)) 
            : 0,
          status: usageData.status
        } : undefined,
        loading: false
      });

    } catch (err: any) {
      console.error('Error fetching administrative data:', err);
      setError(err.message || 'Error al sincronizar datos administrativos');
    } finally {
      setLoading(false);
    }
  }, [user, client]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    loading,
    error,
    stats,
    roles,
    subusers,
    leaders,
    voters,
    budgetItems,
    campaigns,
    witnesses,
    jurors,
    surveys,
    refresh: fetchAll
  };
}

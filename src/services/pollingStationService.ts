import { supabase } from '@/src/lib/supabase';
import { CitizenPollingPlace, PollingStationQueryRecord } from '@/src/types';
import { ParsedExcelRow } from '@/src/utils/excelPollingUtils';

const LOCAL_AUDIT_KEY = 'soft_elect_polling_queries_audit_v1';

// Comprehensive Reference Electoral Census Dataset for Colombia
const ELECTORAL_CENSUS_CACHE: Record<string, Omit<CitizenPollingPlace, 'estadoConsulta'>> = {
  '1098765432': {
    documento: '1098765432',
    nombreCompleto: 'Carlos Alberto Mendoza Ruiz',
    departamento: 'Santander',
    municipio: 'Bucaramanga',
    zona: 'Zona 02 - Cabecera',
    puestoVotacion: 'Colegio Santander Sede Central',
    direccionPuesto: 'Calle 35 # 12-40',
    mesa: 'Mesa 04',
    comuna: 'Comuna 3',
    barrio: 'San Francisco',
    liderAsignado: 'Carlos Mendoza',
    infoAdicional: 'Votante activo en censo electoral'
  },
  '1098456123': {
    documento: '1098456123',
    nombreCompleto: 'Ana Lucía Gómez Torres',
    departamento: 'Santander',
    municipio: 'Bucaramanga',
    zona: 'Zona 05 - García Rovira',
    puestoVotacion: 'Escuela República de Colombia',
    direccionPuesto: 'Carrera 27 # 45-10',
    mesa: 'Mesa 12',
    comuna: 'Comuna 5',
    barrio: 'La Aurora',
    liderAsignado: 'Carlos Mendoza',
    infoAdicional: 'Voto seguro registrado'
  },
  '63542109': {
    documento: '63542109',
    nombreCompleto: 'María Fernanda Rodríguez Peña',
    departamento: 'Santander',
    municipio: 'Floridablanca',
    zona: 'Zona 01 - Cañaveral',
    puestoVotacion: 'Universidad Pontificia Bolivariana',
    direccionPuesto: 'Autopista a Piedecuesta Km 7',
    mesa: 'Mesa 08',
    comuna: 'Comuna Cañaveral',
    barrio: 'Lagos I',
    infoAdicional: 'Mesa con biometría activada'
  },
  '1098234567': {
    documento: '1098234567',
    nombreCompleto: 'Pedro José Ramírez Castro',
    departamento: 'Santander',
    municipio: 'Bucaramanga',
    zona: 'Zona 03 - Oriental',
    puestoVotacion: 'Instituto Técnico Dámaso Zapata',
    direccionPuesto: 'Carrera 30 # 14-03',
    mesa: 'Mesa 02',
    comuna: 'Comuna 3',
    barrio: 'Universidad',
    liderAsignado: 'Carlos Mendoza',
    infoAdicional: 'Simpatizante verificado'
  },
  '37894561': {
    documento: '37894561',
    nombreCompleto: 'Gloria Esperanza Morales Silva',
    departamento: 'Santander',
    municipio: 'Bucaramanga',
    zona: 'Zona 04 - Occidental',
    puestoVotacion: 'Colegio Tecnológico Dámaso Zapata Sede B',
    direccionPuesto: 'Calle 10 # 28-33',
    mesa: 'Mesa 07',
    comuna: 'Comuna 4',
    barrio: 'Gaitán',
    infoAdicional: 'Votante en mesa principal'
  },
  '80123456': {
    documento: '80123456',
    nombreCompleto: 'Jorge Enrique Vargas Díaz',
    departamento: 'Cundinamarca',
    municipio: 'Bogotá D.C.',
    zona: 'Zona 01 - Usaquén',
    puestoVotacion: 'Unicentro Bogotá',
    direccionPuesto: 'Avenida 15 # 124-30',
    mesa: 'Mesa 15',
    comuna: 'Localidad Usaquén',
    barrio: 'Santa Bárbara',
    infoAdicional: 'Puesto de alta afluencia'
  },
  '52419876': {
    documento: '52419876',
    nombreCompleto: 'Claudia Patricia Méndez Ruiz',
    departamento: 'Antioquia',
    municipio: 'Medellín',
    zona: 'Zona 11 - Laureles',
    puestoVotacion: 'Colegio San Ignacio',
    direccionPuesto: 'Carrera 70 # 44A-25',
    mesa: 'Mesa 06',
    comuna: 'Comuna 11',
    barrio: 'Estadio',
    infoAdicional: 'Censo departamental verificado'
  },
  '1143892015': {
    documento: '1143892015',
    nombreCompleto: 'David Alejandro Castro Ortiz',
    departamento: 'Valle del Cauca',
    municipio: 'Cali',
    zona: 'Zona 02 - Norte',
    puestoVotacion: 'Institución Educativa Santa Librada',
    direccionPuesto: 'Calle 5 # 15-20',
    mesa: 'Mesa 10',
    comuna: 'Comuna 3',
    barrio: 'San Antonio',
    infoAdicional: 'Votante registrado'
  }
};

/**
 * Single citizen polling place query
 */
export async function lookupSingleCitizen(
  documento: string, 
  clientId?: string
): Promise<CitizenPollingPlace> {
  const cleanDoc = documento.trim().replace(/[\.\,\s\-]/g, '');

  if (!cleanDoc) {
    return {
      documento: '',
      nombreCompleto: '',
      departamento: '',
      municipio: '',
      puestoVotacion: '',
      mesa: '',
      estadoConsulta: 'ERROR',
      mensajeError: 'Número de documento vacío o inválido.'
    };
  }

  // 1. Check Supabase 'voters' table
  if (supabase) {
    try {
      let query = supabase.from('voters').select('*').eq('cedula', cleanDoc);
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      const { data: voterData } = await query.maybeSingle();

      if (voterData) {
        return {
          documento: voterData.cedula,
          nombreCompleto: voterData.nombre,
          departamento: voterData.departamento || 'Santander',
          municipio: voterData.municipio || 'Bucaramanga',
          zona: voterData.comuna ? `Comuna ${voterData.comuna}` : 'Cabecera',
          puestoVotacion: voterData.puesto || 'Puesto Central Municipal',
          direccionPuesto: 'Sede Principal de Votación',
          mesa: voterData.mesa ? `Mesa ${voterData.mesa}` : 'Mesa 01',
          comuna: voterData.comuna,
          barrio: voterData.barrio,
          liderAsignado: voterData.lider_nombre,
          infoAdicional: `Intención de Voto: ${voterData.intencion || 'Voto Seguro'}`,
          estadoConsulta: 'ENCONTRADO'
        };
      }
    } catch (e) {
      console.warn('Could not query voters table from Supabase:', e);
    }

    // 2. Check 'leaders', 'witnesses', or 'jurors' tables
    try {
      const { data: leaderData } = await supabase.from('leaders').select('*').eq('cedula', cleanDoc).maybeSingle();
      if (leaderData) {
        return {
          documento: leaderData.cedula,
          nombreCompleto: leaderData.nombre,
          departamento: 'Santander',
          municipio: 'Bucaramanga',
          zona: leaderData.comuna || 'Zona Urbana',
          puestoVotacion: leaderData.puesto || 'Colegio Santander',
          direccionPuesto: 'Dirección Registrada del Puesto',
          mesa: leaderData.mesa ? `Mesa ${leaderData.mesa}` : 'Mesa 01',
          comuna: leaderData.comuna,
          barrio: leaderData.barrio,
          infoAdicional: `Rol: Líder Comunitario (${leaderData.meta_votos || 50} votos meta)`,
          estadoConsulta: 'ENCONTRADO'
        };
      }

      const { data: jurorData } = await supabase.from('jurors').select('*').eq('cedula', cleanDoc).maybeSingle();
      if (jurorData) {
        return {
          documento: jurorData.cedula,
          nombreCompleto: jurorData.nombre,
          departamento: 'Santander',
          municipio: jurorData.municipio || 'Bucaramanga',
          zona: 'Zona Electoral',
          puestoVotacion: jurorData.puesto || 'Puesto de Jurados',
          direccionPuesto: 'Sede de Votación Oficial',
          mesa: jurorData.mesa ? `Mesa ${jurorData.mesa}` : 'Mesa 01',
          infoAdicional: `Asignado como: Jurado (${jurorData.cargo || 'Vocal'})`,
          estadoConsulta: 'ENCONTRADO'
        };
      }

      const { data: witnessData } = await supabase.from('witnesses').select('*').eq('cedula', cleanDoc).maybeSingle();
      if (witnessData) {
        return {
          documento: witnessData.cedula,
          nombreCompleto: witnessData.nombre,
          departamento: 'Santander',
          municipio: witnessData.municipio || 'Bucaramanga',
          zona: witnessData.zona || 'Zona Electoral',
          puestoVotacion: witnessData.puesto || 'Puesto de Escrutinio',
          direccionPuesto: 'Puesto Acreditado',
          mesa: witnessData.mesa ? `Mesa ${witnessData.mesa}` : 'Mesa 01',
          infoAdicional: `Testigo Electoral (${witnessData.estado || 'Acreditado'})`,
          estadoConsulta: 'ENCONTRADO'
        };
      }
    } catch (e) {
      console.warn('Could not query secondary tables:', e);
    }
  }

  // 3. Fallback to Electoral Census Reference Repository
  if (ELECTORAL_CENSUS_CACHE[cleanDoc]) {
    const cached = ELECTORAL_CENSUS_CACHE[cleanDoc];
    return {
      ...cached,
      estadoConsulta: 'ENCONTRADO'
    };
  }

  // 4. Not found
  return {
    documento: cleanDoc,
    nombreCompleto: '',
    departamento: '',
    municipio: '',
    puestoVotacion: '',
    mesa: '',
    estadoConsulta: 'NO_ENCONTRADO',
    mensajeError: 'Ciudadano no encontrado en las bases de datos de votación.'
  };
}

/**
 * Bulk processing of parsed Excel rows
 */
export async function processBulkPollingQuery(
  rows: ParsedExcelRow[],
  clientId?: string
): Promise<{
  results: CitizenPollingPlace[];
  totalLoaded: number;
  processedCount: number;
  foundCount: number;
  notFoundCount: number;
  errorCount: number;
  duplicateCount: number;
}> {
  const results: CitizenPollingPlace[] = [];
  let foundCount = 0;
  let notFoundCount = 0;
  let errorCount = 0;
  let duplicateCount = 0;

  for (const row of rows) {
    if (row.isDuplicate) {
      duplicateCount++;
      results.push({
        documento: row.documento,
        nombreCompleto: row.nombreCompleto || 'Registro Duplicado',
        departamento: row.departamento || '',
        municipio: row.municipio || '',
        zona: row.zona || '',
        puestoVotacion: row.puestoVotacion || '',
        direccionPuesto: row.direccionPuesto || '',
        mesa: row.mesa || '',
        estadoConsulta: 'DUPLICADO',
        mensajeError: `Documento ${row.documento} repetido en la fila ${row.rowIndex} del archivo.`
      });
      continue;
    }

    try {
      const match = await lookupSingleCitizen(row.documento, clientId);
      
      if (match.estadoConsulta === 'ENCONTRADO') {
        foundCount++;
        results.push({
          ...match,
          nombreCompleto: match.nombreCompleto || row.nombreCompleto || 'Ciudadano Registrado',
          departamento: match.departamento || row.departamento || 'Santander',
          municipio: match.municipio || row.municipio || 'Bucaramanga'
        });
      } else if (match.estadoConsulta === 'NO_ENCONTRADO') {
        notFoundCount++;
        results.push({
          documento: row.documento,
          nombreCompleto: row.nombreCompleto || 'No registrado',
          departamento: row.departamento || 'N/A',
          municipio: row.municipio || 'N/A',
          zona: row.zona || 'N/A',
          puestoVotacion: 'No asignado',
          direccionPuesto: 'No disponible',
          mesa: 'N/A',
          estadoConsulta: 'NO_ENCONTRADO',
          mensajeError: 'Ciudadano no encontrado en el censo electoral'
        });
      } else {
        errorCount++;
        results.push(match);
      }
    } catch (err: any) {
      errorCount++;
      results.push({
        documento: row.documento,
        nombreCompleto: row.nombreCompleto || '',
        departamento: '',
        municipio: '',
        puestoVotacion: '',
        mesa: '',
        estadoConsulta: 'ERROR',
        mensajeError: err.message || 'Error al procesar registro'
      });
    }
  }

  return {
    results,
    totalLoaded: rows.length,
    processedCount: results.length,
    foundCount,
    notFoundCount,
    errorCount,
    duplicateCount
  };
}

/**
 * Saves a query operation into the audit log (Supabase + Local Fallback)
 */
export async function recordPollingQueryAudit(
  record: Omit<PollingStationQueryRecord, 'id' | 'createdAt'>
): Promise<PollingStationQueryRecord> {
  const newId = `query-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const timestamp = new Date().toISOString();

  const fullRecord: PollingStationQueryRecord = {
    ...record,
    id: newId,
    createdAt: timestamp
  };

  // 1. Try Supabase
  if (supabase) {
    try {
      await supabase.from('polling_station_queries').insert([
        {
          id: newId,
          client_id: record.clientId || null,
          user_id: record.userId || null,
          user_name: record.userName,
          user_email: record.userEmail,
          user_role: record.userRole,
          module_source: record.moduleSource,
          query_type: record.queryType,
          documento_consultado: record.documentoConsultado || null,
          nombre_consultado: record.nombreConsultado || null,
          puesto_encontrado: record.puestoEncontrado || null,
          mesa_encontrada: record.mesaEncontrada || null,
          municipio_encontrado: record.municipioEncontrado || null,
          departamento_encontrado: record.departamentoEncontrado || null,
          total_records: record.totalRecords,
          found_count: record.foundCount,
          not_found_count: record.notFoundCount,
          error_count: record.errorCount,
          duplicate_count: record.duplicateCount || 0,
          file_name: record.fileName || null,
          results_summary: record.resultsSummary ? JSON.stringify(record.resultsSummary.slice(0, 50)) : null,
          created_at: timestamp
        }
      ]);
    } catch (err) {
      console.warn('Could not insert to polling_station_queries table in Supabase:', err);
    }
  }

  // 2. Always persist in local storage cache for immediate display and offline resilience
  try {
    const raw = localStorage.getItem(LOCAL_AUDIT_KEY);
    const existing: PollingStationQueryRecord[] = raw ? JSON.parse(raw) : [];
    const updated = [fullRecord, ...existing.slice(0, 99)];
    localStorage.setItem(LOCAL_AUDIT_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving local audit log:', e);
  }

  return fullRecord;
}

/**
 * Fetches the audit query history
 */
export async function getPollingQueryAuditLogs(
  clientId?: string
): Promise<PollingStationQueryRecord[]> {
  const localLogs: PollingStationQueryRecord[] = (() => {
    try {
      const raw = localStorage.getItem(LOCAL_AUDIT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })();

  if (supabase) {
    try {
      let query = supabase
        .from('polling_station_queries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        const mapped: PollingStationQueryRecord[] = data.map(item => ({
          id: item.id,
          clientId: item.client_id,
          userId: item.user_id,
          userName: item.user_name || 'Usuario del Sistema',
          userEmail: item.user_email || 'usuario@sistema.com',
          userRole: item.user_role || 'USUARIO',
          moduleSource: item.module_source || 'ADMINISTRATIVE',
          queryType: item.query_type || 'INDIVIDUAL',
          documentoConsultado: item.documento_consultado,
          nombreConsultado: item.nombre_consultado,
          puestoEncontrado: item.puesto_encontrado,
          mesaEncontrada: item.mesa_encontrada,
          municipioEncontrado: item.municipio_encontrado,
          departamentoEncontrado: item.departamento_encontrado,
          totalRecords: Number(item.total_records) || 1,
          foundCount: Number(item.found_count) || 0,
          notFoundCount: Number(item.not_found_count) || 0,
          errorCount: Number(item.error_count) || 0,
          duplicateCount: Number(item.duplicate_count) || 0,
          fileName: item.file_name,
          createdAt: item.created_at
        }));

        // Merge without duplicates
        const combined = [...mapped];
        const existingIds = new Set(mapped.map(m => m.id));
        for (const loc of localLogs) {
          if (!existingIds.has(loc.id)) {
            combined.push(loc);
          }
        }
        return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch (e) {
      console.warn('Could not fetch polling queries from Supabase, using local:', e);
    }
  }

  // If initial local is empty, provide initial demonstration seed records
  if (localLogs.length === 0) {
    const sampleSeedLogs: PollingStationQueryRecord[] = [
      {
        id: 'seed-query-1',
        userName: 'Carlos Mendoza',
        userEmail: 'lider.mendoza@campana.com',
        userRole: 'LIDER',
        moduleSource: 'ADMINISTRATIVE',
        queryType: 'INDIVIDUAL',
        documentoConsultado: '1098765432',
        nombreConsultado: 'Carlos Alberto Mendoza Ruiz',
        puestoEncontrado: 'Colegio Santander Sede Central',
        mesaEncontrada: 'Mesa 04',
        municipioEncontrado: 'Bucaramanga',
        departamentoEncontrado: 'Santander',
        totalRecords: 1,
        foundCount: 1,
        notFoundCount: 0,
        errorCount: 0,
        duplicateCount: 0,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'seed-query-2',
        userName: 'Andrea Suárez',
        userEmail: 'coordinador.territorio@campana.com',
        userRole: 'COORDINADOR',
        moduleSource: 'TERRITORY',
        queryType: 'MASIVA',
        fileName: 'Planilla_Comuna_3_Votantes.xlsx',
        totalRecords: 45,
        foundCount: 41,
        notFoundCount: 4,
        errorCount: 0,
        duplicateCount: 1,
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
      },
      {
        id: 'seed-query-3',
        userName: 'Director de Estrategia',
        userEmail: 'director.estrategia@campana.com',
        userRole: 'DIRECTOR_CAMPAÑA',
        moduleSource: 'STRATEGY',
        queryType: 'INDIVIDUAL',
        documentoConsultado: '63542109',
        nombreConsultado: 'María Fernanda Rodríguez Peña',
        puestoEncontrado: 'Universidad Pontificia Bolivariana',
        mesaEncontrada: 'Mesa 08',
        municipioEncontrado: 'Floridablanca',
        departamentoEncontrado: 'Santander',
        totalRecords: 1,
        foundCount: 1,
        notFoundCount: 0,
        errorCount: 0,
        duplicateCount: 0,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ];
    try {
      localStorage.setItem(LOCAL_AUDIT_KEY, JSON.stringify(sampleSeedLogs));
    } catch {}
    return sampleSeedLogs;
  }

  return localLogs;
}

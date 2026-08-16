import * as XLSX from 'xlsx';
import { CitizenPollingPlace } from '@/src/types';

export interface ParsedExcelRow {
  documento: string;
  nombreCompleto?: string;
  departamento?: string;
  municipio?: string;
  zona?: string;
  puestoVotacion?: string;
  direccionPuesto?: string;
  mesa?: string;
  rowIndex: number;
  isDuplicate?: boolean;
}

export interface ExcelParseResult {
  success: boolean;
  rows: ParsedExcelRow[];
  totalRows: number;
  duplicateCount: number;
  invalidCount: number;
  errorMessage?: string;
}

/**
 * Generates and triggers download of official Excel template (.xlsx)
 * with a FORMATO_CONSULTA sheet and an INSTRUCCIONES sheet.
 */
export function downloadPollingTemplate(): void {
  const wb = XLSX.utils.book_new();

  // 1. Data template sheet
  const headers = [
    'DOCUMENTO',
    'NOMBRE_COMPLETO',
    'DEPARTAMENTO',
    'MUNICIPIO',
    'ZONA',
    'PUESTO_VOTACION',
    'DIRECCION_PUESTO',
    'MESA'
  ];

  const sampleData = [
    {
      DOCUMENTO: '1098765432',
      NOMBRE_COMPLETO: 'Carlos Alberto Mendoza Ruiz',
      DEPARTAMENTO: 'Santander',
      MUNICIPIO: 'Bucaramanga',
      ZONA: 'Zona 02',
      PUESTO_VOTACION: 'Colegio Santander Sede Central',
      DIRECCION_PUESTO: 'Calle 35 # 12-40',
      MESA: 'Mesa 04'
    },
    {
      DOCUMENTO: '1098456123',
      NOMBRE_COMPLETO: 'Ana Lucía Gómez Torres',
      DEPARTAMENTO: 'Santander',
      MUNICIPIO: 'Bucaramanga',
      ZONA: 'Zona 05',
      PUESTO_VOTACION: 'Escuela República de Colombia',
      DIRECCION_PUESTO: 'Carrera 27 # 45-10',
      MESA: 'Mesa 12'
    },
    {
      DOCUMENTO: '63542109',
      NOMBRE_COMPLETO: 'María Fernanda Rodríguez',
      DEPARTAMENTO: 'Santander',
      MUNICIPIO: 'Floridablanca',
      ZONA: 'Zona 01',
      PUESTO_VOTACION: 'Universidad Pontificia Bolivariana',
      DIRECCION_PUESTO: 'Autopista a Piedecuesta Km 7',
      MESA: 'Mesa 08'
    }
  ];

  const wsData = XLSX.utils.json_to_sheet(sampleData, { header: headers });
  
  // Set custom column widths
  wsData['!cols'] = [
    { wch: 18 }, // DOCUMENTO
    { wch: 35 }, // NOMBRE_COMPLETO
    { wch: 18 }, // DEPARTAMENTO
    { wch: 20 }, // MUNICIPIO
    { wch: 15 }, // ZONA
    { wch: 38 }, // PUESTO_VOTACION
    { wch: 32 }, // DIRECCION_PUESTO
    { wch: 12 }  // MESA
  ];

  XLSX.utils.book_append_sheet(wb, wsData, 'FORMATO_CONSULTA');

  // 2. Instructions sheet
  const instructionsData = [
    { REGLA: '1. FORMATOS PERMITIDOS', DETALLE: 'Exclusivamente archivos de Microsoft Excel (.xlsx o .xls). NO se aceptan archivos CSV, PDF, TXT, Word ni imágenes.' },
    { REGLA: '2. COLUMNA OBLIGATORIA', DETALLE: 'La columna "DOCUMENTO" es la única estrictamente obligatoria. Debe contener solo números de cédula/documento, sin puntos, comas ni letras.' },
    { REGLA: '3. COLUMNAS OPCIONALES', DETALLE: 'Las columnas NOMBRE_COMPLETO, DEPARTAMENTO, MUNICIPIO, ZONA, PUESTO_VOTACION, DIRECCION_PUESTO y MESA son de referencia y serán consultadas o enriquecidas por el sistema.' },
    { REGLA: '4. DUPLICADOS', DETALLE: 'El sistema detectará automáticamente filas con cédulas repetidas dentro del archivo y las marcará como DUPLICADO.' },
    { REGLA: '5. LÍMITE DE REGISTROS', DETALLE: 'Se recomienda cargar hasta 5.000 registros por archivo para un óptimo rendimiento en la consulta y descarga.' },
    { REGLA: '6. ENCABEZADOS', DETALLE: 'No modifique ni elimine la primera fila de encabezados para garantizar la correcta lectura de las columnas.' }
  ];

  const wsInstructions = XLSX.utils.json_to_sheet(instructionsData);
  wsInstructions['!cols'] = [
    { wch: 28 },
    { wch: 80 }
  ];

  XLSX.utils.book_append_sheet(wb, wsInstructions, 'INSTRUCCIONES');

  // Download
  XLSX.writeFile(wb, 'Formato_Consulta_Lugar_Votacion.xlsx');
}

/**
 * Validates and parses an uploaded Excel file (.xlsx / .xls only)
 */
export async function parsePollingExcelFile(file: File): Promise<ExcelParseResult> {
  const fileName = file.name.toLowerCase();
  
  // 1. Strict extension validation
  if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
    return {
      success: false,
      rows: [],
      totalRows: 0,
      duplicateCount: 0,
      invalidCount: 0,
      errorMessage: `Formato de archivo "${file.name}" no permitido. Únicamente se aceptan hojas de cálculo de Excel (.xlsx, .xls).`
    };
  }

  // 2. File size validation (Max 15MB)
  const MAX_SIZE = 15 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return {
      success: false,
      rows: [],
      totalRows: 0,
      duplicateCount: 0,
      invalidCount: 0,
      errorMessage: `El archivo supera el tamaño máximo permitido de 15MB.`
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return {
        success: false,
        rows: [],
        totalRows: 0,
        duplicateCount: 0,
        invalidCount: 0,
        errorMessage: 'El libro de Excel no contiene hojas válidas o está vacío.'
      };
    }

    // Prefer sheet named 'FORMATO_CONSULTA' or first sheet
    const targetSheetName = workbook.SheetNames.find(s => s.toUpperCase().includes('CONSULTA') || s.toUpperCase().includes('FORMATO') || s.toUpperCase().includes('DATOS')) || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[targetSheetName];

    if (!worksheet) {
      return {
        success: false,
        rows: [],
        totalRows: 0,
        duplicateCount: 0,
        invalidCount: 0,
        errorMessage: 'No se pudo leer la hoja de datos del archivo Excel.'
      };
    }

    // Convert to JSON
    const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (rawRows.length === 0) {
      return {
        success: false,
        rows: [],
        totalRows: 0,
        duplicateCount: 0,
        invalidCount: 0,
        errorMessage: 'El archivo Excel no contiene filas de datos para procesar.'
      };
    }

    // Normalize keys to find document column
    const sampleRow = rawRows[0];
    const keys = Object.keys(sampleRow);
    
    // Find Document Key
    const docKey = keys.find(k => {
      const normalized = k.trim().toUpperCase().replace(/[^A-Z]/g, '');
      return normalized === 'DOCUMENTO' || normalized === 'CEDULA' || normalized === 'IDENTIFICACION' || normalized === 'DOC' || normalized === 'CC';
    });

    if (!docKey) {
      return {
        success: false,
        rows: [],
        totalRows: rawRows.length,
        duplicateCount: 0,
        invalidCount: rawRows.length,
        errorMessage: 'El archivo no contiene la columna obligatoria "DOCUMENTO" (o "CEDULA"). Por favor descargue el formato de ejemplo.'
      };
    }

    // Helper to find column loosely
    const findKey = (candidates: string[]) => {
      return keys.find(k => {
        const normalized = k.trim().toUpperCase().replace(/[^A-Z]/g, '');
        return candidates.some(c => normalized.includes(c));
      });
    };

    const nameKey = findKey(['NOMBRECOMPLETO', 'NOMBRE', 'NOMBRES', 'CIUDADANO']);
    const deptoKey = findKey(['DEPARTAMENTO', 'DEPTO']);
    const munKey = findKey(['MUNICIPIO', 'CIUDAD']);
    const zonaKey = findKey(['ZONA', 'COMUNA', 'SECTOR']);
    const puestoKey = findKey(['PUESTOVOTACION', 'PUESTO', 'LUGARVOTACION', 'LUGAR']);
    const dirKey = findKey(['DIRECCIONPUESTO', 'DIRECCION', 'DIR']);
    const mesaKey = findKey(['MESA', 'MESANUMERO']);

    const seenDocs = new Set<string>();
    const parsedRows: ParsedExcelRow[] = [];
    let duplicateCount = 0;
    let invalidCount = 0;

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const rawDoc = String(row[docKey] || '').trim();
      // Clean document (remove dots, commas, spaces)
      const cleanDoc = rawDoc.replace(/[\.\,\s\-]/g, '');

      if (!cleanDoc || isNaN(Number(cleanDoc)) || cleanDoc.length < 4) {
        invalidCount++;
        continue;
      }

      const isDuplicate = seenDocs.has(cleanDoc);
      if (isDuplicate) {
        duplicateCount++;
      } else {
        seenDocs.add(cleanDoc);
      }

      parsedRows.push({
        documento: cleanDoc,
        nombreCompleto: nameKey ? String(row[nameKey] || '').trim() : '',
        departamento: deptoKey ? String(row[deptoKey] || '').trim() : '',
        municipio: munKey ? String(row[munKey] || '').trim() : '',
        zona: zonaKey ? String(row[zonaKey] || '').trim() : '',
        puestoVotacion: puestoKey ? String(row[puestoKey] || '').trim() : '',
        direccionPuesto: dirKey ? String(row[dirKey] || '').trim() : '',
        mesa: mesaKey ? String(row[mesaKey] || '').trim() : '',
        rowIndex: i + 2, // +2 accounting for 1-based index and header row
        isDuplicate
      });
    }

    if (parsedRows.length === 0) {
      return {
        success: false,
        rows: [],
        totalRows: rawRows.length,
        duplicateCount: 0,
        invalidCount,
        errorMessage: 'No se encontraron documentos válidos en el archivo Excel.'
      };
    }

    return {
      success: true,
      rows: parsedRows,
      totalRows: rawRows.length,
      duplicateCount,
      invalidCount
    };

  } catch (err: any) {
    console.error('Error parsing Excel:', err);
    return {
      success: false,
      rows: [],
      totalRows: 0,
      duplicateCount: 0,
      invalidCount: 0,
      errorMessage: err.message || 'Error al procesar el archivo Excel. Verifique que no esté dañado o protegido.'
    };
  }
}

/**
 * Exports processed polling station results to an Excel spreadsheet (.xlsx)
 */
export function exportPollingResultsToExcel(results: CitizenPollingPlace[], customFilename?: string): void {
  const wb = XLSX.utils.book_new();

  const exportData = results.map(r => ({
    DOCUMENTO: r.documento,
    NOMBRE_COMPLETO: r.nombreCompleto || 'No registrado',
    DEPARTAMENTO: r.departamento || 'N/A',
    MUNICIPIO: r.municipio || 'N/A',
    ZONA: r.zona || 'N/A',
    PUESTO_VOTACION: r.puestoVotacion || 'N/A',
    DIRECCION_PUESTO: r.direccionPuesto || 'N/A',
    MESA: r.mesa || 'N/A',
    ESTADO_CONSULTA: r.estadoConsulta,
    DETALLE_OBSERVACION: r.mensajeError || (r.estadoConsulta === 'ENCONTRADO' ? 'Puesto y mesa validados' : 'Sin datos')
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);

  ws['!cols'] = [
    { wch: 18 }, // DOCUMENTO
    { wch: 35 }, // NOMBRE_COMPLETO
    { wch: 18 }, // DEPARTAMENTO
    { wch: 20 }, // MUNICIPIO
    { wch: 15 }, // ZONA
    { wch: 38 }, // PUESTO_VOTACION
    { wch: 32 }, // DIRECCION_PUESTO
    { wch: 12 }, // MESA
    { wch: 18 }, // ESTADO_CONSULTA
    { wch: 35 }  // DETALLE_OBSERVACION
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'RESULTADOS_CONSULTA');

  const filename = customFilename || `Resultados_Lugar_Votacion_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
}

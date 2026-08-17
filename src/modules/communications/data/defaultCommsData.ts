import { 
  MediaPiece, 
  SocialChannel, 
  ContentItem, 
  Spokesperson, 
  TalkingPoint, 
  PublicIntervention,
  TrendDataPoint,
  TopicSentiment
} from '@/src/types/communications';

export const INITIAL_MEDIA_PIECES: MediaPiece[] = [
  {
    id: 'mp-01',
    title: 'Lanzamiento del Plan Integral de Seguridad y Cuadrantes Digitales',
    mediaType: 'prensa',
    targetOutlet: 'El Tiempo & Portafolio',
    pieceType: 'comunicado',
    date: '2026-08-14',
    responsible: 'María Camila Restrepo (Dir. Prensa)',
    status: 'publicado',
    url: 'https://eltiempo.com/politica/elecciones-2026/plan-seguridad-propuesta',
    estimatedReach: 240000,
    sentiment: 'positivo',
    keyMessage: 'Cero tolerancia al crimen con tecnología PostGIS, cámaras analíticas e iluminación LED en los 120 barrios críticos.',
    notes: 'Gran tracción en redes, portada en edición digital regional.',
    createdAt: '2026-08-12T10:00:00Z'
  },
  {
    id: 'mp-02',
    title: 'Entrevista en vivo: Debate sobre Reactivación Económica y Alivios Tributarios para Pymes',
    mediaType: 'radio',
    targetOutlet: 'Caracol Radio - 6AM Hoy por Hoy',
    pieceType: 'entrevista',
    date: '2026-08-16',
    responsible: 'Dr. Santiago Pérez (Candidato)',
    status: 'publicado',
    url: 'https://caracol.com.co/programas/6am-hoy-por-hoy/entrevista-santiago-perez',
    estimatedReach: 480000,
    sentiment: 'positivo',
    keyMessage: 'Creación del Fondo Capital Semilla y exención predial a empresas generadoras de empleo juvenil durante 3 años.',
    notes: 'Se posicionó la etiqueta #SantiagoGeneraEmpleo.',
    createdAt: '2026-08-15T08:30:00Z'
  },
  {
    id: 'mp-03',
    title: 'Columna de Opinión: La Transformación Educativa y el Distrito Tecnológico que Soñamos',
    mediaType: 'digital',
    targetOutlet: 'La Silla Vacía / Las2Orillas',
    pieceType: 'columna',
    date: '2026-08-18',
    responsible: 'Dra. Elena Mosquera (Jefa de Programa de Gobierno)',
    status: 'enviado',
    url: '',
    estimatedReach: 95000,
    sentiment: 'positivo',
    keyMessage: 'Bilingüismo desde transición y 15.000 becas en programación e IA para jóvenes en comunas vulnerables.',
    notes: 'Aprobado por el comité editorial de la campaña.',
    createdAt: '2026-08-16T14:00:00Z'
  },
  {
    id: 'mp-04',
    title: 'Rueda de Prensa: Posición Oficial y Alerta Temprana ante el Estado Crítico de la Malla Vial',
    mediaType: 'tv',
    targetOutlet: 'Telemedellín & Canal RCN',
    pieceType: 'rueda_prensa',
    date: '2026-08-20',
    responsible: 'Ing. Carlos Barrientos (Coordinador Infraestructura)',
    status: 'revision',
    url: '',
    estimatedReach: 320000,
    sentiment: 'neutro',
    keyMessage: 'Plan de choque de 100 días para repavimentación y auditoría forense a contratos de valorización suspendidos.',
    notes: 'Convocatoria enviada a 35 periodistas acreditados.',
    createdAt: '2026-08-17T09:00:00Z'
  },
  {
    id: 'mp-05',
    title: 'Nota de Prensa: Compromiso con las Madres Cabeza de Hogar y Casas Refugio 24/7',
    mediaType: 'digital',
    targetOutlet: 'Revista Semana & Publimetro',
    pieceType: 'nota_prensa',
    date: '2026-08-22',
    responsible: 'Lic. Patricia Salazar (Vocera Género e Inclusión)',
    status: 'borrador',
    url: '',
    estimatedReach: 140000,
    sentiment: 'positivo',
    keyMessage: 'Red municipal de cuidado infantil gratuito para que las madres puedan estudiar y trabajar sin costo.',
    notes: 'En redacción final con el equipo social.',
    createdAt: '2026-08-17T11:00:00Z'
  }
];

export const INITIAL_SOCIAL_CHANNELS: SocialChannel[] = [
  {
    id: 'ch-x',
    platform: 'x',
    handle: '@SantiagoPerezCol',
    name: 'Santiago Pérez (Oficial X)',
    isConnected: true,
    followers: 68400,
    followerGrowth: 18.4,
    engagementRate: 5.6,
    totalReach: 420000,
    lastSync: 'Hace 10 minutos',
    accountStatus: 'active'
  },
  {
    id: 'ch-instagram',
    platform: 'instagram',
    handle: '@santiagoperez.co',
    name: 'Santiago Pérez en Instagram',
    isConnected: true,
    followers: 112500,
    followerGrowth: 24.1,
    engagementRate: 6.8,
    totalReach: 780000,
    lastSync: 'Hace 5 minutos',
    accountStatus: 'active'
  },
  {
    id: 'ch-facebook',
    platform: 'facebook',
    handle: 'SantiagoPerezCampaña',
    name: 'Página Oficial Facebook',
    isConnected: true,
    followers: 89300,
    followerGrowth: 9.2,
    engagementRate: 3.9,
    totalReach: 510000,
    lastSync: 'Hace 15 minutos',
    accountStatus: 'active'
  },
  {
    id: 'ch-tiktok',
    platform: 'tiktok',
    handle: '@santiagoperez_ok',
    name: 'TikTok Generación de Futuro',
    isConnected: true,
    followers: 145000,
    followerGrowth: 41.5,
    engagementRate: 11.2,
    totalReach: 1240000,
    lastSync: 'Hace 2 minutos',
    accountStatus: 'active'
  },
  {
    id: 'ch-youtube',
    platform: 'youtube',
    handle: '@SantiagoPerezGobernanza',
    name: 'Canal de Propuestas & Podcasts',
    isConnected: true,
    followers: 23400,
    followerGrowth: 12.0,
    engagementRate: 4.1,
    totalReach: 180000,
    lastSync: 'Hace 1 hora',
    accountStatus: 'active'
  },
  {
    id: 'ch-whatsapp',
    platform: 'whatsapp',
    handle: '+57 312 890 2026',
    name: 'Línea Ciudadana & Red Voluntarios',
    isConnected: true,
    followers: 18200,
    followerGrowth: 31.0,
    engagementRate: 28.4,
    totalReach: 65000,
    lastSync: 'En tiempo real',
    accountStatus: 'active'
  }
];

export const INITIAL_CONTENT_ITEMS: ContentItem[] = [
  {
    id: 'cnt-01',
    title: 'Carrusel de 5 Pilares: Seguridad con Ojos en la Calle',
    copy: '¡La seguridad de nuestras familias no se improvisa! Con cámaras de reconocimiento facial y drones de vigilancia 24/7 devolveremos la tranquilidad a nuestros barrios. Conoce aquí nuestras 5 metas concretas. 🛡️🇨🇴',
    hashtags: ['#SeguridadYa', '#SantiagoCumple', '#CampañaGanadora', '#TerritorioSeguro'],
    channels: ['instagram', 'facebook', 'x'],
    stage: 'publicado',
    scheduledDate: '2026-08-15',
    scheduledTime: '18:00',
    approver: 'Felipe Jaramillo (Director Estrategia)',
    author: 'Daniela Toro (Community Manager)',
    mediaType: 'carrusel',
    mediaUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    tone: 'Firme e Inspirador',
    targetAudience: 'Familias, Comerciantes, Adultos 28-60 años',
    metrics: { reach: 89400, likes: 7230, comments: 642, shares: 1240 },
    createdAt: '2026-08-14T15:00:00Z'
  },
  {
    id: 'cnt-02',
    title: 'Reel/TikTok: Recorrido en Comuna 4 - Escuchando a los Emprendedores',
    copy: 'Caminar, escuchar y solucionar. Hoy en la Plaza de Mercado conocimos historias de lucha de mujeres que sacan adelante su hogar. Nuestro compromiso: cero trámites absurdos y créditos a tasa preferencial. 🚀',
    hashtags: ['#EmprendeConSantiago', '#GenteTrabajadora', '#EnLaCalle', '#TuVozCuenta'],
    channels: ['tiktok', 'instagram'],
    stage: 'programado',
    scheduledDate: '2026-08-17',
    scheduledTime: '19:30',
    approver: 'María Camila Restrepo',
    author: 'Daniela Toro',
    mediaType: 'reel',
    mediaUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    tone: 'Cercano y Humano',
    targetAudience: 'Jóvenes y Trabajadores independientes',
    createdAt: '2026-08-16T11:00:00Z'
  },
  {
    id: 'cnt-03',
    title: 'Hilo en X: Desmontando mitos sobre el presupuesto de salud municipal',
    copy: '1/6 🧵 Es falso que el presupuesto de salud se vaya a recortar. Al contrario: destinaremos 18% más de recursos directos a los centros de salud barriales para que no falten medicamentos ni citas oportunas. Aquí los datos oficiales 👇',
    hashtags: ['#SaludDigna', '#LaVerdadDeFrente', '#SantiagoPerez', '#CampañaLimpia'],
    channels: ['x'],
    stage: 'aprobacion',
    scheduledDate: '2026-08-18',
    scheduledTime: '08:00',
    approver: 'Felipe Jaramillo',
    author: 'Mateo Osorio (Estratega Digital)',
    mediaType: 'hilo',
    tone: 'Técnico y Contundente',
    targetAudience: 'Líderes de opinión, Profesionales de la salud',
    aiGenerated: true,
    createdAt: '2026-08-17T08:00:00Z'
  },
  {
    id: 'cnt-04',
    title: 'Infografía: 10.000 Becas Universitarias de Tecnología e IA',
    copy: 'El futuro de nuestra juventud está en la ciencia y la innovación. Con el programa "Talento Digital 2026" capacitaremos a bachilleres con empleo asegurado en empresas internacionales. ¡Comparte y etiqueta a tu amigo que quiere estudiar! 💻✨',
    hashtags: ['#TalentoDigital', '#EducacionGratuita', '#JuventudAlPoder', '#OportunidadesReales'],
    channels: ['facebook', 'instagram', 'whatsapp'],
    stage: 'diseno',
    scheduledDate: '2026-08-19',
    scheduledTime: '12:00',
    approver: 'Pendiente',
    author: 'Daniela Toro',
    mediaType: 'imagen',
    tone: 'Esperanzador y Dinámico',
    targetAudience: 'Jóvenes de 16 a 28 años y padres de familia',
    createdAt: '2026-08-17T09:30:00Z'
  },
  {
    id: 'cnt-05',
    title: 'Video Testimonial: Historia de Doña Rosalba y el nuevo comedor comunitario',
    copy: 'Las obras deben transformar vidas reales. Doña Rosalba nos cuenta cómo un comedor comunitario salvó la nutrición de 80 abuelitos de su sector. Con Santiago, multiplicaremos estos centros por toda la ciudad.',
    hashtags: ['#HistoriasQueInspiran', '#AdultoMayor', '#CuidadoTotal'],
    channels: ['youtube', 'facebook'],
    stage: 'idea',
    scheduledDate: '2026-08-21',
    scheduledTime: '17:00',
    approver: 'Pendiente',
    author: 'Mateo Osorio',
    mediaType: 'video',
    tone: 'Emotivo y Solidario',
    targetAudience: 'Comunidades barriales y adultos mayores',
    createdAt: '2026-08-17T10:15:00Z'
  }
];

export const INITIAL_SPOKESPERSONS: Spokesperson[] = [
  {
    id: 'spk-01',
    fullName: 'Dr. Santiago Pérez Ospina',
    role: 'Candidato Principal',
    authorizedTopics: ['Estrategia General', 'Economía & Empleo', 'Grandes Obras de Infraestructura', 'Lucha Anticorrupción'],
    phone: '+57 300 450 1122',
    email: 'candidato@santiagoperez.co',
    status: 'activo',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    interventionsCount: 28,
    mediaRating: 4.9
  },
  {
    id: 'spk-02',
    fullName: 'Dra. Elena Mosquera Garcés',
    role: 'Jefa de Programa de Gobierno & Educación',
    authorizedTopics: ['Educación y Cultura', 'Primera Infancia', 'Salud Pública', 'Políticas de Mujer'],
    phone: '+57 311 678 9900',
    email: 'elena.mosquera@campanaganadora.co',
    status: 'activo',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    interventionsCount: 16,
    mediaRating: 4.8
  },
  {
    id: 'spk-03',
    fullName: 'Coronel (R) Andrés Giraldo',
    role: 'Asesor Principal de Seguridad & Convivencia',
    authorizedTopics: ['Seguridad Ciudadana', 'Tecnología Policial', 'Prevención del Delito', 'Control Territorial'],
    phone: '+57 314 555 7821',
    email: 'seguridad@campanaganadora.co',
    status: 'activo',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    interventionsCount: 12,
    mediaRating: 4.7
  },
  {
    id: 'spk-04',
    fullName: 'Lic. Patricia Salazar',
    role: 'Vocera de Inclusión Social y Juventud',
    authorizedTopics: ['Juventud & Empleo Joven', 'Comunidades Étnicas & LGBTIQ+', 'Deporte Comunitario'],
    phone: '+57 318 420 1199',
    email: 'juventudes@campanaganadora.co',
    status: 'activo',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    interventionsCount: 9,
    mediaRating: 4.6
  }
];

export const INITIAL_TALKING_POINTS: TalkingPoint[] = [
  {
    id: 'tp-01',
    topic: 'Seguridad Ciudadana y Cuadrantes Inteligentes',
    keyMessage: 'La seguridad es un derecho fundamental que recuperaremos con autoridad, alta tecnología e inversión social focalizada.',
    supportingArguments: [
      'Implementación de 2.000 cámaras analíticas con reconocimiento facial e inteligencia artificial.',
      'Aumento del pie de fuerza en puntos calientes georreferenciados mediante mapa de calor delictivo.',
      'Centros de Atención Inmediata (CAI) móviles en cada comuna y corregimiento.'
    ],
    crisisResponses: [
      'Si cuestionan la militarización: Explicar que la estrategia es 100% preventiva y tecnológica, no de represión indiscriminada.',
      'Si mencionan el costo del sistema: Puntualizar que se financiará con ahorros del recorte a burocracia innecesaria.'
    ],
    forbiddenPhrases: [
      '"Mano dura sin ley"',
      '"La delincuencia está ganada"',
      '"No podemos garantizar resultados inmediatos"'
    ],
    targetAudience: 'Comerciantes, familias de estratos 1, 2 y 3, transportadores.',
    lastUpdated: '2026-08-16'
  },
  {
    id: 'tp-02',
    topic: 'Desarrollo Económico, Empleo y Emprendimiento',
    keyMessage: 'Haremos de nuestra ciudad la capital del emprendimiento con menos impuestos a quien genere trabajo formal.',
    supportingArguments: [
      'Fondo Capital Semilla con $20.000 millones no reembolsables para microempresas barriales.',
      'Cero cobro de predial por 3 años a industrias que contraten jóvenes egresados.',
      'Ventanilla Única Digital para abrir un negocio en menos de 24 horas sin intermediarios.'
    ],
    crisisResponses: [
      'Si acusan favoritismo empresarial: Resaltar que el 80% de los alivios va a micro y pequeñas tiendas de barrio.'
    ],
    forbiddenPhrases: [
      '"Subiremos impuestos para financiarlo"',
      '"El desempleo es un problema nacional inevitable"'
    ],
    targetAudience: 'Pymes, jóvenes universitarios, tenderos y vendedores informales en transición.',
    lastUpdated: '2026-08-15'
  },
  {
    id: 'tp-03',
    topic: 'Salud Oportuna y Hospitales Barriales',
    keyMessage: 'Ningún ciudadano debe madrugar a las 3 a.m. por una ficha médica ni esperar meses por un examen prioritario.',
    supportingArguments: [
      'Citas médicas digitales por WhatsApp con tiempo máximo de espera de 72 horas.',
      'Farmacias satélite en puestos de salud para entrega a domicilio de medicamentos a adultos mayores.',
      'Brigadas médicas móviles permanentes en las 5 zonas rurales y corregimientos.'
    ],
    crisisResponses: [
      'Si alegan crisis de EPS: Enfatizar que fortaleceremos la red pública hospitalaria municipal directamente.'
    ],
    forbiddenPhrases: [
      '"El sistema nacional de salud no nos permite actuar"',
      '"Es culpa de los usuarios por saturar urgencias"'
    ],
    targetAudience: 'Adultos mayores, madres gestantes, personas con enfermedades crónicas.',
    lastUpdated: '2026-08-14'
  }
];

export const INITIAL_PUBLIC_INTERVENTIONS: PublicIntervention[] = [
  {
    id: 'int-01',
    spokespersonId: 'spk-01',
    spokespersonName: 'Dr. Santiago Pérez Ospina',
    outletName: 'Caracol Radio - 6AM Hoy por Hoy',
    mediaType: 'radio',
    date: '2026-08-16',
    topic: 'Debate Central sobre Reactivación Económica y Alivios',
    sentiment: 'positivo',
    summary: 'Presentación sólida de la propuesta de empleo juvenil. El periodista Gustavo Gómez destacó la viabilidad fiscal.',
    impactReach: 480000,
    recordingUrl: 'https://caracol.com.co/audios/debate-reactivacion-perez'
  },
  {
    id: 'int-02',
    spokespersonId: 'spk-02',
    spokespersonName: 'Dra. Elena Mosquera Garcés',
    outletName: 'Teleantioquia Noticias - Edición Central',
    mediaType: 'tv',
    date: '2026-08-14',
    topic: 'Infraestructura Educativa y Jornada Única Integral',
    sentiment: 'positivo',
    summary: 'Entrevista de 8 minutos en estudio. Se exhibieron infografías del plan de colegios bilingües con gran recepción.',
    impactReach: 210000,
    recordingUrl: 'https://teleantioquia.co/noticias/entrevista-elena-mosquera'
  },
  {
    id: 'int-03',
    spokespersonId: 'spk-03',
    spokespersonName: 'Coronel (R) Andrés Giraldo',
    outletName: 'Blu Radio - Mañanas Blu',
    mediaType: 'radio',
    date: '2026-08-13',
    topic: 'Frente contra la Extorsión y Seguridad en Plazas',
    sentiment: 'neutro',
    summary: 'Debate con voceros gremiales. Se mantuvo la línea firme y se presentó el plan de cuadrantes de proximidad.',
    impactReach: 175000
  },
  {
    id: 'int-04',
    spokespersonId: 'spk-04',
    spokespersonName: 'Lic. Patricia Salazar',
    outletName: 'Foro Ciudadano Universidad del Valle',
    mediaType: 'foro',
    date: '2026-08-11',
    topic: 'Inclusión Laboral y Becas Universitarias de Tecnología',
    sentiment: 'positivo',
    summary: 'Auditorio lleno con más de 600 estudiantes universitarios. Fuerte ovación a la propuesta de subsidio de transporte.',
    impactReach: 45000
  }
];

export const WEEKLY_TREND_DATA: TrendDataPoint[] = [
  { period: 'Sem 28', mentions: 145, reach: 380000, sentimentScore: 78 },
  { period: 'Sem 29', mentions: 210, reach: 520000, sentimentScore: 82 },
  { period: 'Sem 30', mentions: 340, reach: 790000, sentimentScore: 85 },
  { period: 'Sem 31', mentions: 480, reach: 1150000, sentimentScore: 81 },
  { period: 'Sem 32', mentions: 620, reach: 1640000, sentimentScore: 88 },
  { period: 'Sem 33 (Actual)', mentions: 785, reach: 2180000, sentimentScore: 91 }
];

export const TOPIC_SENTIMENTS: TopicSentiment[] = [
  { topic: 'Seguridad y Convivencia', mentions: 412, sentiment: 'positivo', percentage: 76 },
  { topic: 'Empleo & Emprendimiento', mentions: 335, sentiment: 'positivo', percentage: 84 },
  { topic: 'Educación & Becas IA', mentions: 280, sentiment: 'positivo', percentage: 92 },
  { topic: 'Salud & Medicamentos', mentions: 210, sentiment: 'positivo', percentage: 79 },
  { topic: 'Malla Vial & Transporte', mentions: 165, sentiment: 'neutro', percentage: 61 },
  { topic: 'Medio Ambiente & Cuencas', mentions: 98, sentiment: 'positivo', percentage: 87 }
];

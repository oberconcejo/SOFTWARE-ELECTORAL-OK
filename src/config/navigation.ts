import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  Target, 
  BarChart3, 
  FileText, 
  Settings, 
  UserCircle, 
  Calendar,
  MessageSquare,
  DollarSign,
  Vote,
  Database
} from 'lucide-react';
import { UserRole } from '../types';

export interface NavItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  roles?: UserRole[];
  permissions?: string[];
  description?: string;
  moduleCode?: string;
  children?: NavItem[];
}

export const navigationConfig: NavItem[] = [
  {
    id: 'territory',
    label: 'Territorio',
    icon: MapPin,
    path: '/app/territory',
    moduleCode: 'TERRITORY',
    description: 'Georreferenciación y censo'
  },
  {
    id: 'strategy',
    label: 'Estrategia',
    icon: Target,
    path: '/app/strategy',
    moduleCode: 'STRATEGY',
    description: 'Planificación y metas de campaña'
  },
  {
    id: 'consulta-lugar-votacion',
    label: 'Consulta lugar de votación',
    icon: MapPin,
    path: '/app/consulta-lugar-votacion',
    description: 'Búsqueda transversal de puestos y mesas de votación'
  },
  {
    id: 'crm',
    label: 'CRM Electoral',
    icon: Users,
    path: '/app/crm',
    moduleCode: 'CRM',
    description: 'Gestión de votantes y líderes'
  },
  {
    id: 'electoral',
    label: 'Electoral (E14)',
    icon: Vote,
    path: '/app/electoral',
    moduleCode: 'ELECTORAL',
    description: 'Validación de actas y escrutinio'
  },
  {
    id: 'analysis',
    label: 'Análisis',
    icon: BarChart3,
    path: '/app/analysis',
    moduleCode: 'ANALYSIS',
    description: 'Sondeos y análisis de datos'
  },
  {
    id: 'communications',
    label: 'Comunicaciones',
    icon: MessageSquare,
    path: '/app/communications',
    moduleCode: 'COMMUNICATIONS',
    description: 'Redes sociales y prensa'
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: Settings,
    path: '/app/settings',
    description: 'Ajustes del sistema'
  }
];

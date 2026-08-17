export type MediaType = 'digital' | 'prensa' | 'radio' | 'tv' | 'podcast' | 'agencia';
export type MediaPieceType = 'nota_prensa' | 'comunicado' | 'columna' | 'entrevista' | 'rueda_prensa' | 'declaracion';
export type MediaPieceStatus = 'borrador' | 'revision' | 'enviado' | 'publicado' | 'archivado';
export type SentimentType = 'positivo' | 'neutro' | 'critico';

export interface MediaPiece {
  id: string;
  title: string;
  mediaType: MediaType;
  targetOutlet: string;
  pieceType: MediaPieceType;
  date: string; // YYYY-MM-DD
  responsible: string;
  status: MediaPieceStatus;
  url?: string;
  estimatedReach: number;
  sentiment: SentimentType;
  keyMessage: string;
  notes?: string;
  createdAt: string;
}

export type SocialPlatform = 'facebook' | 'instagram' | 'x' | 'tiktok' | 'youtube' | 'whatsapp' | 'telegram';

export interface SocialChannel {
  id: string;
  platform: SocialPlatform;
  handle: string;
  name: string;
  isConnected: boolean;
  followers: number;
  followerGrowth: number; // e.g. 12.5%
  engagementRate: number; // e.g. 4.2%
  totalReach: number;
  lastSync: string;
  accountStatus: 'active' | 'warning' | 'disconnected';
}

export type KanbanStage = 'idea' | 'diseno' | 'aprobacion' | 'programado' | 'publicado';
export type ContentMediaType = 'imagen' | 'video' | 'carrusel' | 'reel' | 'hilo' | 'texto';

export interface ContentItem {
  id: string;
  title: string;
  copy: string;
  hashtags: string[];
  channels: SocialPlatform[];
  stage: KanbanStage;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  approver: string;
  author: string;
  mediaType: ContentMediaType;
  mediaUrl?: string;
  tone: string;
  targetAudience: string;
  metrics?: {
    reach: number;
    likes: number;
    comments: number;
    shares: number;
  };
  aiGenerated?: boolean;
  createdAt: string;
}

export interface Spokesperson {
  id: string;
  fullName: string;
  role: string;
  authorizedTopics: string[];
  phone: string;
  email: string;
  status: 'activo' | 'entrenamiento' | 'restringido';
  avatarUrl?: string;
  interventionsCount: number;
  mediaRating: number; // 1 to 5
}

export interface TalkingPoint {
  id: string;
  topic: string;
  keyMessage: string;
  supportingArguments: string[];
  crisisResponses: string[];
  forbiddenPhrases: string[];
  targetAudience: string;
  lastUpdated: string;
}

export interface PublicIntervention {
  id: string;
  spokespersonId: string;
  spokespersonName: string;
  outletName: string;
  mediaType: 'radio' | 'tv' | 'prensa' | 'digital' | 'foro';
  date: string;
  topic: string;
  sentiment: SentimentType;
  summary: string;
  impactReach: number;
  recordingUrl?: string;
}

export interface CommsKPIs {
  totalReach: number;
  mediaMentions: number;
  positiveSentimentPct: number;
  neutralSentimentPct: number;
  negativeSentimentPct: number;
  scheduledPosts: number;
  publishedPosts: number;
  totalEngagement: number;
}

export interface TrendDataPoint {
  period: string; // e.g. "Sem 1", "Sem 2"
  mentions: number;
  reach: number;
  sentimentScore: number;
}

export interface TopicSentiment {
  topic: string;
  mentions: number;
  sentiment: 'positivo' | 'neutro' | 'critico';
  percentage: number;
}

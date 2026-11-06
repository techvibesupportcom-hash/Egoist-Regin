export type StatKey = 'tiro' | 'defensa' | 'velocidad' | 'regate' | 'pase' | 'iq';

export interface CharacterStats {
  tiro: number;
  defensa: number;
  velocidad: number;
  regate: number;
  pase: number;
  iq: number;
}

export interface ProgressStats {
  nivel: number;
  valorMercado: number;
  victorias: number;
  derrotas: number;
  empates: number;
  goles: number;
  robos: number;
  asistencias: number;
  mvp: number;
}

export interface SkillBuff {
  nombre: string;
  descripcion: string;
  buffTexto: string;
  statsElegidas: StatKey[];
  duracion: number;
  usos: number;
}

export interface FlowAbility {
  nombre: string;
  buffTexto: string;
  statsElegidas: StatKey[];
  buffPredeterminadoTexto: string;
  statsPredeterminadas: StatKey[];
  duracion: number;
  usos: number;
}

export interface CharacterSheet {
  id: string;
  userId: string;
  nombre: string;
  apodo: string;
  edad: number;
  piernaDominante: 'Diestra' | 'Zurda' | 'Ambidextra';
  nacionalidad: string;
  posicionPrincipal: 'ST' | 'RW' | 'LW' | 'CM' | 'DMF' | 'CAM' | 'CB' | 'LB' | 'RB' | 'GK';
  clubEstado: string;
  clubId?: string;
  arma: string;
  avatarUrl: string;

  // Habilidades
  habilidad1: SkillBuff;
  habilidad2: SkillBuff;
  pasiva: SkillBuff;
  preFlow: SkillBuff;
  flow: FlowAbility;

  // Estadísticas (30 iniciales)
  stats: CharacterStats;

  // Progreso
  progreso: ProgressStats;

  // Perfil del PJ
  personalidad: string;
  historia: string;
  motivacion: string;

  // Datos del Usuario
  nombreUsser: string;
  edadUsuario: number;
  pais: string;
  zonaHoraria: string;
  pruebaRol: string;
  compromiso: string;

  // Administración
  status: 'pendiente' | 'aprobado' | 'rechazado';
  adminComentario?: string;
  adminRevisor?: string;
  revisadoAt?: string;
  iaEvaluacion?: {
    aprobadoRecomendado: boolean;
    score: number;
    observaciones: string[];
    resumen: string;
  };

  renacimientos: number;
  habilidadesOculares: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ClubMember {
  id: string;
  nombre: string;
  rol: string;
  posicion: string;
  valorMercado: number;
  avatarUrl?: string;
}

export interface ChemicalReaction {
  nombre: string;
  participanteA: string;
  participanteB: string;
  requisito: string;
  efecto: string;
}

export interface Club {
  id: string;
  nombre: string;
  lider: string;
  liderKey?: string;
  icono: string;
  color: string;
  descripcion: string;
  nivelPrestigio: number;
  puntosPrestigio: number;
  tesoreria: number;
  limiteMiembros: number;
  miembros: ClubMember[];
  reaccionesQuimicas: ChemicalReaction[];
  partidosGanados: number;
}

export interface RankingPlayer {
  id: string;
  posicion: number;
  nombre: string;
  apodo?: string;
  posicionRol: string;
  club: string;
  valorMercado: number;
  nivel: number;
  goles: number;
  asistencias: number;
  robos: number;
  mvp: number;
  victorias: number;
  derrotas: number;
  empates: number;
  avatarUrl: string;
  sheetId?: string;
  isCustom?: boolean;
}

export interface TrainingItemSubmission {
  id: string;
  userId: string;
  sheetId: string;
  playerName: string;
  clubNombre?: string;
  fecha: string;
  gym: boolean; // 30 pts
  cancha: boolean; // 30 pts
  rolSocial: boolean; // 10 pts
  instagram: boolean; // 10 pts
  actividades: boolean; // 20 pts
  totalPuntos: number;
  distribucionStats: CharacterStats;
  comprobanteTexto: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  adminNota?: string;
  aprobadoPor?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  titulo: string;
  mensaje: string;
  tipo: 'aprobacion' | 'rechazo' | 'mercado' | 'club' | 'sistema';
  fecha: string;
  leido: boolean;
}

export interface UserSession {
  id: string;
  username: string;
  role: 'admin' | 'club_leader' | 'player';
  adminKey?: 'chinatsu' | 'poseidon' | 'sae' | 'nagi' | 'fuji';
  clubId?: string;
  sheetId?: string;
}

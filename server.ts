import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { CharacterSheet, Club, RankingPlayer, TrainingItemSubmission, NotificationItem } from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Database storage file
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'database.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data
const initialClubs: Club[] = [
  {
    id: 'club-uma',
    nombre: 'Uma musume FC',
    lider: 'Fuji Kiseki',
    liderKey: 'fuji',
    icono: '🐴',
    color: '#ec4899',
    descripcion: 'Velocidad y zancada implacable. La velocidad desgarra las defensas.',
    nivelPrestigio: 1,
    puntosPrestigio: 45,
    tesoreria: 5000,
    limiteMiembros: 11,
    partidosGanados: 2,
    miembros: [
      { id: 'm-fuji', nombre: 'Fuji Kiseki', rol: 'Capitán / ST / RW', posicion: 'ST', valorMercado: 2500, avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
      { id: 'm-agnes', nombre: 'Agnes Tachyon', rol: 'CM', posicion: 'CM', valorMercado: 1100, avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
      { id: 'm-noa', nombre: 'Noa', rol: 'ST', posicion: 'ST', valorMercado: 1100, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' }
    ],
    reaccionesQuimicas: [
      {
        nombre: 'Galope Relámpago',
        participanteA: 'Fuji Kiseki',
        participanteB: 'Agnes Tachyon',
        requisito: 'Ambos jugadores en Flow',
        efecto: '+30% en TIR / VEL en la jugada final y +1 casilla de desplazamiento'
      }
    ]
  },
  {
    id: 'club-real',
    nombre: 'REAL MADRID',
    lider: 'Sae Itoshi',
    liderKey: 'sae',
    icono: '⚪',
    color: '#eab308',
    descripcion: 'La realeza del fútbol mundial. Precisión destructiva y elegancia técnica.',
    nivelPrestigio: 2,
    puntosPrestigio: 180,
    tesoreria: 6800,
    limiteMiembros: 11,
    partidosGanados: 5,
    miembros: [
      { id: 'm-sae', nombre: 'Sae Itoshi', rol: 'Capitán / CM / DMF', posicion: 'CM', valorMercado: 3500, avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' },
      { id: 'm-kaiser', nombre: 'Kaiser', rol: 'ST', posicion: 'ST', valorMercado: 1200, avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
      { id: 'm-nagi', nombre: 'Nagi Seishiro', rol: 'ST', posicion: 'ST', valorMercado: 600, avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' },
      { id: 'm-teddy', nombre: 'Teddy', rol: 'ST', posicion: 'ST', valorMercado: 390, avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80' }
    ],
    reaccionesQuimicas: [
      {
        nombre: 'Elegancia Destructiva',
        participanteA: 'Sae Itoshi',
        participanteB: 'Kaiser',
        requisito: 'Ambos jugadores en Flow',
        efecto: '+30% TIR / REG para jugada final y anula intercepciones de pase'
      }
    ]
  },
  {
    id: 'club-atlantis',
    nombre: 'ATLANTIS IMPERIAL FC',
    lider: 'Poseidón',
    liderKey: 'poseidon',
    icono: '🌊',
    color: '#06b6d4',
    descripcion: 'El imperio del mar. Maremoto táctico que ahoga las esperanzas rivales.',
    nivelPrestigio: 2,
    puntosPrestigio: 140,
    tesoreria: 5900,
    limiteMiembros: 11,
    partidosGanados: 4,
    miembros: [
      { id: 'm-poseidon', nombre: 'Poseidón', rol: 'Capitán / ST', posicion: 'ST', valorMercado: 1060, avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80' },
      { id: 'm-chinatsu', nombre: 'Chinatsu Gojo', rol: 'CM / DMF', posicion: 'CM', valorMercado: 1300, avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
      { id: 'm-alex', nombre: 'Alex Alba', rol: 'MF / CMF', posicion: 'MF', valorMercado: 1501, avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
      { id: 'm-bunny', nombre: 'Bunny Iglesias', rol: 'ST', posicion: 'ST', valorMercado: 1100, avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' },
      { id: 'm-pablo', nombre: 'Pablo Cavazos', rol: 'ST', posicion: 'ST', valorMercado: 800, avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80' }
    ],
    reaccionesQuimicas: [
      {
        nombre: 'Vórtice Abisal',
        participanteA: 'Poseidón',
        participanteB: 'Chinatsu Gojo',
        requisito: 'Ambos en Flow',
        efecto: '+30% en TIR / PAS y +20% defensa global del Blue Lock Man'
      }
    ]
  },
  {
    id: 'club-bastard',
    nombre: 'BASTARD MÜNCHEN',
    lider: 'Kunigami Rensuke',
    liderKey: 'kunigami',
    icono: '🇩🇪',
    color: '#ef4444',
    descripcion: 'Racionalidad, fuerza implacable y el ego del héroe oscuro.',
    nivelPrestigio: 1,
    puntosPrestigio: 90,
    tesoreria: 5200,
    limiteMiembros: 11,
    partidosGanados: 3,
    miembros: [
      { id: 'm-kunigami', nombre: 'Kunigami Rensuke', rol: 'Capitán / ST', posicion: 'ST', valorMercado: 1230, avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80' },
      { id: 'm-chigiri', nombre: 'Chigiri', rol: 'ST / Pantera', posicion: 'ST', valorMercado: 1780, avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' }
    ],
    reaccionesQuimicas: [
      {
        nombre: 'Impacto Salvaje',
        participanteA: 'Kunigami Rensuke',
        participanteB: 'Chigiri',
        requisito: 'Ambos jugadores en Flow',
        efecto: '+30% TIR / VEL con remate de larga distancia (Balcón del Área)'
      }
    ]
  }
];

const initialRanking: RankingPlayer[] = [
  { id: 'r-1', posicion: 1, nombre: 'Sāe Itōshi', apodo: 'El Genio de Japón', posicionRol: 'CM / DMF', club: 'REAL MADRID', valorMercado: 3500, nivel: 4, goles: 12, asistencias: 14, robos: 9, mvp: 4, victorias: 5, derrotas: 0, empates: 0, avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80' },
  { id: 'r-2', posicion: 2, nombre: 'Fuji Kiseki', apodo: 'La Bestia Fugaz', posicionRol: 'ST / RW', club: 'Uma musume FC', valorMercado: 2500, nivel: 3, goles: 9, asistencias: 6, robos: 4, mvp: 3, victorias: 4, derrotas: 1, empates: 0, avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
  { id: 'r-3', posicion: 3, nombre: 'Chigiri', apodo: 'La Pantera Roja', posicionRol: 'ST', club: 'BASTARD MÜNCHEN', valorMercado: 1780, nivel: 3, goles: 7, asistencias: 4, robos: 5, mvp: 2, victorias: 3, derrotas: 1, empates: 0, avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
  { id: 'r-4', posicion: 4, nombre: 'Alex Alba', apodo: 'El Metrónomo', posicionRol: 'MF / CMF', club: 'ATLANTIS IMPERIAL FC', valorMercado: 1501, nivel: 2, goles: 4, asistencias: 8, robos: 7, mvp: 2, victorias: 3, derrotas: 1, empates: 0, avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
  { id: 'r-5', posicion: 5, nombre: 'Chinatsu Gojo', apodo: 'La Emperatriz', posicionRol: 'CM / DMF', club: 'ATLANTIS IMPERIAL FC', valorMercado: 1300, nivel: 2, goles: 3, asistencias: 7, robos: 6, mvp: 1, victorias: 3, derrotas: 1, empates: 0, avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80' },
  { id: 'r-6', posicion: 6, nombre: 'Kunigami Rensuke', apodo: 'Cyborg / Dark Hero', posicionRol: 'ST', club: 'BASTARD MÜNCHEN', valorMercado: 1230, nivel: 2, goles: 5, asistencias: 2, robos: 4, mvp: 1, victorias: 2, derrotas: 1, empates: 0, avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&auto=format&fit=crop&q=80' },
  { id: 'r-7', posicion: 7, nombre: 'Kaiser', apodo: 'El Emperador', posicionRol: 'ST', club: 'REAL MADRID', valorMercado: 1200, nivel: 2, goles: 4, asistencias: 3, robos: 2, mvp: 1, victorias: 3, derrotas: 0, empates: 0, avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
  { id: 'r-8', posicion: 8, nombre: 'Bunny Iglesias', apodo: 'El Cazador Rápido', posicionRol: 'ST', club: 'ATLANTIS IMPERIAL FC', valorMercado: 1100, nivel: 2, goles: 4, asistencias: 2, robos: 3, mvp: 1, victorias: 2, derrotas: 1, empates: 0, avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80' },
  { id: 'r-9', posicion: 9, nombre: 'Agnes Tachyon', apodo: 'La Científica Loca', posicionRol: 'CM', club: 'Uma musume FC', valorMercado: 1100, nivel: 2, goles: 3, asistencias: 5, robos: 3, mvp: 1, victorias: 2, derrotas: 1, empates: 0, avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80' },
  { id: 'r-10', posicion: 10, nombre: 'Noa', apodo: 'Cibernético', posicionRol: 'ST', club: 'Uma musume FC', valorMercado: 1100, nivel: 2, goles: 4, asistencias: 1, robos: 2, mvp: 1, victorias: 2, derrotas: 1, empates: 0, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
  { id: 'r-11', posicion: 11, nombre: 'Poseidón', apodo: 'Rey de los Mares', posicionRol: 'ST', club: 'ATLANTIS IMPERIAL FC', valorMercado: 1060, nivel: 2, goles: 4, asistencias: 3, robos: 3, mvp: 1, victorias: 2, derrotas: 1, empates: 0, avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80' },
  { id: 'r-12', posicion: 12, nombre: 'Pablo Cavazos', apodo: 'El Francotirador', posicionRol: 'ST', club: 'ATLANTIS IMPERIAL FC', valorMercado: 800, nivel: 1, goles: 2, asistencias: 1, robos: 1, mvp: 0, victorias: 1, derrotas: 1, empates: 0, avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&auto=format&fit=crop&q=80' },
  { id: 'r-13', posicion: 13, nombre: 'Nagi Seishiro', apodo: 'El Genio Perezoso', posicionRol: 'ST', club: 'REAL MADRID', valorMercado: 600, nivel: 1, goles: 2, asistencias: 1, robos: 0, mvp: 0, victorias: 1, derrotas: 0, empates: 0, avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80' },
  { id: 'r-14', posicion: 14, nombre: 'Teddy', apodo: 'El Rayo Silencioso', posicionRol: 'ST', club: 'REAL MADRID', valorMercado: 390, nivel: 1, goles: 1, asistencias: 0, robos: 1, mvp: 0, victorias: 1, derrotas: 0, empates: 0, avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80' }
];

interface DatabaseSchema {
  sheets: CharacterSheet[];
  clubs: Club[];
  ranking: RankingPlayer[];
  trainings: TrainingItemSubmission[];
  notifications: NotificationItem[];
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading database file:', err);
  }
  const defaultDb: DatabaseSchema = {
    sheets: [],
    clubs: initialClubs,
    ranking: initialRanking,
    trainings: [],
    notifications: [
      {
        id: 'notif-welcome',
        titulo: '¡Bienvenido a Blue Lock: Reign of Egoists!',
        mensaje: 'Crea tu ficha de personaje con 30 puntos base. La IA y los administradores revisarán tu postulación.',
        tipo: 'sistema',
        fecha: new Date().toISOString(),
        leido: false
      }
    ]
  };
  saveDatabase(defaultDb);
  return defaultDb;
}

function saveDatabase(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database file:', err);
  }
}

let db = loadDatabase();

// Calculate player level based on goals, assists, wins, steals
export function calculateLevel(goles: number, asistencias: number, victorias: number, robos: number): number {
  if (goles >= 35 && asistencias >= 27 && victorias >= 25 && robos >= 60) return 10;
  if (goles >= 30 && asistencias >= 23 && victorias >= 20 && robos >= 50) return 9;
  if (goles >= 25 && asistencias >= 19 && victorias >= 16 && robos >= 40) return 8;
  if (goles >= 20 && asistencias >= 15 && victorias >= 13 && robos >= 30) return 7;
  if (goles >= 16 && asistencias >= 12 && victorias >= 10 && robos >= 25) return 6;
  if (goles >= 12 && asistencias >= 9 && victorias >= 8 && robos >= 20) return 5;
  if (goles >= 10 || asistencias >= 8 || victorias >= 5 || robos >= 8) return 4;
  if (goles >= 6 || asistencias >= 6 || victorias >= 3 || robos >= 5) return 3;
  if (goles >= 3 || asistencias >= 3 || victorias >= 2 || robos >= 3) return 2;
  return 1;
}

// ----------------- API ROUTES ----------------- //

// 1. Get full state
app.get('/api/state', (_req: Request, res: Response) => {
  res.json({
    sheets: db.sheets,
    clubs: db.clubs,
    ranking: db.ranking,
    trainings: db.trainings,
    notifications: db.notifications
  });
});

// 2. Submit or update character sheet
app.post('/api/sheets', (req: Request, res: Response) => {
  try {
    const sheetData: Partial<CharacterSheet> = req.body;
    const now = new Date().toISOString();

    const stats = sheetData.stats || { tiro: 0, defensa: 0, velocidad: 0, regate: 0, pase: 0, iq: 0 };
    const progreso = sheetData.progreso || {
      nivel: 1,
      valorMercado: 300,
      victorias: 0,
      derrotas: 0,
      empates: 0,
      goles: 0,
      robos: 0,
      asistencias: 0,
      mvp: 0
    };

    progreso.nivel = calculateLevel(progreso.goles, progreso.asistencias, progreso.victorias, progreso.robos);

    const existingIndex = db.sheets.findIndex(s => s.id === sheetData.id);

    let savedSheet: CharacterSheet;
    if (existingIndex >= 0) {
      savedSheet = {
        ...db.sheets[existingIndex],
        ...sheetData,
        stats,
        progreso,
        updatedAt: now
      } as CharacterSheet;
      db.sheets[existingIndex] = savedSheet;
    } else {
      const newId = sheetData.id || `sheet-${Date.now()}`;
      savedSheet = {
        id: newId,
        userId: sheetData.userId || `user-${Date.now()}`,
        nombre: sheetData.nombre || 'Egoísta Desconocido',
        apodo: sheetData.apodo || '',
        edad: sheetData.edad || 17,
        piernaDominante: sheetData.piernaDominante || 'Diestra',
        nacionalidad: sheetData.nacionalidad || 'Japonesa',
        posicionPrincipal: sheetData.posicionPrincipal || 'ST',
        clubEstado: sheetData.clubEstado || 'Libre / En busca de ser fichado',
        clubId: sheetData.clubId,
        arma: sheetData.arma || '',
        avatarUrl: sheetData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        habilidad1: sheetData.habilidad1 || { nombre: '', descripcion: '', buffTexto: '+30% a 1 stat', statsElegidas: ['tiro'], duracion: 1, usos: 1 },
        habilidad2: sheetData.habilidad2 || { nombre: '', descripcion: '', buffTexto: '+30% a 1 stat', statsElegidas: ['velocidad'], duracion: 1, usos: 1 },
        pasiva: sheetData.pasiva || { nombre: '', descripcion: '', buffTexto: '+30% a 1 stat', statsElegidas: ['tiro'], duracion: 1, usos: 1 },
        preFlow: sheetData.preFlow || { nombre: 'Pre-Flow', descripcion: '', buffTexto: '+50% a 1 stat', statsElegidas: ['tiro'], duracion: 1, usos: 1 },
        flow: sheetData.flow || { nombre: 'Flow', buffTexto: '+90% a 1 stat', statsElegidas: ['tiro'], buffPredeterminadoTexto: '+70% a 1 stat', statsPredeterminadas: ['tiro'], duracion: 1, usos: 1 },
        stats,
        progreso,
        personalidad: sheetData.personalidad || '',
        historia: sheetData.historia || '',
        motivacion: sheetData.motivacion || '',
        nombreUsser: sheetData.nombreUsser || '',
        edadUsuario: sheetData.edadUsuario || 18,
        pais: sheetData.pais || '',
        zonaHoraria: sheetData.zonaHoraria || '',
        pruebaRol: sheetData.pruebaRol || '',
        compromiso: sheetData.compromiso || 'Sí, prometo mantener actividad y respeto.',
        status: 'pendiente',
        renacimientos: 0,
        habilidadesOculares: [],
        createdAt: now,
        updatedAt: now
      };
      db.sheets.unshift(savedSheet);

      // Add notification for admins
      db.notifications.unshift({
        id: `notif-${Date.now()}`,
        titulo: 'Nueva Ficha Ingresada',
        mensaje: `${savedSheet.nombre} (${savedSheet.nombreUsser}) ha enviado su ficha para aprobación.`,
        tipo: 'aprobacion',
        fecha: now,
        leido: false
      });
    }

    saveDatabase(db);
    res.json({ success: true, sheet: savedSheet });
  } catch (err: any) {
    console.error('Error saving sheet:', err);
    res.status(500).json({ error: err.message || 'Error guardando la ficha' });
  }
});

// 3. AI Evaluation of Sheet (Gemini API)
app.post('/api/sheets/:id/evaluate-ai', async (req: Request, res: Response) => {
  try {
    const sheetId = req.params.id;
    const sheet = db.sheets.find(s => s.id === sheetId) || req.body.sheet;

    if (!sheet) {
      return res.status(404).json({ error: 'Ficha no encontrada' });
    }

    // Rules validation logic
    const totalStats = Number(sheet.stats.tiro || 0) +
      Number(sheet.stats.defensa || 0) +
      Number(sheet.stats.velocidad || 0) +
      Number(sheet.stats.regate || 0) +
      Number(sheet.stats.pase || 0) +
      Number(sheet.stats.iq || 0);

    const personalityLines = (sheet.personalidad || '').split('\n').filter((l: string) => l.trim().length > 0).length;
    const roleplayLines = (sheet.pruebaRol || '').split('\n').filter((l: string) => l.trim().length > 0).length;

    let aiPrompt = `Eres Jinpachi Ego, el director supremo de Blue Lock. Tu misión es evaluar con frialdad analítica, perspicacia y tono egoísta la siguiente ficha de personaje para el roleplay oficial "BLUE LOCK — REIGN OF EGOISTS".

REGLAS DEL SISTEMA BLUE LOCK:
1. Estadísticas iniciales: Deben sumar exactamente 30 puntos repartidos entre Tiro (TIR), Defensa (DEF), Velocidad (VEL), Regate (REG), Pase (PAS) e IQ.
   - Suma actual del jugador: ${totalStats} puntos. (TIR: ${sheet.stats.tiro}, DEF: ${sheet.stats.defensa}, VEL: ${sheet.stats.velocidad}, REG: ${sheet.stats.regate}, PAS: ${sheet.stats.pase}, IQ: ${sheet.stats.iq})
2. Regla de Casillas y Arma: El arma define la movilidad. Solo si el arma está relacionada con Velocidad/Desplazamiento puede alcanzar hasta 4 casillas por turno con habilidades. Si no, el límite máximo es 3 casillas por turno.
   - Arma del personaje: "${sheet.arma}"
3. Habilidades activas (Máximo 2):
   - Buffs válidos: +10% a 3 stats, o +20% a 2 stats, o +30% a 1 stat.
   - Hab 1: "${sheet.habilidad1?.nombre}" buff: "${sheet.habilidad1?.buffTexto}"
   - Hab 2: "${sheet.habilidad2?.nombre}" buff: "${sheet.habilidad2?.buffTexto}"
4. Pasiva (Solo 1):
   - Buffs válidos: +20% a 2 stats, o +30% a 1 stat.
   - Pasiva: "${sheet.pasiva?.nombre}" buff: "${sheet.pasiva?.buffTexto}"
5. Pre-Flow:
   - Buffs válidos: +30% a 3 stats, o +40% a 2 stats, o +50% a 1 stat.
   - Duración según IQ: 0-50 IQ = 1 turno, 50-100 IQ = 2 turnos, 100-150 IQ = 3 turnos, 150-200 IQ = 4 turnos.
6. Flow:
   - Buff elegido: +70% a 3 stats, o +80% a 2 stats, o +90% a 1 stat.
   - Buff predeterminado: +50% a 3 stats, o +60% a 2 stats, o +70% a 1 stat.
7. Perfil del PJ:
   - Personalidad: mínimo 6 líneas. (Tiene actualmente ${personalityLines} líneas).
   - Historia y Motivación clara de devorar a los demás.
8. Datos del Usuario:
   - Edad mayor de 17 años (Tiene ${sheet.edadUsuario} años).
   - Prueba de Rol: mínimo 15 líneas narradas con calidad, sin mano negra, usando lógica coherente. (Tiene actualmente ${roleplayLines} líneas).
   - Compromiso de actividad.

DATOS DE LA FICHA A EVALUAR:
- Nombre: ${sheet.nombre}
- Apodo: ${sheet.apodo}
- Posición: ${sheet.posicionPrincipal} | Pierna: ${sheet.piernaDominante}
- Club o Estado: ${sheet.clubEstado}
- Arma: ${sheet.arma}
- Personalidad: """${sheet.personalidad}"""
- Historia: """${sheet.historia}"""
- Motivación: """${sheet.motivacion}"""
- Prueba de Rol: """${sheet.pruebaRol}"""
- Compromiso: """${sheet.compromiso}"""

INSTRUCCIONES DE RESPUESTA:
Evalúa rigurosamente. Si cumple todos los requisitos matemáticos y cualitativos, recomiéndalo como APROBADO. Si tiene errores (ej. la suma de stats no es 30, líneas insuficientes, buffs ilegales o incoherencias), especifícalo claramente con las correcciones exactas que debe hacer.
Genera un análisis en tono Ego Jinpachi con:
1. "dictamen": "APROBADO_RECOMENDADO" o "REQUIERE_CORRECCIONES"
2. "puntuacionEgo": número del 1 al 100
3. "observaciones": array de strings con cada punto revisado (Suma de stats, Habilidades, Arma/Casillas, Prueba de rol, Personalidad)
4. "resumenEgo": 2-3 párrafos motivacionales y directos de Ego Jinpachi dirigidos a los administradores (Chinatsu, Poseidón, Sae, Nagi, Fuji) para que aprueben o pidan correcciones con 1 click.
5. "whatsappFormat": El texto completo listo para pegar en WhatsApp con la estética oficial del grupo.

Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
{
  "aprobadoRecomendado": boolean,
  "score": number,
  "observaciones": ["punto 1", "punto 2", "..."],
  "resumen": "texto del resumen",
  "correccionesSugeridas": ["si hay errores, ponlos aquí"],
  "whatsappText": "texto formateado para whatsapp"
}`;

    let aiResult;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: aiPrompt,
        config: {
          responseMimeType: 'application/json',
        }
      });
      aiResult = JSON.parse(response.text || '{}');
    } catch (modelErr) {
      console.warn('Gemini API call failed, generating deterministic rule-based evaluation:', modelErr);
      const is30 = totalStats === 30;
      const isAge = (sheet.edadUsuario || 0) >= 17;
      const obs = [
        `Suma de Estadísticas: ${totalStats}/30 puntos (${is30 ? 'CORRECTO' : 'ERROR: Debe sumar exactamente 30'})`,
        `Edad de usuario: ${sheet.edadUsuario} años (${isAge ? 'CUMPLE (+17)' : 'NO CUMPLE: Debe tener +17 años'})`,
        `Personalidad: ${personalityLines}/6 líneas mínimas (${personalityLines >= 6 ? 'CUMPLE' : 'INSUFICIENTE'})`,
        `Prueba de Rol: ${roleplayLines}/15 líneas mínimas (${roleplayLines >= 15 ? 'CUMPLE' : 'INSUFICIENTE'})`,
        `Arma / Movilidad: ${sheet.arma ? 'Definida correctamente' : 'Falta detallar arma'}`
      ];
      const valid = is30 && isAge && personalityLines >= 4 && roleplayLines >= 10;
      aiResult = {
        aprobadoRecomendado: valid,
        score: valid ? 88 : 55,
        observaciones: obs,
        resumen: valid
          ? `La ficha de ${sheet.nombre} demuestra una mentalidad egoísta afinada y cumple con los 30 puntos reglamentarios. Recomendado para aprobación inmediata de los Administradores.`
          : `La ficha posee irregularidades que deben corregirse antes del ingreso formal al campo de juego.`,
        correccionesSugeridas: valid ? [] : ['Ajustar la distribución de puntos a exactamente 30', 'Aumentar la extensión de la prueba de rol o personalidad'],
        whatsappText: `*BLUE LOCK REVISIÓN OFICIAL*\nJugador: ${sheet.nombre}\nEstado: ${valid ? 'Aprobado' : 'Revisión Pendiente'}`
      };
    }

    // Save AI evaluation to sheet
    const targetIdx = db.sheets.findIndex(s => s.id === sheet.id);
    if (targetIdx >= 0) {
      db.sheets[targetIdx].iaEvaluacion = {
        aprobadoRecomendado: aiResult.aprobadoRecomendado,
        score: aiResult.score || 85,
        observaciones: aiResult.observaciones || [],
        resumen: aiResult.resumen || ''
      };
      saveDatabase(db);
    }

    res.json({ success: true, evaluation: aiResult });
  } catch (err: any) {
    console.error('Error in evaluate-ai:', err);
    res.status(500).json({ error: err.message || 'Error en evaluación de IA' });
  }
});

// 4. Admin Review Sheet (Approve / Reject)
app.post('/api/sheets/:id/review', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminComentario, adminRevisor } = req.body;

    const sheetIdx = db.sheets.findIndex(s => s.id === id);
    if (sheetIdx === -1) {
      return res.status(404).json({ error: 'Ficha no encontrada' });
    }

    const sheet = db.sheets[sheetIdx];
    sheet.status = status;
    sheet.adminComentario = adminComentario || '';
    sheet.adminRevisor = adminRevisor || 'Administración';
    sheet.revisadoAt = new Date().toISOString();

    // If approved and not in ranking, add player to ranking!
    if (status === 'aprobado') {
      const existingInRanking = db.ranking.find(r => r.sheetId === sheet.id || r.nombre.toLowerCase() === sheet.nombre.toLowerCase());
      if (!existingInRanking) {
        db.ranking.push({
          id: `r-${Date.now()}`,
          posicion: db.ranking.length + 1,
          nombre: sheet.nombre,
          apodo: sheet.apodo,
          posicionRol: `${sheet.posicionPrincipal} ── ${sheet.clubEstado}`,
          club: sheet.clubEstado,
          valorMercado: sheet.progreso.valorMercado || 300,
          nivel: sheet.progreso.nivel || 1,
          goles: sheet.progreso.goles || 0,
          asistencias: sheet.progreso.asistencias || 0,
          robos: sheet.progreso.robos || 0,
          mvp: sheet.progreso.mvp || 0,
          victorias: sheet.progreso.victorias || 0,
          derrotas: sheet.progreso.derrotas || 0,
          empates: sheet.progreso.empates || 0,
          avatarUrl: sheet.avatarUrl,
          sheetId: sheet.id,
          isCustom: true
        });
        // Sort ranking descending by valorMercado
        db.ranking.sort((a, b) => b.valorMercado - a.valorMercado);
        db.ranking.forEach((r, idx) => { r.posicion = idx + 1; });
      }
    }

    // Push notification
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: sheet.userId,
      titulo: status === 'aprobado' ? '¡Ficha Aprobada!' : 'Ficha Requiere Corrección',
      mensaje: status === 'aprobado'
        ? `¡Felicidades, ${sheet.nombre}! Tu ficha ha sido aprobada por ${sheet.adminRevisor}. Tu valor inicial es de ¥${sheet.progreso.valorMercado}.`
        : `Tu ficha de ${sheet.nombre} fue revisada por ${sheet.adminRevisor}. Observación: ${adminComentario || 'Corrige los puntos señalados.'}`,
      tipo: status === 'aprobado' ? 'aprobacion' : 'rechazo',
      fecha: new Date().toISOString(),
      leido: false
    });

    saveDatabase(db);
    res.json({ success: true, sheet });
  } catch (err: any) {
    console.error('Error reviewing sheet:', err);
    res.status(500).json({ error: err.message || 'Error revisando ficha' });
  }
});

// 5. Daily Training Submissions
app.post('/api/trainings', (req: Request, res: Response) => {
  try {
    const trainingData: Partial<TrainingItemSubmission> = req.body;
    const now = new Date().toISOString();

    let points = 0;
    if (trainingData.gym) points += 30;
    if (trainingData.cancha) points += 30;
    if (trainingData.rolSocial) points += 10;
    if (trainingData.instagram) points += 10;
    if (trainingData.actividades) points += 20;

    const newTraining: TrainingItemSubmission = {
      id: `tr-${Date.now()}`,
      userId: trainingData.userId || 'user-unknown',
      sheetId: trainingData.sheetId || '',
      playerName: trainingData.playerName || 'Jugador',
      clubNombre: trainingData.clubNombre || 'Sin Club',
      fecha: now,
      gym: !!trainingData.gym,
      cancha: !!trainingData.cancha,
      rolSocial: !!trainingData.rolSocial,
      instagram: !!trainingData.instagram,
      actividades: !!trainingData.actividades,
      totalPuntos: points,
      distribucionStats: trainingData.distribucionStats || { tiro: 0, defensa: 0, velocidad: 0, regate: 0, pase: 0, iq: 0 },
      comprobanteTexto: trainingData.comprobanteTexto || 'Entrenamiento diario realizado.',
      status: 'pendiente',
      createdAt: now
    };

    db.trainings.unshift(newTraining);

    // Notify admins
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      titulo: 'Nuevo Entrenamiento Enviado',
      mensaje: `${newTraining.playerName} ha completado sus actividades diarias (+${points} pts reclamados). Requiere aprobación del Staff.`,
      tipo: 'sistema',
      fecha: now,
      leido: false
    });

    saveDatabase(db);
    res.json({ success: true, training: newTraining });
  } catch (err: any) {
    console.error('Error submitting training:', err);
    res.status(500).json({ error: err.message || 'Error enviando entrenamiento' });
  }
});

// 6. Admin approves training
app.post('/api/trainings/:id/approve', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { adminNota, adminRevisor } = req.body;

    const tIdx = db.trainings.findIndex(t => t.id === id);
    if (tIdx === -1) {
      return res.status(404).json({ error: 'Entrenamiento no encontrado' });
    }

    const training = db.trainings[tIdx];
    training.status = 'aprobado';
    training.adminNota = adminNota || 'Entrenamiento validado con éxito.';
    training.aprobadoPor = adminRevisor || 'Staff';

    // Boost stats on the player's sheet!
    const sheetIdx = db.sheets.findIndex(s => s.id === training.sheetId);
    if (sheetIdx >= 0) {
      const sheet = db.sheets[sheetIdx];
      const dist = training.distribucionStats;
      sheet.stats.tiro += Number(dist.tiro || 0);
      sheet.stats.defensa += Number(dist.defensa || 0);
      sheet.stats.velocidad += Number(dist.velocidad || 0);
      sheet.stats.regate += Number(dist.regate || 0);
      sheet.stats.pase += Number(dist.pase || 0);
      sheet.stats.iq += Number(dist.iq || 0);
      sheet.updatedAt = new Date().toISOString();
    }

    // Push notification to user
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: training.userId,
      titulo: '¡Entrenamiento Aprobado!',
      mensaje: `Tu entrenamiento de +${training.totalPuntos} pts fue aprobado por ${training.aprobadoPor}. Tus estadísticas han aumentado.`,
      tipo: 'aprobacion',
      fecha: new Date().toISOString(),
      leido: false
    });

    saveDatabase(db);
    res.json({ success: true, training });
  } catch (err: any) {
    console.error('Error approving training:', err);
    res.status(500).json({ error: err.message || 'Error aprobando entrenamiento' });
  }
});

// 7. Admin rejects training
app.post('/api/trainings/:id/reject', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { adminNota, adminRevisor } = req.body;

    const tIdx = db.trainings.findIndex(t => t.id === id);
    if (tIdx === -1) {
      return res.status(404).json({ error: 'Entrenamiento no encontrado' });
    }

    const training = db.trainings[tIdx];
    training.status = 'rechazado';
    training.adminNota = adminNota || 'Evidencia insuficiente o no cumple las 24 horas.';
    training.aprobadoPor = adminRevisor || 'Staff';

    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: training.userId,
      titulo: 'Entrenamiento Rechazado',
      mensaje: `Tu entrenamiento fue rechazado por ${training.aprobadoPor}. Motivo: ${training.adminNota}`,
      tipo: 'rechazo',
      fecha: new Date().toISOString(),
      leido: false
    });

    saveDatabase(db);
    res.json({ success: true, training });
  } catch (err: any) {
    console.error('Error rejecting training:', err);
    res.status(500).json({ error: err.message || 'Error rechazando entrenamiento' });
  }
});

// 8. Update Ranking
app.put('/api/ranking/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const rIdx = db.ranking.findIndex(r => r.id === id);
    if (rIdx === -1) {
      return res.status(404).json({ error: 'Jugador de ranking no encontrado' });
    }

    db.ranking[rIdx] = {
      ...db.ranking[rIdx],
      ...updates
    };

    // Re-calculate levels and re-sort
    db.ranking.forEach(p => {
      p.nivel = calculateLevel(p.goles, p.asistencias, p.victorias, p.robos);
    });

    db.ranking.sort((a, b) => b.valorMercado - a.valorMercado);
    db.ranking.forEach((r, idx) => { r.posicion = idx + 1; });

    saveDatabase(db);
    res.json({ success: true, ranking: db.ranking });
  } catch (err: any) {
    console.error('Error updating ranking:', err);
    res.status(500).json({ error: err.message || 'Error actualizando ranking' });
  }
});

// 9. Add or update Club details
app.put('/api/clubs/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const cIdx = db.clubs.findIndex(c => c.id === id);
    if (cIdx === -1) {
      return res.status(404).json({ error: 'Club no encontrado' });
    }

    db.clubs[cIdx] = {
      ...db.clubs[cIdx],
      ...updates
    };

    saveDatabase(db);
    res.json({ success: true, club: db.clubs[cIdx] });
  } catch (err: any) {
    console.error('Error updating club:', err);
    res.status(500).json({ error: err.message || 'Error actualizando club' });
  }
});

// 10. Found new club
app.post('/api/clubs/found', (req: Request, res: Response) => {
  try {
    const { nombre, lider, liderKey, descripcion, icono, color } = req.body;

    const newClub: Club = {
      id: `club-${Date.now()}`,
      nombre: nombre || 'Nuevo Club Egoísta',
      lider: lider || 'Capitán Fundador',
      liderKey: liderKey || '',
      icono: icono || '⚽',
      color: color || '#3b82f6',
      descripcion: descripcion || 'Club fundado bajo el ego supremo.',
      nivelPrestigio: 1,
      puntosPrestigio: 0,
      tesoreria: 5000, // Presupuesto inicial estricto de ¥5,000 yenes
      limiteMiembros: 11,
      partidosGanados: 0,
      miembros: [
        {
          id: `m-${Date.now()}`,
          nombre: lider,
          rol: 'Capitán / ST',
          posicion: 'ST',
          valorMercado: 300
        }
      ],
      reaccionesQuimicas: []
    };

    db.clubs.push(newClub);

    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      titulo: '¡Nuevo Club Fundado!',
      mensaje: `${lider} ha registrado el club "${newClub.nombre}" con ¥5,000 Yenes en tesorería.`,
      tipo: 'club',
      fecha: new Date().toISOString(),
      leido: false
    });

    saveDatabase(db);
    res.json({ success: true, club: newClub });
  } catch (err: any) {
    console.error('Error founding club:', err);
    res.status(500).json({ error: err.message || 'Error fundando club' });
  }
});

// 11. Interactive Ego Jinpachi Q&A Chat for players & admins
app.post('/api/ai/ego-chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    const systemPrompt = `Eres Jinpachi Ego, el estratega frío, analítico y despiadado creador de Blue Lock.
Estás a cargo del sistema "BLUE LOCK — REIGN OF EGOISTS".
Tu tono es exigente, técnico, perspicaz, con desprecio por el juego tradicional en equipo y obsesionado con despertar el hambre de gol y el talento individual.

REGLAMENTO Y MECÁNICAS QUE DOMINAS A LA PERFECCIÓN:
- SISTEMA DE STATS: Tiro (TIR), Defensa (DEF), Velocidad (VEL), Regate (REG), Pase (PAS), IQ.
  * Regla de casillas por velocidad: 0-39 pts = 1 casilla, 40-79 pts = 2 casillas, 80+ pts = 3 casillas. Solo aquellos cuya Arma sea de velocidad/desplazamiento pueden llegar a 4 casillas mediante habilidad activa.
  * Bonificación IQ: Cada 60 Pts de IQ = +1 Turno de duración para habilidades oculares, Pre-Flow o Flow.
- DUELOS Y REGLA DEL 10%:
  * Regate vs Defensa: Si REG supera en >=10% la DEF rival -> Victoria Automática. Si diferencia < 10% -> Zona de Duelo (Ruleta/Dado). Si DEF supera en >=10% el REG -> Recuperación Automática.
  * Tiro vs Defensa: Si TIR Final Potencial supera en >=10% la DEF rival/Blue Lock Man -> GOL AUTOMÁTICO. Si DEF supera en >=10% -> BLOQUEO AUTOMÁTICO. Si diferencia <10% -> Zona de Disparo (Ruleta).
- ZONAS DE GOL (COORDENADAS A-M y 1-5):
  * Áreas Chicas (2-4/L-M y 2-4/A-B): Multiplicador x1.0 (100% de potencia).
  * Zonas Ofensivas: Extremos y 3/4 (1L, 5L, H, F, B) x0.9; Laterales área grande (1K, 5K, 1C, 5C) x0.8.
  * Zonas Medias: Línea de creación (I, E) x0.7; Balcón del área (3J, 3D, 2J/4J) x0.2.
  * Baja probabilidad: Semicírculos (K, C) x0.1; Círculo Central (G1-5) x0.10.
- BUFFS:
  * Habilidades activas: +10% a 3 stats, +20% a 2 stats, +30% a 1 stat.
  * Pasiva: +20% a 2 stats, +30% a 1 stat.
  * Pre-Flow: +30% a 3 stats, +40% a 2 stats, +50% a 1 stat. (Debuff al terminar x0.6/x0.5/x0.4).
  * Flow: +70% a 3 stats, +80% a 2 stats, +90% a 1 stat + Buff predeterminado (+50% a 3, +60% a 2, +70% a 1).
- CLUBES Y PRESTIGIO:
  * Presupuesto inicial al fundar: ¥5,000 Yenes. Límite 11 jugadores (12 en Élite).
  * Prestigio 1 Underground (0-99), 2 Promesa (100-299, subvención ¥200, +10% stats entrenamientos), 3 Consolidado (300-599, subvención ¥400, +12% stats, cláusulas de rescisión), 4 Élite (600+, subvención ¥500).
  * Cláusula de rescisión: Doble del valor del jugador (50% va a billetera personal del capitán).
  * Capitán gana +25 Pts de Stats semanales por cada miembro en el Top 10 del Ranking!
- ENTRENAMIENTO DIARIO (24 HORAS):
  * Gym: +30 pts
  * Cancha: +30 pts (60 total gym + cancha)
  * Rol social: +10 pts
  * Instagram / redes: +10 pts
  * Actividades: +20 pts
  * Total máximo diario: 100 pts. Requiere aprobación de los Admins (Chinatsu, Poseidón, Sae, Nagi, Fuji).
- RENACIMIENTO (REBIRTH): 20 niveles. Al llegar a la meta de stats, vuelven a 0 y desbloqueas ojos y dominaciones (Meta-Vision, Francotirador, Depredador, Imponente, Ego Awakening, etc.).
- REGLAS DE PARTIDO: No mano negra, sí mano blanca, no boicot, tiempo de respuesta 24h (+12h de prórroga opcional).

Responde en español, con estilo apasionado, punzante y brillante como Jinpachi Ego. Si preguntan cálculos, haz la matemática exacta paso a paso.`;

    let reply = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${systemPrompt}\n\nPregunta del jugador/admin:\n${message}`
      });
      reply = response.text || 'El ego es lo único que importa. Reformulen su consulta si quieren sobrevivir.';
    } catch (e: any) {
      console.warn('Ego chat fallback:', e);
      reply = `En el fútbol tradicional te enseñarían a dudar; en Blue Lock sólo cuenta tu ego. Tu pregunta sobre "${message}" está regulada por la regla matemática del 10% y las coordenadas del campo.`;
    }

    res.json({ reply });
  } catch (err: any) {
    console.error('Error in ego-chat:', err);
    res.status(500).json({ error: err.message || 'Error en ego chat' });
  }
});

// Mount Vite in development or serve static in production
async function startServer() {
  const distPath = path.join(__dirname, 'dist');
  const isProduction = process.env.NODE_ENV === 'production' && fs.existsSync(distPath);

  if (isProduction) {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const portNumber = Number(PORT) || 3000;
  app.listen(portNumber, '0.0.0.0', () => {
    console.log(`Blue Lock Reign of Egoists server running on http://0.0.0.0:${portNumber}`);
  });
}

startServer();

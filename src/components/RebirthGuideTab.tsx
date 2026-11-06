import React, { useState } from 'react';
import { Eye, Flame, Shield, Sparkles, BookOpen, Clock, AlertTriangle, Swords, Compass } from 'lucide-react';

export const RebirthGuideTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'renacimientos' | 'ojos' | 'reglamento'>('renacimientos');

  const rebirths = [
    { nvl: 1, stats: 200, req: 'Sin requisito de campo', unlock: 'Meta-Vision', effect: 'Información constante y predicción del juego | Buff ×0.7 / ×0.6 / ×0.5' },
    { nvl: 2, stats: 220, req: '5 Goles OR 4 Asistencias OR 8 Robos', unlock: 'Ojo de Francotirador', effect: 'Precisión máxima de disparo | Buff ×0.8 / ×0.7' },
    { nvl: 3, stats: 240, req: '10 Goles OR 8 Asistencias OR 15 Robos', unlock: 'Ojo de Depredador', effect: 'Enfoque ofensivo en la zona de definición | Buff ×0.9 / ×0.8' },
    { nvl: 4, stats: 260, req: '15 Goles OR 12 Asistencias OR 22 Robos', unlock: 'Dominio Imponente (Physically)', effect: 'Dominación física, choque de masas y protección corporal | Buff ×0.4/×0.5/×0.6' },
    { nvl: 5, stats: 280, req: '20 Goles OR 16 Asistencias OR 30 Robos', unlock: 'Despertar del Ego (Ego Awakening)', effect: 'Trance mental e instinto destructivo para devorar el partido' },
    { nvl: 6, stats: 300, req: '25 Goles OR 20 Asistencias OR 38 Robos', unlock: 'Ojos de Radar', effect: 'Vigilancia y rastreo defensivo del mapa mental' },
    { nvl: 7, stats: 320, req: '30 Goles OR 24 Asistencias OR 45 Robos', unlock: 'Ojo de Asesino', effect: 'Detección y ruptura del instante más vulnerable rival' },
    { nvl: 8, stats: 340, req: '35 Goles OR 28 Asistencias OR 52 Robos', unlock: 'Ojos del Monstruo', effect: 'Adaptación al caos. Permite evadir a 1 rival por partido sin importar stats' },
    { nvl: 9, stats: 360, req: '40 Goles OR 32 Asistencias OR 60 Robos', unlock: 'Ojos del Destino', effect: 'Lectura de cadenas de jugadas y margen de reacción del 30%' },
    { nvl: 10, stats: 380, req: '45 Goles OR 36 Asistencias OR 68 Robos', unlock: 'Ojos de Ruleta (Despertar Intermedio)', effect: 'Cálculo de posibilidades. Otorga 2 intentos en las ruletas' },
    { nvl: 11, stats: 400, req: '50 Goles OR 40 Asistencias OR 75 Robos', unlock: 'Ojos del Mago', effect: 'Rutas de pase imposibles. Los pases no pueden ser interceptados' },
    { nvl: 12, stats: 420, req: '55 Goles OR 44 Asistencias OR 82 Robos', unlock: 'Ojos del Destructor', effect: 'Desmantela la estructura rival reduciendo un 10% stats y destruyendo técnicas' },
    { nvl: 13, stats: 440, req: '60 Goles OR 48 Asistencias OR 90 Robos', unlock: 'Ojos del Ego (Despertar Absoluto)', effect: 'Dominio absoluto. Desactiva el Flow de 1 rival imponiendo el propio ego' },
    { nvl: 14, stats: 460, req: '65 Goles OR 52 Asistencias OR 98 Robos', unlock: 'Dominio de Doble Ojo', effect: 'Permite combinar 2 Ojos / Habilidades en un mismo partido' },
    { nvl: 15, stats: 480, req: '70 Goles OR 56 Asistencias OR 105 Robos', unlock: 'Reducción de Debuff', effect: 'Los debuffs de tus Ojos/Habilidades se reducen un 50%' },
    { nvl: 16, stats: 500, req: '75 Goles OR 60 Asistencias OR 112 Robos', unlock: 'God Speed (Solo arma de velocidad)', effect: 'Desplazamiento supersónico. Evasión directa y aceleración explosiva' },
    { nvl: 17, stats: 520, req: '80 Goles OR 64 Asistencias OR 120 Robos', unlock: 'Trascendencia del Ego I', effect: 'Tope potencial ampliado a escala internacional' },
    { nvl: 18, stats: 540, req: '85 Goles OR 68 Asistencias OR 128 Robos', unlock: 'Trascendencia del Ego II', effect: 'Lectura sensorial omnidireccional' },
    { nvl: 19, stats: 560, req: '90 Goles OR 72 Asistencias OR 135 Robos', unlock: 'Maestría Suprema', effect: 'Acceso a todas las variantes tácticas' },
    { nvl: 20, stats: 580, req: '100 Goles OR 80 Asistencias OR 150 Robos', unlock: 'DIOS DEL CAMPO (4ª Habilidad)', effect: 'Derecho a una 4ª habilidad activa y dominio total del césped' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Compendio Oficial • Reign of Egoists</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-chakra font-bold text-white mt-1">
            Renacimientos, Ojos & Reglamentos
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            "Para alcanzar la verdadera evolución y despertar los ojos del ego supremo, primero debes estar dispuesto a destruir todo lo que has construido."
          </p>
        </div>

        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSection('renacimientos')}
            className={`px-4 py-2 rounded-lg text-xs font-chakra font-bold transition ${
              activeSection === 'renacimientos' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            🔥 20 Renacimientos
          </button>
          <button
            onClick={() => setActiveSection('ojos')}
            className={`px-4 py-2 rounded-lg text-xs font-chakra font-bold transition ${
              activeSection === 'ojos' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            👁️ Habilidades Oculares
          </button>
          <button
            onClick={() => setActiveSection('reglamento')}
            className={`px-4 py-2 rounded-lg text-xs font-chakra font-bold transition ${
              activeSection === 'reglamento' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚖️ Reglas de Partido
          </button>
        </div>
      </div>

      {/* SECTION 1: 20 REBIRTHS TABLE */}
      {activeSection === 'renacimientos' && (
        <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-chakra font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              Escala de los 20 Renacimientos del Ego
            </h3>
            <p className="text-xs text-slate-400">
              Alcanzas la meta de stats en todas tus capacidades ➜ Aceptas el Renacimiento ante los admins ➜ Tus stats vuelven a 0 Puntos (conservando tu valor y nivel previo) ➜ Desbloqueas los Ojos y Estilos asignados.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                  <th className="py-3 px-3">Nvl</th>
                  <th className="py-3 px-3">Stats Requeridas</th>
                  <th className="py-3 px-3">Requisito de Campo</th>
                  <th className="py-3 px-3">Desbloqueo de Poder</th>
                  <th className="py-3 px-3">Efecto / Bonificación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {rebirths.map((r) => (
                  <tr key={r.nvl} className="hover:bg-slate-900/40">
                    <td className="py-3 px-3 font-chakra font-bold text-cyan-400">R{r.nvl}</td>
                    <td className="py-3 px-3 font-bold text-white">{r.stats} en All Stats</td>
                    <td className="py-3 px-3 text-slate-400">{r.req}</td>
                    <td className="py-3 px-3 font-bold text-yellow-400">{r.unlock}</td>
                    <td className="py-3 px-3 text-slate-300">{r.effect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: EYE ABILITIES */}
      {activeSection === 'ojos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'Meta-Vision',
              badge: 'Renacimiento 1 • Nvl 1',
              stats: 'IQ: 50, DEF: 50, VEL: 50, PAS: 50',
              buff: '1 stat ×0.7 | 2 stats ×0.6 | 3 stats ×0.5',
              debuff: '×0.4 sobre stats potenciadas al finalizar (3 turnos)',
              desc: 'Percepción espacial de nivel superior que permite recopilar información constante de todo el campo mediante movimiento continuo de cabeza para predecir el futuro del juego.'
            },
            {
              title: 'Ojo de Francotirador',
              badge: 'Renacimiento 2 • Nvl 1',
              stats: 'IQ: 75, TIR: 100',
              buff: '1 stat ×0.7 | 2 stats ×0.8',
              debuff: '×0.4 al finalizar',
              desc: 'Percepción ofensiva enfocada en la precisión del disparo. Analiza en un instante la posición del portero, puntos ciegos y ángulo de remate para colocar el balón en la escuadra.'
            },
            {
              title: 'Ojo de Depredador',
              badge: 'Renacimiento 3 • Nvl 2',
              stats: 'IQ: 50, TIR: 50, REG: 50, VEL: 50',
              buff: '1 stat ×0.9 | 2 stats ×0.8',
              debuff: '×0.4 al finalizar',
              desc: 'Concentración total en la zona de definición. Espera el momento de máxima vulnerabilidad del portero y defensas para ejecutar un tiro fulminante a quemarropa.'
            },
            {
              title: 'Dominio Imponente (Physically)',
              badge: 'Renacimiento 4 • Nvl 2',
              stats: 'DEF: 50, TIR: 50, VEL: 50, REG: 50',
              buff: '1 stat ×0.4 | 2 stats ×0.5 | 3 stats ×0.6',
              debuff: 'Fatiga extrema: ×0.4',
              desc: 'Dominación física y choque de masas. Utiliza el centro de gravedad, envergadura y fuerza bruta para anular la estabilidad rival y aplastar duelos 1v1.'
            },
            {
              title: 'Ojos del Monstruo',
              badge: 'Renacimiento 8 • Nvl 4',
              stats: 'IQ: 50, REG: 100, VEL: 50',
              buff: '1 stat ×0.5 | 2 stats ×0.4 | 3 stats ×0.3',
              debuff: '×0.4 al finalizar',
              desc: 'Instinto del caos e improvisación pura. Permite evadir a 1 rival por partido de forma automática, independientemente de que tenga mayores estadísticas.'
            },
            {
              title: 'God Speed',
              badge: 'Renacimiento 16 • Nvl 9 (Solo Arma Velocidad)',
              stats: 'VEL: 100, TIR: 50, REG: 50',
              buff: '1 stat ×0.5 | 2 stats ×0.4 (VEL, TIR, PAS, DEF)',
              debuff: '×0.4 en VEL por agotamiento',
              desc: 'Aceleración explosiva supersónica (estilo Chigiri/Zantetsu). Desplazamiento imposible de seguir visualmente, evasión garantizada y 20% de margen de reacción.'
            }
          ].map((eye, idx) => (
            <div key={idx} className="border border-slate-800 bg-[#080d1e] rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h4 className="text-base font-chakra font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  {eye.title}
                </h4>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-900">
                  {eye.badge}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{eye.desc}</p>
              <div className="text-[11px] font-mono space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="text-slate-400">Requisitos: <span className="text-slate-200">{eye.stats}</span></div>
                <div className="text-cyan-300">Buff Activo: {eye.buff}</div>
                <div className="text-rose-400">Debuff: {eye.debuff}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 3: MATCH RULES */}
      {activeSection === 'reglamento' && (
        <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-6 space-y-5">
          <div className="space-y-1">
            <h3 className="text-lg font-chakra font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              Reglamento Oficial de Partidos en Cuadrícula
            </h3>
            <p className="text-xs text-slate-400">
              Normativa para evitar disputas y asegurar que toda victoria sea legítima dentro del roleplay.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-rose-400 block text-sm">❌ PROHIBIDO: MANIPULACIÓN NEGRA</span>
              <p className="text-slate-300 leading-relaxed">
                Ocurre cuando un jugador intenta imponer su voluntad sobre el oponente sin darle margen de defensa o controlando las acciones, pensamientos y movimientos del rival. Toda acción descrita como hecho inevitable carente de lógica es sancionada.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-emerald-400 block text-sm">✅ PERMITIDO: MANIPULACIÓN BLANCA</span>
              <p className="text-slate-300 leading-relaxed">
                Herramienta que permite que el combate avance cuando hay omisiones. Si lanzas un ataque pero no describes cómo interactúa con el rival o qué pretendes lograr, le otorgas permiso al contrincante para rellenar esos vacíos narrativos de manera lógica.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-amber-400 block text-sm">⏱️ TIEMPO DE RESPUESTA (HDR)</span>
              <p className="text-slate-300 leading-relaxed">
                Límite estándar de <strong className="text-white">24 horas</strong> para responder turnos de partido. Puedes pedir <strong className="text-white">+12 horas de prórroga</strong> notificando previamente. Superar el plazo sin aviso conlleva <strong className="text-rose-400">-100 ¥ en Valor de Mercado</strong> y pérdida de jugada.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-cyan-400 block text-sm">⚽ MOVIMIENTO Y CASILLAS</span>
              <p className="text-slate-300 leading-relaxed">
                Cada turno permite desplazamiento de hasta <strong className="text-white">2 casillas</strong> en cualquier dirección (sin atravesar a otro jugador) + <strong className="text-white">1 acción principal</strong> (pasar, rematar, regatear, barrida). El balón ocupa una casilla en todo momento.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

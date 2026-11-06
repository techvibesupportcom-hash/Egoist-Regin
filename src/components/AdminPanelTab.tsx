import React, { useState } from 'react';
import { CharacterSheet, TrainingItemSubmission, RankingPlayer, UserSession } from '../types.ts';
import { generateSheetWhatsAppText, openWhatsAppShare } from '../utils/whatsapp.ts';
import { Shield, Check, X, Bot, AlertCircle, Edit3, Award, Sparkles, MessageSquare, Send, CheckCircle2, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminPanelTabProps {
  sheets: CharacterSheet[];
  trainings: TrainingItemSubmission[];
  ranking: RankingPlayer[];
  currentSession: UserSession;
  onReviewSheet: (sheetId: string, status: 'aprobado' | 'rechazado', comment: string, reviewer: string) => Promise<void>;
  onApproveTraining: (trainingId: string, note: string, reviewer: string) => Promise<void>;
  onRejectTraining: (trainingId: string, note: string, reviewer: string) => Promise<void>;
  onUpdateRankingPlayer: (playerId: string, updates: Partial<RankingPlayer>) => Promise<void>;
  onAddRankingPlayer: (player: Partial<RankingPlayer>) => Promise<void>;
}

export const AdminPanelTab: React.FC<AdminPanelTabProps> = ({
  sheets,
  trainings,
  ranking,
  currentSession,
  onReviewSheet,
  onApproveTraining,
  onRejectTraining,
  onUpdateRankingPlayer,
  onAddRankingPlayer,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'fichas' | 'entrenamientos' | 'ranking'>('fichas');
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(sheets[0]?.id || null);
  const [adminComment, setAdminComment] = useState<string>('');
  const [evaluatingSheetId, setEvaluatingSheetId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Ranking edit modal/state
  const [editingPlayer, setEditingPlayer] = useState<RankingPlayer | null>(null);
  const [newPlayerModal, setNewPlayerModal] = useState<boolean>(false);
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [newPlayerClub, setNewPlayerClub] = useState<string>('REAL MADRID');
  const [newPlayerVal, setNewPlayerVal] = useState<number>(300);

  const selectedSheet = sheets.find(s => s.id === selectedSheetId);

  const pendingSheetsCount = sheets.filter(s => s.status === 'pendiente').length;
  const pendingTrainingsCount = trainings.filter(t => t.status === 'pendiente').length;

  const reviewerName =
    currentSession.adminKey === 'chinatsu' ? 'Chinatsu / Kaiser (Owner)' :
    currentSession.adminKey === 'poseidon' ? 'Poseidón (Co-owner)' :
    currentSession.adminKey === 'sae' ? 'Sae Itoshi (Admin)' :
    currentSession.adminKey === 'nagi' ? 'Nagi (Admin)' :
    currentSession.adminKey === 'fuji' ? 'Fuji Kiseki (Admin)' :
    currentSession.username || 'Staff Blue Lock';

  const handleApproveSheet = async (sheet: CharacterSheet) => {
    setActionLoading(true);
    try {
      await onReviewSheet(sheet.id, 'aprobado', adminComment || 'Ficha aprobada con éxito. Cumple con los 30 puntos y la normativa egoísta.', reviewerName);
      setAdminComment('');
      confetti({ particleCount: 70, spread: 60 });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSheet = async (sheet: CharacterSheet) => {
    if (!adminComment.trim()) {
      alert('Por favor escribe el motivo o las correcciones que debe realizar el usuario.');
      return;
    }
    setActionLoading(true);
    try {
      await onReviewSheet(sheet.id, 'rechazado', adminComment, reviewerName);
      setAdminComment('');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEvaluateAI = async (sheet: CharacterSheet) => {
    setEvaluatingSheetId(sheet.id);
    try {
      const res = await fetch(`/api/sheets/${sheet.id}/evaluate-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheet })
      });
      const data = await res.json();
      if (data.evaluation?.resumen) {
        setAdminComment(`[Auditoría IA Jinpachi Ego: ${data.evaluation.score}/100]\n${data.evaluation.resumen}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluatingSheetId(null);
    }
  };

  const handleSavePlayerEdit = async () => {
    if (!editingPlayer) return;
    await onUpdateRankingPlayer(editingPlayer.id, editingPlayer);
    setEditingPlayer(null);
  };

  const handleCreateRankingPlayer = async () => {
    if (!newPlayerName.trim()) return;
    await onAddRankingPlayer({
      nombre: newPlayerName,
      club: newPlayerClub,
      posicionRol: `ST ── ${newPlayerClub}`,
      valorMercado: newPlayerVal,
      nivel: 1,
      goles: 0,
      asistencias: 0,
      robos: 0,
      mvp: 0,
      victorias: 0,
      derrotas: 0,
      empates: 0,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
    });
    setNewPlayerName('');
    setNewPlayerModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Admin Header with Current Admin Identity */}
      <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Sede Central de Administración • 5 Admins</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-chakra font-bold text-white mt-1">
            Panel de Control del Staff
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sesión activa como: <span className="text-cyan-300 font-mono font-bold">{reviewerName}</span>
          </p>
        </div>

        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('fichas')}
            className={`px-3.5 py-2 rounded-lg text-xs font-chakra font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'fichas'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Fichas de Jugadores</span>
            {pendingSheetsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-mono">
                {pendingSheetsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('entrenamientos')}
            className={`px-3.5 py-2 rounded-lg text-xs font-chakra font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'entrenamientos'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Entrenamientos 24h</span>
            {pendingTrainingsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-yellow-500 text-slate-950 text-[10px] flex items-center justify-center font-mono font-bold">
                {pendingTrainingsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('ranking')}
            className={`px-3.5 py-2 rounded-lg text-xs font-chakra font-bold transition ${
              activeSubTab === 'ranking'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Editar Ranking en Vivo
          </button>
        </div>
      </div>

      {/* SUBTAB 1: FICHAS APPROVAL QUEUE */}
      {activeSubTab === 'fichas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List of Sheets */}
          <div className="lg:col-span-4 border border-slate-800 bg-[#080d1e] rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center px-1 pb-2 border-b border-slate-800">
              <span className="text-xs font-mono uppercase text-slate-400">Fichas Registradas ({sheets.length})</span>
              <span className="text-[11px] font-mono text-cyan-400">{pendingSheetsCount} pendientes</span>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {sheets.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 font-mono">
                  No hay fichas enviadas todavía.
                </div>
              ) : (
                sheets.map((s) => {
                  const isSelected = selectedSheetId === s.id;
                  const total =
                    Number(s.stats.tiro) +
                    Number(s.stats.defensa) +
                    Number(s.stats.velocidad) +
                    Number(s.stats.regate) +
                    Number(s.stats.pase) +
                    Number(s.stats.iq);

                  return (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedSheetId(s.id); setAdminComment(s.adminComentario || ''); }}
                      className={`w-full text-left p-3 rounded-xl border transition flex items-center gap-3 ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500/70 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                          : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
                      }`}
                    >
                      <img
                        src={s.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                        alt={s.nombre}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-chakra font-bold text-white truncate">{s.nombre || 'Sin nombre'}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded uppercase ${
                            s.status === 'aprobado'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : s.status === 'rechazado'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {s.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {s.posicionPrincipal} • {s.clubEstado}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                          Stats: {total}/30 • {s.nombreUsser}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Sheet Details & Review Action Box */}
          <div className="lg:col-span-8 space-y-4">
            {selectedSheet ? (
              <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-6 space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedSheet.avatarUrl}
                      alt={selectedSheet.nombre}
                      className="w-14 h-14 rounded-xl object-cover border-2 border-cyan-500/40"
                    />
                    <div>
                      <h3 className="text-xl font-chakra font-bold text-white flex items-center gap-2">
                        <span>{selectedSheet.nombre}</span>
                        {selectedSheet.apodo && (
                          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-900/60">
                            "{selectedSheet.apodo}"
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {selectedSheet.edad} años • {selectedSheet.posicionPrincipal} • {selectedSheet.nacionalidad} • {selectedSheet.piernaDominante}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEvaluateAI(selectedSheet)}
                      disabled={evaluatingSheetId === selectedSheet.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-900/50 hover:bg-purple-800/60 border border-purple-500/50 text-purple-200 rounded-xl text-xs font-mono font-bold transition"
                    >
                      <Bot className="w-4 h-4 text-purple-400" />
                      {evaluatingSheetId === selectedSheet.id ? 'Auditando...' : 'Pedir Consejo a IA Ego'}
                    </button>

                    <button
                      onClick={() => openWhatsAppShare(generateSheetWhatsAppText(selectedSheet))}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold transition flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      WhatsApp
                    </button>
                  </div>
                </div>

                {/* Stats Breakdown with 30 pts check */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400 uppercase">Distribución de Estadísticas (30 Puntos Base)</span>
                    {(() => {
                      const total = Number(selectedSheet.stats.tiro) + Number(selectedSheet.stats.defensa) + Number(selectedSheet.stats.velocidad) + Number(selectedSheet.stats.regate) + Number(selectedSheet.stats.pase) + Number(selectedSheet.stats.iq);
                      return (
                        <span className={`font-bold ${total === 30 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          Suma: {total} / 30 {total === 30 ? '✓ REGLAMENTARIO' : '✗ ILEGAL'}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-6 gap-2 text-center font-mono text-xs">
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-rose-400">TIR</div>
                      <div className="text-sm font-bold text-white">{selectedSheet.stats.tiro}</div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-indigo-400">DEF</div>
                      <div className="text-sm font-bold text-white">{selectedSheet.stats.defensa}</div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-cyan-400">VEL</div>
                      <div className="text-sm font-bold text-white">{selectedSheet.stats.velocidad}</div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-emerald-400">REG</div>
                      <div className="text-sm font-bold text-white">{selectedSheet.stats.regate}</div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-amber-400">PAS</div>
                      <div className="text-sm font-bold text-white">{selectedSheet.stats.pase}</div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-purple-400">IQ</div>
                      <div className="text-sm font-bold text-white">{selectedSheet.stats.iq}</div>
                    </div>
                  </div>
                </div>

                {/* Arma & Habilidades */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div>
                    <span className="font-mono text-cyan-400 font-bold block">✦ Arma / Talento:</span>
                    <p className="text-slate-300 mt-0.5">{selectedSheet.arma || 'Sin especificar'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="font-mono text-slate-400 font-bold">Habilidad 1:</span> {selectedSheet.habilidad1.nombre} ({selectedSheet.habilidad1.buffTexto})
                    </div>
                    <div>
                      <span className="font-mono text-slate-400 font-bold">Habilidad 2:</span> {selectedSheet.habilidad2.nombre} ({selectedSheet.habilidad2.buffTexto})
                    </div>
                    <div>
                      <span className="font-mono text-slate-400 font-bold">Pasiva:</span> {selectedSheet.pasiva.nombre} ({selectedSheet.pasiva.buffTexto})
                    </div>
                    <div>
                      <span className="font-mono text-slate-400 font-bold">Flow:</span> {selectedSheet.flow.nombre} ({selectedSheet.flow.buffTexto})
                    </div>
                  </div>
                </div>

                {/* Roleplay Proof text */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400 uppercase">Prueba de Rol del Usuario</span>
                    <span className="text-cyan-400">Usser: {selectedSheet.nombreUsser} ({selectedSheet.edadUsuario} años)</span>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 max-h-40 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {selectedSheet.pruebaRol || 'Sin prueba de rol.'}
                  </div>
                </div>

                {/* Admin Observation Input & Actions */}
                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <label className="text-xs font-mono uppercase text-slate-300 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    Observación o Comentario de Revisión para el Usuario:
                  </label>
                  <textarea
                    rows={2}
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder="Escribe felicitaciones o correcciones detalladas (ej: Ajusta 2 puntos de defensa a pase)..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-400"
                  />

                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => handleRejectSheet(selectedSheet)}
                      disabled={actionLoading}
                      className="px-4 py-2.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/50 text-rose-300 rounded-xl text-xs font-chakra font-bold transition flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      ❌ Rechazar / Pedir Corrección
                    </button>

                    <button
                      onClick={() => handleApproveSheet(selectedSheet)}
                      disabled={actionLoading}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-chakra font-bold transition flex items-center gap-2 shadow-lg"
                    >
                      <Check className="w-4 h-4" />
                      🌑 Aprobar Ficha Oficialmente
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-12 text-center text-slate-500 text-xs font-mono">
                Selecciona una ficha a la izquierda para inspeccionar y aprobar.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: DAILY TRAININGS APPROVAL */}
      {activeSubTab === 'entrenamientos' && (
        <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-chakra font-bold text-white">Cola de Entrenamientos Diarios (24 Horas)</h3>
              <p className="text-xs text-slate-400">
                Los jugadores reclaman puntos por Gym (30), Cancha (30), Rol Social (10), IG (10) y Actividades (20).
                Al aprobar, los puntos se inyectan directamente a su ficha y se notifica al jugador.
              </p>
            </div>
            <span className="text-xs font-mono bg-cyan-950 text-cyan-300 px-3 py-1 rounded-full border border-cyan-800">
              {pendingTrainingsCount} por revisar
            </span>
          </div>

          <div className="space-y-3">
            {trainings.length === 0 ? (
              <div className="text-center py-12 text-xs font-mono text-slate-500">
                No hay reportes de entrenamiento registrados aún.
              </div>
            ) : (
              trainings.map((t) => (
                <div key={t.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-chakra font-bold text-cyan-400 text-sm">
                        +{t.totalPuntos}
                      </div>
                      <div>
                        <div className="text-sm font-chakra font-bold text-white">{t.playerName}</div>
                        <div className="text-xs text-slate-400 font-mono">
                          Club: {t.clubNombre || 'Agente Libre'} • {new Date(t.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono px-2 py-0.5 rounded uppercase ${
                        t.status === 'aprobado'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : t.status === 'rechazado'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {t.status === 'aprobado' ? `Aprobado por ${t.aprobadoPor}` : t.status}
                      </span>
                    </div>
                  </div>

                  {/* Badges of completed activities */}
                  <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                    {t.gym && <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded">🏋️‍♂️ Gym (+30)</span>}
                    {t.cancha && <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded">⚽ Cancha (+30)</span>}
                    {t.rolSocial && <span className="bg-slate-800 text-indigo-300 px-2 py-0.5 rounded">💬 Rol Social (+10)</span>}
                    {t.instagram && <span className="bg-slate-800 text-pink-300 px-2 py-0.5 rounded">📸 Instagram (+10)</span>}
                    {t.actividades && <span className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded">🏆 Actividades (+20)</span>}
                  </div>

                  {/* Proof */}
                  <div className="bg-slate-900 p-2.5 rounded-lg text-xs font-mono text-slate-300">
                    <span className="text-slate-500 block text-[10px]">EVIDENCIA / COMPROBANTE:</span>
                    {t.comprobanteTexto}
                  </div>

                  {/* Stats distribution planned */}
                  <div className="text-[11px] font-mono text-slate-400 flex flex-wrap gap-3">
                    <span>Inyección: TIR +{t.distribucionStats.tiro}</span>
                    <span>DEF +{t.distribucionStats.defensa}</span>
                    <span>VEL +{t.distribucionStats.velocidad}</span>
                    <span>REG +{t.distribucionStats.regate}</span>
                    <span>PAS +{t.distribucionStats.pase}</span>
                    <span>IQ +{t.distribucionStats.iq}</span>
                  </div>

                  {/* Admin actions if pending */}
                  {t.status === 'pendiente' && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => onRejectTraining(t.id, 'Evidencia insuficiente o fuera de tiempo.', reviewerName)}
                        className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/50 text-rose-300 rounded-lg text-xs font-chakra transition"
                      >
                        Rechazar
                      </button>
                      <button
                        onClick={() => {
                          onApproveTraining(t.id, 'Entrenamiento verificado y puntos asignados.', reviewerName);
                          confetti({ particleCount: 40 });
                        }}
                        className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-chakra font-bold transition"
                      >
                        Aprobar y Asignar +{t.totalPuntos} Pts
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: LIVE RANKING EDITOR */}
      {activeSubTab === 'ranking' && (
        <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-chakra font-bold text-white">Editor del Ranking en Tiempo Real</h3>
              <p className="text-xs text-slate-400">
                Ajusta el valor de mercado en Yenes (¥), victorias, goles, asistencias y premios MVP de cualquier jugador.
              </p>
            </div>
            <button
              onClick={() => setNewPlayerModal(true)}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-chakra font-bold text-xs rounded-xl transition shadow"
            >
              + Agregar Jugador al Mercado
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Jugador</th>
                  <th className="py-2.5 px-3">Club</th>
                  <th className="py-2.5 px-3">Valor de Mercado</th>
                  <th className="py-2.5 px-3">Nvl</th>
                  <th className="py-2.5 px-3">G</th>
                  <th className="py-2.5 px-3">A</th>
                  <th className="py-2.5 px-3">R</th>
                  <th className="py-2.5 px-3">MVP</th>
                  <th className="py-2.5 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ranking.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-3 font-bold text-cyan-400">{p.posicion}°</td>
                    <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                      <img src={p.avatarUrl} alt={p.nombre} className="w-7 h-7 rounded-full object-cover border border-slate-700" />
                      <span>{p.nombre}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{p.club}</td>
                    <td className="py-3 px-3 font-bold text-yellow-400">¥{p.valorMercado.toLocaleString()}</td>
                    <td className="py-3 px-3 text-cyan-300">Nvl {p.nivel}</td>
                    <td className="py-3 px-3">{p.goles}</td>
                    <td className="py-3 px-3">{p.asistencias}</td>
                    <td className="py-3 px-3">{p.robos}</td>
                    <td className="py-3 px-3">{p.mvp}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setEditingPlayer(p)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-chakra text-[11px] transition"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal to edit player */}
          {editingPlayer && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#0b1024] border border-cyan-500/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h4 className="text-base font-chakra font-bold text-white">
                    Editar Jugador: {editingPlayer.nombre}
                  </h4>
                  <button onClick={() => setEditingPlayer(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <label className="text-slate-400 block mb-1">Valor de Mercado (¥ Yenes)</label>
                    <input
                      type="number"
                      value={editingPlayer.valorMercado}
                      onChange={(e) => setEditingPlayer({ ...editingPlayer, valorMercado: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1">Goles</label>
                      <input
                        type="number"
                        value={editingPlayer.goles}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, goles: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Asistencias</label>
                      <input
                        type="number"
                        value={editingPlayer.asistencias}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, asistencias: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1">Robos / Intercepciones</label>
                      <input
                        type="number"
                        value={editingPlayer.robos}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, robos: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Premios MVP</label>
                      <input
                        type="number"
                        value={editingPlayer.mvp}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, mvp: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setEditingPlayer(null)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSavePlayerEdit}
                    className="px-4 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal to add player */}
          {newPlayerModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#0b1024] border border-cyan-500/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h4 className="text-base font-chakra font-bold text-white">
                    Registrar Jugador en el Mercado
                  </h4>
                  <button onClick={() => setNewPlayerModal(false)} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      placeholder="Ej: Ryusei Shidou"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Club</label>
                    <input
                      type="text"
                      value={newPlayerClub}
                      onChange={(e) => setNewPlayerClub(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Valor Inicial (¥ Yenes)</label>
                    <input
                      type="number"
                      value={newPlayerVal}
                      onChange={(e) => setNewPlayerVal(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setNewPlayerModal(false)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateRankingPlayer}
                    className="px-4 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs"
                  >
                    Crear en Ranking
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

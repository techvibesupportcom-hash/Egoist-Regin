import React, { useState } from 'react';
import { Club, ClubMember, ChemicalReaction, UserSession } from '../types.ts';
import { Shield, Users, Coins, TrendingUp, Plus, Sparkles, Award, UserMinus, UserPlus, Flame, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ClubsTabProps {
  clubs: Club[];
  currentSession: UserSession;
  onUpdateClub: (clubId: string, updates: Partial<Club>) => Promise<void>;
  onFoundClub: (clubData: Partial<Club>) => Promise<void>;
}

export const ClubsTab: React.FC<ClubsTabProps> = ({
  clubs,
  currentSession,
  onUpdateClub,
  onFoundClub,
}) => {
  const [selectedClubId, setSelectedClubId] = useState<string>(clubs[0]?.id || '');
  const [foundModal, setFoundModal] = useState<boolean>(false);
  const [addMemberModal, setAddMemberModal] = useState<boolean>(false);
  const [addReactionModal, setAddReactionModal] = useState<boolean>(false);

  // New club form
  const [newClubName, setNewClubName] = useState('');
  const [newClubLeader, setNewClubLeader] = useState(currentSession.username || 'Capitán');
  const [newClubIcon, setNewClubIcon] = useState('⚽');
  const [newClubDesc, setNewClubDesc] = useState('');

  // Add member form
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('ST');
  const [memberValue, setMemberValue] = useState(300);

  // Reaction form
  const [rxName, setRxName] = useState('');
  const [rxPartA, setRxPartA] = useState('');
  const [rxPartB, setRxPartB] = useState('');
  const [rxReq, setRxReq] = useState('Ambos en Flow');
  const [rxEffect, setRxEffect] = useState('+30% en TIR / REG para jugada final');

  // Treasury adjust form
  const [treasuryAdjustVal, setTreasuryAdjustVal] = useState(0);

  const selectedClub = clubs.find(c => c.id === selectedClubId) || clubs[0];

  const isLeaderOrAdmin =
    currentSession.role === 'admin' ||
    currentSession.adminKey === selectedClub?.liderKey ||
    currentSession.username?.toLowerCase() === selectedClub?.lider?.toLowerCase();

  const handleAddMember = async () => {
    if (!selectedClub || !memberName.trim()) return;
    if (selectedClub.miembros.length >= selectedClub.limiteMiembros) {
      alert(`El club ha alcanzado el límite máximo de ${selectedClub.limiteMiembros} miembros.`);
      return;
    }

    const cost = Number(memberValue);
    if (selectedClub.tesoreria < cost) {
      alert(`Fondos insuficientes en la tesorería (¥${selectedClub.tesoreria}). Costo de fichaje: ¥${cost}`);
      return;
    }

    const newMember: ClubMember = {
      id: `m-${Date.now()}`,
      nombre: memberName,
      rol: memberRole,
      posicion: memberRole,
      valorMercado: cost,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };

    const updatedMembers = [...selectedClub.miembros, newMember];
    const newTreasury = selectedClub.tesoreria - cost;

    await onUpdateClub(selectedClub.id, {
      miembros: updatedMembers,
      tesoreria: newTreasury
    });

    setMemberName('');
    setAddMemberModal(false);
    confetti({ particleCount: 40 });
  };

  const handleReleaseMember = async (memberId: string) => {
    if (!selectedClub) return;
    const member = selectedClub.miembros.find(m => m.id === memberId);
    if (!member) return;

    if (member.nombre.toLowerCase().includes(selectedClub.lider.toLowerCase())) {
      alert('El Capitán no puede ser liberado del club.');
      return;
    }

    const confirmRelease = confirm(`¿Liberar a ${member.nombre}? Se devolverá el 80% de su valor (¥${Math.round(member.valorMercado * 0.8)}) a la tesorería como compensación.`);
    if (!confirmRelease) return;

    const compensation = Math.round(member.valorMercado * 0.8);
    const updatedMembers = selectedClub.miembros.filter(m => m.id !== memberId);
    const newTreasury = selectedClub.tesoreria + compensation;

    await onUpdateClub(selectedClub.id, {
      miembros: updatedMembers,
      tesoreria: newTreasury
    });
  };

  const handleAddReaction = async () => {
    if (!selectedClub || !rxName.trim()) return;
    const newReaction: ChemicalReaction = {
      nombre: rxName,
      participanteA: rxPartA || selectedClub.lider,
      participanteB: rxPartB,
      requisito: rxReq,
      efecto: rxEffect
    };

    const updated = [...(selectedClub.reaccionesQuimicas || []), newReaction];
    await onUpdateClub(selectedClub.id, { reaccionesQuimicas: updated });
    setRxName('');
    setAddReactionModal(false);
  };

  const handleAdjustTreasury = async (delta: number) => {
    if (!selectedClub) return;
    const newTreasury = Math.max(0, selectedClub.tesoreria + delta);
    await onUpdateClub(selectedClub.id, { tesoreria: newTreasury });
  };

  const handleFoundNewClub = async () => {
    if (!newClubName.trim()) return;
    await onFoundClub({
      nombre: newClubName,
      lider: newClubLeader,
      descripcion: newClubDesc || 'Club recién fundado bajo el ego supremo.',
      icono: newClubIcon || '⚽',
      color: '#3b82f6'
    });
    setNewClubName('');
    setFoundModal(false);
    confetti({ particleCount: 60 });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Sistema Oficial de Clubes & Clanes Egoístas</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-chakra font-bold text-white mt-1">
            Gestión de Clubes, Plantillas y Tesorería
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            "Los clubes no son refugios para los débiles, son empresas del ego. El capitán administra el capital, domina el mercado y devora el ranking."
          </p>
        </div>

        <button
          onClick={() => setFoundModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-chakra font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Fundar Club Egoísta (¥5,000 Yenes)
        </button>
      </div>

      {/* Clubs Selector Horizontal Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {clubs.map((club) => {
          const isSelected = selectedClub?.id === club.id;
          return (
            <button
              key={club.id}
              onClick={() => setSelectedClubId(club.id)}
              className={`p-4 rounded-xl border text-left transition flex items-center gap-3 ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
              }`}
            >
              <span className="text-2xl">{club.icono}</span>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-chakra font-bold text-white block truncate">{club.nombre}</span>
                <span className="text-[10px] text-slate-400 font-mono block">Líder: {club.lider}</span>
                <span className="text-[10px] text-yellow-400 font-mono font-bold">¥{club.tesoreria.toLocaleString()}</span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedClub && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Club Info & Treasury & Prestige Box */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <span className="text-3xl p-2 bg-slate-900 rounded-xl border border-slate-700">{selectedClub.icono}</span>
                <div>
                  <h3 className="text-lg font-chakra font-bold text-white">{selectedClub.nombre}</h3>
                  <p className="text-xs text-cyan-400 font-mono">Capitán: {selectedClub.lider}</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 italic">"{selectedClub.descripcion}"</p>

              {/* Treasury Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-950/30 to-slate-950 border border-yellow-500/40 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-yellow-300 font-bold uppercase flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    Tesorería del Club
                  </span>
                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded font-mono font-bold">
                    ¥{selectedClub.tesoreria.toLocaleString()} Yenes
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Fondos para contrataciones, sueldos y apuestas entre clubes.
                </p>

                {isLeaderOrAdmin && (
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => handleAdjustTreasury(500)}
                      className="flex-1 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-[10px] font-mono rounded border border-yellow-500/30 transition"
                    >
                      +¥500 (Victoria)
                    </button>
                    <button
                      onClick={() => handleAdjustTreasury(200)}
                      className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono rounded border border-slate-700 transition"
                    >
                      +¥200 (Patrocinio)
                    </button>
                  </div>
                )}
              </div>

              {/* Prestige Level Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-cyan-400 font-bold">Nivel de Prestigio: {selectedClub.nivelPrestigio}</span>
                  <span className="text-slate-400">{selectedClub.puntosPrestigio} Pts</span>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full transition-all"
                    style={{ width: `${Math.min(100, (selectedClub.puntosPrestigio / 300) * 100)}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-300 font-mono space-y-1 pt-1">
                  <div>
                    {selectedClub.nivelPrestigio === 1 && '• Rango Underground: Límite 11 miembros. Bono +8% en stats.'}
                    {selectedClub.nivelPrestigio === 2 && '• Rango Promesa: Subvención ¥200/sem. +10% en entrenamientos.'}
                    {selectedClub.nivelPrestigio === 3 && '• Rango Consolidado: Subvención ¥400/sem. Cláusulas de rescisión activas.'}
                    {selectedClub.nivelPrestigio >= 4 && '• Rango Élite: Cupo a Torneos Internacionales. Límite 12 miembros.'}
                  </div>
                  <div className="text-yellow-300 font-bold">
                    👑 Privilegio Capitán: +10 IQ pasivo y +25 Pts semanales por cada fichaje en el Top 10 Global.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Plantilla / Roster & Chemical Reactions */}
          <div className="lg:col-span-8 space-y-6">
            {/* Roster Box */}
            <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-chakra font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    Lista Oficial de Plantilla ({selectedClub.miembros.length} / {selectedClub.limiteMiembros})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Jugadores contratados bajo la bandera del club.
                  </p>
                </div>

                {isLeaderOrAdmin && (
                  <button
                    onClick={() => setAddMemberModal(true)}
                    className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-chakra font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    Fichar Jugador
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedClub.miembros.map((m, idx) => {
                  const isCap = idx === 0 || m.nombre.toLowerCase().includes(selectedClub.lider.toLowerCase());
                  return (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl border border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={m.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt={m.nombre}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-chakra font-bold text-white truncate">{m.nombre}</span>
                            {isCap && (
                              <span className="text-[10px] font-mono bg-yellow-500 text-black px-1.5 py-0.2 rounded font-bold">CAP</span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block font-mono">{m.rol}</span>
                          <span className="text-[11px] text-yellow-400 font-mono font-bold block">
                            ¥{m.valorMercado.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {isLeaderOrAdmin && !isCap && (
                        <button
                          onClick={() => handleReleaseMember(m.id)}
                          title="Liberar jugador y recibir compensación"
                          className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 border border-rose-900/50 transition text-xs"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chemical Reactions (Sinergias del Capitán) */}
            <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-chakra font-bold text-white flex items-center gap-2">
                    <Flame className="w-5 h-5 text-rose-400" />
                    Reacciones Químicas (Sinergias Tácticas)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Combinaciones estratégicas que se activan en partido cuando el Capitán coordina con un miembro específico.
                  </p>
                </div>

                {isLeaderOrAdmin && (
                  <button
                    onClick={() => setAddReactionModal(true)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-chakra text-xs rounded-xl border border-slate-700 transition"
                  >
                    + Nueva Sinergia
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {selectedClub.reaccionesQuimicas?.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500 font-mono">
                    No hay reacciones químicas configuradas aún para este club.
                  </div>
                ) : (
                  selectedClub.reaccionesQuimicas?.map((rx, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-rose-900/40 bg-gradient-to-r from-rose-950/20 to-slate-950 text-xs space-y-1.5"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-chakra font-bold text-rose-300 text-sm">
                          {rx.nombre}
                        </span>
                        <span className="text-[10px] font-mono bg-rose-900/40 text-rose-200 px-2 py-0.5 rounded border border-rose-800">
                          Requisito: {rx.requisito}
                        </span>
                      </div>
                      <div className="font-mono text-slate-400 text-[11px]">
                        Participantes: <span className="text-white">{rx.participanteA}</span> + <span className="text-white">{rx.participanteB}</span>
                      </div>
                      <div className="text-cyan-300 font-mono text-[11px]">
                        Efecto Táctico: {rx.efecto}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Fichar Jugador */}
      {addMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1024] border border-cyan-500/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="text-base font-chakra font-bold text-white">
                Fichar Jugador para {selectedClub.nombre}
              </h4>
              <button onClick={() => setAddMemberModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nombre del Jugador</label>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="Ej: Alexis Ness"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Rol / Posición</label>
                <input
                  type="text"
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  placeholder="MF / CMF"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Valor de Mercado / Costo (¥ Yenes)</label>
                <input
                  type="number"
                  value={memberValue}
                  onChange={(e) => setMemberValue(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Se debitará de la tesorería (Fondos disponibles: ¥{selectedClub.tesoreria})
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setAddMemberModal(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddMember}
                className="px-4 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs"
              >
                Confirmar Fichaje
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nueva Sinergia */}
      {addReactionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1024] border border-rose-500/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="text-base font-chakra font-bold text-white">
                Crear Reacción Química
              </h4>
              <button onClick={() => setAddReactionModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nombre de la Sinergia</label>
                <input
                  type="text"
                  value={rxName}
                  onChange={(e) => setRxName(e.target.value)}
                  placeholder="Ej: Dupla de Impacto Directo"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Participante B (Compañero)</label>
                <input
                  type="text"
                  value={rxPartB}
                  onChange={(e) => setRxPartB(e.target.value)}
                  placeholder="Nombre del compañero"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Efecto Táctico</label>
                <input
                  type="text"
                  value={rxEffect}
                  onChange={(e) => setRxEffect(e.target.value)}
                  placeholder="+30% en TIR / REG para jugada final"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setAddReactionModal(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddReaction}
                className="px-4 py-1.5 bg-rose-500 text-white font-bold rounded-lg text-xs"
              >
                Guardar Sinergia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Fundar Club */}
      {foundModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1024] border border-cyan-500/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="text-base font-chakra font-bold text-white">
                Fundar Club Egoísta Oficial (¥5,000 Yenes)
              </h4>
              <button onClick={() => setFoundModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nombre del Club</label>
                <input
                  type="text"
                  value={newClubName}
                  onChange={(e) => setNewClubName(e.target.value)}
                  placeholder="Ej: Manshine City / Ubers"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Capitán / Líder</label>
                <input
                  type="text"
                  value={newClubLeader}
                  onChange={(e) => setNewClubLeader(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Icono / Emoji</label>
                <input
                  type="text"
                  value={newClubIcon}
                  onChange={(e) => setNewClubIcon(e.target.value)}
                  placeholder="🦁 / ⚡ / 🛡️"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Filosofía del Club</label>
                <textarea
                  rows={2}
                  value={newClubDesc}
                  onChange={(e) => setNewClubDesc(e.target.value)}
                  placeholder="Rigor físico, velocidad implacable..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl text-[11px] text-cyan-300">
                Al fundar el club recibirás ¥5,000 Yenes en tesorería y cupo para 11 miembros iniciales.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setFoundModal(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleFoundNewClub}
                className="px-4 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs"
              >
                Registrar Club ante Admins
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

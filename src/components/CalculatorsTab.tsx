import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Target, Zap, Shield, Sparkles, Crosshair, Award, HelpCircle, Flame } from 'lucide-react';

export const CalculatorsTab: React.FC = () => {
  const [subTab, setSubTab] = useState<'zonas' | 'tiroLibre' | 'regate'>('zonas');

  // Shot zone states
  const [col, setCol] = useState<number>(3);
  const [row, setRow] = useState<string>('L');
  const [baseTir, setBaseTir] = useState<number>(100);
  const [activeFlow, setActiveFlow] = useState<string>('none');
  const [predeterminadoFlow, setPredeterminadoFlow] = useState<string>('none');
  const [preFlowBuff, setPreFlowBuff] = useState<string>('none');
  const [activeSkillBuff, setActiveSkillBuff] = useState<string>('none');
  
  // Defender
  const [targetType, setTargetType] = useState<'rival' | 'bluelockman'>('bluelockman');
  const [defVal, setDefVal] = useState<number>(90);
  const [blmReflejos, setBlmReflejos] = useState<number>(30);
  const [teamFlowSynergy, setTeamFlowSynergy] = useState<boolean>(false);

  // Roulette
  const [rouletteSpinning, setRouletteSpinning] = useState<boolean>(false);
  const [rouletteResult, setRouletteResult] = useState<string | null>(null);

  // Free kick states
  const [fkDistance, setFkDistance] = useState<number>(24);
  const [fkCurve, setFkCurve] = useState<number>(75);
  const [fkPower, setFkPower] = useState<number>(85);
  const [fkIq, setFkIq] = useState<number>(60);
  const [fkResult, setFkResult] = useState<{ score: number; zone: string; status: 'gol' | 'palo' | 'bloqueo' | 'fuera' } | null>(null);

  // Regate states
  const [regAtacante, setRegAtacante] = useState<number>(100);
  const [defDefensor, setDefDefensor] = useState<number>(90);
  const [regResult, setRegResult] = useState<string | null>(null);

  // Grid definition
  const columns = [1, 2, 3, 4, 5];
  const rows = ['M', 'L', 'K', 'J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];

  // Zone multiplier calculation based on rules
  const getMultiplier = (r: string, c: number): { mult: number; label: string; color: string } => {
    // Green areas (x1.0): 2-4/L-M and 2-4/A-B
    if (['L', 'M', 'A', 'B'].includes(r) && [2, 3, 4].includes(c)) {
      return { mult: 1.0, label: 'Área Chica (Zona Verde)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500' };
    }
    // Deep Wings & 3/4 lines (x0.9): 1L, 5L, 1M, 5M, H, F
    if (['H', 'F'].includes(r) || (['L', 'M', 'B', 'A'].includes(r) && [1, 5].includes(c))) {
      return { mult: 0.9, label: 'Zona Ofensiva Profunda', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500' };
    }
    // Lateral Big Area (x0.8): 1K, 5K, 1C, 5C
    if (['K', 'C'].includes(r) && [1, 5].includes(c)) {
      return { mult: 0.8, label: 'Lateral de Área Grande', color: 'bg-blue-500/20 text-blue-300 border-blue-500' };
    }
    // Creation lines (x0.7): I, E, 1J, 5J, 1D, 5D
    if (['I', 'E'].includes(r) || (['J', 'D'].includes(r) && [1, 5].includes(c))) {
      return { mult: 0.7, label: 'Línea de Creación', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500' };
    }
    // Balcony / Intersections (x0.2): 3J, 3D, 2J, 4J, 2D, 4D
    if (['J', 'D'].includes(r) && [2, 3, 4].includes(c)) {
      return { mult: 0.2, label: 'Balcón del Área', color: 'bg-amber-500/20 text-amber-300 border-amber-500' };
    }
    // Low probability (x0.1): Semicircles (2-4/K, 2-4/C), Center Circle G1-5
    return { mult: 0.1, label: 'Baja Probabilidad / Media Cancha', color: 'bg-rose-500/20 text-rose-300 border-rose-500' };
  };

  const currentZone = getMultiplier(row, col);

  // Compute shooter buffs
  let totalBuffPercent = 0;
  if (activeSkillBuff === '30') totalBuffPercent += 0.30;
  if (activeSkillBuff === '20') totalBuffPercent += 0.20;
  if (activeSkillBuff === '10') totalBuffPercent += 0.10;

  if (preFlowBuff === '50') totalBuffPercent += 0.50;
  if (preFlowBuff === '40') totalBuffPercent += 0.40;
  if (preFlowBuff === '30') totalBuffPercent += 0.30;

  if (activeFlow === '90') totalBuffPercent += 0.90;
  if (activeFlow === '80') totalBuffPercent += 0.80;
  if (activeFlow === '70') totalBuffPercent += 0.70;

  if (predeterminadoFlow === '70') totalBuffPercent += 0.70;
  if (predeterminadoFlow === '60') totalBuffPercent += 0.60;
  if (predeterminadoFlow === '50') totalBuffPercent += 0.50;

  const tirBuffed = baseTir + (baseTir * totalBuffPercent);
  const finalPotencialTir = Math.round(tirBuffed * currentZone.mult * 10) / 10;

  // Defender effective stat
  let effectiveDef = defVal;
  if (targetType === 'bluelockman') {
    effectiveDef = defVal + (blmReflejos * 0.5);
    if (teamFlowSynergy) {
      effectiveDef *= 1.25; // 25% synergy buff
    }
    // If shooting from low multiplier zones, Blue Lock Man receives extra buff
    if (currentZone.mult <= 0.2) {
      effectiveDef += 15;
    }
  }
  effectiveDef = Math.round(effectiveDef * 10) / 10;

  // 10% Advantage Rule
  const tirAdvantage = finalPotencialTir >= effectiveDef * 1.10;
  const defAdvantage = effectiveDef >= finalPotencialTir * 1.10;
  const isRouletteZone = !tirAdvantage && !defAdvantage;

  const handleSpinRoulette = () => {
    setRouletteSpinning(true);
    setRouletteResult(null);
    setTimeout(() => {
      const outcomes = ['¡GOL ÉPICO! (La rozó el portero pero entró)', '¡DESVÍO AL PALO! (El balón rebota afuera)', '¡TIRO DE ESQUINA! (El portero desvía con la uña)', '¡BLOQUEO IN EXTREMIS! (El defensa se barre y salva)'];
      const pick = outcomes[Math.floor(Math.random() * outcomes.length)];
      setRouletteResult(pick);
      setRouletteSpinning(false);
      if (pick.includes('GOL')) {
        confetti({ particleCount: 70, spread: 60 });
      }
    }, 1200);
  };

  const handleCalculateFreeKick = () => {
    // Free kick formula: curve quality + power vs distance + iq bonus
    const curveBonus = (fkCurve / 100) * 40;
    const powerAccuracy = 100 - Math.abs(fkPower - (fkDistance * 3.2));
    const iqBonus = (fkIq / 100) * 20;
    const totalScore = Math.min(100, Math.round(curveBonus + (powerAccuracy * 0.4) + iqBonus));

    let status: 'gol' | 'palo' | 'bloqueo' | 'fuera' = 'fuera';
    let zone = 'Por encima del travesaño';

    if (totalScore >= 80) {
      status = 'gol';
      zone = '¡Directo a la escuadra superior derecha! (Imparable)';
      confetti({ particleCount: 90, spread: 70 });
    } else if (totalScore >= 65) {
      status = 'gol';
      zone = 'Curva cerrada junto al poste izquierdo';
      confetti({ particleCount: 50, spread: 50 });
    } else if (totalScore >= 45) {
      status = 'palo';
      zone = 'Impacto violento en el poste';
    } else if (totalScore >= 30) {
      status = 'bloqueo';
      zone = 'La barrera logra rozar el balón';
    } else {
      status = 'fuera';
      zone = 'El tiro se desvía sin peligro';
    }

    setFkResult({ score: totalScore, zone, status });
  };

  const handleCalculateRegate = () => {
    const regAuto = regAtacante >= defDefensor * 1.10;
    const defAuto = defDefensor >= regAtacante * 1.10;

    if (regAuto) {
      setRegResult('¡VICTORIA AUTOMÁTICA DEL REGATE! (Supera al defensor por más del 10%)');
      confetti({ particleCount: 40 });
    } else if (defAuto) {
      setRegResult('¡DEFENSA AUTOMÁTICA! (El defensor anticipa y recupera el balón con +10% de ventaja)');
    } else {
      setRegResult('¡ZONA DE DUELO (Diferencia < 10%)! Requiere resolución por Ruleta o Dado del Staff.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border border-slate-800 bg-[#080d1e]/80 backdrop-blur rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm tracking-widest uppercase">
              <Sparkles className="w-4 h-4" />
              <span>Laboratorio Táctico de Blue Lock</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-chakra font-bold text-white mt-1">
              Calculadoras del Ego & Zonas de Campo
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Matemáticas oficiales del sistema: Multiplicadores de cancha (A-M, 1-5), regla del 10% y simulador de tiro libre.
            </p>
          </div>

          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSubTab('zonas')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                subTab === 'zonas' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              🎯 Zonas & Tiro Flow
            </button>
            <button
              onClick={() => setSubTab('tiroLibre')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                subTab === 'tiroLibre' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚽ Tiros Libres con Curva
            </button>
            <button
              onClick={() => setSubTab('regate')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                subTab === 'regate' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚡ Duelo Regate vs DEF
            </button>
          </div>
        </div>
      </div>

      {subTab === 'zonas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive Field Grid */}
          <div className="lg:col-span-5 border border-slate-800 bg-[#070b18] rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Plano de Coordenadas (A-M / 1-5)</span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  Casilla: {row}{col} ({currentZone.mult}x)
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Haz clic sobre cualquier cuadrícula para posicionar a tu jugador y calcular el multiplicador de tiro.
              </p>

              {/* Pitch Diagram */}
              <div className="relative border-2 border-slate-700 rounded-xl bg-gradient-to-b from-[#09152b] via-[#0b1c3a] to-[#09152b] p-3 overflow-hidden shadow-inner">
                {/* Goal area top & bottom */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 border-b-2 border-x-2 border-cyan-500/50 bg-cyan-950/20" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-6 border-t-2 border-x-2 border-cyan-500/50 bg-cyan-950/20" />
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-700/60" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-slate-700/60" />

                <div className="grid grid-cols-5 gap-1.5 relative z-10 text-center font-mono">
                  {rows.map((r) =>
                    columns.map((c) => {
                      const isSelected = row === r && col === c;
                      const z = getMultiplier(r, c);
                      return (
                        <button
                          key={`${r}-${c}`}
                          onClick={() => { setRow(r); setCol(c); }}
                          title={`Casilla ${r}${c} (${z.mult}x)`}
                          className={`h-7 rounded text-[11px] font-bold flex items-center justify-center transition border ${
                            isSelected
                              ? 'bg-cyan-400 text-black border-white shadow-[0_0_12px_rgba(6,182,212,0.8)] scale-105 z-20'
                              : z.mult === 1.0
                              ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/50'
                              : z.mult >= 0.8
                              ? 'bg-cyan-950/40 text-cyan-300 border-cyan-800/40 hover:bg-cyan-900/60'
                              : z.mult >= 0.7
                              ? 'bg-indigo-950/40 text-indigo-300 border-indigo-800/40 hover:bg-indigo-900/60'
                              : z.mult === 0.2
                              ? 'bg-amber-950/40 text-amber-300 border-amber-800/40 hover:bg-amber-900/60'
                              : 'bg-slate-900/60 text-slate-500 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {r}{c}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Zone Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] font-mono">
              <div className="flex items-center gap-1.5 bg-emerald-950/30 border border-emerald-900/50 px-2 py-1 rounded text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                <span>Área Chica (x1.0)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-cyan-950/30 border border-cyan-900/50 px-2 py-1 rounded text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                <span>Ofensiva / 3/4 (x0.9 - x0.8)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-indigo-950/30 border border-indigo-900/50 px-2 py-1 rounded text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block" />
                <span>Creación (x0.7)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-950/30 border border-amber-900/50 px-2 py-1 rounded text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span>Balcón del Área (x0.2)</span>
              </div>
            </div>
          </div>

          {/* Configuration & Duel Resolution */}
          <div className="lg:col-span-7 space-y-5">
            <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h3 className="text-lg font-chakra font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-500" />
                  Potenciación del Atacante (TIR Base & Buffs)
                </h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${currentZone.color}`}>
                  Multiplicador {row}{col}: {currentZone.mult}x
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-mono uppercase block mb-1">Tiro Base (TIR)</label>
                  <input
                    type="number"
                    value={baseTir}
                    onChange={(e) => setBaseTir(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-400 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-mono uppercase block mb-1">Habilidad Activa</label>
                  <select
                    value={activeSkillBuff}
                    onChange={(e) => setActiveSkillBuff(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none"
                  >
                    <option value="none">Sin buff de habilidad (0%)</option>
                    <option value="10">+10% (TIR en combo de 3 stats)</option>
                    <option value="20">+20% (TIR en combo de 2 stats)</option>
                    <option value="30">+30% (TIR en 1 stat única)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-mono uppercase block mb-1">Pre-Flow</label>
                  <select
                    value={preFlowBuff}
                    onChange={(e) => setPreFlowBuff(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none"
                  >
                    <option value="none">Sin Pre-Flow</option>
                    <option value="30">+30% (Pre-Flow en 3 stats)</option>
                    <option value="40">+40% (Pre-Flow en 2 stats)</option>
                    <option value="50">+50% (Pre-Flow en 1 stat)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-mono uppercase block mb-1">Flow Egoísta (A elegir)</label>
                  <select
                    value={activeFlow}
                    onChange={(e) => setActiveFlow(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none"
                  >
                    <option value="none">Sin Flow activo</option>
                    <option value="70">+70% (Flow en 3 stats)</option>
                    <option value="80">+80% (Flow en 2 stats)</option>
                    <option value="90">+90% (Flow en 1 stat)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-400 font-mono uppercase block mb-1">
                    Buff Predeterminado en Flow (Acumulativo)
                  </label>
                  <select
                    value={predeterminadoFlow}
                    onChange={(e) => setPredeterminadoFlow(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none"
                  >
                    <option value="none">Sin buff predeterminado</option>
                    <option value="50">+50% (Predeterminado en 3 stats)</option>
                    <option value="60">+60% (Predeterminado en 2 stats)</option>
                    <option value="70">+70% (Predeterminado en 1 stat — ej. Kaiser Impact Magnus)</option>
                  </select>
                </div>
              </div>

              {/* Formula breakdown */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                <div className="text-slate-400">
                  Fórmula: (TIR Base: {baseTir}) + ({Math.round(totalBuffPercent * 100)}% Buffs) = <span className="text-cyan-300 font-bold">{tirBuffed}</span>
                </div>
                <div className="text-slate-300">
                  Potencial Final: {tirBuffed} × {currentZone.mult} (Zona {row}{col}) ={' '}
                  <span className="text-cyan-400 font-bold text-base">{finalPotencialTir} TIR Final</span>
                </div>
              </div>
            </div>

            {/* Defender / Portero */}
            <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h3 className="text-lg font-chakra font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-400" />
                  Defensa Rival o Blue Lock Man
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTargetType('bluelockman')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
                      targetType === 'bluelockman' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    Blue Lock Man
                  </button>
                  <button
                    onClick={() => setTargetType('rival')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
                      targetType === 'rival' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    Defensor Rival
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-mono uppercase block mb-1">
                    {targetType === 'bluelockman' ? 'DEF Portero' : 'DEF Rival'}
                  </label>
                  <input
                    type="number"
                    value={defVal}
                    onChange={(e) => setDefVal(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-indigo-400 outline-none"
                  />
                </div>

                {targetType === 'bluelockman' && (
                  <div>
                    <label className="text-xs text-slate-400 font-mono uppercase block mb-1">Reflejos (REF)</label>
                    <input
                      type="number"
                      value={blmReflejos}
                      onChange={(e) => setBlmReflejos(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-indigo-400 outline-none"
                    />
                  </div>
                )}
              </div>

              {targetType === 'bluelockman' && (
                <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    id="synergy"
                    checked={teamFlowSynergy}
                    onChange={(e) => setTeamFlowSynergy(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
                  />
                  <label htmlFor="synergy" className="text-xs text-slate-300">
                    <span className="font-bold text-white">Sinergia de Flow del Equipo:</span> Mínimo 2 defensores en Flow (+25% resistencia Blue Lock Man)
                  </label>
                </div>
              )}

              <div className="text-xs font-mono text-slate-400">
                Defensa Efectiva Total: <span className="text-indigo-300 font-bold text-sm">{effectiveDef}</span>
              </div>
            </div>

            {/* Duel Verdict according to 10% Advantage Rule */}
            <div className={`rounded-2xl p-5 border text-center transition ${
              tirAdvantage
                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                : defAdvantage
                ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                : 'bg-amber-950/40 border-amber-500/60 text-amber-200'
            }`}>
              <div className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-1">
                Regla del 10% | Comparativa: {finalPotencialTir} TIR vs {effectiveDef} DEF
              </div>

              {tirAdvantage && (
                <div className="space-y-2">
                  <div className="text-3xl font-chakra font-black text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-2">
                    <Sparkles className="w-7 h-7 text-emerald-400 animate-pulse" />
                    ¡GOL AUTOMÁTICO!
                  </div>
                  <p className="text-xs text-slate-300 max-w-lg mx-auto">
                    Tu Tiro Potencial ({finalPotencialTir}) supera en un 10% o más la Defensa rival ({effectiveDef} + 10% = {(effectiveDef * 1.1).toFixed(1)}). El tiro es imparable.
                  </p>
                </div>
              )}

              {defAdvantage && (
                <div className="space-y-2">
                  <div className="text-3xl font-chakra font-black text-rose-400 uppercase tracking-wider flex items-center justify-center gap-2">
                    <Shield className="w-7 h-7 text-rose-400" />
                    ¡BLOQUEO / ATAJADA AUTOMÁTICA!
                  </div>
                  <p className="text-xs text-slate-300 max-w-lg mx-auto">
                    La Defensa ({effectiveDef}) supera en un 10% o más el Tiro Potencial ({finalPotencialTir} + 10% = {(finalPotencialTir * 1.1).toFixed(1)}). El remate es neutralizado o atrapado.
                  </p>
                </div>
              )}

              {isRouletteZone && (
                <div className="space-y-3">
                  <div className="text-2xl font-chakra font-black text-amber-400 uppercase tracking-wider flex items-center justify-center gap-2">
                    <HelpCircle className="w-6 h-6 text-amber-400" />
                    ZONA DE DISPARO (RULETA DEL AZAR / DADO)
                  </div>
                  <p className="text-xs text-slate-300 max-w-lg mx-auto">
                    La diferencia entre Tiro ({finalPotencialTir}) y Defensa ({effectiveDef}) es menor al 10%. Según las reglas oficiales, el Staff o los jugadores deben resolver mediante ruleta.
                  </p>

                  <button
                    onClick={handleSpinRoulette}
                    disabled={rouletteSpinning}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-chakra font-bold rounded-xl shadow-lg transition transform active:scale-95 disabled:opacity-50"
                  >
                    {rouletteSpinning ? 'Girando la Ruleta...' : '🎲 Girar Ruleta Oficial de Disparo'}
                  </button>

                  {rouletteResult && (
                    <div className="mt-3 p-3 bg-slate-900/80 border border-amber-500/40 rounded-xl text-amber-300 font-mono font-bold text-sm animate-fade-in">
                      Resultado del Staff: {rouletteResult}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Free Kick Gauge */}
      {subTab === 'tiroLibre' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 border border-slate-800 bg-[#080d1e] rounded-2xl p-6 space-y-5">
            <h3 className="text-xl font-chakra font-bold text-white flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-cyan-400" />
              Parámetros de Tiro Libre con Efecto
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Distancia a Portería</span>
                  <span className="text-cyan-400 font-bold">{fkDistance} metros</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="35"
                  value={fkDistance}
                  onChange={(e) => setFkDistance(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Efecto / Curva Aplicada</span>
                  <span className="text-cyan-400 font-bold">{fkCurve}% (Rosca extrema)</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={fkCurve}
                  onChange={(e) => setFkCurve(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Potencia de Golpeo</span>
                  <span className="text-cyan-400 font-bold">{fkPower} km/h estimado</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="130"
                  value={fkPower}
                  onChange={(e) => setFkPower(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>IQ Táctico (Lectura de punto ciego)</span>
                  <span className="text-cyan-400 font-bold">{fkIq} IQ</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="150"
                  value={fkIq}
                  onChange={(e) => setFkIq(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <button
                onClick={handleCalculateFreeKick}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-chakra font-bold rounded-xl shadow-lg transition"
              >
                Ejecutar Lanzamiento de Falta
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 border border-slate-800 bg-[#080d1e] rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-chakra font-bold text-white mb-3">Trayectoria Visual de la Curva</h3>
              
              {/* Goal visual simulation */}
              <div className="relative h-64 border-2 border-slate-700 rounded-xl bg-gradient-to-t from-emerald-950/30 via-slate-950 to-slate-900 overflow-hidden p-4 flex flex-col justify-end">
                {/* Goal frame */}
                <div className="relative border-4 border-slate-300 w-4/5 mx-auto h-40 bg-slate-900/40 rounded-t-lg">
                  {/* Goal net pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px] opacity-20" />
                  
                  {/* Top corners target */}
                  <div className="absolute top-1 right-1 w-8 h-8 border-2 border-dashed border-red-500/80 rounded bg-red-500/20 flex items-center justify-center text-[10px] text-red-400 font-bold">
                    Escuadra
                  </div>
                  <div className="absolute top-1 left-1 w-8 h-8 border-2 border-dashed border-red-500/80 rounded bg-red-500/20 flex items-center justify-center text-[10px] text-red-400 font-bold">
                    Escuadra
                  </div>

                  {/* Wall simulation */}
                  <div className="absolute -bottom-1 left-1/4 flex gap-1 items-end">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-5 h-16 bg-slate-700 border border-slate-500 rounded-t-md opacity-80" />
                    ))}
                  </div>

                  {/* Ball trajectory curve rendering */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 160">
                    <path
                      d={`M 150 160 Q ${150 + fkCurve * 0.9} 80 ${fkResult?.status === 'gol' ? '260 25' : '150 20'}`}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="3"
                      strokeDasharray="4"
                    />
                    {fkResult?.status === 'gol' && (
                      <circle cx="260" cy="25" r="7" fill="#22c55e" className="animate-ping" />
                    )}
                  </svg>
                </div>
              </div>
            </div>

            {fkResult && (
              <div className={`mt-4 p-4 rounded-xl border font-mono ${
                fkResult.status === 'gol'
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300'
              }`}>
                <div className="flex justify-between items-center text-sm font-bold mb-1">
                  <span>Precisión Calculada: {fkResult.score}%</span>
                  <span className="uppercase text-xs px-2 py-0.5 rounded bg-black/40">
                    {fkResult.status === 'gol' ? '⚽ ¡GOOOOL!' : fkResult.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{fkResult.zone}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Regate vs Defensa Duel Tab */}
      {subTab === 'regate' && (
        <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-6 max-w-2xl mx-auto space-y-5">
          <div className="text-center space-y-1">
            <h3 className="text-2xl font-chakra font-bold text-white flex items-center justify-center gap-2">
              <Zap className="w-6 h-6 text-cyan-400" />
              Calculadora de Duelo 1 vs 1: Regate vs Defensa
            </h3>
            <p className="text-xs text-slate-400">
              Regla Oficial: Si el Regate supera en ≥10% la Defensa rival, gana automáticamente. Si la Defensa supera en ≥10% el Regate, recupera el balón. De lo contrario, van a Ruleta.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs text-cyan-400 font-mono uppercase block mb-1">Regate Atacante (REG)</label>
              <input
                type="number"
                value={regAtacante}
                onChange={(e) => setRegAtacante(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-lg font-bold outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">+10% umbral: {(regAtacante * 1.1).toFixed(1)}</span>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs text-indigo-400 font-mono uppercase block mb-1">Defensa Rival (DEF)</label>
              <input
                type="number"
                value={defDefensor}
                onChange={(e) => setDefDefensor(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-lg font-bold outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">+10% umbral: {(defDefensor * 1.1).toFixed(1)}</span>
            </div>
          </div>

          <button
            onClick={handleCalculateRegate}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-chakra font-bold rounded-xl shadow-lg transition"
          >
            Evaluar Duelo 1v1
          </button>

          {regResult && (
            <div className="p-4 bg-slate-900 border border-cyan-500/50 rounded-xl text-center font-mono text-sm text-cyan-300">
              {regResult}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

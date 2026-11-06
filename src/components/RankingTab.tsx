import React, { useState } from 'react';
import { RankingPlayer } from '../types.ts';
import { Trophy, TrendingUp, Award, Search, Sparkles, Share2, Copy, Shield, Crown } from 'lucide-react';
import { openWhatsAppShare } from '../utils/whatsapp.ts';

interface RankingTabProps {
  ranking: RankingPlayer[];
  currentPlayerName?: string;
}

export const RankingTab: React.FC<RankingTabProps> = ({ ranking, currentPlayerName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClub, setSelectedClub] = useState('ALL');
  const [copied, setCopied] = useState(false);

  const clubsList = Array.from(new Set(ranking.map(r => r.club)));

  const filteredRanking = ranking.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.apodo && p.apodo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesClub = selectedClub === 'ALL' || p.club === selectedClub;
    return matchesSearch && matchesClub;
  });

  const getEgoQuote = (pos: number) => {
    if (pos === 1) return '👑 ¡Eres el Número 1 indiscutible! El mercado rinde pleitesía ante tu talento. Devóralos a todos.';
    if (pos === 2) return '🥈 ¡Estás en la cima! Tan solo una jugada magistral te separa de arrebatar el trono.';
    if (pos === 3) return '🥉 ¡El podio es tuyo! Tu valor sigue disparándose, continúa perfeccionando tus armas.';
    if (pos <= 5) return '🔥 ¡Top 5 de Élite! Los clubes más poderosos están observando cada toque tuyo.';
    if (pos <= 10) return '⚡ ¡Top 10 Mundial! Otorga +25 Pts semanales de Stats a tu Capitán. Estás en la mira.';
    return '⚽ Tu ego apenas está despertando. El mercado no miente: tus goles te llevarán a la cima.';
  };

  const generateRankingWhatsAppText = () => {
    const list = ranking.map(p => {
      let icon = '🎖️';
      if (p.posicion === 1) icon = '🥇';
      else if (p.posicion === 2) icon = '🥈';
      else if (p.posicion === 3) icon = '🥉';
      return `${icon} \`${p.posicion}° | ${p.nombre} ── ¥${p.valorMercado.toLocaleString()} Yenes\`\n> ${p.posicionRol}`;
    }).join('\n');

    return `🏆 *` + `𝐁𝐋𝐔𝐄 𝐋𝐎𝐂𝐊 — 𝐑𝐀𝐍𝐊𝐈𝐍𝐆 𝐃𝐄 𝐕𝐀𝐋𝐎𝐑 𝐃𝐄 𝐌𝐄𝐑𝐂𝐀𝐃𝐎` + `* ⚽\`
ㅤ            𓆩👑𓆪 日本の天才 — *` + `𝐑𝐄𝐈𝐆𝐍 𝐎𝐅 𝐄𝐆𝐎𝐈𝐒𝐓𝐒` + `* 𓆩⚽𓆪
> *"El mercado no miente: tu valor define tu lugar en el campo."*
━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━
${list}
━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━
          *` + `𝗢𝗡𝗟𝗬 𝗧𝗛𝗘 𝗘𝗚𝗢𝗜𝗦𝗧 𝗪𝗜𝗟𝗟 𝗥𝗘𝗠𝗔𝗜𝗡.` + `* ⚽
─── ⋆⋅☆⋅⋆ ───`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateRankingWhatsAppText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    openWhatsAppShare(generateRankingWhatsAppText());
  };

  // Find user in ranking if exists
  const myPlayer = ranking.find(p => currentPlayerName && p.nombre.toLowerCase() === currentPlayerName.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Top Banner with Hype Quote & Actions */}
      <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>Mercado de Fichajes Oficial • Blue Lock</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-chakra font-bold text-white mt-1">
              Ranking de Valor de Mercado (Yenes ¥)
            </h2>
            <p className="text-xs text-slate-400 italic mt-1 font-mono">
              "El mercado no miente: tu valor define tu lugar en el campo. Solo el egoísta permanecerá."
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-mono transition"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? '¡Copiado!' : 'Copiar Ranking'}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-chakra font-bold text-xs rounded-xl shadow transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              Publicar en WhatsApp
            </button>
          </div>
        </div>

        {/* Motivational Banner for Current User */}
        {myPlayer && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-cyan-950/50 to-indigo-950/40 border border-cyan-500/40 flex items-center gap-3">
            <Crown className="w-7 h-7 text-yellow-400 shrink-0 animate-bounce" />
            <div>
              <span className="text-xs font-mono text-cyan-300 font-bold uppercase block">
                Tu Posición Actual: {myPlayer.posicion}° Lugar — ¥{myPlayer.valorMercado.toLocaleString()}
              </span>
              <p className="text-xs text-white mt-0.5">{getEgoQuote(myPlayer.posicion)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Podium Top 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ranking.slice(0, 3).map((player, idx) => {
          const medal = idx === 0 ? '🥇 1° LUGAR' : idx === 1 ? '🥈 2° LUGAR' : '🥉 3° LUGAR';
          const borderColor = idx === 0 ? 'border-yellow-500/60 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : idx === 1 ? 'border-slate-400/60' : 'border-amber-600/60';
          const bgGrad = idx === 0 ? 'from-yellow-950/20 via-slate-900 to-[#080d1e]' : 'from-slate-900 to-[#080d1e]';

          return (
            <div
              key={player.id}
              className={`border-2 ${borderColor} bg-gradient-to-b ${bgGrad} rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between`}
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-chakra font-black tracking-wider text-yellow-400 uppercase">
                    {medal}
                  </span>
                  <span className="text-xs font-mono bg-black/40 text-slate-300 px-2 py-0.5 rounded">
                    Nvl {player.nivel}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={player.avatarUrl}
                    alt={player.nombre}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-slate-700"
                  />
                  <div>
                    <h3 className="text-base font-chakra font-bold text-white leading-tight">{player.nombre}</h3>
                    {player.apodo && (
                      <span className="text-[11px] font-mono text-cyan-400 block">"{player.apodo}"</span>
                    )}
                    <span className="text-xs text-slate-400">{player.club}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">VALOR DE MERCADO</span>
                  <span className="text-xl font-chakra font-extrabold text-yellow-400">
                    ¥{player.valorMercado.toLocaleString()}
                  </span>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-400">
                  <div>⚽ {player.goles} Goles</div>
                  <div>👟 {player.asistencias} Asist.</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Table View */}
      <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por jugador o apodo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          {/* Club Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedClub('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition whitespace-nowrap ${
                selectedClub === 'ALL' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
              }`}
            >
              Todos ({ranking.length})
            </button>
            {clubsList.map(club => (
              <button
                key={club}
                onClick={() => setSelectedClub(club)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition whitespace-nowrap ${
                  selectedClub === club ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
                }`}
              >
                {club}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                <th className="py-3 px-3">Puesto</th>
                <th className="py-3 px-3">Jugador / Posición</th>
                <th className="py-3 px-3">Club</th>
                <th className="py-3 px-3">Nivel</th>
                <th className="py-3 px-3 text-center">Goles</th>
                <th className="py-3 px-3 text-center">Asist.</th>
                <th className="py-3 px-3 text-center">Robos</th>
                <th className="py-3 px-3 text-center">MVP</th>
                <th className="py-3 px-3 text-right">Valor en Yenes (¥)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRanking.map((p) => {
                const isTop1 = p.posicion === 1;
                const isTop10 = p.posicion <= 10;
                const isMe = currentPlayerName && p.nombre.toLowerCase() === currentPlayerName.toLowerCase();

                return (
                  <tr
                    key={p.id}
                    className={`transition hover:bg-slate-900/60 ${
                      isMe ? 'bg-cyan-950/30 border-l-2 border-cyan-400' : ''
                    }`}
                  >
                    <td className="py-3.5 px-3 font-bold font-chakra">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs ${
                        p.posicion === 1 ? 'bg-yellow-500 text-slate-950 font-black' :
                        p.posicion === 2 ? 'bg-slate-400 text-slate-950 font-black' :
                        p.posicion === 3 ? 'bg-amber-600 text-white font-black' :
                        isTop10 ? 'text-cyan-400' : 'text-slate-500'
                      }`}>
                        {p.posicion}°
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.avatarUrl}
                          alt={p.nombre}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="font-chakra font-bold text-white flex items-center gap-1.5">
                            <span>{p.nombre}</span>
                            {isMe && (
                              <span className="text-[10px] bg-cyan-500 text-black px-1.5 py-0.2 rounded font-mono font-bold">TÚ</span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block">{p.posicionRol}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-300 font-semibold">{p.club}</td>
                    <td className="py-3.5 px-3 text-cyan-300 font-bold">Nvl {p.nivel}</td>
                    <td className="py-3.5 px-3 text-center text-slate-200">{p.goles}</td>
                    <td className="py-3.5 px-3 text-center text-slate-200">{p.asistencias}</td>
                    <td className="py-3.5 px-3 text-center text-slate-200">{p.robos}</td>
                    <td className="py-3.5 px-3 text-center text-yellow-400 font-bold">{p.mvp}</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="text-base font-chakra font-bold text-yellow-400">
                        ¥{p.valorMercado.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

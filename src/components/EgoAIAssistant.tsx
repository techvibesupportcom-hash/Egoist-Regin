import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, Feather, Copy, Share2, CheckCircle, RefreshCw, Flame, Dumbbell, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { openWhatsAppShare } from '../utils/whatsapp.ts';

export const EgoAIAssistant: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'chat' | 'roleplay'>('roleplay');

  // --- Chat State ---
  const [messages, setMessages] = useState<Array<{ sender: 'ego' | 'user'; text: string }>>([
    {
      sender: 'ego',
      text: '¿Qué buscan, diamantes en bruto? Soy Jinpachi Ego. Puedo responder cualquier duda técnica del sistema de Blue Lock (cálculos de tiro, coordenadas, regla del 10%, renacimientos) o redactar sus roles de entrenamiento y partidos de más de 50 líneas con narración humana impecable.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  const quickQuestions = [
    '¿Cómo funciona la regla matemática del 10%?',
    '¿Qué necesito para desbloquear Meta-Vision?',
    'Calcula un remate desde casilla L3 con 120 TIR y Flow activo',
    '¿Cómo se ganan los 100 puntos de entrenamiento cada 24h?',
    '¿Cuáles son los beneficios de subir de Prestigio en mi Club?'
  ];

  const handleSendChat = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loadingChat) return;

    const userMsg = { sender: 'user' as const, text: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoadingChat(true);

    try {
      const res = await fetch('/api/ai/ego-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        { sender: 'ego', text: data.reply || 'El ego es lo único que define tu supervivencia.' }
      ]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        { sender: 'ego', text: 'Error en la conexión con el servidor de Blue Lock. Vuelve a intentarlo.' }
      ]);
    } finally {
      setLoadingChat(false);
    }
  };

  // --- Roleplay Generator State ---
  const [personaje, setPersonaje] = useState('Michael Kaiser');
  const [tipoRol, setTipoRol] = useState<'entrenamiento' | 'partido' | 'social' | 'prueba_ficha' | 'libre'>('entrenamiento');
  const [longitudMinima, setLongitudMinima] = useState<number>(50);
  const [contextoExtra, setContextoExtra] = useState('');
  const [generatingRole, setGeneratingRole] = useState(false);
  const [roleOutput, setRoleOutput] = useState<string>('');
  const [roleLineCount, setRoleLineCount] = useState<number>(0);
  const [copySuccess, setCopySuccess] = useState(false);

  const CHARACTER_PRESETS = [
    'Michael Kaiser',
    'Sae Itoshi',
    'Seishiro Nagi',
    'Kunigami Rensuke',
    'Chigiri Hyoma',
    'Yoichi Isagi',
    'Rin Itoshi',
    'Meguru Bachira',
    'Shoei Barou',
    'Chinatsu Gojo',
    'Poseidón',
    'Fuji Kiseki'
  ];

  const handleGenerateRoleplay = async () => {
    if (!personaje.trim()) {
      alert('Por favor ingresa o selecciona un personaje.');
      return;
    }

    setGeneratingRole(true);
    setCopySuccess(false);

    try {
      const res = await fetch('/api/ai/generate-roleplay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaje,
          tipoRol,
          longitudMinima,
          contexto: contextoExtra,
          actividades: tipoRol === 'entrenamiento' ? ['Gym (+30)', 'Cancha (+30)', 'Social (+10)'] : []
        })
      });

      const data = await res.json();
      if (data.roleplayText) {
        setRoleOutput(data.roleplayText);
        setRoleLineCount(data.lineCount || data.roleplayText.split('\n').filter((l: string) => l.trim().length > 0).length);
        confetti({ particleCount: 70, spread: 60 });
      }
    } catch (err) {
      console.error('Error generating roleplay:', err);
      alert('Ocurrió un error al generar el rol. Por favor intenta de nuevo.');
    } finally {
      setGeneratingRole(false);
    }
  };

  const handleCopyRoleplay = () => {
    if (!roleOutput) return;
    navigator.clipboard.writeText(roleOutput);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleShareWhatsAppRoleplay = () => {
    if (!roleOutput) return;
    openWhatsAppShare(roleOutput);
  };

  return (
    <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-6 flex flex-col min-h-[700px]">
      {/* Header with Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center shadow-[0_0_18px_rgba(168,85,247,0.45)]">
            <Bot className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-chakra font-bold text-white flex items-center gap-2">
              <span>IA de Jinpachi Ego</span>
              <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/40">
                Oficial Blue Lock
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Generador de rol humano de 50+ líneas y consultoría estratégica de reglas 24/7.
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveMode('roleplay')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-chakra font-bold transition ${
              activeMode === 'roleplay'
                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Feather className="w-4 h-4" />
            <span>Redactor de Rol (50+ Líneas)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-chakra font-bold transition ${
              activeMode === 'chat'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Consultar Reglas & Ego</span>
          </button>
        </div>
      </div>

      {/* MODE 1: REDACTOR DE ROL HUMANIZADO (50+ LÍNEAS) */}
      {activeMode === 'roleplay' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <label className="text-xs font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                1. Elige o escribe tu personaje
              </label>

              {/* Preset pills */}
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {CHARACTER_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPersonaje(p)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition border ${
                      personaje === p
                        ? 'bg-cyan-500 text-slate-950 font-bold border-white'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <input
                type="text"
                value={personaje}
                onChange={(e) => setPersonaje(e.target.value)}
                placeholder="O escribe otro nombre (ej. Isagi, Rin, tu OC...)"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none focus:border-cyan-400"
              />
            </div>

            {/* Tipo de Rol */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
              <label className="text-xs font-mono font-bold text-purple-400 uppercase flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5" />
                2. Tipo de Rol a redactar
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'entrenamiento' as const, label: '🏋️‍♂️ Entrenamiento Diario (Gym + Cancha)', desc: 'Para reclamar los +100 pts diarios' },
                  { id: 'partido' as const, label: '⚽ Jugada de Partido (L3 ➜ M3)', desc: 'Desmarques, regate y tiro al arco' },
                  { id: 'prueba_ficha' as const, label: '📝 Prueba de Rol de Ficha', desc: 'Narración de calidad para ser aprobado' },
                  { id: 'social' as const, label: '💬 Rol Social & Rivalidad', desc: 'Convivencia, comedor o Instagram' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTipoRol(t.id)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      tipoRol === t.id
                        ? 'bg-purple-950/60 border-purple-500 text-white shadow'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-[11px] font-chakra">{t.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Longitud & Detalles */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                  3. Extensión Mínima de Líneas
                </label>
                <div className="flex gap-1">
                  {[50, 75, 100].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setLongitudMinima(num)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border transition ${
                        longitudMinima === num
                          ? 'bg-amber-500 text-slate-950 border-white'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {num}+ líneas
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Contexto o situación especial (Opcional):
                </label>
                <textarea
                  rows={2}
                  value={contextoExtra}
                  onChange={(e) => setContextoExtra(e.target.value)}
                  placeholder="Ej. Entrenando de madrugada con la música al máximo, tiros con efecto desde el balcón J3, buscando superar a Sae..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleGenerateRoleplay}
                disabled={generatingRole}
                className="w-full py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-chakra font-bold text-sm rounded-xl transition shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generatingRole ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Redactando rol humanizado (+{longitudMinima} líneas)...</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 text-yellow-300" />
                    <span>🔥 Redactar Rol Humanizado ({longitudMinima}+ Líneas con IA)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output Column */}
          <div className="lg:col-span-7 flex flex-col bg-slate-950/80 border border-slate-800 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
              <div>
                <span className="text-xs font-mono uppercase text-cyan-400 font-bold block">
                  Rol Generado para: {personaje}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Estilo: Prosa humana, rica en sensaciones y sin clichés de IA.
                </span>
              </div>

              {roleOutput && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {roleLineCount} líneas generadas ✓
                  </span>
                </div>
              )}
            </div>

            {/* Roleplay Text Area / Scrollbox */}
            <div className="flex-1 min-h-[350px] max-h-[500px] overflow-y-auto bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed select-text">
              {roleOutput ? (
                roleOutput
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                  <Feather className="w-8 h-8 text-slate-600" />
                  <p className="font-chakra font-bold text-sm text-slate-400">
                    Aún no has generado tu rol
                  </p>
                  <p className="text-xs max-w-sm">
                    Selecciona a tu personaje (ej. Kaiser, Sae, Nagi o tu propio OC) y presiona "Redactar Rol Humanizado" para obtener más de 50 líneas escritas con narrativa cinematográfica.
                  </p>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            {roleOutput && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 font-mono">
                  Listo para copiar a tu ficha o comprobante de entrenamiento de WhatsApp.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateRoleplay}
                    disabled={generatingRole}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Regenerar
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyRoleplay}
                    className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-mono font-bold transition shadow"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copySuccess ? '¡Copiado al Portapapeles!' : 'Copiar Rol Completo'}
                  </button>
                  <button
                    type="button"
                    onClick={handleShareWhatsAppRoleplay}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold transition shadow"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Enviar por WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: Q&A CHAT CON JINPACHI EGO */}
      {activeMode === 'chat' && (
        <div className="flex flex-col flex-1">
          {/* Quick Prompts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-2">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendChat(q)}
                className="text-[11px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-800 transition whitespace-nowrap shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 font-mono text-xs max-h-[460px]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ego' && (
                  <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-500/40 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-purple-400" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-xl leading-relaxed whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-tr-none'
                      : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none shadow'
                  }`}
                >
                  {m.text}
                </div>
                {m.sender === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-cyan-900 border border-cyan-500/40 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-cyan-300" />
                  </div>
                )}
              </div>
            ))}
            {loadingChat && (
              <div className="flex items-center gap-2 text-xs text-purple-400 font-mono italic">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Jinpachi Ego está analizando las variables del campo...</span>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="pt-3 border-t border-slate-800 flex gap-2 mt-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="Pregúntale a Jinpachi Ego sobre tiros, casillas, ojos o entrenamientos..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-purple-400 font-mono"
            />
            <button
              onClick={() => handleSendChat()}
              disabled={loadingChat || !input.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-chakra font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Consultar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

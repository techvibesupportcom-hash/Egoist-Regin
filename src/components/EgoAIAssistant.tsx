import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, HelpCircle, Terminal } from 'lucide-react';

export const EgoAIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ sender: 'ego' | 'user'; text: string }>>([
    {
      sender: 'ego',
      text: '¿Qué buscan, diamantes en bruto? Soy Jinpachi Ego. Estoy aquí para erradicar cualquier duda sobre el sistema de Blue Lock. Pregúntenme sobre cálculos de tiro, coordenadas de gol, la regla del 10%, renacimientos o tesorerías de clubes.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickQuestions = [
    '¿Cómo funciona la regla matemática del 10%?',
    '¿Qué necesito para desbloquear Meta-Vision?',
    'Calcula un remate desde casilla L3 con 120 TIR y Flow activo',
    '¿Cómo se ganan los 100 puntos de entrenamiento cada 24h?',
    '¿Cuáles son los beneficios de subir de Prestigio en mi Club?'
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { sender: 'user' as const, text: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

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
      setLoading(false);
    }
  };

  return (
    <div className="border border-slate-800 bg-[#080d1e] rounded-2xl p-6 flex flex-col h-[680px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Bot className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-chakra font-bold text-white flex items-center gap-2">
              <span>Jinpachi Ego — Asistente de Consulta 24/7</span>
              <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/40">
                IA Oficial
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Abierto para jugadores y administradores. Respuestas inmediatas sobre reglas y fórmulas.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-2">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="text-[11px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-800 transition whitespace-nowrap shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 font-mono text-xs">
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
        {loading && (
          <div className="flex items-center gap-2 text-xs text-purple-400 font-mono italic">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Jinpachi Ego está analizando las variables del campo...</span>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="pt-3 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Pregúntale a Jinpachi Ego sobre tiros, casillas, ojos o entrenamientos..."
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-purple-400 font-mono"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-chakra font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>Consultar</span>
        </button>
      </div>
    </div>
  );
};

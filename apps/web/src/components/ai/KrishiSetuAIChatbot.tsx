'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  X, 
  Minus, 
  Send, 
  Bot, 
  User as UserIcon, 
  TrendingUp, 
  Building2, 
  MapPin, 
  Calculator, 
  HelpCircle, 
  RotateCcw,
  Languages,
  Maximize2,
  ChevronRight,
  ShieldCheck,
  Wheat,
  Scale
} from 'lucide-react';
import { api } from '../../lib/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  cardType?: 'comparison' | 'trend' | 'value_calculation' | 'fpo' | 'advisory';
  cardData?: any;
  actions?: Array<{ label: string; action: string; href?: string; prompt?: string }>;
  isDemoAi?: boolean;
  disclaimer?: string;
  timestamp: string;
}

const INITIAL_GREETING_EN = `Namaste! 👋 I'm **KrishiSetu AI**, your Smart Market Assistant.

I can help you compare mandi prices, understand market trends and make informed selling decisions.

What would you like to know today?`;

const INITIAL_GREETING_HI = `नमस्ते! 👋 मैं **कृषिसेतु AI** हूँ, आपका स्मार्ट मंडी सहायक।

मैं मंडियों के भावों की तुलना करने, बाज़ार के रुझानों को समझने और सही बिक्री निर्णय लेने में आपकी मदद कर सकता हूँ।

आज आप क्या जानना चाहते हैं?`;

const QUICK_QUESTIONS_EN = [
  '🌾 Wheat price today',
  '📍 Best nearby mandi',
  '📈 Price trend',
  '💡 Should I sell now?',
  '👥 Find an FPO',
];

const QUICK_QUESTIONS_HI = [
  '🌾 गेहूं का आज का भाव',
  '📍 सबसे अच्छी मंडी',
  '📈 भाव ट्रेंड',
  '💡 क्या अभी बेचूं?',
  '👥 एफपीओ (FPO) ढूंढें',
];

export function KrishiSetuAIChatbot() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionContext, setSessionContext] = useState<{
    crop?: string;
    quantityQtl?: number;
    location?: string;
    transportCost?: number;
  }>({
    crop: 'Wheat',
    quantityQtl: 20,
    location: 'Haldwani / Pune Region',
    transportCost: 1500,
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-init',
      role: 'assistant',
      content: INITIAL_GREETING_EN,
      actions: [
        { label: '🌾 Wheat price today', action: 'prompt', prompt: 'Wheat price today' },
        { label: '📍 Best nearby mandi', action: 'prompt', prompt: 'Which mandi has the best price for wheat?' },
        { label: '📈 Price trend', action: 'prompt', prompt: 'Is wheat price increasing?' },
        { label: '💡 Should I sell now?', action: 'prompt', prompt: 'Should I sell my wheat now or wait?' },
        { label: '👥 Find an FPO', action: 'prompt', prompt: 'Find farmer group for wheat' },
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  // Global trigger event listener to open AI chatbot from external buttons (Dashboard, Landing)
  useEffect(() => {
    const handleOpenAi = (e: CustomEvent<{ prompt?: string }>) => {
      setIsOpen(true);
      setIsMinimized(false);
      if (e.detail?.prompt) {
        handleSendMessage(e.detail.prompt);
      }
    };
    window.addEventListener('open-krishisetu-ai' as any, handleOpenAi as any);
    return () => {
      window.removeEventListener('open-krishisetu-ai' as any, handleOpenAi as any);
    };
  }, []);

  const handleLanguageToggle = (lang: 'en' | 'hi') => {
    setLanguage(lang);
    if (messages.length === 1 && messages[0].id === 'msg-init') {
      setMessages([
        {
          id: 'msg-init',
          role: 'assistant',
          content: lang === 'hi' ? INITIAL_GREETING_HI : INITIAL_GREETING_EN,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: language === 'hi' ? INITIAL_GREETING_HI : INITIAL_GREETING_EN,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      // Build conversation history payload
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.sendChatMessage({
        message: text,
        conversationHistory: historyPayload,
        language,
        context: sessionContext,
      });

      if (res.sessionContext) {
        setSessionContext((prev) => ({ ...prev, ...res.sessionContext }));
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        cardType: res.cardType,
        cardData: res.cardData,
        actions: res.actions,
        isDemoAi: res.isDemoAi,
        disclaimer: res.disclaimer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.warn('[KrishiSetu AI] Chat error:', err);
      const fallbackAiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content:
          language === 'hi'
            ? 'क्षमा करें, AI सेवा से संपर्क नहीं हो पा रहा है। आप नीचे दिए गए बटनों से मंडी भाव जांच सकते हैं।'
            : "Sorry, I'm unable to connect to the AI service right now. You can still explore current market prices and compare mandis.",
        cardType: 'advisory',
        isDemoAi: true,
        actions: [
          { label: 'View Market Prices', action: 'navigate', href: '/markets' },
          { label: 'Compare Mandis', action: 'navigate', href: '/markets' },
        ],
        disclaimer: 'AI insights are based on available market data and are not guaranteed forecasts.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (act: { label: string; action: string; href?: string; prompt?: string }) => {
    if (act.action === 'navigate' && act.href) {
      router.push(act.href);
    } else if (act.prompt) {
      handleSendMessage(act.prompt);
    } else if (act.href) {
      router.push(act.href);
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 bg-[#ef4d23] hover:bg-[#d84018] text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 group border-2 border-white/20"
          aria-label="Open KrishiSetu AI Market Assistant"
        >
          <div className="relative">
            <span className="text-xl">🌾</span>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
          </div>
          <div className="text-left leading-tight">
            <div className="text-sm font-semibold tracking-wide flex items-center gap-1.5">
              KrishiSetu AI
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            </div>
            <div className="text-[10px] text-white/80 font-medium">Market Assistant</div>
          </div>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ${
            isMinimized
              ? 'bottom-6 right-6 w-72 h-14 rounded-2xl shadow-xl bg-white border border-neutral-200 overflow-hidden flex items-center justify-between px-4'
              : 'bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[410px] h-full sm:h-[640px] sm:max-h-[85vh] bg-white sm:rounded-3xl shadow-2xl border border-neutral-200/80 flex flex-col overflow-hidden'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#09090b] to-[#1e1e24] text-white px-4 py-3.5 flex items-center justify-between shrink-0 border-b border-white/10 select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ef4d23] to-[#f5734c] flex items-center justify-center text-lg shadow-sm">
                🌾
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-sm tracking-tight text-white flex items-center gap-1">
                    KrishiSetu AI
                  </h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 font-medium">
                  {language === 'hi' ? 'स्मार्ट मंडी सहायक' : 'Smart Market Assistant'}
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1.5">
              {!isMinimized && (
                <>
                  {/* Language Selector */}
                  <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10 text-[11px] font-medium mr-1">
                    <button
                      onClick={() => handleLanguageToggle('en')}
                      className={`px-2 py-0.5 rounded ${
                        language === 'en' ? 'bg-[#ef4d23] text-white' : 'text-neutral-300 hover:text-white'
                      }`}
                      title="English"
                    >
                      EN
                    </button>
                    <button
                      onClick={() => handleLanguageToggle('hi')}
                      className={`px-2 py-0.5 rounded ${
                        language === 'hi' ? 'bg-[#ef4d23] text-white' : 'text-neutral-300 hover:text-white'
                      }`}
                      title="हिन्दी"
                    >
                      हिन्दी
                    </button>
                  </div>

                  <button
                    onClick={handleClearChat}
                    className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                    title={language === 'hi' ? 'चैट साफ़ करें' : 'Clear Chat'}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition hidden sm:inline-flex"
                    title="Minimize"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </>
              )}

              {isMinimized && (
                <button
                  onClick={() => setIsMinimized(false)}
                  className="p-1.5 text-neutral-600 hover:text-neutral-900 rounded-lg"
                  title="Expand"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* If Minimized, skip body rendering */}
          {!isMinimized && (
            <>
              {/* Context bar / Active Crop & Session */}
              <div className="bg-neutral-50 px-4 py-1.5 border-b border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-neutral-800">
                    🌾 {sessionContext.crop || 'Wheat'}
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span>{sessionContext.quantityQtl || 20} Qtl tracked</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium text-[10px] border border-emerald-200">
                    Advisory Only
                  </span>
                </div>
              </div>

              {/* Chat Message Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#fbfaf8]">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl p-3.5 shadow-sm text-[13px] leading-relaxed break-words ${
                        m.role === 'user'
                          ? 'bg-[#ef4d23] text-white rounded-tr-none'
                          : 'bg-white text-neutral-800 border border-neutral-200/90 rounded-tl-none'
                      }`}
                    >
                      {/* AI Header with Badge */}
                      {m.role === 'assistant' && (
                        <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-neutral-100 text-[11px] text-neutral-500">
                          <span className="font-semibold text-neutral-700 flex items-center gap-1">
                            🌾 KrishiSetu AI
                          </span>
                          {m.isDemoAi && (
                            <span className="bg-amber-50 text-amber-700 text-[9px] px-1.5 py-0.5 rounded font-medium border border-amber-200">
                              Demo AI
                            </span>
                          )}
                        </div>
                      )}

                      {/* Message Content formatted */}
                      <div className="whitespace-pre-line space-y-1.5">
                        {renderFormattedMessage(m.content)}
                      </div>

                      {/* Structured Rich Cards */}
                      {m.cardType && m.cardData && (
                        <div className="mt-3 pt-2.5 border-t border-neutral-100">
                          {m.cardType === 'comparison' && (
                            <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200">
                              <div className="flex items-center justify-between text-xs font-semibold text-neutral-900 mb-1.5">
                                <span className="flex items-center gap-1">
                                  🌾 {m.cardData.crop} Market Comparison
                                </span>
                                <span className="text-emerald-700 bg-emerald-100/70 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                  Best Option
                                </span>
                              </div>
                              <div className="bg-white rounded-lg p-2.5 border border-neutral-200 shadow-2xs space-y-1">
                                <div className="text-sm font-bold text-neutral-900">
                                  {m.cardData.bestMandi}
                                </div>
                                <div className="flex items-baseline justify-between">
                                  <span className="text-base font-extrabold text-[#ef4d23]">
                                    ₹{m.cardData.modalPrice?.toLocaleString('en-IN')}{' '}
                                    <span className="text-xs font-normal text-neutral-500">/ quintal</span>
                                  </span>
                                  <span className="text-xs text-neutral-500 font-medium">
                                    {m.cardData.distanceKm} km away
                                  </span>
                                </div>
                                {m.cardData.trend && (
                                  <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 pt-0.5">
                                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>↗ {m.cardData.trendPercent || 'Increasing'}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {m.cardType === 'trend' && (
                            <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200">
                              <div className="flex items-center justify-between text-xs font-semibold text-neutral-900 mb-2">
                                <span>📈 7-Day Price Trajectory</span>
                                <span className="text-emerald-700 font-bold">{m.cardData.change7Day}</span>
                              </div>
                              {/* Simple SVG sparkline chart */}
                              <div className="h-16 w-full bg-white rounded-lg p-2 border border-neutral-200 flex items-end justify-between gap-1.5">
                                {[2210, 2240, 2290, 2340, 2390, 2420, 2450].map((val, idx) => {
                                  const height = `${((val - 2150) / (2500 - 2150)) * 100}%`;
                                  return (
                                    <div
                                      key={idx}
                                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 rounded-t transition-all relative group"
                                      style={{ height }}
                                    >
                                      <div className="hidden group-hover:block absolute -top-6 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[9px] px-1 py-0.5 rounded whitespace-nowrap z-10">
                                        ₹{val}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                                <span>Day 1</span>
                                <span>Today (₹{m.cardData.currentPrice})</span>
                              </div>
                            </div>
                          )}

                          {m.cardType === 'value_calculation' && (
                            <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200 space-y-1.5">
                              <div className="text-xs font-semibold text-neutral-900 flex items-center gap-1">
                                <Calculator className="w-3.5 h-3.5 text-[#ef4d23]" />
                                <span>Estimated Realization Breakdown</span>
                              </div>
                              <div className="bg-white rounded-lg p-2.5 border border-neutral-200 space-y-1 text-xs">
                                <div className="flex justify-between text-neutral-600">
                                  <span>Quantity:</span>
                                  <span className="font-semibold text-neutral-900">
                                    {m.cardData.quantityQtl} Quintals
                                  </span>
                                </div>
                                <div className="flex justify-between text-neutral-600">
                                  <span>Gross Value ({m.cardData.quantityQtl} × ₹{m.cardData.pricePerQtl}):</span>
                                  <span className="font-semibold text-neutral-900">
                                    ₹{m.cardData.grossValue?.toLocaleString('en-IN')}
                                  </span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                  <span>Est. Freight/Deductions:</span>
                                  <span>− ₹{m.cardData.transportCost?.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="border-t border-neutral-100 pt-1 flex justify-between font-bold text-emerald-700">
                                  <span>Est. Net Realization:</span>
                                  <span>₹{m.cardData.netValue?.toLocaleString('en-IN')}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {m.cardType === 'fpo' && (
                            <div className="bg-emerald-50/70 rounded-xl p-3 border border-emerald-200">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 mb-1">
                                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{m.cardData.fpoName}</span>
                              </div>
                              <p className="text-[11px] text-neutral-600 mb-2">
                                📍 {m.cardData.location}
                              </p>
                              <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <div className="bg-white rounded p-1.5 border border-emerald-100">
                                  <div className="text-neutral-500">Members</div>
                                  <div className="font-bold text-neutral-900">{m.cardData.membersCount} Farmers</div>
                                </div>
                                <div className="bg-white rounded p-1.5 border border-emerald-100">
                                  <div className="text-neutral-500">Aggregated</div>
                                  <div className="font-bold text-neutral-900">{m.cardData.aggregatedProduceQtl} Qtl</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actionable buttons */}
                      {m.actions && m.actions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-neutral-100">
                          {m.actions.map((act, i) => (
                            <button
                              key={i}
                              onClick={() => handleActionClick(act)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-100 hover:bg-[#ef4d23] hover:text-white text-neutral-800 transition shadow-2xs border border-neutral-200/80 active:scale-95"
                            >
                              <span>{act.label}</span>
                              <ChevronRight className="w-3 h-3 opacity-60" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Disclaimer */}
                      {m.disclaimer && (
                        <div className="mt-2 text-[10px] text-neutral-400 italic flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-neutral-400 shrink-0" />
                          <span>{m.disclaimer}</span>
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-neutral-400 px-1 mt-1 font-mono">
                      {m.timestamp}
                    </span>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex items-start">
                    <div className="bg-white border border-neutral-200 rounded-2xl rounded-tl-none p-3 shadow-xs text-xs text-neutral-600 flex items-center gap-2">
                      <div className="flex gap-1 items-center">
                        <span className="w-2 h-2 rounded-full bg-[#ef4d23] animate-bounce"></span>
                        <span className="w-2 h-2 rounded-full bg-[#ef4d23] animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 rounded-full bg-[#ef4d23] animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                      <span className="font-medium">
                        {language === 'hi'
                          ? 'कृषिसेतु AI मंडी डेटा का विश्लेषण कर रहा है...'
                          : 'KrishiSetu AI is analyzing market data...'}
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="p-2.5 bg-white border-t border-neutral-100 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
                {(language === 'hi' ? QUICK_QUESTIONS_HI : QUICK_QUESTIONS_EN).map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    disabled={isLoading}
                    className="whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition active:scale-95 disabled:opacity-50 shrink-0 border border-neutral-200/60"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-neutral-200 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={
                      language === 'hi'
                        ? 'फसल भाव, मंडी या बिक्री के बारे में पूछें...'
                        : 'Ask about crop prices, mandis or selling...'
                    }
                    className="flex-1 bg-neutral-100 hover:bg-neutral-50 focus:bg-white text-neutral-900 placeholder:text-neutral-400 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-[#ef4d23] transition"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="p-2.5 bg-[#ef4d23] hover:bg-[#d84018] disabled:bg-neutral-300 text-white rounded-xl transition shadow-sm active:scale-95 shrink-0"
                    title={language === 'hi' ? 'भेजें' : 'Send'}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

function renderFormattedMessage(content: string) {
  // Simple markdown renderer for bold text and bullet points
  const lines = content.split('\n');
  return lines.map((line, idx) => {
    let formatted = line;
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <div key={idx} className={line.startsWith('•') ? 'pl-2' : ''}>
        {parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-bold text-neutral-900">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        })}
      </div>
    );
  });
}


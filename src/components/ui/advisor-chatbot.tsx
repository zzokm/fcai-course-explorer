"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChatTeardropText, X, Gear, PaperPlaneRight, WarningCircle, CheckCircle, List, Plus, CaretLeft, CaretDown, PencilSimple } from "@phosphor-icons/react";
import { CustomDropdown } from "./custom-dropdown";

const PROVIDERS = [
  { id: "openai", name: "OpenAI", defaultModel: "gpt-4o-mini" },
  { id: "anthropic", name: "Anthropic", defaultModel: "claude-3-5-sonnet-20240620" },
  { id: "google", name: "Google Gemini", defaultModel: "gemini-1.5-flash" },
  { id: "groq", name: "Groq", defaultModel: "llama-3.1-8b-instant" },
  { id: "openrouter", name: "OpenRouter", defaultModel: "meta-llama/llama-3.1-8b-instruct:free" },
];

export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

type ChatSession = {
  id: string;
  title: string;
  updatedAt: number;
  messages: Message[];
};

export function AdvisorChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const [view, setView] = useState<"chat" | "settings" | "history">("settings");
  const [isClient, setIsClient] = useState(false);

  // Settings State
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [isProviderDropdownOpen, setIsProviderDropdownOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  // Auto-check Token State
  const [isCheckingToken, setIsCheckingToken] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [availableModels, setAvailableModels] = useState<{id: string, name: string}[]>([]);

  // Multi-chat State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    setIsClient(true);
    const accepted = localStorage.getItem("advisor_disclaimer_accepted");
    if (accepted === "true") setHasAcceptedDisclaimer(true);

    const savedProvider = localStorage.getItem("advisor_provider");
    const savedKey = localStorage.getItem("advisor_api_key");
    const savedModel = localStorage.getItem("advisor_model");
    
    if (savedProvider) setProvider(savedProvider);
    if (savedKey) setApiKey(savedKey);
    if (savedModel) setModel(savedModel);

    const savedSessionsStr = localStorage.getItem("advisor_sessions");
    let loadedSessions: ChatSession[] = [];
    if (savedSessionsStr) {
      try {
        loadedSessions = JSON.parse(savedSessionsStr);
      } catch (e) {}
    }

    if (loadedSessions.length === 0) {
      const newId = Date.now().toString() + "-" + Math.random().toString(36).substring(2, 9);
      const newSession: ChatSession = {
        id: newId,
        title: "New Conversation",
        updatedAt: Date.now(),
        messages: []
      };
      loadedSessions = [newSession];
      localStorage.setItem("advisor_sessions", JSON.stringify(loadedSessions));
    }
    
    setSessions(loadedSessions);
    setCurrentSessionId(loadedSessions[0].id);

    if (savedKey) {
      setView("chat");
    }
  }, []);

  // Auto-check Token logic
  useEffect(() => {
    if (!apiKey || apiKey.length < 5) {
      setIsTokenValid(null);
      setAvailableModels([]);
      return;
    }

    const checkToken = async () => {
      setIsCheckingToken(true);
      setIsTokenValid(null);
      try {
        const res = await fetch("/api/models", {
          headers: {
            "x-provider": provider,
            "x-api-key": apiKey
          }
        });
        if (res.ok) {
          const data = await res.json();
          setAvailableModels(data.models || []);
          if (data.models && data.models.length > 0) {
            // Pick default model if current model isn't in the list
            if (!data.models.find((m: any) => m.id === model)) {
              setModel(data.models[0].id);
            }
          }
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
          setAvailableModels([]);
        }
      } catch (err) {
        setIsTokenValid(false);
        setAvailableModels([]);
      }
      setIsCheckingToken(false);
    };

    const timer = setTimeout(checkToken, 800);
    return () => clearTimeout(timer);
  }, [apiKey, provider]); // Re-run if key or provider changes

  const createNewSession = () => {
    // If the current session is already empty, just switch to it and don't create duplicates
    const currentSession = sessions.find(s => s.id === currentSessionId);
    if (currentSession && currentSession.messages.length === 0) {
      setView("chat");
      return;
    }

    const newId = Date.now().toString() + "-" + Math.random().toString(36).substring(2, 9);
    const newSession: ChatSession = {
      id: newId,
      title: "New Conversation",
      updatedAt: Date.now(),
      messages: []
    };
    
    setSessions(prev => {
      // Clean up any existing empty sessions from history
      const cleaned = prev.filter(s => s.messages.length > 0);
      const next = [newSession, ...cleaned];
      localStorage.setItem("advisor_sessions", JSON.stringify(next));
      return next;
    });
    
    setCurrentSessionId(newId);
    setView("chat");
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newUserMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    const newMessages = [...messages, newUserMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-provider": provider,
          "x-api-key": apiKey,
          "x-model": model,
        },
        body: JSON.stringify({ messages: newMessages })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || res.statusText || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No stream available");

      const aiMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: aiMsgId, role: "assistant", content: "" }]);

      let done = false;
      let fullText = "";
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last.id === aiMsgId) {
              return [...prev.slice(0, -1), { ...last, content: last.content + chunk }];
            }
            return prev;
          });
        }
      }

      if (fullText.trim() === "") {
        setMessages(prev => prev.map(m => 
          m.id === aiMsgId 
            ? { ...m, content: "⚠️ **Error:** The AI provider returned an empty response. The selected model may be deprecated, unavailable, or your API key lacks access. Please select a different model." } 
            : m
        ));
        return;
      }
    } catch (err: any) {
      setMessages(prev => {
        const hasMsg = prev.some(m => m.id === aiMsgId);
        const errorMessage = `⚠️ **Error:** ${err.message === "Unauthorized" || err.message.includes("401") ? "API Key is invalid or expired. Please check settings." : err.message}`;
        if (hasMsg) {
          return prev.map(m => m.id === aiMsgId ? { ...m, content: errorMessage } : m);
        }
        return [...prev, { id: aiMsgId, role: "assistant", content: errorMessage }];
      });
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync messages when session changes
  useEffect(() => {
    if (currentSession) {
      setMessages(currentSession.messages);
    }
  }, [currentSessionId]);

  // Save messages to local storage whenever they change
  useEffect(() => {
    if (!currentSessionId || messages.length === 0) return;
    
    setSessions(prev => {
      const next = prev.map(s => {
        if (s.id === currentSessionId) {
          let title = s.title;
          if (title === "New Conversation" && messages.length > 0) {
            const firstUserMsg = messages.find(m => m.role === "user");
            if (firstUserMsg) {
              title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? "..." : "");
            }
          }
          return { ...s, messages, title, updatedAt: Date.now() };
        }
        return s;
      });
      localStorage.setItem("advisor_sessions", JSON.stringify(next));
      return next;
    });
  }, [messages, currentSessionId]);

  useEffect(() => {
    if (messagesEndRef.current && view === "chat") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, view]);

  const acceptDisclaimer = () => {
    localStorage.setItem("advisor_disclaimer_accepted", "true");
    setHasAcceptedDisclaimer(true);
    if (apiKey) {
      setView("chat");
    } else {
      setView("settings");
    }
  };

  const saveSettings = () => {
    localStorage.setItem("advisor_provider", provider);
    localStorage.setItem("advisor_api_key", apiKey);
    localStorage.setItem("advisor_model", model);
    setView("chat");
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      localStorage.setItem("advisor_sessions", JSON.stringify(next));
      if (currentSessionId === id) {
        if (next.length > 0) {
          setCurrentSessionId(next[0].id);
        } else {
          createNewSession();
        }
      }
      return next;
    });
  };

  const saveTitle = (id: string) => {
    if (editingTitle.trim()) {
      setSessions(prev => {
        const next = prev.map(s => s.id === id ? { ...s, title: editingTitle.trim() } : s);
        localStorage.setItem("advisor_sessions", JSON.stringify(next));
        return next;
      });
    }
    setEditingSessionId(null);
  };

  if (!isClient) return null;

  const glassStyle = {
    background: 'var(--card-bg-inner)',
    backdropFilter: 'blur(24px)',
    border: '1px solid var(--card-border-outer)',
    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.3)',
  };

  const inputStyle = {
    background: 'var(--card-bg-outer)',
    border: '1px solid var(--card-border-outer)',
    color: 'var(--foreground)',
    fontFamily: 'inherit',
  };

  const btnPrimaryStyle = {
    background: 'var(--foreground)',
    color: 'var(--background)',
    fontFamily: 'inherit',
  };

  const userBubbleStyle = {
    background: 'var(--foreground)',
    color: 'var(--background)',
    borderRadius: '1.25rem',
    borderBottomRightRadius: '0.25rem',
  };

  const aiBubbleStyle = {
    background: 'var(--card-bg-outer)',
    border: '1px solid var(--card-border-outer)',
    color: 'var(--foreground)',
    borderRadius: '1.25rem',
    borderBottomLeftRadius: '0.25rem',
  };

  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 50, fontFamily: 'var(--font-jakarta)' }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chatbox-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            style={{
              position: 'absolute',
              bottom: '4.5rem',
              right: 0,
              maxHeight: 'calc(100vh - 6rem)',
              borderRadius: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              ...glassStyle
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--card-border-outer)',
              background: 'rgba(0,0,0,0.02)',
              borderTopLeftRadius: '1.5rem',
              borderTopRightRadius: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {view !== "chat" && hasAcceptedDisclaimer ? (
                  <button onClick={() => setView("chat")} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--foreground)', display: 'flex', alignItems: 'center', padding: '0.25rem' }}>
                    <CaretLeft size={20} weight="bold" />
                  </button>
                ) : (
                  <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'var(--foreground)', color: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChatTeardropText size={18} weight="fill" />
                  </div>
                )}
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>{view === "settings" ? "Configuration" : view === "history" ? "Chat History" : "FCAI Advisor"}</h3>
                  {view === "chat" && <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.6 }}>AI Academic Assistant</p>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {hasAcceptedDisclaimer && view === "chat" && (
                  <>
                    <button onClick={() => createNewSession()} style={{ background: 'transparent', border: 'none', padding: '0.5rem', cursor: 'pointer', color: 'var(--foreground)', opacity: 0.6, borderRadius: '0.5rem' }}>
                      <Plus size={20} />
                    </button>
                    <button onClick={() => setView("history")} style={{ background: 'transparent', border: 'none', padding: '0.5rem', cursor: 'pointer', color: 'var(--foreground)', opacity: 0.6, borderRadius: '0.5rem' }}>
                      <List size={20} />
                    </button>
                    <button onClick={() => setView("settings")} style={{ background: 'transparent', border: 'none', padding: '0.5rem', cursor: 'pointer', color: 'var(--foreground)', opacity: 0.6, borderRadius: '0.5rem' }}>
                      <Gear size={20} />
                    </button>
                  </>
                )}
                <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', padding: '0.5rem', cursor: 'pointer', color: 'var(--foreground)', opacity: 0.6, borderRadius: '0.5rem' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              
              {!hasAcceptedDisclaimer ? (
                /* Disclaimer Screen */
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem', textAlign: 'center' }}>
                  <div style={{ width: '4rem', height: '4rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <WarningCircle size={32} weight="fill" />
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 700 }}>Important Disclaimer</h3>
                  <p style={{ margin: '0 0 2rem 0', fontSize: '0.875rem', opacity: 0.7, lineHeight: 1.6 }}>
                    This AI advisor provides guidance based on official faculty bylaws and course data, but <strong>cannot replace official academic advising</strong>.
                    <br/><br/>
                    Always verify critical information (like graduation requirements or prerequisites) with the faculty administration. Do not rely on this as your sole source of truth.
                  </p>
                  <button onClick={acceptDisclaimer} style={{ ...btnPrimaryStyle, width: '100%', padding: '0.875rem', border: 'none', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                    I Understand and Agree
                  </button>
                </div>
              ) : view === "settings" ? (
                /* Settings Screen */
                <div style={{ flex: 1, padding: '1.5rem' }}>
                  <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', opacity: 0.7 }}>Bring your own key (BYOK) to use the advisor. Keys are stored securely in your browser's local storage.</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ position: 'relative' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>AI Provider</label>
                      <CustomDropdown
                        value={provider}
                        options={PROVIDERS}
                        onChange={(val) => {
                          setProvider(val);
                          const p = PROVIDERS.find(x => x.id === val);
                          if (p) setModel(p.defaultModel);
                        }}
                        placeholder="Select Provider"
                        triggerStyle={{ background: 'transparent' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>API Key</label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type="password" 
                          value={apiKey} 
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder={`Enter your ${PROVIDERS.find(p => p.id === provider)?.name} key...`}
                          style={{ ...inputStyle, width: '100%', padding: '0.75rem 2.5rem 0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.875rem', outline: 'none' }}
                        />
                        <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                          {isCheckingToken ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 16, height: 16, border: '2px solid var(--foreground-muted)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                          ) : isTokenValid === true ? (
                            <CheckCircle size={18} weight="fill" color="#10b981" />
                          ) : isTokenValid === false ? (
                            <X size={18} weight="bold" color="#ef4444" />
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Show Model Name only if Token is Valid */}
                    {isTokenValid && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                        transition={{ duration: 0.3 }}
                      >
                        <div style={{ position: 'relative' }}>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Model</label>
                          
                          <CustomDropdown
                            value={model}
                            options={availableModels.length > 0 ? availableModels : [{ id: "", name: "No models found" }]}
                            disabled={availableModels.length === 0}
                            onChange={(val) => {
                              setModel(val);
                            }}
                            placeholder="Select Model"
                            triggerStyle={{ background: 'transparent' }}
                            dropdownStyle={{ maxHeight: '200px' }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <button 
                    onClick={saveSettings} 
                    disabled={!isTokenValid}
                    style={{ ...btnPrimaryStyle, width: '100%', padding: '0.875rem', border: 'none', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer', marginTop: '2rem', opacity: !isTokenValid ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <CheckCircle size={20} /> Save Configuration
                  </button>
                </div>
              ) : view === "history" ? (
                /* History Screen */
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid var(--card-border-outer)' }}>
                    <button onClick={() => createNewSession()} style={{ ...btnPrimaryStyle, width: '100%', padding: '0.75rem', border: 'none', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <Plus size={18} weight="bold" /> New Chat
                    </button>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                    {sessions.map(s => (
                      <div 
                        key={s.id}
                        onClick={() => { if (editingSessionId !== s.id) { setCurrentSessionId(s.id); setView("chat"); } }}
                        onMouseEnter={() => setHoveredSessionId(s.id)}
                        onMouseLeave={() => setHoveredSessionId(null)}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '0.75rem',
                          margin: '0.25rem 0',
                          cursor: 'pointer',
                          background: s.id === currentSessionId ? 'var(--card-bg-outer)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'background 0.2s',
                          gap: '0.5rem'
                        }}
                      >
                        <div style={{ overflow: 'hidden', flex: 1 }}>
                          {editingSessionId === s.id ? (
                            <input 
                              autoFocus
                              value={editingTitle}
                              onChange={e => setEditingTitle(e.target.value)}
                              onBlur={() => saveTitle(s.id)}
                              onKeyDown={e => e.key === 'Enter' && saveTitle(s.id)}
                              onClick={e => e.stopPropagation()}
                              style={{ ...inputStyle, width: '100%', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem' }}
                            />
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{s.title}</div>
                              {hoveredSessionId === s.id && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setEditingTitle(s.title); setEditingSessionId(s.id); }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--foreground)', opacity: 0.5, display: 'flex', padding: '0.125rem' }}
                                >
                                  <PencilSimple size={14} />
                                </button>
                              )}
                            </div>
                          )}
                          {editingSessionId !== s.id && (
                            <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.25rem' }}>{new Date(s.updatedAt).toLocaleDateString()}</div>
                          )}
                        </div>
                        <button onClick={(e) => deleteSession(s.id, e)} style={{ background: 'none', border: 'none', color: '#ef4444', opacity: 0.7, cursor: 'pointer', padding: '0.5rem', display: 'flex' }}>
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    {sessions.length === 0 && (
                      <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5, fontSize: '0.875rem' }}>
                        No chat history found.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Chat Screen */
                <>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {messages.length === 0 && (
                      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.5, padding: '1rem' }}>
                        <ChatTeardropText size={48} style={{ marginBottom: '1rem' }} />
                        <p style={{ fontSize: '0.875rem', margin: 0, maxWidth: '200px' }}>Hi! Ask me anything about FCAI courses, prerequisites, or bylaws.</p>
                      </div>
                    )}
                    {messages.map((m) => (
                      <div key={m.id} style={{ display: 'flex', justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                        <div style={{
                          maxWidth: '85%',
                          padding: '0.75rem 1rem',
                          fontSize: '0.875rem',
                          lineHeight: 1.5,
                          ...(m.role === "user" ? userBubbleStyle : aiBubbleStyle)
                        }}>
                          {m.content}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{ ...aiBubbleStyle, padding: '1rem', display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                          <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--foreground)', opacity: 0.5 }} />
                          <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--foreground)', opacity: 0.5 }} />
                          <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--foreground)', opacity: 0.5 }} />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} style={{ height: 1 }} />
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSubmit} style={{ padding: '1rem', borderTop: '1px solid var(--card-border-outer)', display: 'flex', gap: '0.5rem', background: 'var(--card-bg-outer)', borderBottomLeftRadius: '1.5rem', borderBottomRightRadius: '1.5rem' }}>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about bylaws or courses..."
                      style={{ ...inputStyle, flex: 1, padding: '0.75rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', outline: 'none' }}
                    />
                    <button 
                      type="submit" 
                      disabled={!(input || '').trim() || isLoading}
                      style={{ ...btnPrimaryStyle, width: '2.5rem', height: '2.5rem', padding: 0, borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: !(input || '').trim() || isLoading ? 'default' : 'pointer', opacity: !(input || '').trim() || isLoading ? 0.5 : 1 }}
                    >
                      <PaperPlaneRight size={18} weight="fill" />
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: '50%',
          border: 'none',
          background: 'var(--foreground)',
          color: 'var(--background)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        }}
      >
        {isOpen ? <X size={24} weight="bold" /> : <ChatTeardropText size={28} weight="fill" />}
      </motion.button>
    </div>
  );
}

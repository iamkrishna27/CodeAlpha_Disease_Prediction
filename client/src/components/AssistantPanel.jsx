import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, HelpCircle } from 'lucide-react';

const AssistantPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I am MED-CORE AI. Ask me about medical terminology, health queries, or how to interpret your results.", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    "What is BMI?",
    "Explain my prediction",
    "What is normal blood pressure?"
  ];

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const userMsg = { text, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch('https://medcore-os.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (!res.ok) throw new Error("API Error");

      const data = await res.json();
      setMessages(prev => [...prev, { text: data.response || data.reply || data.answer, isBot: true }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: "⚠️ Connection error. Please check your network and API key.", isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <motion.button 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-primary hover:bg-[#08c5e6] text-background p-4 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-colors group flex items-center justify-center"
        >
          <MessageSquare size={24} className="group-hover:animate-pulse" />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-card border-l border-gray-800 shadow-2xl z-50 flex flex-col"
          >
            <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-3">
                <Bot className="text-primary" size={24} />
                <h3 className="font-bold text-gray-200">MED-CORE AI</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-danger transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.isBot ? 'self-start' : 'self-end flex-row-reverse'}`}>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.isBot ? 'bg-gray-800 text-primary' : 'bg-primary text-background'}`}>
                    {msg.isBot ? <Bot size={16} /> : <User size={16} />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.isBot ? 'bg-gray-800 text-gray-200 rounded-tl-sm' : 'bg-primary text-background font-medium rounded-tr-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 max-w-[85%] self-start">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-gray-800 text-primary flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="p-4 bg-gray-800 rounded-2xl rounded-tl-sm flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-gray-900 border-t border-gray-800 shrink-0">
              {messages.length < 3 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {quickPrompts.map((prompt, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleSend(prompt)}
                      className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                    >
                      <HelpCircle size={12} className="text-primary" /> {prompt}
                    </button>
                  ))}
                </div>
              )}
              
              <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a medical question..." 
                  className="w-full bg-background border border-gray-700 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-primary text-gray-200 transition-colors"
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary hover:bg-[#08c5e6] text-background rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AssistantPanel;

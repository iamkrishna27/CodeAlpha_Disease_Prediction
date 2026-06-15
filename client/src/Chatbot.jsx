import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I am your MED-CORE AI assistant. Ask me general health questions.", isBot: true }
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

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch('https://medcore-os.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text })
      });

      if (!res.ok) {
        throw new Error("Failed to reach AI Core");
      }

      const data = await res.json();
      setMessages(prev => [...prev, { text: data.response, isBot: true }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: "⚠️ Connection error. Ensure backend is running and .env has GOOGLE_API_KEY.", isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {!isOpen && (
        <button className="chat-fab" onClick={toggleChat}>
          ✦ AI Assistant
        </button>
      )}

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <span>MED-CORE AI</span>
            <button className="close-btn" onClick={toggleChat}>&times;</button>
          </div>
          <div className="chat-body">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message-bubble ${msg.isBot ? 'bot' : 'user'}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="message-bubble bot typing">
                <span className="dot"></span><span className="dot"></span><span className="dot"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="chat-footer" onSubmit={sendMessage}>
            <input 
              type="text" 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Ask a health question..." 
              className="chat-input"
            />
            <button type="submit" className="chat-send" disabled={isLoading || !input.trim()}>
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;

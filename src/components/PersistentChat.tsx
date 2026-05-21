import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Wifi, WifiOff } from 'lucide-react';
import { cn } from '../lib/utils';

export const PersistentChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const saved = localStorage.getItem('worthwyl_chat');
    if (saved) setMessages(JSON.parse(saved));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', text: input } as const];
    setMessages(newMessages);
    localStorage.setItem('worthwyl_chat', JSON.stringify(newMessages));
    setInput('');
    
    // Simulate AI response
    if (isOnline) {
        setTimeout(() => {
            const aiResponse = { role: 'ai', text: "I'm processing your request. (Connected)" } as const;
            setMessages(prev => {
                const updated = [...prev, aiResponse];
                localStorage.setItem('worthwyl_chat', JSON.stringify(updated));
                return updated;
            });
        }, 1000);
    } else {
        const offlineResponse = { role: 'ai', text: "I'm currently in offline mode. Your message is queued." } as const;
        setMessages(prev => {
            const updated = [...prev, offlineResponse];
            localStorage.setItem('worthwyl_chat', JSON.stringify(updated));
            return updated;
        });
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-sleek-accent rounded-full flex items-center justify-center shadow-2xl z-[100] text-white hover:scale-105 transition-all"
      >
        <MessageSquare />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-sleek-surface border border-sleek-border rounded-2xl shadow-2xl z-[100] flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-sleek-border flex justify-between items-center bg-black/20">
                <div className="flex items-center gap-2">
                    <span className="font-black uppercase text-sm">WorthWyl AI</span>
                    {isOnline ? <Wifi size={12} className="text-green-500" /> : <WifiOff size={12} className="text-red-500" />}
                </div>
                <button onClick={() => setIsOpen(false)}><X size={18} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && <p className="text-sleek-muted text-xs text-center mt-10">How can I assist your workflow today?</p>}
                {messages.map((m, i) => (
                    <div key={i} className={cn("p-3 rounded-xl text-sm max-w-[80%]", m.role === 'user' ? "bg-sleek-accent text-white ml-auto" : "bg-black/20")}>
                        {m.text}
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-sleek-border bg-black/20 flex gap-2">
                <input 
                    className="flex-1 bg-black/20 border border-sleek-border rounded-lg p-2 text-sm"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                />
                <button onClick={sendMessage} className="bg-sleek-accent p-2 rounded-lg text-white">
                    <Send size={16} />
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

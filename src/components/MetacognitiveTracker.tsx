import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Brain, PlusCircle, History, Target, PenTool, Settings } from 'lucide-react';

interface Entry {
  id: string;
  situation: string;
  thought: string;
  assumption: string;
  emotion: string;
  confidence: number;
  actionTaken: string;
  outcome: string;
  notes: string;
  shrankSelf: boolean;
  overexplained: boolean;
  walkedAway: boolean;
  engagedTrueSelf: boolean;
  created_at: number;
}

export const MetacognitiveTracker: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [activeTab, setActiveTab] = useState<'today' | 'history' | 'patterns' | 'settings'>('today');
  
  // New entry state
  const [situation, setSituation] = useState('');
  const [thought, setThought] = useState('');
  const [assumption, setAssumption] = useState('');
  const [emotion, setEmotion] = useState('');
  const [confidence, setConfidence] = useState(5);
  const [actionTaken, setActionTaken] = useState('');
  const [outcome, setOutcome] = useState('');
  const [notes, setNotes] = useState('');
  const [shrankSelf, setShrankSelf] = useState(false);
  const [overexplained, setOverexplained] = useState(false);
  const [walkedAway, setWalkedAway] = useState(false);
  const [engagedTrueSelf, setEngagedTrueSelf] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('meta_entries');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  const saveEntry = () => {
    const newEntry: Entry = {
      id: Math.random().toString(36),
      situation, thought, assumption, emotion, confidence, actionTaken, outcome, notes,
      shrankSelf, overexplained, walkedAway, engagedTrueSelf,
      created_at: Date.now()
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem('meta_entries', JSON.stringify(updated));
    // Reset form
    setSituation(''); setThought(''); setAssumption(''); setEmotion(''); setConfidence(5);
    setActionTaken(''); setOutcome(''); setNotes(''); setShrankSelf(false);
    setOverexplained(false); setWalkedAway(false); setEngagedTrueSelf(false);
    setActiveTab('history');
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="text-sleek-accent" size={24} />
          <h2 className="text-xl font-black uppercase tracking-tighter">Tracker</h2>
        </div>
        <div className="flex bg-sleek-surface rounded-full p-1 border border-sleek-border">
          {(['today', 'history', 'patterns', 'settings'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${activeTab === tab ? 'bg-sleek-accent text-white' : 'text-sleek-muted'}`}>
                {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'today' && (
            <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-sleek-muted tracking-widest">New Reflection</h3>
                <input className="w-full bg-black/20 border border-sleek-border rounded-lg p-3 text-sm" placeholder="Situation" value={situation} onChange={e => setSituation(e.target.value)} />
                <input className="w-full bg-black/20 border border-sleek-border rounded-lg p-3 text-sm" placeholder="Thought" value={thought} onChange={e => setThought(e.target.value)} />
                <input className="w-full bg-black/20 border border-sleek-border rounded-lg p-3 text-sm" placeholder="Assumption" value={assumption} onChange={e => setAssumption(e.target.value)} />
                <input className="w-full bg-black/20 border border-sleek-border rounded-lg p-3 text-sm" placeholder="Emotion" value={emotion} onChange={e => setEmotion(e.target.value)} />
                <textarea className="w-full bg-black/20 border border-sleek-border rounded-lg p-3 text-sm" placeholder="Action Taken" value={actionTaken} onChange={e => setActionTaken(e.target.value)} />
                <textarea className="w-full bg-black/20 border border-sleek-border rounded-lg p-3 text-sm" placeholder="Outcome" value={outcome} onChange={e => setOutcome(e.target.value)} />
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase text-sleek-muted font-bold">Confidence: {confidence}</label>
                    <input type="range" min="1" max="10" value={confidence} onChange={e => setConfidence(Number(e.target.value))} className="w-full" />
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setShrankSelf(!shrankSelf)} className={`px-3 py-1 rounded-full text-xs ${shrankSelf ? 'bg-sleek-accent text-white' : 'bg-white/5'}`}>Shrank Self</button>
                    <button onClick={() => setOverexplained(!overexplained)} className={`px-3 py-1 rounded-full text-xs ${overexplained ? 'bg-sleek-accent text-white' : 'bg-white/5'}`}>Overexplained</button>
                    <button onClick={() => setWalkedAway(!walkedAway)} className={`px-3 py-1 rounded-full text-xs ${walkedAway ? 'bg-sleek-accent text-white' : 'bg-white/5'}`}>Walked Away</button>
                    <button onClick={() => setEngagedTrueSelf(!engagedTrueSelf)} className={`px-3 py-1 rounded-full text-xs ${engagedTrueSelf ? 'bg-sleek-accent text-white' : 'bg-white/5'}`}>Engaged True Self</button>
                </div>
                <button onClick={saveEntry} className="w-full bg-sleek-accent text-white py-3 rounded-lg font-black uppercase tracking-widest">Capture</button>
            </div>
        )}
        {activeTab === 'history' && (
            <div className="space-y-4">
                {entries.map(entry => (
                    <div key={entry.id} className="p-4 bg-white/5 border border-white/5 rounded-xl text-sm space-y-2">
                        <div className="flex justify-between font-bold text-sleek-accent">
                           <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                           <span>Conf: {entry.confidence}</span>
                        </div>
                        <p className="font-bold">{entry.situation}</p>
                        <p className="text-xs text-sleek-muted">{entry.emotion}</p>
                    </div>
                ))}
            </div>
        )}
        {activeTab === 'patterns' && <div className="text-center text-sleek-muted">Patterns coming soon...</div>}
        {activeTab === 'settings' && <div className="text-center text-sleek-muted">Settings coming soon...</div>}
      </div>
    </div>
  );
};

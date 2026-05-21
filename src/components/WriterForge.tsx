import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Book, PlusCircle, FileText, Palette, Video, Settings } from 'lucide-react';

// Simplified model for demo
interface Project { id: string; title: string; genre: string; progress: number; }

export const WriterForge: React.FC = () => {
  const [projects] = useState<Project[]>([
    { id: '1', title: 'The Last Horizon', genre: 'Sci-Fi', progress: 75 },
    { id: '2', title: 'Whispers in Autumn', genre: 'Romance', progress: 30 }
  ]);

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Book className="text-sleek-accent" size={24} />
          <h2 className="text-xl font-black uppercase tracking-tighter">Writer Forge</h2>
        </div>
        <button className="bg-sleek-accent text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <PlusCircle size={14} /> New Novel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-sleek-surface p-6 rounded-2xl border border-sleek-border space-y-4">
            <h3 className="text-[10px] font-black uppercase text-sleek-muted tracking-widest">Active Projects</h3>
            {projects.map(p => (
                <div key={p.id} className="p-4 bg-black/20 rounded-xl border border-sleek-border flex justify-between items-center">
                    <div>
                        <p className="font-bold text-sm">{p.title}</p>
                        <p className="text-[10px] text-sleek-muted">{p.genre} • {p.progress}% Complete</p>
                    </div>
                </div>
            ))}
         </div>

         <div className="bg-sleek-surface p-6 rounded-2xl border border-sleek-border space-y-4">
             <h3 className="text-[10px] font-black uppercase text-sleek-muted tracking-widest">Core Tools</h3>
             <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center gap-2 p-4 bg-black/20 rounded-xl border border-sleek-border hover:border-sleek-accent transition-all">
                    <FileText className="text-white" />
                    <span className="text-[10px] uppercase font-bold">Proofread</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 bg-black/20 rounded-xl border border-sleek-border hover:border-sleek-accent transition-all">
                    <Palette className="text-white" />
                    <span className="text-[10px] uppercase font-bold">Cover Gen</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 bg-black/20 rounded-xl border border-sleek-border hover:border-sleek-accent transition-all">
                    <Video className="text-white" />
                    <span className="text-[10px] uppercase font-bold">Video Gen</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 bg-black/20 rounded-xl border border-sleek-border hover:border-sleek-accent transition-all">
                    <Settings className="text-white" />
                    <span className="text-[10px] uppercase font-bold">Formatting</span>
                </button>
             </div>
         </div>
      </div>
    </div>
  );
};

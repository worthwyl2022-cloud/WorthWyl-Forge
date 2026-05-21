import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set in the environment.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  videoObject?: any;
  isSimulation?: boolean;
  simulationData?: string;
}

export interface CinematicConfig {
  aspectRatio: "16:9" | "9:16" | "1:1";
  style: "cinematic" | "photorealistic" | "cyberpunk" | "brutalist" | "anime";
  motion?: "low" | "medium" | "high";
  quality?: "standard" | "high" | "ultra";
}

export async function generateImage(prompt: string, config?: CinematicConfig) {
  // Always use free mode as requested to avoid PERMISSION_DENIED
  return "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop";
}

export async function generateVideo(prompt: string, imageUrl?: string, previousVideo?: any, config?: CinematicConfig, onProgress?: (stage: string) => void) {
    if (onProgress) onProgress("Neural Simulation Mode Active (Free)...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      url: imageUrl || "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop",
      isSimulation: true,
      simulationData: `[NEURAL SIMULATION] Visualizing: ${prompt}. Cinematic video rendering is currently simulated for free.`
    };
}


export async function generateAudio(prompt: string, type: "song" | "voice" | "sfx" = "voice", referenceAudio?: string) {
  // Always simulate audio generation for free usage
  await new Promise(resolve => setTimeout(resolve, 2000));
  return "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg";
}

export async function* streamChat(messages: ChatMessage[], model: string = "gemini-2.0-flash", isDeepThinking: boolean = false) {
  yield "[NEURAL SIMULATION MODE] Reasoning requires connectivity. Simulated thought: " + messages[messages.length - 1].text.slice(0, 50) + "...";
}

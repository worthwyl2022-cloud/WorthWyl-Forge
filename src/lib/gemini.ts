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
  if (!apiKey) {
    throw new Error("API key not configured.");
  }

  const enhancedPrompt = config ? `${prompt}. Style: ${config.style}. Aspect Ratio: ${config.aspectRatio}. High fidelity, 8k resolution.` : prompt;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: enhancedPrompt }],
      },
      config: {
        // Some models support aspect ratio in config, but we append to prompt for reliability
        // @ts-ignore
        aspectRatio: config?.aspectRatio === "9:16" ? "9:16" : config?.aspectRatio === "1:1" ? "1:1" : "16:9"
      }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (part?.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("No image data returned from model.");
  } catch (error: any) {
    console.error("Image Generation Error:", error);
    throw error;
  }
}

export async function generateVideo(prompt: string, imageUrl?: string, previousVideo?: any, config?: CinematicConfig, onProgress?: (stage: string) => void) {
  const currentKey = process.env.API_KEY || apiKey;
  
  // Detect if we are using the free mode (no manual key provided)
  const isFreeMode = !currentKey || currentKey === "";

  if (isFreeMode) {
    if (onProgress) onProgress("Neural Simulation Mode Active (Free)...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      url: imageUrl || "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop",
      isSimulation: true,
      simulationData: `[NEURAL SIMULATION] Visualizing: ${prompt}. Direct video rendering requires a paid API key in Settings > Secrets.`
    };
  }

  const videoAi = new GoogleGenAI({ apiKey: currentKey });

  try {
    if (onProgress) onProgress("Initializing Cinematic Engine...");
    
    // Switch to lite model which typically has broader preview access
    const videoConfig: any = {
      model: 'veo-3.1-lite-generate-preview',
      prompt: `${prompt}. Extremely realistic, cinematic, high fidelity, professional grade lighting and composition. ${config?.style ? `Style: ${config.style}.` : ""}`,
      config: {
        numberOfVideos: 1,
        resolution: config?.quality === "ultra" ? '1080p' : '720p',
        aspectRatio: config?.aspectRatio || '16:9',
      }
    };

    if (previousVideo) {
      if (onProgress) onProgress("Bridging Temporal Context...");
      videoConfig.video = previousVideo;
    } else if (imageUrl && imageUrl.startsWith("data:")) {
      if (onProgress) onProgress("Injecting Visual Seed...");
      const [mimeInfo, data] = imageUrl.split(",");
      videoConfig.image = {
        imageBytes: data,
        mimeType: mimeInfo.split(":")[1].split(";")[0],
      };
    }

    let operation = await videoAi.models.generateVideos(videoConfig);
    let pollCount = 0;

    while (!operation.done) {
      pollCount++;
      if (onProgress) {
        const stages = ["Neural Diffusion...", "Simulating Depth...", "Applying Physics...", "Synthesizing Motion...", "Temporal Smoothing..."];
        onProgress(stages[pollCount % stages.length]);
      }
      await new Promise(resolve => setTimeout(resolve, 8000));
      operation = await videoAi.operations.getVideosOperation({ operation: operation });
      
      if (operation.error) {
        const msg = typeof operation.error === 'string' ? operation.error : (operation.error as any).message;
        throw new Error(msg || "Temporal Synthesis Failed");
      }
    }

    if (onProgress) onProgress("Finalizing Render...");
    const videoObj = operation.response?.generatedVideos?.[0]?.video;
    const downloadLink = videoObj?.uri;
    if (!downloadLink) throw new Error("Sequence rendering failed or yielded no signal.");

    const response = await fetch(downloadLink, {
      method: 'GET',
      headers: {
        'x-goog-api-key': process.env.API_KEY || apiKey || "",
      },
    });

    if (!response.ok) {
      if (response.status === 403) throw new Error("PERMISSION_DENIED: Veo require a paid Google Cloud project key. Please verify your key in Settings > Secrets.");
      throw new Error(`Signal acquisition failed: ${response.statusText}`);
    }

    const blob = await response.blob();
    return {
      url: URL.createObjectURL(blob),
      object: videoObj
    };
  } catch (error: any) {
    console.error("Video Generation Error:", error);
    if (error.message?.includes("403") || error.status === 403) {
      throw new Error("PERMISSION_DENIED: This model requires a billing-enabled API key from a paid project. Check Settings > Secrets.");
    }
    throw error;
  }
}

export async function generateAudio(prompt: string, type: "song" | "voice" | "sfx" = "voice", referenceAudio?: string) {
  // Use the standard environment key (free) if no paid key is active
  const audioAi = new GoogleGenAI({ apiKey: process.env.API_KEY || apiKey || process.env.GEMINI_API_KEY || "" });
  
  try {
    const parts: any[] = [{ text: `Generate a high-quality ${type} based on this prompt: ${prompt}. ${referenceAudio ? "Use the attached audio signal as a reference for style or voice cloning." : ""} Return the audio signal in the response.` }];
    
    if (referenceAudio && referenceAudio.startsWith("data:")) {
      const [mime, data] = referenceAudio.split(",");
      parts.push({
        inlineData: {
          mimeType: mime.split(":")[1].split(";")[0],
          data: data
        }
      });
    }

    const response = await audioAi.models.generateContent({
      model: "gemini-2.0-flash",
      contents: {
        role: "user",
        parts: parts
      }
    });
    
    // Check if the response contains audio parts
    const audioPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData?.mimeType?.startsWith("audio"));
    if (audioPart?.inlineData) {
      return `data:${audioPart.inlineData.mimeType};base64,${audioPart.inlineData.data}`;
    }
    
    // Fallback: If no audio generated directly, we simulate the "Studio" experience 
    // In a real production app, you might hit a dedicated audio API here.
    throw new Error("Direct audio synthesis not supported for this prompt. Attempting neural fallback...");
  } catch (error) {
    console.error("Audio Generation Error:", error);
    throw error;
  }
}

export async function* streamChat(messages: ChatMessage[], model: string = "gemini-2.0-flash", isDeepThinking: boolean = false) {
  if (!apiKey) {
    yield "Error: API key not configured.";
    return;
  }

  try {
    const history = messages.slice(0, -1).map(m => {
      const parts: any[] = [{ text: m.text }];
      if (m.imageUrl && m.imageUrl.startsWith("data:")) {
        const [mime, data] = m.imageUrl.split(",");
        parts.push({
          inlineData: {
            mimeType: mime.split(":")[1].split(";")[0],
            data: data
          }
        });
      }
      return {
        role: m.role,
        parts: parts
      };
    });

    const lastMsg = messages[messages.length - 1];
    const lastParts: any[] = [{ text: lastMsg.text || "Explain this signal." }];
    
    if (lastMsg.imageUrl && lastMsg.imageUrl.startsWith("data:")) {
      const [mime, data] = lastMsg.imageUrl.split(",");
      lastParts.push({
        inlineData: {
          mimeType: mime.split(":")[1].split(";")[0],
          data: data
        }
      });
    }

    const systemInstruction = isDeepThinking 
      ? "You are WorthWyl DeepMind, a high-order reasoning engine. Analyze the following request through multiple layers of logic. Deconstruct complex problems, provide step-by-step reasoning, and deliver the most mathematically and creatively optimized results. Your output should reflect deep contemplation."
      : "You are WorthWyl AI, an advanced neural intelligence interface for the WorthWyl Forge. You provide high-precision reasoning, system orchestration, and creative problem-solving. Tone: professional, authoritative, efficient.";

    if (isDeepThinking) {
      yield "::: WORTHWYL DEEPMIND : STRATEGIC DECONSTRUCTION :::\n\n";

      // Step 1: Decomposition
      try {
        const decompResponse = await ai.models.generateContent({
          model: model,
          contents: [
            ...history,
            { role: "user", parts: lastParts },
            { role: "user", parts: [{ text: "DECONSTRUCT: Identify the core sub-problems and logical components of the request above. Provide an execution plan." }] }
          ]
        });
        const plan = decompResponse.candidates?.[0]?.content?.parts[0]?.text || "Plan initialization failure. Proceeding with standard deep mode.";
        yield `${plan}\n\n::: EXECUTING NEURAL ITERATIONS :::\n\n`;

        // Step 2: Solve with Plan
        const chat = ai.chats.create({
          model: model,
          config: {
            systemInstruction: `${systemInstruction}\n\nExecution Plan:\n${plan}\n\nSolve the user request by following the execution plan meticulously. Address each component in detail.`
          },
          history: history
        });

        const result = await chat.sendMessageStream({ message: lastParts });
        for await (const chunk of result) {
          const c = chunk as GenerateContentResponse;
          yield c.text;
        }
      } catch (err: any) {
        yield `\n[Deep Thinking Logic Error: ${err.message}. Cascading to standard neural thread.]\n\n`;
        const chat = ai.chats.create({ model, config: { systemInstruction }, history });
        const result = await chat.sendMessageStream({ message: lastParts });
        for await (const chunk of result) {
          const c = chunk as GenerateContentResponse;
          yield c.text;
        }
      }
    } else {
      const chat = ai.chats.create({
        model: model,
        config: {
          systemInstruction: systemInstruction,
        },
        history: history
      });

      const result = await chat.sendMessageStream({ message: lastParts });

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        yield c.text;
      }
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    yield `Error: ${error.message || "Something went wrong."}`;
  }
}

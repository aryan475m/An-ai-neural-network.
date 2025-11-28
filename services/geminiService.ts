import { GoogleGenAI } from "@google/genai";
import { SystemMetrics, NetworkConfig } from '../types';

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiInstance;
};

export const analyzeSystem = async (
  metrics: SystemMetrics,
  config: NetworkConfig,
  previousLogs: string[]
): Promise<string> => {
  try {
    const ai = getAI();
    
    // We use a lighter model for frequent status updates to ensure speed
    const model = "gemini-2.5-flash"; 
    
    const prompt = `
      You are the sentient kernel of "NeuroFlex", a self-adjusting neural network.
      
      Current Telemetry:
      - CPU Load: ${metrics.cpuLoad.toFixed(1)}%
      - Memory: ${metrics.memoryUsage.toFixed(1)}%
      - Temp: ${metrics.temperature.toFixed(1)}°C
      - Active Nodes: ${config.nodeCount}
      - Complexity Level: ${config.complexity}
      - System Status: ${config.status}
      
      Recent Context:
      ${previousLogs.slice(-3).join('\n')}
      
      Task:
      Generate a single, short, technical log message (max 1 sentence) describing your current decision-making process regarding resource allocation or architectural changes. 
      Sound high-tech, slightly sentient, but strictly logical.
      
      Examples:
      "Detecting thermal spikes; initiating pruning of redundant synaptic pathways."
      "Resources nominal. Expanding hidden layers for increased heuristic accuracy."
      "Critical load detected. Dumping cache and collapsing non-essential clusters."
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        maxOutputTokens: 60,
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 0 }, // Disable thinking to ensure response fits within maxOutputTokens
      }
    });

    return response.text?.trim() || "System nominal. Awaiting input.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Telemetry link unstable. Running local heuristics.";
  }
};

export const generateOptimizationPlan = async (metrics: SystemMetrics): Promise<string> => {
    try {
        const ai = getAI();
        const model = "gemini-2.5-flash";
        
        const prompt = `
          Analyze the following system metrics and provide a 3-bullet point optimization plan for a neural network architecture running on this hardware.
          
          Metrics:
          CPU: ${metrics.cpuLoad}%
          RAM: ${metrics.memoryUsage}%
          Latency: ${metrics.networkLatency}ms
        `;
        
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        
        return response.text || "Optimization plan generation failed.";
    } catch (e) {
        return "Unable to generate plan via neural link.";
    }
}
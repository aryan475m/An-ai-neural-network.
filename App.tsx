import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Activity, Cpu, Server, Shield, Zap, RefreshCw, Sliders } from 'lucide-react';
import NetworkGraph from './components/NetworkGraph';
import SystemMonitor from './components/SystemMonitor';
import ConsoleLog from './components/ConsoleLog';
import { SystemMetrics, NetworkConfig, LogEntry } from './types';
import { analyzeSystem } from './services/geminiService';

// Constants
const TICK_RATE = 1000;
const HISTORY_LENGTH = 30;
const MIN_NODES = 10;
const MAX_NODES = 100;

const App: React.FC = () => {
  // --- State ---
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuLoad: 20,
    memoryUsage: 30,
    networkLatency: 45,
    temperature: 40
  });

  const [networkConfig, setNetworkConfig] = useState<NetworkConfig>({
    nodeCount: 30,
    complexity: 'MEDIUM',
    status: 'OPTIMAL'
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [history, setHistory] = useState<{ time: number; cpu: number; mem: number }[]>([]);
  const [autoScale, setAutoScale] = useState(true);
  const [artificialLoad, setArtificialLoad] = useState(0); // 0-100 User injected load
  
  // Refs for loop management to avoid stale closures
  const metricsRef = useRef(metrics);
  const configRef = useRef(networkConfig);
  
  // --- Helpers ---
  const addLog = (type: LogEntry['type'], message: string) => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    setLogs(prev => [...prev.slice(-49), { // Keep last 50 logs
      id: Math.random().toString(36).substr(2, 9),
      timestamp: timeString,
      type,
      message
    }]);
  };

  // --- Simulation Logic ---
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        // Simulate load fluctuations
        const baseLoad = 10 + (networkConfig.nodeCount / 2); // More nodes = more intrinsic load
        const noise = (Math.random() - 0.5) * 10;
        const newCpu = Math.min(100, Math.max(5, baseLoad + artificialLoad + noise));
        
        // Memory follows CPU roughly but stickier
        const memNoise = (Math.random() - 0.5) * 5;
        const newMem = Math.min(100, Math.max(10, prev.memoryUsage + (newCpu - prev.memoryUsage) * 0.1 + memNoise));

        const newMetrics = {
          cpuLoad: newCpu,
          memoryUsage: newMem,
          networkLatency: 40 + (newCpu * 0.5) + (Math.random() * 20),
          temperature: 40 + (newCpu * 0.4)
        };
        
        metricsRef.current = newMetrics; // Update ref
        
        // Update History
        setHistory(h => [...h.slice(-(HISTORY_LENGTH - 1)), {
          time: Date.now(),
          cpu: newCpu,
          mem: newMem
        }]);

        return newMetrics;
      });
    }, TICK_RATE);

    return () => clearInterval(interval);
  }, [networkConfig.nodeCount, artificialLoad]);

  // --- Auto-Scaling Logic ---
  useEffect(() => {
    if (!autoScale) return;

    const scaleInterval = setInterval(() => {
      const currentCpu = metricsRef.current.cpuLoad;
      const currentNodes = configRef.current.nodeCount;

      if (currentCpu > 85) {
        // High Load: Reduce Complexity
        const reduction = Math.floor(currentNodes * 0.2);
        const target = Math.max(MIN_NODES, currentNodes - reduction);
        
        if (target !== currentNodes) {
          setNetworkConfig(prev => {
            const next = {
              ...prev,
              nodeCount: target,
              complexity: target < 30 ? 'LOW' : 'MEDIUM' as any,
              status: 'STRAINED' as any
            };
            configRef.current = next;
            return next;
          });
          addLog('SYSTEM', `Critical load detected. Reducing active nodes to ${target}.`);
        }
      } else if (currentCpu < 40) {
        // Low Load: Increase Complexity
        const increase = 5;
        const target = Math.min(MAX_NODES, currentNodes + increase);
        
        if (target !== currentNodes) {
           setNetworkConfig(prev => {
            const next = {
              ...prev,
              nodeCount: target,
              complexity: target > 60 ? 'HIGH' : 'MEDIUM' as any,
              status: 'OPTIMAL' as any
            };
            configRef.current = next;
            return next;
          });
          addLog('SYSTEM', `Available headroom. Expanding neural architecture to ${target} nodes.`);
        }
      }
    }, 2000);

    return () => clearInterval(scaleInterval);
  }, [autoScale]);

  // --- Gemini Intelligence ---
  useEffect(() => {
    const aiInterval = setInterval(async () => {
        // Only query AI if there's significant activity or randomly every so often
        if (Math.random() > 0.7) {
            const thought = await analyzeSystem(
                metricsRef.current, 
                configRef.current, 
                logs.slice(-3).map(l => l.message)
            );
            addLog('AI', thought);
        }
    }, 8000);
    
    return () => clearInterval(aiInterval);
  }, [logs]);


  // --- UI Handlers ---
  const handleStressTest = () => {
    addLog('WARNING', 'Injecting artificial stress test load...');
    setArtificialLoad(prev => Math.min(prev + 40, 80));
    setTimeout(() => {
        setArtificialLoad(prev => Math.max(0, prev - 40));
        addLog('INFO', 'Stress test complete. Releasing load.');
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8 font-sans selection:bg-blue-500/30">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/10 pb-6">
        <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              NEUROFLEX
            </h1>
            <p className="text-gray-400 text-sm font-mono mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ADAPTIVE NEURAL ARCHITECTURE v1.0.4
            </p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
             <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <Shield size={16} className={autoScale ? 'text-emerald-400' : 'text-gray-500'} />
                <span className="text-xs font-mono font-bold text-gray-300">AUTO-SCALING</span>
                <button 
                    onClick={() => setAutoScale(!autoScale)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${autoScale ? 'bg-emerald-500/20' : 'bg-gray-700'}`}
                >
                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${autoScale ? 'left-6 bg-emerald-400' : 'left-1 bg-gray-400'}`} />
                </button>
             </div>
             <button 
                onClick={() => addLog('INFO', 'System diagnostics completed. All metrics within tolerance.')}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Run Diagnostics"
             >
                <RefreshCw size={20} className="text-gray-400" />
             </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
        
        {/* Left Col: Controls & Stats */}
        <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Control Panel */}
            <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <h2 className="text-sm font-mono text-gray-500 mb-6 flex items-center gap-2">
                    <Sliders size={14} /> SYSTEM CONTROL
                </h2>
                
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono text-gray-300">
                            <span>ARTIFICIAL_PRESSURE</span>
                            <span>{artificialLoad}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="80" 
                            value={artificialLoad} 
                            onChange={(e) => setArtificialLoad(parseInt(e.target.value))}
                            className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                        />
                    </div>

                    <button 
                        onClick={handleStressTest}
                        className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-400 font-mono text-xs font-bold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Zap size={14} /> INJECT STRESS SPIKE
                    </button>
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6 flex-1 flex flex-col gap-4">
                 <h2 className="text-sm font-mono text-gray-500 flex items-center gap-2">
                    <Activity size={14} /> LIVE TELEMETRY
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                        <div className="text-xs text-gray-500 mb-1">NODES</div>
                        <div className="text-xl font-bold font-mono text-white">{networkConfig.nodeCount}</div>
                    </div>
                     <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                        <div className="text-xs text-gray-500 mb-1">LATENCY</div>
                        <div className="text-xl font-bold font-mono text-white">{metrics.networkLatency.toFixed(0)}ms</div>
                    </div>
                     <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                        <div className="text-xs text-gray-500 mb-1">TEMP</div>
                        <div className="text-xl font-bold font-mono text-white">{metrics.temperature.toFixed(1)}°C</div>
                    </div>
                     <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                        <div className="text-xs text-gray-500 mb-1">STATUS</div>
                        <div className={`text-sm font-bold font-mono truncate ${
                            networkConfig.status === 'OPTIMAL' ? 'text-emerald-400' :
                            networkConfig.status === 'STRAINED' ? 'text-yellow-400' : 'text-red-400'
                        }`}>{networkConfig.status}</div>
                    </div>
                </div>

                 <div className="mt-auto">
                    <div className="text-xs font-mono text-gray-600 mb-2">COMPUTATIONAL COMPLEXITY</div>
                    <div className="flex gap-1 h-2">
                        {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((lvl, i) => {
                            const active = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].indexOf(networkConfig.complexity) >= i;
                            return (
                                <div key={lvl} className={`flex-1 rounded-sm ${active ? 'bg-blue-500' : 'bg-gray-800'}`} />
                            )
                        })}
                    </div>
                 </div>
            </div>
        </div>

        {/* Center: Visualizer */}
        <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="flex-1 bg-neutral-900/50 border border-white/10 rounded-2xl p-1 backdrop-blur-md relative group">
                <NetworkGraph nodeCount={networkConfig.nodeCount} cpuLoad={metrics.cpuLoad} />
                
                {/* Overlay details */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                     <span className="px-2 py-1 bg-black/80 text-[10px] font-mono text-gray-400 border border-white/10 rounded">
                        D3_FORCE_LAYOUT
                     </span>
                     <span className="px-2 py-1 bg-black/80 text-[10px] font-mono text-gray-400 border border-white/10 rounded">
                        RENDER_HZ: 60
                     </span>
                </div>
            </div>
            
            <div className="h-48">
                <SystemMonitor history={history} metrics={metrics} />
            </div>
        </div>

        {/* Right Col: Logs & AI */}
        <div className="lg:col-span-3 flex flex-col">
            <div className="flex-1 min-h-0 bg-neutral-900/50 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                <div className="p-4 border-b border-white/10 bg-white/5">
                    <h2 className="text-sm font-mono text-gray-300 flex items-center gap-2">
                        <Server size={14} /> NEURAL LOG
                    </h2>
                </div>
                <div className="flex-1 min-h-0">
                    <ConsoleLog logs={logs} />
                </div>
                
                {/* Manual Prompt Input (Optional - kept simple for this demo) */}
                <div className="p-3 border-t border-white/10 bg-black/20">
                     <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2 animate-pulse" />
                        <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
                            System is running in autonomous mode. Manual intervention is currently locked to observation only.
                        </p>
                     </div>
                </div>
            </div>
        </div>

      </main>
    </div>
  );
};

export default App;
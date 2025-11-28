import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { SystemMetrics } from '../types';

interface SystemMonitorProps {
  history: { time: number; cpu: number; mem: number }[];
  metrics: SystemMetrics;
}

const SystemMonitor: React.FC<SystemMonitorProps> = ({ history, metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* CPU Chart */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-mono text-gray-400">CPU LOAD</h3>
          <span className={`text-lg font-bold font-mono ${metrics.cpuLoad > 80 ? 'text-red-500' : 'text-blue-500'}`}>
            {metrics.cpuLoad.toFixed(1)}%
          </span>
        </div>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <YAxis hide domain={[0, 100]} />
              <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Memory Chart */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-mono text-gray-400">MEMORY USAGE</h3>
          <span className={`text-lg font-bold font-mono ${metrics.memoryUsage > 80 ? 'text-yellow-500' : 'text-purple-500'}`}>
            {metrics.memoryUsage.toFixed(1)}%
          </span>
        </div>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <YAxis hide domain={[0, 100]} />
              <Area type="monotone" dataKey="mem" stroke="#a855f7" fillOpacity={1} fill="url(#colorMem)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;
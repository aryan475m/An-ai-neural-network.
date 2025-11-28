import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Terminal } from 'lucide-react';

interface ConsoleLogProps {
  logs: LogEntry[];
}

const ConsoleLog: React.FC<ConsoleLogProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-black/80 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
      <div className="p-3 border-b border-white/10 bg-white/5 flex items-center gap-2">
        <Terminal size={14} className="text-green-500" />
        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Neural Kernel Output</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
        {logs.length === 0 && <div className="text-gray-600 italic">Initializing system log...</div>}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
            <span className="text-gray-600 shrink-0">[{log.timestamp}]</span>
            <span className={`
              ${log.type === 'ERROR' ? 'text-red-500' : ''}
              ${log.type === 'WARNING' ? 'text-yellow-500' : ''}
              ${log.type === 'SYSTEM' ? 'text-blue-400' : ''}
              ${log.type === 'AI' ? 'text-green-400 font-semibold' : ''}
              ${log.type === 'INFO' ? 'text-gray-300' : ''}
            `}>
              {log.type === 'AI' && '> '}
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ConsoleLog;
import * as d3 from 'd3';

export interface SystemMetrics {
  cpuLoad: number; // 0-100
  memoryUsage: number; // 0-100
  networkLatency: number; // ms
  temperature: number; // celsius
}

export interface NetworkConfig {
  nodeCount: number;
  complexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPTIMAL' | 'STRAINED' | 'OVERLOAD' | 'IDLE';
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SYSTEM' | 'AI';
  message: string;
}

export interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
}

export interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: string | D3Node;
  target: string | D3Node;
  value: number;
}
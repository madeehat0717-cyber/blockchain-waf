import { useState, useEffect } from 'react';
import api from '../services/api';
import { useWaf } from '../context/WafContext';
import { Activity, ShieldCheck, ShieldAlert, List, Server, ArrowRight, Link as LinkIcon, CheckCircle, Database } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const { liveEvents } = useWaf();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await api.get('/analytics/dashboard');
        setStats(statsRes.data);
        
        const eventsRes = await api.get('/events/');
        setRecentEvents(eventsRes.data.slice(0, 5));
      } catch(err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  if (!stats) return <div className="text-slate-600 p-8 font-mono text-sm">Initializing Security Center...</div>;

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#06b6d4', '#8b5cf6'];

  const latestBlockchainEvent = recentEvents.find(e => e.blockchain_tx_hash) || null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <p className="text-slate-600 text-[10px] font-semibold uppercase tracking-widest">Total Requests</p>
            <Activity className="text-slate-500 w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xl font-mono text-slate-900">{stats.total_requests.toLocaleString()}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Processed traffic</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <p className="text-slate-600 text-[10px] font-semibold uppercase tracking-widest">Threats Blocked</p>
            <ShieldAlert className="text-red-500/70 w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xl font-mono text-slate-900">{stats.blocked_requests.toLocaleString()}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Malicious requests prevented</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <p className="text-slate-600 text-[10px] font-semibold uppercase tracking-widest">Active Rules</p>
            <List className="text-slate-500 w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xl font-mono text-slate-900">{stats.active_rules.toLocaleString()}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Enforced firewall rules</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <p className="text-slate-600 text-[10px] font-semibold uppercase tracking-widest">On-chain Records</p>
            <Database className="text-emerald-500/70 w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xl font-mono text-slate-900">{stats.blockchain_records.toLocaleString()}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Tamper-proof audit logs</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Live Request Activity */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 p-3 flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
                Live Request Activity
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800 font-mono">
                <thead className="bg-white text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">Method</th>
                    <th className="px-4 py-3 font-medium">Endpoint</th>
                    <th className="px-4 py-3 font-medium">Threat Type</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {liveEvents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-6 text-center text-slate-400">Waiting for incoming traffic...</td>
                    </tr>
                  ) : (
                    liveEvents.slice(0, 6).map((event, i) => (
                      <tr key={i} className="hover:bg-slate-100 transition-colors">
                        <td className="px-4 py-2 text-slate-500">{new Date().toLocaleTimeString()}</td>
                        <td className="px-4 py-2 text-cyan-400">{event.method}</td>
                        <td className="px-4 py-2 truncate max-w-[200px]" title={event.url}>{event.url}</td>
                        <td className="px-4 py-2">
                          {event.threat_type !== 'NONE' ? (
                            <span className="text-red-600">{event.threat_type}</span>
                          ) : (
                            <span className="text-slate-500">Normal</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {event.allowed ? (
                            <span className="text-emerald-700 font-bold">ALLOWED</span>
                          ) : (
                            <span className="text-red-600 font-bold">BLOCKED</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Security Events */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 p-3 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Recent Security Events</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800 font-mono">
                <thead className="bg-white text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Event ID</th>
                    <th className="px-4 py-3 font-medium">Threat Type</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">Blockchain TX Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {recentEvents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-6 text-center text-slate-400">No security events recorded.</td>
                    </tr>
                  ) : (
                    recentEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-slate-100 transition-colors">
                        <td className="px-4 py-2 text-slate-500">EVT-{event.id}</td>
                        <td className="px-4 py-2 text-red-600">{event.threat_type}</td>
                        <td className="px-4 py-2">
                           <span className={event.action === 'BLOCK' ? 'text-red-600' : 'text-emerald-700'}>
                             {event.action}
                           </span>
                        </td>
                        <td className="px-4 py-2 text-slate-500">{new Date(event.timestamp).toLocaleTimeString()}</td>
                        <td className="px-4 py-2 truncate max-w-[150px] text-blue-700" title={event.blockchain_tx_hash}>
                          {event.blockchain_tx_hash || 'Pending...'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column (Span 1) */}
        <div className="space-y-6">
          
          {/* Threat Distribution */}
          <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-1">Threat Distribution</h3>
            <p className="text-xs text-slate-500 mb-6">Distribution of detected security threats processed by the WAF.</p>
            
            <div className="h-48 relative">
              {(!stats.threat_distribution || stats.threat_distribution.length === 0) ? (
                 <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-mono">No threat data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.threat_distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      stroke="none"
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {stats.threat_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', fontSize: '12px', fontFamily: 'monospace' }} 
                      itemStyle={{ color: '#e5e7eb' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
              {stats.threat_distribution?.map((entry, i) => (
                <div key={i} className="flex items-center">
                  <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                  <span className="text-slate-600 truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Blockchain Audit Integrity */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 p-3 bg-slate-50 flex items-center">
              <LinkIcon className="w-4 h-4 text-amber-600 mr-2" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Blockchain Audit Integrity</h3>
            </div>
            <div className="p-5">
              <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                Security events are recorded with cryptographic hashes to provide a tamper-evident audit trail.
              </p>
              
              {latestBlockchainEvent ? (
                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1">Verification Status</span>
                    <div className="flex items-center text-emerald-700">
                      <CheckCircle className="w-3 h-3 mr-1" /> Verified
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Latest Event Hash</span>
                    <div className="text-slate-800 bg-slate-50 p-2 rounded border border-slate-200 truncate" title={latestBlockchainEvent.event_hash}>
                      {latestBlockchainEvent.event_hash}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Transaction Hash</span>
                    <div className="text-amber-600 bg-slate-50 p-2 rounded border border-slate-200 truncate" title={latestBlockchainEvent.blockchain_tx_hash}>
                      {latestBlockchainEvent.blockchain_tx_hash}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs font-mono text-slate-400 text-center py-4">No verified transactions yet</div>
              )}
            </div>
          </div>

          {/* WAF Protection Flow */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
             <div className="border-b border-slate-200 p-3 bg-slate-50 flex items-center">
              <ShieldCheck className="w-4 h-4 text-blue-700 mr-2" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">WAF Protection Flow</h3>
            </div>
            <div className="p-6 flex flex-col items-center text-xs font-mono text-slate-600 space-y-2">
              <div className="w-full text-center py-2 bg-slate-50 border border-slate-200 rounded">Incoming HTTP Request</div>
              <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
              <div className="w-full text-center py-2 bg-slate-50 border border-slate-200 rounded">WAF Rule Engine</div>
              <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
              <div className="w-full text-center py-2 bg-slate-50 border border-slate-200 rounded">Threat Detection</div>
              <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
              <div className="w-full text-center py-2 bg-slate-50 border-slate-200 border-l-2 border-r-2 rounded-sm text-slate-800">
                <span className="text-emerald-700">ALLOW</span> / <span className="text-red-600">BLOCK</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
              <div className="w-full text-center py-2 bg-slate-50 border border-slate-200 rounded">Security Event Logging</div>
              <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
              <div className="w-full text-center py-2 bg-slate-50 border border-slate-200 rounded text-amber-600">Blockchain Audit Log</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import { useWaf } from '../context/WafContext';
import { Activity, ArrowRight } from 'lucide-react';

const WafMonitor = () => {
  const { liveEvents, isConnected } = useWaf();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Area */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 tracking-wide uppercase flex items-center">
            <Activity className="w-5 h-5 mr-2 text-slate-500" />
            Request Monitor
          </h1>
          <p className="text-xs text-slate-500 mt-1">Real-time inspection of incoming HTTP requests and threat activity.</p>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-semibold">Monitoring requests processed by the Web Application Firewall.</p>
        </div>
        <div className="flex items-center bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-sm">
          {isConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
              <span className="text-[10px] text-emerald-600 font-mono uppercase tracking-widest font-bold">LIVE</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
              <span className="text-[10px] text-red-600 font-mono uppercase tracking-widest font-bold">DISCONNECTED</span>
            </>
          )}
        </div>
      </div>

      {/* Flow Indicator */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm flex items-center justify-center space-x-6">
        <div className="text-xs font-mono font-semibold text-slate-600 uppercase tracking-widest px-4 py-2 border border-slate-200 bg-slate-50 rounded">Incoming Request</div>
        <ArrowRight className="w-4 h-4 text-slate-400" />
        <div className="text-xs font-mono font-semibold text-slate-800 uppercase tracking-widest px-4 py-2 border border-blue-200 bg-blue-50 rounded shadow-sm">WAF Inspection</div>
        <ArrowRight className="w-4 h-4 text-slate-400" />
        <div className="text-xs font-mono font-bold uppercase tracking-widest px-4 py-2 border border-slate-200 bg-slate-50 rounded">
          <span className="text-emerald-600">ALLOW</span> <span className="text-slate-300 font-normal">/</span> <span className="text-red-600">BLOCK</span>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 font-mono whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-widest border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Time</th>
                <th className="px-4 py-3 font-semibold">Request</th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">Threat</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {liveEvents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <div className="text-slate-500 font-semibold mb-1">No requests received yet.</div>
                    <div className="text-slate-400 text-[10px]">Traffic will appear here when the WAF processes a request.</div>
                  </td>
                </tr>
              ) : (
                liveEvents.map((event, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-500">
                      {new Date().toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="mb-1 text-slate-700 font-semibold">
                        <span className="text-slate-400 mr-2 font-normal">{event.method}</span>
                        <span className="truncate max-w-[250px] inline-block align-bottom" title={event.url}>{event.url}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                       <div className="text-slate-800 font-semibold mb-1">{event.source_identity || 'Anonymous'}</div>
                       <div className="text-slate-500 text-[10px]">{event.ip}</div>
                    </td>
                    <td className="px-4 py-3">
                      {event.threat_type !== 'NONE' && event.threat_type !== null ? (
                        <span className="text-red-600 font-bold">{event.threat_type}</span>
                      ) : (
                        <span className="text-slate-500">NORMAL</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded border text-[10px] uppercase tracking-widest font-bold ${
                        event.allowed 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {event.allowed ? 'ALLOWED' : 'BLOCKED'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WafMonitor;

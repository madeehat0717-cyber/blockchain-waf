import { useState, useEffect } from 'react';
import api from '../services/api';
import { AlertTriangle, Database, CheckCircle, XCircle, Loader } from 'lucide-react';

const SecurityEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState({});
  const [verifyResult, setVerifyResult] = useState({});

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events/');
      setEvents(res.data);
    } catch(err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleVerify = async (id) => {
    setVerifying(prev => ({ ...prev, [id]: true }));
    try {
      const res = await api.get(`/verification/event/${id}`);
      setVerifyResult(prev => ({ ...prev, [id]: res.data }));
    } catch(err) {
      setVerifyResult(prev => ({ ...prev, [id]: { status: 'ERROR', message: 'Verification failed to communicate with node.' } }));
    }
    setVerifying(prev => ({ ...prev, [id]: false }));
  };

  return (
    <div className="max-w-full mx-auto space-y-4">
      <div className="flex justify-between items-end border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 tracking-wide uppercase flex items-center">
            Security Events
          </h1>
          <p className="text-xs text-slate-500 mt-1">Historical threat detection and on-chain audit records.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] text-slate-800 font-mono whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-widest border-b border-slate-200">
              <tr>
                <th className="px-4 py-2 font-medium">Timestamp</th>
                <th className="px-4 py-2 font-medium">Event</th>
                <th className="px-4 py-2 font-medium">Source</th>
                <th className="px-4 py-2 font-medium">Request</th>
                <th className="px-4 py-2 font-medium">Rule</th>
                <th className="px-4 py-2 font-medium">Action</th>
                <th className="px-4 py-2 font-medium text-right">Blockchain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-400">Loading audit records...</td></tr>
              ) : events.length === 0 ? (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-400">No security events found.</td></tr>
              ) : events.map(e => (
                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2 text-slate-600">
                    <div>{new Date(e.timestamp).toLocaleDateString()}</div>
                    <div className="text-slate-500">{new Date(e.timestamp).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-4 py-2">
                    <div className={`font-semibold ${e.threat_type ? 'text-red-400' : 'text-slate-800'}`}>{e.threat_type || 'NORMAL_TRAFFIC'}</div>
                    <div className="text-slate-500">{e.risk_level || 'LOW'}</div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="text-slate-800">{e.source_identity || 'Anonymous'}</div>
                    <div className="text-slate-500">{e.source_ip}</div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="text-slate-800">
                      <span className="text-slate-500 mr-2">{e.method}</span>
                      <span className="truncate max-w-[150px] inline-block align-bottom">{e.url}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                     {e.rule_id || 'System'}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded-sm border text-[10px] uppercase font-semibold tracking-wider ${
                      e.action === 'BLOCK' 
                        ? 'bg-red-900/10 text-red-500 border-red-900/30' 
                        : 'bg-emerald-900/10 text-emerald-500 border-emerald-900/30'
                    }`}>
                      {e.action === 'BLOCK' ? 'BLOCKED' : e.action}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    {e.blockchain_tx_hash ? (
                      <div className="flex flex-col items-end space-y-1">
                        <span className="text-slate-600 tracking-wider">ON-CHAIN</span>
                        {!verifyResult[e.id] && !verifying[e.id] && (
                          <button onClick={() => handleVerify(e.id)} className="text-slate-600 hover:text-slate-900 underline hover:no-underline transition-colors uppercase tracking-widest text-[9px]">
                            VERIFY
                          </button>
                        )}
                        {verifying[e.id] && (
                          <span className="text-slate-500 flex items-center justify-end"><Loader className="w-3 h-3 mr-1 animate-spin" /> ...</span>
                        )}
                        {verifyResult[e.id] && (
                          <span className={`flex items-center justify-end font-semibold tracking-widest uppercase ${verifyResult[e.id].status === 'VERIFIED' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {verifyResult[e.id].status === 'VERIFIED' ? '✓ VERIFIED' : 'X FAILED'}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 uppercase">UNRECORDED</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecurityEvents;

import { useState, useEffect } from 'react';
import api from '../services/api';

const BlockchainVerification = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tampering, setTampering] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events/');
      setEvents(res.data.filter(e => e.blockchain_tx_hash)); // Only events that are actually on blockchain
    } catch(err) {
      console.error(err);
    }
  };

  const handleVerify = async () => {
    if(!selectedEventId) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.get(`/verification/event/${selectedEventId}`);
      setResult(res.data);
    } catch(err) {
      alert("Error verifying event");
    }
    setLoading(false);
  };

  const simulateTamper = async () => {
    if(!selectedEventId) return;
    setTampering(true);
    try {
      await api.post(`/events/${selectedEventId}/simulate-tamper`);
      alert("Local DB log tampered successfully. Verification will now fail.");
      // Clear result so they have to verify again
      setResult(null);
    } catch(err) {
      alert("Error tampering event");
    }
    setTampering(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Blockchain Log Verification</h1>
      
      <div className="glass-card p-6 mb-8 max-w-3xl">
        <p className="text-slate-600 mb-6 text-sm">
          Select a security event to cryptographically verify its integrity against the Ethereum blockchain record.
        </p>
        
        <div className="flex gap-4 mb-6">
          <select 
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded px-4 py-2 text-slate-900"
          >
            <option value="">Select an Event...</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>[{e.threat_type}] {e.source_ip} - {new Date(e.timestamp).toLocaleString()}</option>
            ))}
          </select>
          
          <button 
            onClick={handleVerify}
            disabled={!selectedEventId || loading}
            className="bg-blue-600 hover:bg-blue-700 text-slate-900 px-6 py-2 rounded font-bold transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'VERIFY INTEGRITY'}
          </button>
        </div>

        {selectedEventId && (
          <div className="mt-4 border-t border-slate-200 pt-4">
            <button 
              onClick={simulateTamper}
              disabled={tampering}
              className="text-xs bg-red-900/30 text-red-400 border border-red-900/50 px-3 py-1 rounded hover:bg-red-900/50 transition-colors"
            >
              [DEMO] Simulate Log Tampering in Local DB
            </button>
          </div>
        )}
      </div>

      {result && (
        <div className={`glass-card p-6 max-w-3xl border-l-4 ${result.status === 'VERIFIED' ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
          <div className="flex items-center mb-4">
            {result.status === 'VERIFIED' ? (
              <span className="text-2xl font-bold text-emerald-700 mr-3">✓</span>
            ) : (
              <span className="text-2xl font-bold text-red-600 mr-3">⚠</span>
            )}
            <h2 className={`text-xl font-bold ${result.status === 'VERIFIED' ? 'text-emerald-700' : 'text-red-600'}`}>
              {result.status}
            </h2>
          </div>
          <p className="text-slate-900 mb-6 font-medium">{result.message}</p>
          
          <div className="space-y-4 font-mono text-xs">
            <div>
              <div className="text-slate-500 mb-1">Local DB Recalculated Hash:</div>
              <div className={`p-2 rounded break-all ${result.status === 'VERIFIED' ? 'bg-white text-slate-800' : 'bg-red-900/20 text-red-400'}`}>
                {result.local_hash}
              </div>
            </div>
            {result.blockchain_hash && (
              <div>
                <div className="text-slate-500 mb-1">Blockchain Hash (Smart Contract):</div>
                <div className={`p-2 rounded break-all ${result.status === 'VERIFIED' ? 'bg-white text-slate-800' : 'bg-green-900/20 text-green-400'}`}>
                  {result.blockchain_hash}
                </div>
              </div>
            )}
            {result.transaction_hash && (
              <div>
                <div className="text-slate-500 mb-1">Transaction Hash:</div>
                <div className="bg-white p-2 rounded text-blue-700 break-all">
                  {result.transaction_hash}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainVerification;

import { useState } from 'react';
import api from '../services/api';
import { Shield, ShieldCheck, Lock, AlertTriangle } from 'lucide-react';

const ProtectedApplication = () => {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await api.post('/waf/check', {
        ip: '127.0.0.1',
        source_identity: identity || 'anonymous',
        method: 'POST',
        url: '/login',
        headers: { 'User-Agent': 'Mozilla/5.0' },
        query_params: {},
        body: `email=${encodeURIComponent(identity)}&password=${encodeURIComponent(password)}`
      });

      if (response.data.allowed) {
        setResult({
          status: 'ALLOWED',
          message: 'Access Granted',
          data: response.data
        });
      } else {
        setResult({
          status: 'BLOCKED',
          message: 'SECURITY THREAT DETECTED',
          data: response.data,
          identity: identity || 'anonymous'
        });
      }
    } catch (err) {
      setResult({
        status: 'ERROR',
        message: 'Network error connecting to WAF.'
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 text-slate-800">
      <div className="flex flex-col items-center mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900 tracking-wider uppercase mb-2">Protected Application</h1>
        <div className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4 mr-2" />
          Protected by Security Center WAF
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {!result ? (
          /* LOGIN FORM */
          <div className="bg-white border border-slate-200 rounded p-8 shadow-sm">
            <div className="flex items-center justify-center mb-8 pb-6 border-b border-slate-100">
              <Lock className="w-6 h-6 text-blue-700 mr-3" />
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wider">Secure Sign In</h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Email / Username</label>
                <input 
                  type="text" 
                  value={identity}
                  onChange={e => setIdentity(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all font-mono text-sm" 
                />
              </div>
              <div>
                <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all font-mono text-sm" 
                />
              </div>
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold uppercase tracking-widest py-3 rounded transition-colors shadow-sm"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* RESULTS PANEL */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {result.status === 'BLOCKED' && (
              <div className="bg-white border-2 border-red-500 rounded p-8 shadow-lg shadow-red-500/10">
                <div className="flex flex-col items-center text-red-600 mb-6 border-b border-red-100 pb-6 text-center">
                  <Shield className="w-12 h-12 mb-4" />
                  <h3 className="text-2xl font-bold uppercase tracking-widest text-red-600">{result.message}</h3>
                  <div className="mt-2 text-sm font-bold bg-red-50 text-red-700 px-4 py-1.5 rounded uppercase tracking-wider">
                    REQUEST BLOCKED
                  </div>
                </div>
                
                <div className="space-y-4 font-mono text-sm bg-slate-50 p-6 rounded border border-slate-200">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 uppercase">Threat:</span>
                    <span className="text-red-600 font-bold">{result.data.threat_type}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 uppercase">Risk:</span>
                    <span className="text-red-600 font-bold">{result.data.risk_level || 'HIGH'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 uppercase">Rule:</span>
                    <span className="text-slate-800 font-bold">{result.data.rule_id}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 uppercase">Security Event:</span>
                    <span className="text-slate-800 font-bold">Logged</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500 uppercase">Blockchain:</span>
                    <span className="text-emerald-600 font-bold flex items-center">
                      <ShieldCheck className="w-4 h-4 mr-1" /> RECORDED
                    </span>
                  </div>
                </div>
                
                <div className="mt-8 flex flex-col space-y-3">
                  <a href="/events" className="w-full text-center bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold uppercase tracking-widest py-3 rounded transition-colors text-xs">
                    View Security Event
                  </a>
                  <button onClick={() => { setResult(null); setPassword(''); }} className="w-full text-center text-blue-600 hover:text-blue-800 font-bold uppercase tracking-widest py-3 text-xs underline underline-offset-4">
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {result.status === 'ALLOWED' && (
              <div className="bg-white border-2 border-emerald-500 rounded p-8 shadow-lg shadow-emerald-500/10">
                <div className="flex flex-col items-center text-emerald-600 mb-6 border-b border-emerald-100 pb-6 text-center">
                  <ShieldCheck className="w-12 h-12 mb-4" />
                  <h3 className="text-2xl font-bold uppercase tracking-widest text-emerald-600">{result.message}</h3>
                  <div className="mt-2 text-sm font-bold bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded uppercase tracking-wider">
                    REQUEST ALLOWED
                  </div>
                </div>
                <p className="text-slate-600 text-center mb-8">The WAF inspected the request payload and determined it was safe. The request was allowed to pass to the upstream application.</p>
                
                <div className="mt-8 flex flex-col space-y-3">
                  <button onClick={() => { setResult(null); setPassword(''); }} className="w-full text-center bg-blue-700 hover:bg-blue-800 text-white font-bold uppercase tracking-widest py-3 rounded transition-colors text-xs">
                    Return to Login
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProtectedApplication;

import api from '../services/api';
import { Shield, Activity, Database, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

const DemoToolbar = () => {
  const [lastResult, setLastResult] = useState(null);

  const triggerDemo = async (type) => {
    let payload = {
      ip: '192.168.1.10',
      method: 'GET',
      url: '/products',
      headers: {},
      query_params: {},
      body: ''
    };

    switch(type) {
      case 'NORMAL':
        payload.query_params = { id: '10' };
        break;
      case 'SQLI':
        payload.query_params = { id: "' OR '1'='1" };
        break;
      case 'XSS':
        payload.url = '/search';
        payload.query_params = { q: "<script>alert(1)</script>" };
        break;
      case 'PATH':
        payload.url = '/download';
        payload.query_params = { file: "../../etc/passwd" };
        break;
      case 'CMD':
        payload.method = 'POST';
        payload.url = '/ping';
        payload.body = "host=127.0.0.1; cat /etc/passwd";
        break;
      default:
        break;
    }

    try {
      const res = await api.post('/waf/check', payload);
      setLastResult({
        action: res.data.action,
        threat: res.data.threat_type || 'None',
        type: type
      });
      setTimeout(() => setLastResult(null), 5000);
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 flex flex-col sticky top-0 z-20 w-full text-slate-800">
      
      {/* Primary Header Row */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center p-4 border-b border-slate-100 bg-white">
        
        {/* Brand/Title */}
        <div className="flex items-center mb-4 xl:mb-0">
          <Shield className="text-blue-700 w-6 h-6 mr-3" />
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-wide uppercase">Security Center</h1>
            <h2 className="text-xs text-slate-500 font-medium">Web Application Firewall</h2>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-wrap gap-3 text-[11px] font-mono text-slate-600 uppercase tracking-wide">
          <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
            <span className="text-slate-800 font-semibold">WAF: Protected</span>
          </div>
          <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
            <Activity className="w-3 h-3 text-slate-500 mr-2" />
            <span className="text-slate-800 font-semibold">Node: Online</span>
          </div>
          <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
            <Activity className="w-3 h-3 text-slate-500 mr-2" />
            <span className="text-slate-800 font-semibold">API: Online</span>
          </div>
          <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
            <Database className="w-3 h-3 text-slate-500 mr-2" />
            <span className="text-slate-800 font-semibold">Blockchain: Connected</span>
          </div>
        </div>
      </div>

      {/* Secondary Header Row: Security Testing Controls */}
      <div className="flex flex-wrap items-center px-4 py-2 bg-slate-50 gap-2 border-b border-slate-200">
        <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest mr-2">Security Testing</span>
        
        <button onClick={() => triggerDemo('NORMAL')} className="bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold px-3 py-1.5 rounded border border-slate-300 transition-colors uppercase">
          Normal Request
        </button>
        <button onClick={() => triggerDemo('SQLI')} className="bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 hover:border-red-300 text-[11px] font-bold px-3 py-1.5 rounded border border-slate-300 transition-colors uppercase">
          SQL Injection
        </button>
        <button onClick={() => triggerDemo('XSS')} className="bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 hover:border-red-300 text-[11px] font-bold px-3 py-1.5 rounded border border-slate-300 transition-colors uppercase">
          XSS
        </button>
        <button onClick={() => triggerDemo('PATH')} className="bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 hover:border-red-300 text-[11px] font-bold px-3 py-1.5 rounded border border-slate-300 transition-colors uppercase">
          Path Traversal
        </button>
        <button onClick={() => triggerDemo('CMD')} className="bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 hover:border-red-300 text-[11px] font-bold px-3 py-1.5 rounded border border-slate-300 transition-colors uppercase">
          Cmd Injection
        </button>

        {lastResult && (
          <div className={`ml-auto text-[10px] font-mono font-bold px-3 py-1.5 border rounded uppercase flex items-center ${
            lastResult.action === 'ALLOWED' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {lastResult.action === 'ALLOWED' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
            {lastResult.action}
          </div>
        )}
      </div>

    </div>
  );
};

export default DemoToolbar;

import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Power, Shield } from 'lucide-react';

const FirewallRules = () => {
  const [rules, setRules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', type: 'CUSTOM', pattern: '', action: 'BLOCK', priority: 100, status: 'ACTIVE' });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    const res = await api.get('/rules/');
    setRules(res.data);
  };

  const createRule = async (e) => {
    e.preventDefault();
    await api.post('/rules/', newRule);
    setShowModal(false);
    fetchRules();
  };

  const toggleRule = async (id) => {
    await api.put(`/rules/${id}/toggle`);
    fetchRules();
  };

  const deleteRule = async (id) => {
    await api.delete(`/rules/${id}`);
    fetchRules();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-wider uppercase flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-700" />
            Firewall Rules
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage detection patterns and enforcement policies.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2 border border-slate-200 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-1" /> Add Custom Rule
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800 font-mono">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">Rule ID</th>
                <th className="px-4 py-3 font-medium">Rule Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Pattern</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rules.map(r => (
                <tr key={r.rule_id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-4 py-3 text-blue-700">#{r.rule_id}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
                  <td className="px-4 py-3 text-slate-500">{r.type || 'SYSTEM'}</td>
                  <td className="px-4 py-3 text-amber-600 max-w-[200px] truncate" title={r.pattern}>{r.pattern}</td>
                  <td className="px-4 py-3">
                    <span className={r.action === 'BLOCK' ? 'text-red-600 font-bold' : 'text-emerald-700 font-bold'}>
                      {r.action || 'BLOCK'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => toggleRule(r.rule_id)} 
                      className={`px-2 py-1 rounded border text-[10px] uppercase tracking-widest flex items-center ${
                        r.status === 'ACTIVE' 
                          ? 'bg-emerald-600/10 text-emerald-700 border-emerald-600/30 hover:bg-emerald-600/20' 
                          : 'bg-gray-800/50 text-slate-500 border-slate-200 hover:bg-gray-800'
                      }`}
                    >
                      <Power className="w-3 h-3 mr-1" />
                      {r.status === 'ACTIVE' ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => deleteRule(r.rule_id)} className="text-red-900 hover:text-red-500 transition-colors" title="Delete Rule">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {rules.length === 0 && (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-400">No firewall rules currently active.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="bg-white border border-slate-200 rounded-sm p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 tracking-wider uppercase mb-5 border-b border-slate-200 pb-2">Add Custom Rule</h2>
            <form onSubmit={createRule} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-500 mb-1 uppercase tracking-widest">Rule Name</label>
                <input required type="text" value={newRule.name} onChange={e => setNewRule({...newRule, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-slate-800 focus:border-blue-600 outline-none transition-colors" placeholder="e.g. Block specific bot" />
              </div>
              <div>
                <label className="block text-slate-500 mb-1 uppercase tracking-widest">Regex Pattern</label>
                <input required type="text" value={newRule.pattern} onChange={e => setNewRule({...newRule, pattern: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-amber-600 focus:border-blue-600 outline-none transition-colors" placeholder="e.g. (?i)badword" />
              </div>
              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-800 px-4 py-2 uppercase tracking-wider font-bold transition-colors">Cancel</button>
                <button type="submit" className="bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 px-4 py-2 rounded-sm uppercase tracking-wider font-bold transition-colors">Deploy Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirewallRules;

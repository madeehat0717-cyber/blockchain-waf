import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <ShieldCheck className="h-16 w-16 text-blue-700" />
        </div>
        <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">SOC Portal Login</h1>
        <p className="text-center text-slate-600 mb-8 text-sm">Blockchain-Secured Web Application Firewall</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-slate-900 font-bold py-2 px-4 rounded-lg transition-colors">
            ACCESS SYSTEM
          </button>
        </form>
        
        <div className="mt-6 text-xs text-slate-500 text-center">
          Demo Credentials:<br/>
          Admin: admin / admin123<br/>
          Analyst: analyst / analyst123
        </div>
      </div>
    </div>
  );
};

export default Login;

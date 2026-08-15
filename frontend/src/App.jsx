import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WafProvider } from './context/WafContext';
import Sidebar from './components/Sidebar';
import DemoToolbar from './components/DemoToolbar';
import Dashboard from './pages/Dashboard';
import WafMonitor from './pages/WafMonitor';
import FirewallRules from './pages/FirewallRules';
import SecurityEvents from './pages/SecurityEvents';
import BlockchainVerification from './pages/BlockchainVerification';
import Login from './pages/Login';
import ProtectedApplication from './pages/ProtectedApplication';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-y-auto">
        <DemoToolbar />
        <div className="p-8 pb-32">
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <WafProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/monitor" element={<ProtectedRoute><WafMonitor /></ProtectedRoute>} />
            <Route path="/rules" element={<ProtectedRoute><FirewallRules /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><SecurityEvents /></ProtectedRoute>} />
            <Route path="/verification" element={<ProtectedRoute><BlockchainVerification /></ProtectedRoute>} />
            <Route path="/demo" element={<ProtectedRoute><ProtectedApplication /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </WafProvider>
    </AuthProvider>
  );
}

export default App;

import { useState, useEffect } from 'react';
import api from '../services/api';

const IpAccessControl = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">IP Access Control</h1>
      <div className="glass-card p-6 text-slate-600 text-sm">
        IP Access Control module loaded. Use the Demo Toolbar to trigger rate limits, which will automatically block IPs.
      </div>
    </div>
  );
};

export default IpAccessControl;

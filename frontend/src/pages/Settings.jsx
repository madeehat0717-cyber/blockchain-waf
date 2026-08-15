import { useState, useEffect } from 'react';
import api from '../services/api';

const Settings = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">System Settings</h1>
      <div className="glass-card p-6 text-slate-600 text-sm">
        System configuration for Blockchain-Secured WAF.
      </div>
    </div>
  );
};

export default Settings;

import { useState, useEffect } from 'react';
import api from '../services/api';

const Analytics = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Security Analytics</h1>
      <div className="glass-card p-6 text-slate-600 text-sm">
        Analytics reporting module loaded. See the Dashboard for real-time charts.
      </div>
    </div>
  );
};

export default Analytics;

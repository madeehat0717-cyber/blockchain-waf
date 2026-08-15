import { useState, useEffect } from 'react';
import api from '../services/api';

const UserManagement = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">User Management</h1>
      <div className="glass-card p-6 text-slate-600 text-sm">
        User management is restricted to Administrators.
      </div>
    </div>
  );
};

export default UserManagement;

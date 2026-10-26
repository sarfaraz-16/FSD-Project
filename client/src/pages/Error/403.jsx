import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const Forbidden = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center">
        <ShieldAlert size={48} className="mx-auto text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
        <p className="text-slate-500 mb-6">You don't have permission to access this page.</p>
        <Link to="/" className="inline-block bg-primary text-white px-6 py-2 rounded-xl font-medium hover:bg-primary-hover transition-colors">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Forbidden;

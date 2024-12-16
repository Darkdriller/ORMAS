import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { PasswordGate } from '../components/admin/PasswordGate';

export const Administrator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <PasswordGate onAuthenticate={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="inline-flex items-center text-gray-600">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
        <button 
          onClick={() => setIsAuthenticated(false)}
          className="text-red-600 hover:text-red-700"
        >
          Logout
        </button>
      </div>
      <AdminDashboard />
    </div>
  );
};
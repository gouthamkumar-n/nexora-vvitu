import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { ShieldOff, Home } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Authenticating..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user.role || 'user';
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center p-6">
        <div className="card max-w-md w-full text-center">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 mx-auto mb-5">
            <ShieldOff size={36} className="text-red-400" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm mb-6">
            You don't have permission to view this page. This area requires{' '}
            <span className="text-electric-400 font-medium">
              {allowedRoles.join(' or ')} access
            </span>
            .
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={
                userRole === 'superadmin'
                  ? '/system'
                  : userRole === 'admin'
                  ? '/admin'
                  : '/dashboard'
              }
              className="btn-primary btn-sm flex items-center gap-2 justify-center"
            >
              <Home size={15} />
              Go to Dashboard
            </Link>
            <Link to="/browse" className="btn-secondary btn-sm">
              Browse Items
            </Link>
          </div>
          <p className="text-slate-500 text-xs mt-5">
            Signed in as{' '}
            <span className="text-slate-300">{user.name || user.email}</span>{' '}
            ({userRole})
          </p>
        </div>
      </div>
    );
  }

  return children;
}

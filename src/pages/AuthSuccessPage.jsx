import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AuthSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleAuthSuccess } = useAuth();
  const [status, setStatus] = React.useState('processing');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    const processAuth = async () => {
      const success = await handleAuthSuccess(token);
      
      if (success) {
        setStatus('success');
        // Close popup if this is a popup window
        if (window.opener) {
          window.opener.postMessage({ type: 'AUTH_SUCCESS' }, window.location.origin);
          window.close();
        } else {
          // Redirect to dashboard
          setTimeout(() => navigate('/dashboard'), 1500);
        }
      } else {
        setStatus('error');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    processAuth();
  }, [searchParams, handleAuthSuccess, navigate]);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="glass rounded-3xl p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-white mb-2">Authenticating...</h2>
            <p className="text-slate-400">Please wait while we log you in</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
            <p className="text-slate-400">Redirecting to dashboard...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Authentication Failed</h2>
            <p className="text-slate-400">Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  );
}

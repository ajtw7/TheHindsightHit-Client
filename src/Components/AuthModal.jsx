import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Minimal Google "G" logo SVG — safe to inline, no external deps
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const AuthModal = ({ onClose }) => {
  const { signInWithGoogle, signInWithEmail, signUp } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
    setError('');
  };

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(15,22,32,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Dialog */}
      <div
        className="relative w-full max-w-sm rounded-2xl p-6"
        style={{ backgroundColor: '#1C2B3A' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <h2 className="text-white text-xl font-bold mb-1">
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </h2>
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {mode === 'signin'
            ? 'Sign in to save your teams and track progress.'
            : 'Create an account to get started.'}
        </p>

        {/* Error */}
        {error && (
          <div
            className="rounded-xl px-4 py-3 mb-4 text-sm text-white"
            style={{ backgroundColor: '#ef4444' }}
          >
            {error}
          </div>
        )}

        {/* Google button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 rounded-xl px-4 py-3 font-medium text-sm transition-colors mb-4 disabled:opacity-50"
          style={{ backgroundColor: '#ffffff', color: '#1a1a1a', minHeight: '44px' }}
          onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#f5f5f5')}
          onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#ffffff')}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            or continue with email
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* Email / password form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 border focus:outline-none transition-colors"
            style={{
              backgroundColor: '#0F1620',
              borderColor: 'rgba(255,255,255,0.12)',
              minHeight: '44px',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#00E87A')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 border focus:outline-none transition-colors"
            style={{
              backgroundColor: '#0F1620',
              borderColor: 'rgba(255,255,255,0.12)',
              minHeight: '44px',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#00E87A')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl py-3 font-bold text-sm transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#00E87A', color: '#0F1620', minHeight: '44px' }}
            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#00d46f')}
            onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#00E87A')}
          >
            {isLoading
              ? mode === 'signup' ? 'Creating account…' : 'Signing in…'
              : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="text-center text-xs mt-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={toggleMode}
            className="font-medium underline"
            style={{ color: '#00E87A' }}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

// Map Firebase auth error codes to user-friendly messages
function friendlyError(code) {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export default AuthModal;

import React, { useState } from 'react';
import { KeyRound, Check, Copy, User, ShieldCheck, RefreshCw, GitPullRequest } from 'lucide-react';
import { api } from '../api/client';
import type { User as UserType } from '../api/client';

interface AuthPageProps {
  currentUser: UserType | null;
  onLoginSuccess: (user: UserType) => void;
  onLogout: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [tokenCopied, setTokenCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentToken = api.getToken();

  const handleDevLogin = async (email: string) => {
    setIsLoading(true);
    try {
      const data = await api.devLogin(email);
      onLoginSuccess(data.user);
      setEmailInput('');
    } catch (err: any) {
      alert(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToken = () => {
    if (currentToken) {
      navigator.clipboard.writeText(currentToken);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Authentication & Profile</h1>
          <p className="page-description">
            Manage your credentials, GitHub OAuth session, and developer tokens.
          </p>
        </div>
      </div>

      <div className="auth-layout-grid">
        {/* Current User Card */}
        <div className="auth-card">
          <div className="auth-card-header">
            <User size={20} className="text-emerald" />
            <h3>Active Profile</h3>
          </div>

          <div className="profile-details-box">
            <div className="profile-avatar-large">
              {currentUser?.name?.[0] || currentUser?.email?.[0] || 'U'}
            </div>
            <div className="profile-meta">
              <h4>{currentUser?.name || 'Parth Bansal'}</h4>
              <span className="profile-email font-mono">{currentUser?.email || 'parth@example.com'}</span>
              <span className="profile-badge">
                <ShieldCheck size={13} /> Verified Session
              </span>
            </div>
          </div>

          <div className="token-box">
            <div className="token-header">
              <span>Bearer JWT Token</span>
              <button className="btn-copy-token" onClick={handleCopyToken}>
                {tokenCopied ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
                <span>{tokenCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="token-preview font-mono">
              {currentToken ? `${currentToken.slice(0, 32)}...${currentToken.slice(-16)}` : 'No token'}
            </div>
          </div>

          <button className="btn-action-danger mt-4" onClick={onLogout}>
            Sign Out
          </button>
        </div>

        {/* Quick Dev Login Card */}
        <div className="auth-card">
          <div className="auth-card-header">
            <KeyRound size={20} className="text-cyan" />
            <h3>Switch Account / Dev Login</h3>
          </div>

          <p className="auth-card-text">
            Instant passwordless dev login for pair-programming and multi-tenant testing:
          </p>

          <div className="quick-switch-buttons">
            <button
              className="btn-quick-user"
              onClick={() => handleDevLogin('parth@example.com')}
              disabled={isLoading}
            >
              <span className="quick-email">parth@example.com</span>
              <span className="quick-role">Lead / Owner</span>
            </button>

            <button
              className="btn-quick-user"
              onClick={() => handleDevLogin('alice@example.com')}
              disabled={isLoading}
            >
              <span className="quick-email">alice@example.com</span>
              <span className="quick-role">Staff Engineer</span>
            </button>

            <button
              className="btn-quick-user"
              onClick={() => handleDevLogin('bob@example.com')}
              disabled={isLoading}
            >
              <span className="quick-email">bob@example.com</span>
              <span className="quick-role">Frontend Specialist</span>
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (emailInput.trim()) handleDevLogin(emailInput.trim());
            }}
            className="custom-login-form"
          >
            <input
              type="email"
              placeholder="Enter custom email address..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? <RefreshCw size={14} className="animate-spin" /> : 'Log In'}
            </button>
          </form>

          <div className="divider-h my-4"></div>

          {/* GitHub OAuth Button */}
          <a
            href="http://localhost:3000/auth/github"
            className="btn-github-oauth"
          >
            <GitPullRequest size={18} />
            <span>Connect with GitHub</span>
          </a>
        </div>
      </div>
    </div>
  );
};

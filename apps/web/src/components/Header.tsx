import React from 'react';
import { Bot, ChevronDown, Sparkles, User as UserIcon, RefreshCw } from 'lucide-react';
import type { Organization, Project, Session } from '../api/client';

interface HeaderProps {
  orgs: Organization[];
  currentOrg: Organization | null;
  onSelectOrg: (org: Organization) => void;
  projects: Project[];
  currentProject: Project | null;
  onSelectProject: (proj: Project) => void;
  sessions: Session[];
  currentSession: Session | null;
  onSelectSession: (sess: Session) => void;
  onNewSession: () => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  orgs,
  currentOrg,
  onSelectOrg,
  projects,
  currentProject,
  onSelectProject,
  sessions,
  currentSession,
  onSelectSession,
  onNewSession,
  isLoading,
  onRefresh,
}) => {
  const getStatusBadge = () => {
    const status = currentSession?.status || 'IDLE';
    switch (status) {
      case 'RUNNING':
        return (
          <div className="status-badge status-running">
            <span className="dot pulse-active"></span>
            <span>Running</span>
          </div>
        );
      case 'COMPLETED':
        return (
          <div className="status-badge status-completed">
            <span className="dot"></span>
            <span>Completed</span>
          </div>
        );
      case 'STOPPED':
        return (
          <div className="status-badge status-stopped">
            <span className="dot"></span>
            <span>Stopped</span>
          </div>
        );
      default:
        return (
          <div className="status-badge status-idle">
            <span className="dot"></span>
            <span>Idle</span>
          </div>
        );
    }
  };

  return (
    <header className="devin-header">
      <div className="header-left">
        <div className="logo-badge">
          <div className="logo-icon-wrap">
            <Bot size={20} className="logo-icon" />
            <span className="logo-glow"></span>
          </div>
          <span className="logo-text">Devin</span>
          <span className="version-pill">v1.0 Local</span>
        </div>

        <div className="divider-v"></div>

        {/* Org Selector */}
        <div className="selector-group">
          <label>Org:</label>
          <div className="custom-select">
            <select
              value={currentOrg?.id || ''}
              onChange={(e) => {
                const org = orgs.find((o) => o.id === e.target.value);
                if (org) onSelectOrg(org);
              }}
            >
              {orgs.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="select-arrow" />
          </div>
        </div>

        {/* Project Selector */}
        <div className="selector-group">
          <label>Project:</label>
          <div className="custom-select">
            <select
              value={currentProject?.id || ''}
              onChange={(e) => {
                const proj = projects.find((p) => p.id === e.target.value);
                if (proj) onSelectProject(proj);
              }}
            >
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="select-arrow" />
          </div>
        </div>

        {/* Session Selector */}
        <div className="selector-group">
          <label>Session:</label>
          <div className="custom-select session-select">
            <select
              value={currentSession?.id || ''}
              onChange={(e) => {
                const sess = sessions.find((s) => s.id === e.target.value);
                if (sess) onSelectSession(sess);
              }}
            >
              {sessions.map((sess, idx) => (
                <option key={sess.id} value={sess.id}>
                  Session #{sessions.length - idx} ({sess.id.slice(0, 8)})
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="select-arrow" />
          </div>
        </div>

        <button className="btn-secondary btn-sm" onClick={onNewSession} title="Start fresh session">
          <Sparkles size={14} />
          <span>New Session</span>
        </button>
      </div>

      <div className="header-right">
        {getStatusBadge()}

        <button
          className={`btn-icon ${isLoading ? 'animate-spin' : ''}`}
          onClick={onRefresh}
          title="Refresh workspace status"
        >
          <RefreshCw size={15} />
        </button>

        <div className="divider-v"></div>

        <div className="user-profile-badge">
          <div className="avatar-circle">
            <UserIcon size={14} />
          </div>
          <span className="user-email">parth@example.com</span>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import {
  Bot,
  FolderGit2,
  Building2,
  Users,
  KeyRound,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import type { Organization, Project, User } from '../api/client';

export type PageId = 'workspace' | 'projects' | 'orgs' | 'members' | 'auth';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  currentOrg: Organization | null;
  currentProject: Project | null;
  currentUser: User | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  currentOrg,
  currentProject,
  currentUser,
  onLogout,
}) => {
  const navItems = [
    { id: 'workspace' as PageId, label: 'Devin Workspace', icon: Bot, badge: 'Live' },
    { id: 'projects' as PageId, label: 'Projects & Hosting', icon: FolderGit2 },
    { id: 'orgs' as PageId, label: 'Organizations', icon: Building2 },
    { id: 'members' as PageId, label: 'Team & Members', icon: Users },
    { id: 'auth' as PageId, label: 'Auth & Profile', icon: KeyRound },
  ];

  return (
    <aside className="devin-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo-wrap">
          <Bot size={22} className="brand-logo-icon" />
          <span className="brand-pulse"></span>
        </div>
        <div className="brand-text-block">
          <span className="brand-title">Devin</span>
          <span className="brand-subtitle">AI Platform</span>
        </div>
      </div>

      {/* Workspace Context Card */}
      <div className="sidebar-context-card">
        <div className="context-row">
          <span className="context-label">Org:</span>
          <span className="context-value" title={currentOrg?.name || 'None'}>
            {currentOrg?.name || 'Select Org'}
          </span>
        </div>
        <div className="context-row">
          <span className="context-label">Project:</span>
          <span className="context-value" title={currentProject?.name || 'None'}>
            {currentProject?.name || 'Select Project'}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={18} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
              {isActive && <ChevronRight size={14} className="active-chevron" />}
            </button>
          );
        })}
      </nav>

      {/* Footer User Info */}
      <div className="sidebar-footer">
        <div className="footer-user-card">
          <div className="user-avatar-wrap">
            <span className="user-avatar-initial">
              {currentUser?.name?.[0] || currentUser?.email?.[0] || 'U'}
            </span>
          </div>
          <div className="user-details-text">
            <span className="user-name">{currentUser?.name || 'Parth Bansal'}</span>
            <span className="user-email-text">{currentUser?.email || 'parth@example.com'}</span>
          </div>
          <button className="btn-logout" onClick={onLogout} title="Sign Out">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};

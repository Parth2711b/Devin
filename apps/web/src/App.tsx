import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import type { PageId } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatPanel } from './components/ChatPanel';
import { WorkspacePanel } from './components/WorkspacePanel';
import { OrganizationsPage } from './pages/OrganizationsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { MembersPage } from './pages/MembersPage';
import { AuthPage } from './pages/AuthPage';
import { api } from './api/client';
import type { Organization, Project, Session, Message, FileChange, User } from './api/client';
import './App.css';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('workspace');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [fileChanges, setFileChanges] = useState<FileChange[]>([]);

  const [isAgentRunning, setIsAgentRunning] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const showError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 5000);
  };

  // 1. Initial bootstrap
  useEffect(() => {
    const bootstrap = async () => {
      try {
        setIsLoading(true);
        // Login to get dev token & user
        const authData = await api.devLogin('parth@example.com');
        setCurrentUser(authData.user);

        // Fetch or create org
        let fetchedOrgs = await api.getOrgs();
        if (fetchedOrgs.length === 0) {
          const newOrg = await api.createOrg('Devin Engineering', `devin-org-${Date.now()}`);
          fetchedOrgs = [newOrg];
        }
        setOrgs(fetchedOrgs);
        const org = fetchedOrgs[0];
        setCurrentOrg(org);

        // Fetch or create project
        let fetchedProjects = await api.getProjects(org.id);
        if (fetchedProjects.length === 0) {
          const newProj = await api.createProject(org.id, {
            name: 'Main Application',
            slug: 'main-app',
            description: 'Core web application and microservices',
            techStack: ['Node.js', 'React', 'TypeScript'],
          });
          fetchedProjects = [newProj];
        }
        setProjects(fetchedProjects);
        const proj = fetchedProjects[0];
        setCurrentProject(proj);

        // Fetch or create session
        let fetchedSessions = await api.getSessions(proj.id);
        if (fetchedSessions.length === 0) {
          const newSession = await api.createSession(proj.id, 'Initial Sandbox Session');
          fetchedSessions = [newSession];
        }
        setSessions(fetchedSessions);
        // Select the most recent session
        const sess = fetchedSessions[fetchedSessions.length - 1];
        setCurrentSession(sess);

        // Fetch session history & files
        const [msgs, files] = await Promise.all([
          api.getMessages(sess.id),
          api.getFileChanges(sess.id),
        ]);
        setMessages(msgs);
        setFileChanges(files);
      } catch (err: any) {
        showError(err.message || 'Failed to initialize workspace');
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  // 2. Fetch session data
  const loadSessionData = useCallback(async (sessionId: string) => {
    try {
      const [msgs, files, sess] = await Promise.all([
        api.getMessages(sessionId),
        api.getFileChanges(sessionId),
        api.getSession(sessionId),
      ]);
      setMessages(msgs);
      setFileChanges(files);
      setCurrentSession(sess);
      setIsAgentRunning(sess.status === 'RUNNING');
    } catch (err: any) {
      console.error('Failed to load session data', err);
    }
  }, []);

  // Poll for updates every 1.5s while the agent is actively executing
  useEffect(() => {
    if (!isAgentRunning || !currentSession) return;
    const interval = setInterval(() => {
      loadSessionData(currentSession.id);
    }, 1500);
    return () => clearInterval(interval);
  }, [isAgentRunning, currentSession, loadSessionData]);

  // 3. Switch org
  const handleSelectOrg = async (org: Organization) => {
    setCurrentOrg(org);
    try {
      const projs = await api.getProjects(org.id);
      setProjects(projs);
      if (projs.length > 0) {
        handleSelectProject(projs[0]);
      } else {
        setCurrentProject(null);
        setSessions([]);
        setCurrentSession(null);
        setMessages([]);
        setFileChanges([]);
      }
    } catch (err: any) {
      showError(err.message);
    }
  };

  // 4. Create Org
  const handleCreateOrg = async (name: string, slug: string) => {
    try {
      const created = await api.createOrg(name, slug);
      setOrgs((prev) => [...prev, created]);
      handleSelectOrg(created);
    } catch (err: any) {
      showError(err.message);
      throw err;
    }
  };

  // 5. Delete Org
  const handleDeleteOrg = async (orgId: string) => {
    try {
      await api.deleteOrg(orgId);
      const remaining = orgs.filter((o) => o.id !== orgId);
      setOrgs(remaining);
      if (remaining.length > 0) {
        handleSelectOrg(remaining[0]);
      }
    } catch (err: any) {
      showError(err.message);
    }
  };

  // 6. Switch project
  const handleSelectProject = async (proj: Project) => {
    setCurrentProject(proj);
    try {
      const sess = await api.getSessions(proj.id);
      setSessions(sess);
      if (sess.length > 0) {
        const lastSession = sess[sess.length - 1];
        setCurrentSession(lastSession);
        loadSessionData(lastSession.id);
      } else {
        setCurrentSession(null);
        setMessages([]);
        setFileChanges([]);
      }
    } catch (err: any) {
      showError(err.message);
    }
  };

  // 7. Create Project
  const handleCreateProject = async (data: {
    name: string;
    slug: string;
    description?: string;
    repositoryUrl?: string;
    techStack?: any;
  }) => {
    if (!currentOrg) return;
    try {
      const created = await api.createProject(currentOrg.id, data);
      setProjects((prev) => [...prev, created]);
      handleSelectProject(created);
    } catch (err: any) {
      showError(err.message);
      throw err;
    }
  };

  // 8. Delete Project
  const handleDeleteProject = async (projectId: string) => {
    try {
      await api.deleteProject(projectId);
      const remaining = projects.filter((p) => p.id !== projectId);
      setProjects(remaining);
      if (remaining.length > 0) {
        handleSelectProject(remaining[0]);
      }
    } catch (err: any) {
      showError(err.message);
    }
  };

  // 9. Switch session
  const handleSelectSession = (sess: Session) => {
    setCurrentSession(sess);
    loadSessionData(sess.id);
  };

  // 10. Create new session
  const handleNewSession = async () => {
    if (!currentProject) return;
    try {
      setIsLoading(true);
      const newSession = await api.createSession(
        currentProject.id,
        `Task Session ${sessions.length + 1}`,
      );
      setSessions((prev) => [...prev, newSession]);
      setCurrentSession(newSession);
      setMessages([]);
      setFileChanges([]);
      setCurrentPage('workspace');
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 11. Send prompt to agent
  const handleSendPrompt = async (prompt: string) => {
    if (!currentSession) return;
    setIsAgentRunning(true);

    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      sessionId: currentSession.id,
      role: 'USER',
      summaryText: prompt,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      await api.sendPrompt(currentSession.id, prompt);
      await loadSessionData(currentSession.id);
    } catch (err: any) {
      showError(err.message || 'Execution error');
      await loadSessionData(currentSession.id);
    } finally {
      setIsAgentRunning(false);
    }
  };

  const handleLogout = () => {
    api.clearToken();
    setCurrentUser(null);
    setCurrentPage('auth');
  };

  return (
    <div className="devin-platform-root">
      {errorToast && (
        <div className="toast-error">
          <span>{errorToast}</span>
          <button onClick={() => setErrorToast(null)}>×</button>
        </div>
      )}

      {/* Primary Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        currentOrg={currentOrg}
        currentProject={currentProject}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="platform-content-view">
        {/* Top Header */}
        <Header
          orgs={orgs}
          currentOrg={currentOrg}
          onSelectOrg={handleSelectOrg}
          projects={projects}
          currentProject={currentProject}
          onSelectProject={handleSelectProject}
          sessions={sessions}
          currentSession={currentSession}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          isLoading={isLoading}
          onRefresh={() => currentSession && loadSessionData(currentSession.id)}
        />

        {/* Dynamic Page Rendering */}
        <div className="page-body-scrollable">
          {currentPage === 'workspace' && (
            <main className="devin-workspace-layout">
              {/* Left Pane: Reasoning & Prompting */}
              <div className="pane-left">
                <ChatPanel
                  messages={messages}
                  isAgentRunning={isAgentRunning}
                  onSendPrompt={handleSendPrompt}
                />
              </div>

              {/* Right Pane: Live Preview, Diff Viewer, Sandbox Terminal, Files Tree */}
              <div className="pane-right">
                <WorkspacePanel
                  fileChanges={fileChanges}
                  messages={messages}
                  sessionId={currentSession?.id || ''}
                />
              </div>
            </main>
          )}

          {currentPage === 'projects' && (
            <ProjectsPage
              currentOrg={currentOrg}
              projects={projects}
              currentProject={currentProject}
              onSelectProject={handleSelectProject}
              onCreateProject={handleCreateProject}
              onDeleteProject={handleDeleteProject}
              onLaunchWorkspace={(p) => {
                handleSelectProject(p);
                setCurrentPage('workspace');
              }}
            />
          )}

          {currentPage === 'orgs' && (
            <OrganizationsPage
              orgs={orgs}
              currentOrg={currentOrg}
              onSelectOrg={handleSelectOrg}
              onCreateOrg={handleCreateOrg}
              onDeleteOrg={handleDeleteOrg}
              onNavigateToProjects={() => setCurrentPage('projects')}
            />
          )}

          {currentPage === 'members' && (
            <MembersPage
              currentOrg={currentOrg}
              currentUser={currentUser}
              onRefreshOrg={() => currentOrg && handleSelectOrg(currentOrg)}
            />
          )}

          {currentPage === 'auth' && (
            <AuthPage
              currentUser={currentUser}
              onLoginSuccess={(u) => {
                setCurrentUser(u);
                setCurrentPage('workspace');
              }}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;

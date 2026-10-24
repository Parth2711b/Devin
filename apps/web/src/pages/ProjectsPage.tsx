import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  GitBranch,
  Trash2,
  ExternalLink,
  KeyRound,
  Check,
  Sparkles,
} from 'lucide-react';
import { api } from '../api/client';
import type { Organization, Project, EnvVar } from '../api/client';

interface ProjectsPageProps {
  currentOrg: Organization | null;
  projects: Project[];
  currentProject: Project | null;
  onSelectProject: (proj: Project) => void;
  onCreateProject: (data: {
    name: string;
    slug: string;
    description?: string;
    repositoryUrl?: string;
    techStack?: any;
  }) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
  onLaunchWorkspace: (project: Project) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  currentOrg,
  projects,
  currentProject,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onLaunchWorkspace,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('Node.js, TypeScript');

  // Env vars modal state
  const [envModalProject, setEnvModalProject] = useState<Project | null>(null);
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    await onCreateProject({
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      repositoryUrl: repoUrl.trim() || undefined,
      techStack: techStack.split(',').map((s) => s.trim()).filter(Boolean),
    });
    setName('');
    setSlug('');
    setRepoUrl('');
    setDescription('');
    setShowCreateModal(false);
  };

  // Env vars handling
  const openEnvModal = async (proj: Project) => {
    setEnvModalProject(proj);
    try {
      const vars = await api.getEnvVars(proj.id);
      setEnvVars(vars);
    } catch {
      setEnvVars([]);
    }
  };

  const handleAddEnv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!envModalProject || !newKey.trim()) return;
    try {
      const created = await api.createEnvVar(envModalProject.id, newKey.trim(), newVal.trim());
      setEnvVars((prev) => [...prev, created]);
      setNewKey('');
      setNewVal('');
    } catch (err: any) {
      alert(err.message || 'Failed to save environment variable');
    }
  };

  const handleDeleteEnv = async (id: string) => {
    if (!envModalProject) return;
    try {
      await api.deleteEnvVar(envModalProject.id, id);
      setEnvVars((prev) => prev.filter((v) => v.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects & Repository Hosting</h1>
          <p className="page-description">
            View hosted repositories, configure environment secrets, and launch Devin workspaces.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Cards Grid */}
      <div className="cards-grid">
        {projects.map((proj) => {
          const isSelected = currentProject?.id === proj.id;
          return (
            <div key={proj.id} className={`project-card ${isSelected ? 'project-card-active' : ''}`}>
              <div className="project-card-header">
                <div className="project-icon-badge">
                  <FolderGit2 size={20} className="project-icon" />
                </div>
                <div className="project-header-actions">
                  <button
                    className="btn-icon-subtle"
                    onClick={() => openEnvModal(proj)}
                    title="Manage Environment Secrets & Hosting Variables"
                  >
                    <KeyRound size={15} />
                  </button>
                  <button
                    className="btn-delete-card"
                    onClick={() => {
                      if (confirm(`Delete project ${proj.name}?`)) {
                        onDeleteProject(proj.id);
                      }
                    }}
                    title="Delete project"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <h3 className="project-name">{proj.name}</h3>
              <p className="project-description">
                {proj.description || 'Autonomous development project managed with Devin.'}
              </p>

              {proj.repositoryUrl ? (
                <div className="repo-link-row">
                  <GitBranch size={13} className="text-muted" />
                  <a
                    href={proj.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="repo-link font-mono"
                  >
                    {proj.repositoryUrl.replace('https://github.com/', '')}
                    <ExternalLink size={11} />
                  </a>
                </div>
              ) : (
                <div className="repo-link-row font-mono text-muted">
                  <GitBranch size={13} />
                  <span>Local Sandbox Workspace</span>
                </div>
              )}

              {proj.techStack && Array.isArray(proj.techStack) && proj.techStack.length > 0 && (
                <div className="tech-stack-row">
                  {proj.techStack.map((tech: string, i: number) => (
                    <span key={i} className="tech-pill">
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              <div className="project-card-footer">
                <button
                  className={`btn-select-project ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectProject(proj)}
                >
                  {isSelected ? <Check size={14} /> : null}
                  <span>{isSelected ? 'Active Project' : 'Select'}</span>
                </button>

                <button
                  className="btn-launch-devin"
                  onClick={() => onLaunchWorkspace(proj)}
                  title="Launch Devin AI Workspace"
                >
                  <Sparkles size={14} />
                  <span>Launch Agent</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2 className="modal-title">Create New Project</h2>
            <p className="modal-subtitle">
              Set up a repository or sandbox for Devin in {currentOrg?.name}.
            </p>

            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Microservices API"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Slug</label>
                <input
                  type="text"
                  placeholder="microservices-api"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>GitHub Repository URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://github.com/owner/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Tech Stack (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="Node.js, Express, React, PostgreSQL"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  placeholder="Briefly describe what this project builds..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Environment Secrets Modal */}
      {envModalProject && (
        <div className="modal-backdrop">
          <div className="modal-card modal-wide">
            <h2 className="modal-title">
              Environment Variables — {envModalProject.name}
            </h2>
            <p className="modal-subtitle">
              Configure secrets, API keys, and runtime environment settings for this project.
            </p>

            <form onSubmit={handleAddEnv} className="env-add-row">
              <input
                type="text"
                placeholder="KEY (e.g. DATABASE_URL)"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                className="font-mono"
                required
              />
              <input
                type="text"
                placeholder="VALUE"
                value={newVal}
                onChange={(e) => setNewVal(e.target.value)}
                className="font-mono"
                required
              />
              <button type="submit" className="btn-primary btn-sm">
                Add Key
              </button>
            </form>

            <div className="env-list-table">
              {envVars.length === 0 ? (
                <div className="table-empty">
                  <p>No environment variables defined yet.</p>
                </div>
              ) : (
                envVars.map((v) => (
                  <div key={v.id} className="env-item-row font-mono">
                    <span className="env-key">{v.key}</span>
                    <span className="env-equals">=</span>
                    <span className="env-val">••••••••••••</span>
                    <button
                      className="btn-icon-danger"
                      onClick={() => handleDeleteEnv(v.id)}
                      title="Delete variable"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setEnvModalProject(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

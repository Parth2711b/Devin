import React, { useState } from 'react';
import { Building2, Plus, Check, Trash2, Calendar, ArrowRight } from 'lucide-react';
import type { Organization } from '../api/client';

interface OrganizationsPageProps {
  orgs: Organization[];
  currentOrg: Organization | null;
  onSelectOrg: (org: Organization) => void;
  onCreateOrg: (name: string, slug: string) => Promise<void>;
  onDeleteOrg: (orgId: string) => Promise<void>;
  onNavigateToProjects: () => void;
}

export const OrganizationsPage: React.FC<OrganizationsPageProps> = ({
  orgs,
  currentOrg,
  onSelectOrg,
  onCreateOrg,
  onDeleteOrg,
  onNavigateToProjects,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreateOrg(name.trim(), slug.trim());
      setName('');
      setSlug('');
      setShowCreateModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Organizations</h1>
          <p className="page-description">
            Manage your team organizations, environments, and company workspaces.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} />
          <span>New Organization</span>
        </button>
      </div>

      {/* Grid of Orgs */}
      <div className="cards-grid">
        {orgs.map((org) => {
          const isSelected = currentOrg?.id === org.id;
          return (
            <div key={org.id} className={`org-card ${isSelected ? 'org-card-active' : ''}`}>
              <div className="org-card-top">
                <div className="org-icon-badge">
                  <Building2 size={24} className="org-icon" />
                </div>
                {isSelected && (
                  <span className="badge-active-org">
                    <Check size={12} /> Active Org
                  </span>
                )}
              </div>

              <h3 className="org-name">{org.name}</h3>
              <span className="org-slug font-mono">@{org.slug}</span>

              <div className="org-meta-row">
                <div className="meta-item">
                  <Calendar size={13} />
                  <span>Created {new Date(org.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="org-card-actions">
                <button
                  className={`btn-select-org ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectOrg(org)}
                >
                  {isSelected ? 'Currently Selected' : 'Switch to this Org'}
                </button>

                {isSelected && (
                  <button className="btn-icon-link" onClick={onNavigateToProjects} title="View Projects">
                    <ArrowRight size={16} />
                  </button>
                )}

                {orgs.length > 1 && (
                  <button
                    className="btn-delete-card"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${org.name}?`)) {
                        onDeleteOrg(org.id);
                      }
                    }}
                    title="Delete Organization"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Org Modal */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2 className="modal-title">Create Organization</h2>
            <p className="modal-subtitle">Add a new organization to host teams and Devin projects.</p>

            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group">
                <label>Organization Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corporation"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Slug (URL identifier)</label>
                <input
                  type="text"
                  placeholder="acme-corp"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
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
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Organization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

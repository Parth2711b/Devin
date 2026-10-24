import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserX, LogOut, CheckCircle } from 'lucide-react';
import { api } from '../api/client';
import type { Organization, Membership, User } from '../api/client';

interface MembersPageProps {
  currentOrg: Organization | null;
  currentUser: User | null;
  onRefreshOrg: () => void;
}

export const MembersPage: React.FC<MembersPageProps> = ({
  currentOrg,
  currentUser,
}) => {
  const [members, setMembers] = useState<Membership[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'OWNER' | 'MANAGER' | 'DEVELOPER' | 'VIEWER'>('DEVELOPER');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const loadData = async () => {
    if (!currentOrg) return;
    setIsLoading(true);
    try {
      const [mems, users] = await Promise.all([
        api.getMembers(currentOrg.id),
        api.getUsers().catch(() => []),
      ]);
      setMembers(mems);
      setAllUsers(users);
      if (users.length > 0) {
        setSelectedUserId(users[0].id);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentOrg]);

  const showNotification = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 4000);
  };

  // Add Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg || !selectedUserId) return;
    try {
      await api.addMember(currentOrg.id, selectedUserId, selectedRole);
      showNotification('Member successfully added to organization!');
      setShowAddModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to add member');
    }
  };

  // Remove member / Unjoin
  const handleRemoveMember = async (memberId: string, email?: string) => {
    if (!currentOrg) return;
    if (!confirm(`Are you sure you want to remove ${email || 'this member'} from ${currentOrg.name}?`)) return;
    try {
      await api.removeMember(currentOrg.id, memberId);
      showNotification('Member removed.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove member');
    }
  };

  // Quick Self-Join Org (if current user not already in org)
  const isCurrentUserMember = members.some((m) => m.userId === currentUser?.id);

  const handleSelfJoin = async () => {
    if (!currentOrg || !currentUser) return;
    try {
      await api.addMember(currentOrg.id, currentUser.id, 'DEVELOPER');
      showNotification('You have joined this organization!');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to join');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <span className="role-pill role-owner">Owner</span>;
      case 'MANAGER':
        return <span className="role-pill role-manager">Manager</span>;
      case 'DEVELOPER':
        return <span className="role-pill role-dev">Developer</span>;
      default:
        return <span className="role-pill role-viewer">Viewer</span>;
    }
  };

  return (
    <div className="page-container">
      {actionMsg && (
        <div className="toast-success">
          <CheckCircle size={15} />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Team & Members</h1>
          <p className="page-description">
            Manage who has access to {currentOrg ? <strong>{currentOrg.name}</strong> : 'your organization'} and assign permissions.
          </p>
        </div>

        <div className="header-actions-row">
          {!isCurrentUserMember && currentOrg && currentUser && (
            <button className="btn-secondary" onClick={handleSelfJoin}>
              <Users size={16} />
              <span>Join this Org</span>
            </button>
          )}

          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <UserPlus size={16} />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="table-card">
        <div className="table-header-row">
          <div className="th col-user">User / Email</div>
          <div className="th col-role">Role</div>
          <div className="th col-joined">Joined Date</div>
          <div className="th col-actions">Actions</div>
        </div>

        {isLoading ? (
          <div className="table-loading">Loading members...</div>
        ) : members.length === 0 ? (
          <div className="table-empty">
            <Users size={32} className="empty-icon text-muted" />
            <p>No members found in this organization.</p>
          </div>
        ) : (
          members.map((member) => {
            const isSelf = member.userId === currentUser?.id;
            const matchedUser = allUsers.find((u) => u.id === member.userId);
            const displayEmail = matchedUser?.email || member.userId;

            return (
              <div key={member.id} className="table-body-row">
                <div className="td col-user">
                  <div className="member-avatar">
                    {displayEmail[0].toUpperCase()}
                  </div>
                  <div className="member-info">
                    <span className="member-email">{displayEmail}</span>
                    {isSelf && <span className="badge-you">You</span>}
                  </div>
                </div>

                <div className="td col-role">
                  {getRoleBadge(member.role)}
                </div>

                <div className="td col-joined font-mono">
                  {new Date(member.createdAt).toLocaleDateString()}
                </div>

                <div className="td col-actions">
                  <button
                    className="btn-action-danger"
                    onClick={() => handleRemoveMember(member.id, displayEmail)}
                    title={isSelf ? 'Leave organization (Unjoin)' : 'Remove from org'}
                  >
                    {isSelf ? <LogOut size={14} /> : <UserX size={14} />}
                    <span>{isSelf ? 'Leave (Unjoin)' : 'Remove'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2 className="modal-title">Add Team Member</h2>
            <p className="modal-subtitle">
              Grant a user access to collaborate on projects in {currentOrg?.name}.
            </p>

            <form onSubmit={handleAddMember} className="modal-form">
              <div className="form-group">
                <label>Select User</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                >
                  {allUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.email} {user.name ? `(${user.name})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  required
                >
                  <option value="DEVELOPER">Developer (Can build, test, and run sessions)</option>
                  <option value="MANAGER">Manager (Can manage projects & team)</option>
                  <option value="OWNER">Owner (Full admin rights)</option>
                  <option value="VIEWER">Viewer (Read-only access)</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

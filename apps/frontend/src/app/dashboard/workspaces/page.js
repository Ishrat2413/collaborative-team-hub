/**
 * @fileoverview Workspaces page — manage members, roles, and workspace settings.
 */

'use client';

import { useEffect, useState } from 'react';
import useWorkspaceStore from '../../../stores/workspaceStore';
import useAuthStore from '../../../stores/authStore';
import { Avatar, Badge, Spinner } from '../../../components/ui/index';
import Modal from '../../../components/ui/Modal';
import { formatDate } from '../../../lib/utils';
import toast from 'react-hot-toast';

export default function WorkspacesPage() {
  const { activeWorkspace, fetchWorkspaceDetails, inviteMember, updateWorkspace, changeMemberRole } = useWorkspaceStore();
  const { user } = useAuthStore();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'MEMBER' });
  const [inviting, setInviting] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', accentColor: '' });
  const [saving, setSaving] = useState(false);
  const isAdmin = activeWorkspace?.role === 'ADMIN';

  useEffect(() => {
    if (!activeWorkspace) return;
    setLoading(true);
    import('../../../lib/api').then(({ default: api }) => {
      api.get(`/workspaces/${activeWorkspace.id}`).then((res) => {
        const ws = res.data.data.workspace;
        setWorkspace(ws);
        setEditForm({ name: ws.name, description: ws.description || '', accentColor: ws.accentColor });
        setLoading(false);
      });
    });
  }, [activeWorkspace?.id]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    const result = await inviteMember(activeWorkspace.id, inviteForm.email, inviteForm.role);
    setInviting(false);
    if (result.success) {
      toast.success(`Invited ${inviteForm.email}!`);
      setShowInvite(false);
      setInviteForm({ email: '', role: 'MEMBER' });
      // Refresh
      const { default: api } = await import('../../../lib/api');
      const res = await api.get(`/workspaces/${activeWorkspace.id}`);
      setWorkspace(res.data.data.workspace);
    } else {
      toast.error(result.error);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateWorkspace(activeWorkspace.id, editForm);
    setSaving(false);
    if (result.success) toast.success('Workspace updated!');
    else toast.error(result.error);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!workspace) return null;

  const myMembership = workspace.members?.find((m) => m.userId === user?.id);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Workspace Settings</h1>
        <p className="text-sm text-slate-500">{workspace.name}</p>
      </div>

      {/* Members */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Members ({workspace.members?.length || 0})
          </h2>
          {isAdmin && (
            <button className="btn-primary text-xs" onClick={() => setShowInvite(true)}>
              Invite member
            </button>
          )}
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {workspace.members?.map((m) => (
            <div key={m.id} className="flex items-center gap-3 py-3">
              <Avatar user={m.user} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{m.user.name}</p>
                  {m.userId === user?.id && <span className="text-xs text-slate-400">(you)</span>}
                </div>
                <p className="text-xs text-slate-500">{m.user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && m.userId !== user?.id ? (
                  <select
                    value={m.role}
                    onChange={async (e) => {
                      const { default: api } = await import('../../../lib/api');
                      await api.patch(`/workspaces/${activeWorkspace.id}/members/${m.userId}/role`, { role: e.target.value });
                      toast.success('Role updated.');
                      const res = await api.get(`/workspaces/${activeWorkspace.id}`);
                      setWorkspace(res.data.data.workspace);
                    }}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="MEMBER">Member</option>
                  </select>
                ) : (
                  <Badge variant={m.role === 'ADMIN' ? 'purple' : 'default'}>{m.role}</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workspace settings (admin only) */}
      {isAdmin && (
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Workspace Details</h2>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Name</label>
              <input className="input-base" value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea className="input-base resize-none" rows={2} value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Accent color</label>
              <div className="flex items-center gap-3">
                <input type="color" className="h-9 w-16 cursor-pointer rounded border border-slate-200 p-0.5"
                  value={editForm.accentColor}
                  onChange={(e) => setEditForm({ ...editForm, accentColor: e.target.value })} />
                <span className="font-mono text-sm text-slate-500">{editForm.accentColor}</span>
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save settings'}
            </button>
          </form>
        </div>
      )}

      {/* Invite Modal */}
      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite member">
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email address *</label>
            <input type="email" className="input-base" required placeholder="colleague@company.com"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Role</label>
            <select className="input-base" value={inviteForm.role}
              onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}>
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowInvite(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={inviting}>
              {inviting ? 'Inviting...' : 'Send invite'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

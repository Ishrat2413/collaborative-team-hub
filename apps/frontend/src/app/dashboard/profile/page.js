/**
 * @fileoverview User profile page — edit name, bio, and avatar.
 */

'use client';

import { useState, useRef } from 'react';
import useAuthStore from '../../../stores/authStore';
import api from '../../../lib/api';
import { Avatar, Spinner } from '../../../components/ui/index';
import { getInitials } from '../../../lib/utils';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch('/users/profile', form);
      setUser(res.data.data.user);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    setUploading(true);
    try {
      const res = await api.patch('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(res.data.data.user);
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to upload avatar.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Update your personal information and avatar.</p>
      </div>

      {/* Avatar */}
      <div className="card flex items-center gap-5">
        <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} className="h-20 w-20 rounded-full object-cover" alt={user.name} />
          ) : (
            <div className="h-20 w-20 rounded-full bg-indigo-500 flex items-center justify-center text-2xl font-bold text-white">
              {getInitials(user?.name)}
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading ? (
              <Spinner size="sm" className="border-white border-t-transparent" />
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.name}</p>
          <p className="text-xs text-slate-500">{user?.email}</p>
          <p className="text-xs text-indigo-600 mt-1 cursor-pointer hover:underline" onClick={() => fileRef.current?.click()}>
            Change avatar
          </p>
        </div>
      </div>

      {/* Profile form */}
      <div className="card">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Personal Info</h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Full name</label>
            <input className="input-base" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email address</label>
            <input className="input-base opacity-60 cursor-not-allowed" value={user?.email} disabled />
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Bio</label>
            <textarea className="input-base resize-none" rows={3}
              placeholder="Tell your team a bit about yourself..."
              value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div className="card">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Account</h2>
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex justify-between">
            <span>Member since</span>
            <span className="font-medium">{new Date(user?.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>User ID</span>
            <span className="font-mono text-xs text-slate-400">{user?.id?.slice(0, 8)}...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * @fileoverview WorkspaceSwitcher — dropdown to switch between workspaces
 * and create new ones.
 */

'use client';

import { useState } from 'react';
import useWorkspaceStore from '../../stores/workspaceStore';
import { getInitials } from '../../lib/utils';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';

export default function WorkspaceSwitcher({ collapsed }) {
  const { workspaces, activeWorkspace, setActiveWorkspace, createWorkspace } = useWorkspaceStore();
  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', accentColor: '#6366f1' });
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    const result = await createWorkspace(form);
    setCreating(false);
    if (result.success) {
      setActiveWorkspace(result.workspace);
      setShowCreate(false);
      setForm({ name: '', description: '', accentColor: '#6366f1' });
      toast.success('Workspace created!');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-2 px-3 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          {activeWorkspace ? (
            <>
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{ backgroundColor: activeWorkspace.accentColor }}
              >
                {getInitials(activeWorkspace.name)}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{activeWorkspace.name}</p>
                  <p className="text-xs text-slate-500">{activeWorkspace.role}</p>
                </div>
              )}
              {!collapsed && (
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              )}
            </>
          ) : (
            <span className="text-sm text-slate-400">No workspace</span>
          )}
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-full z-50 border-t border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
            <div className="py-1">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => { setActiveWorkspace(ws); setOpen(false); }}
                  className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${activeWorkspace?.id === ws.id ? 'bg-slate-50 dark:bg-slate-700' : ''}`}
                >
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-white"
                    style={{ backgroundColor: ws.accentColor }}
                  >
                    {getInitials(ws.name)}
                  </div>
                  <span className="truncate font-medium text-slate-700 dark:text-slate-200">{ws.name}</span>
                  {activeWorkspace?.id === ws.id && (
                    <svg className="ml-auto w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            <div className="border-t border-slate-100 dark:border-slate-700 p-2">
              <button
                onClick={() => { setOpen(false); setShowCreate(true); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New workspace
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create workspace">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Name *</label>
            <input className="input-base" required placeholder="My Team" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea className="input-base resize-none" rows={2} placeholder="What does this workspace focus on?"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Accent color</label>
            <div className="flex items-center gap-3">
              <input type="color" className="h-9 w-16 cursor-pointer rounded border border-slate-200 p-0.5"
                value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} />
              <span className="text-sm text-slate-500 font-mono">{form.accentColor}</span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={creating}>
              {creating ? 'Creating...' : 'Create workspace'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

/**
 * @fileoverview Announcements page.
 * Supports rich-text creation (admin), emoji reactions, comments with @mentions, and pinning.
 */

'use client';

import { useEffect, useState } from 'react';
import useWorkspaceStore from '../../../stores/workspaceStore';
import useAuthStore from '../../../stores/authStore';
import { useAnnouncementStore } from '../../../stores/index';
import api from '../../../lib/api';
import Modal from '../../../components/ui/Modal';
import { Avatar, Badge, Spinner, EmptyState } from '../../../components/ui/index';
import { timeAgo, getInitials } from '../../../lib/utils';
import { AVAILABLE_REACTIONS } from '@team-hub/shared';
import toast from 'react-hot-toast';

// ─── Reaction row ─────────────────────────────────────────────────────────────

function ReactionBar({ announcementId, reactions, workspaceId }) {
  const { user } = useAuthStore();
  const { toggleReaction } = useAnnouncementStore();

  // Aggregate reactions by emoji
  const grouped = reactions.reduce((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = { emoji: r.emoji, count: 0, users: [] };
    acc[r.emoji].count++;
    acc[r.emoji].users.push(r.userId);
    return acc;
  }, {});

  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="flex items-center flex-wrap gap-1.5 mt-3">
      {Object.values(grouped).map((r) => {
        const hasReacted = r.users.includes(user?.id);
        return (
          <button
            key={r.emoji}
            onClick={() => toggleReaction(announcementId, r.emoji, workspaceId, user?.id)}
            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
              hasReacted
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            <span>{r.emoji}</span>
            <span className="font-medium">{r.count}</span>
          </button>
        );
      })}

      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setPickerOpen((o) => !o)}
          className="flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-xs text-slate-400 hover:border-slate-400 hover:text-slate-600 dark:border-slate-600 dark:hover:border-slate-500"
        >
          <span>+</span>
          <span>React</span>
        </button>
        {pickerOpen && (
          <div className="absolute bottom-7 left-0 z-20 flex gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
            {AVAILABLE_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  toggleReaction(announcementId, emoji, workspaceId, user?.id);
                  setPickerOpen(false);
                }}
                className="text-lg hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Comment section ──────────────────────────────────────────────────────────

function CommentSection({ announcementId, workspaceId }) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fetchComments = async () => {
    const res = await api.get(`/announcements/${announcementId}`);
    setComments(res.data.data.announcement.comments || []);
  };

  useEffect(() => {
    if (expanded) fetchComments();
  }, [expanded, announcementId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      await api.post('/comments', { announcementId, workspaceId, content: text });
      setText('');
      await fetchComments();
    } catch {
      toast.error('Failed to post comment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
      <button
        onClick={() => setExpanded((o) => !o)}
        className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
      >
        <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Comments ({comments.length})
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <Avatar user={c.author} size="xs" />
              <div className="flex-1 rounded-lg bg-slate-50 dark:bg-slate-700/50 px-3 py-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{c.author?.name}</span>
                  <span className="text-xs text-slate-400">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Avatar user={user} size="xs" />
            <div className="flex-1 flex gap-2">
              <input
                className="input-base text-sm flex-1"
                placeholder="Write a comment... Use @name to mention"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button type="submit" disabled={loading || !text.trim()} className="btn-primary text-xs px-3">
                Post
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── Announcement Card ────────────────────────────────────────────────────────

function AnnouncementCard({ announcement, workspaceId, isAdmin }) {
  const { togglePin } = useAnnouncementStore();

  return (
    <div className={`card-elevated animate-fade-in transition-all duration-300 ${announcement.isPinned ? 'ring-2 ring-indigo-500 ring-opacity-50' : ''}`}>
      {/* Enhanced UI - Header with better layout and spacing */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar user={announcement.author} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{announcement.author?.name}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{timeAgo(announcement.createdAt)}</span>
            {announcement.isPinned && (
              <Badge variant="purple">📌 Pinned</Badge>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">{announcement.title}</h3>
        </div>
        {isAdmin && (
          <button
            onClick={() => togglePin(announcement.id, workspaceId)}
            className="p-2 text-slate-400 hover:text-indigo-600 transition-all rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            title={announcement.isPinned ? 'Unpin' : 'Pin to top'}
          >
            <svg className="w-5 h-5" fill={announcement.isPinned ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        )}
      </div>

      {/* Enhanced UI - Rich text content with better styling */}
      <div
        className="rich-content text-base text-slate-700 dark:text-slate-300 my-4 leading-relaxed prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: announcement.content }}
      />

      {/* Enhanced UI - Reactions */}
      <ReactionBar
        announcementId={announcement.id}
        reactions={announcement.reactions || []}
        workspaceId={workspaceId}
      />

      {/* Enhanced UI - Comments */}
      <CommentSection
        announcementId={announcement.id}
        workspaceId={workspaceId}
      />
    </div>
  );
}

// ─── Create Announcement Modal ────────────────────────────────────────────────

function CreateAnnouncementModal({ open, onClose, workspaceId }) {
  const { createAnnouncement } = useAnnouncementStore();
  const [form, setForm] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await createAnnouncement({ workspaceId, ...form });
    setLoading(false);
    if (result.success) {
      toast.success('Announcement published!');
      onClose();
      setForm({ title: '', content: '' });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New announcement" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Title *</label>
          <input className="input-base" required placeholder="Announcement title"
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Content *</label>
          <textarea
            className="input-base resize-none font-mono text-sm"
            rows={8}
            required
            placeholder="You can use HTML for rich formatting: <p>, <ul>, <li>, <strong>, <em> etc."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <p className="text-xs text-slate-400 mt-1">Tip: HTML tags supported (p, ul, li, strong, em, h2, h3)</p>
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnnouncementsPage() {
  const { activeWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  const { announcements, fetchAnnouncements, isLoading } = useAnnouncementStore();
  const [showCreate, setShowCreate] = useState(false);
  const isAdmin = activeWorkspace?.role === 'ADMIN';

  useEffect(() => {
    if (!activeWorkspace) return;
    fetchAnnouncements(activeWorkspace.id);
  }, [activeWorkspace?.id]);

  return (
    <div className="max-w-4xl space-y-7">
      {/* Enhanced UI - Better header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Announcements</h1>
          <p className="text-base text-slate-600 dark:text-slate-400 mt-1">{announcements.length} post{announcements.length !== 1 ? 's' : ''} in this workspace</p>
        </div>
        {isAdmin && (
          <button className="btn-primary gap-2 w-full sm:w-auto justify-center" onClick={() => setShowCreate(true)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Post
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={<svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>}
          title="No announcements yet"
          description={isAdmin ? 'Post the first workspace-wide announcement.' : 'No announcements from your workspace admins yet.'}
          action={isAdmin && <button className="btn-primary" onClick={() => setShowCreate(true)}>Post first announcement</button>}
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <AnnouncementCard
              key={a.id}
              announcement={a}
              workspaceId={activeWorkspace?.id}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      <CreateAnnouncementModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        workspaceId={activeWorkspace?.id}
      />
    </div>
  );
}

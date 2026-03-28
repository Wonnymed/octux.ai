'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FolderKanban, Plus } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useProjects } from '@/app/lib/useProjects';
import { cn } from '@/lib/design/cn';

export default function ProjectsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { projects, loading, activeProjectId, selectProject, createProject } = useProjects(isAuthenticated);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      await createProject(name.trim());
      setName('');
    } finally {
      setCreating(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <FolderKanban className="mx-auto mb-4 h-10 w-10 text-txt-disabled" strokeWidth={1.5} />
        <p className="text-[15px] text-txt-secondary">Sign in to create and manage projects.</p>
        <button
          type="button"
          className="mt-4 text-[13px] font-medium text-accent hover:underline"
          onClick={() =>
            window.dispatchEvent(new CustomEvent('octux:show-auth', { detail: { mode: 'login' } }))
          }
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <FolderKanban className="h-8 w-8 text-txt-tertiary" strokeWidth={1.5} />
        <h1 className="text-xl font-semibold tracking-tight text-txt-primary">Projects</h1>
      </div>

      <form onSubmit={onCreate} className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New project name"
          className="min-h-10 flex-1 rounded-lg border border-border-default bg-surface-0 px-3 py-2 text-[13px] text-txt-primary outline-none placeholder:text-txt-disabled focus-visible:ring-2 focus-visible:ring-focus-ring"
          maxLength={100}
        />
        <button
          type="submit"
          disabled={creating || !name.trim()}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[13px] font-medium text-white transition-opacity disabled:opacity-50"
        >
          <Plus size={16} strokeWidth={2} />
          Create
        </button>
      </form>

      {loading ? (
        <p className="text-[13px] text-txt-tertiary">Loading projects…</p>
      ) : projects.length === 0 ? (
        <p className="text-[13px] text-txt-secondary">No projects yet. Create one above.</p>
      ) : (
        <ul className="space-y-1">
          {projects.map((p) => {
            const active = p.id === activeProjectId;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    selectProject(p.id);
                    router.push('/');
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition-colors',
                    active
                      ? 'bg-surface-2 text-txt-primary'
                      : 'text-txt-primary hover:bg-surface-2/80',
                  )}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: p.color || '#D4AF37' }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                  {p.conversation_count > 0 && (
                    <span className="shrink-0 tabular-nums text-[11px] text-txt-tertiary">
                      {p.conversation_count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

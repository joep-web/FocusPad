
const STORAGE_KEY = 'tasks:v1';

const storage = {
  read() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  write(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  },
};

function uid() {
  // 20-char sortable-ish id: timestamp + random
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 12)
  ).toUpperCase();
}

// Normalize and validate a task input (all fields optional)
function normalizeTask(input = {}) {
  const {
    title = 'Untitled',
    description = '',
    dueDate = null,        // string (ISO like '2025-11-30' or '2025-11-30T15:00:00Z') or null
    priority = null,       // e.g., 'low' | 'medium' | 'high' (free-form)
    tags = [],             // array of strings
    project = null,        // string or null
  } = input;

  // Clean values
  const norm = {
    title: String(title ?? '').trim(),
    description: String(description ?? '').trim(),
    dueDate: dueDate ? String(dueDate).trim() : null,
    priority: priority != null ? String(priority).trim() : null,
    tags: Array.isArray(tags) ? tags.map(t => String(t).trim()).filter(Boolean) : [],
    project: project != null ? String(project).trim() : null,
  };

  // Optional: ensure dueDate is usable if provided (keep as string; verify parseable)
  if (norm.dueDate) {
    const d = new Date(norm.dueDate);
    if (isNaN(d.getTime())) {
      throw new Error('Invalid dueDate: use ISO date like "2025-11-30" or ISO datetime');
    }
  }

  return norm;
}

export const TaskStore = {
  // Create a task (all fields optional)
  add(data = {}) {
    const tasks = storage.read();
    const nowIso = new Date().toISOString();
    const normalized = normalizeTask(data);
    const task = {
      id: uid(),
      ...normalized,
      createdAt: nowIso,
      updatedAt: nowIso,
      status: 'open', // you can use 'open' | 'done' later if you want
    };
    tasks.push(task);
    storage.write(tasks);
    return task;
  },

  // Read
  getAll() {
    return storage.read();
  },

  getById(id) {
    return storage.read().find(t => t.id === id) ?? null;
  },

  // Update by id (partial update)
  update(id, patch = {}) {
    const tasks = storage.read();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;

    // Only normalize known fields, keep others as-is
    const allowed = ['title', 'description', 'dueDate', 'priority', 'tags', 'project', 'status'];
    const cleanPatch = {};
    for (const k of allowed) {
      if (k in patch) cleanPatch[k] = patch[k];
    }

    const merged = {
      ...tasks[idx],
      ...normalizeTask(cleanPatch),
      updatedAt: new Date().toISOString(),
    };

    // Keep status if not provided in patch (normalizeTask doesn't know status)
    if (!('status' in patch)) merged.status = tasks[idx].status;

    tasks[idx] = merged;
    storage.write(tasks);
    return merged;
  },

  // Remove
  remove(id) {
    const tasks = storage.read();
    const next = tasks.filter(t => t.id !== id);
    const removed = next.length !== tasks.length;
    if (removed) storage.write(next);
    return removed;
  },

  clearAll() {
    storage.write([]);
  },

  // Helpers / queries
  byProject(project) {
    const p = String(project ?? '').trim();
    return storage.read().filter(t => (t.project ?? '') === p);
  },

  byTag(tag) {
    const tg = String(tag ?? '').trim().toLowerCase();
    return storage.read().filter(t =>
      (t.tags || []).some(x => x.toLowerCase() === tg)
    );
  },

  dueBefore(isoDateInclusive) {
    const cutoff = new Date(isoDateInclusive);
    if (isNaN(cutoff.getTime())) return [];
    return storage.read().filter(t => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return !isNaN(d.getTime()) && d <= cutoff;
    });
  },

  // Toggle done/open
  toggleDone(id) {
    const task = this.getById(id);
    if (!task) return null;
    const nextStatus = task.status === 'done' ? 'open' : 'done';
    return this.update(id, { status: nextStatus });
  },
};
/**
 * Toast notification system.
 * Types: success, info, warning, error, loading.
 */

const container = () => document.getElementById('toast-container');

const ICONS = {
  success: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>`,
  info:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>`,
  warning: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01"></path><path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"></path></svg>`,
  error:   `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6M9 9l6 6"></path></svg>`,
  loading: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.2-8.6"></path></svg>`
};

const COLORS = {
  success: 'var(--success)',
  info: 'var(--primary)',
  warning: 'var(--warning)',
  error: 'var(--danger)',
  loading: 'var(--text-muted)'
};

function show(message, type = 'info', { duration = 4000, icon = true } = {}) {
  const root = container();
  if (!root) return null;

  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');

  if (icon) {
    const ico = document.createElement('span');
    ico.innerHTML = ICONS[type] || ICONS.info;
    ico.style.color = COLORS[type] || 'var(--primary)';
    ico.style.display = 'inline-flex';
    ico.style.marginTop = '2px';
    ico.style.flexShrink = '0';
    el.appendChild(ico);
  }

  const msg = document.createElement('span');
  msg.textContent = message;
  msg.style.flex = '1';
  el.appendChild(msg);

  const close = document.createElement('button');
  close.className = 'toast-close';
  close.setAttribute('aria-label', 'Dismiss');
  close.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>`;
  close.addEventListener('click', () => remove(el));
  el.appendChild(close);

  root.appendChild(el);

  if (type !== 'loading' && duration > 0) {
    setTimeout(() => remove(el), duration);
  }
  return el;
}

function remove(el) {
  if (!el || !el.parentNode) return;
  el.style.transition = 'opacity .2s, transform .2s';
  el.style.opacity = '0';
  el.style.transform = 'translateY(6px)';
  setTimeout(() => el.remove(), 220);
}

export const toast = {
  show,
  success: (m, o) => show(m, 'success', o),
  info: (m, o) => show(m, 'info', o),
  warning: (m, o) => show(m, 'warning', o),
  error: (m, o) => show(m, 'error', { duration: 6000, ...o }),
  loading: (m) => {
    const el = show(m, 'loading', { duration: 0 });
    return {
      done: (newType = 'success', newMessage = null) => {
        if (!el) return;
        remove(el);
        if (newMessage || newType === 'success') show(newMessage || m, newType);
      },
      dismiss: () => remove(el)
    };
  }
};

export default toast;
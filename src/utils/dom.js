export function $(id) {
  return document.getElementById(id);
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[char] || char;
  });
}

export function sanitizeUrl(rawUrl, fallback = '') {
  const value = String(rawUrl ?? '').trim();
  if (!value) return fallback;
  try {
    const parsed = new URL(value, window.location.origin);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function isValidOptionalHttpUrl(rawUrl) {
  const value = String(rawUrl ?? '').trim();
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function formatIdr(amount) {
  return `Rp ${Number(amount || 0).toLocaleString('id-ID')}`;
}

export function buildWhatsappHref(phone, itemName) {
  const digits = String(phone ?? '')
    .replace(/\D/g, '')
    .replace(/^0/, '');
  const text = encodeURIComponent(`Halo, saya ingin bertanya tentang ${itemName}`);
  return `https://wa.me/62${digits}?text=${text}`;
}

export function renderFallbackSvg(title = 'Wisata View Aceh') {
  return `
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 17l5-5 4 4 5-6 4 5"></path>
      <rect x="2" y="4" width="20" height="16" rx="2"></rect>
    </svg>
    <span class="media-fallback-title">${escapeHtml(title)}</span>
  `;
}

export function bindImageFallbacks(root = document) {
  root.querySelectorAll('.media-frame img').forEach((img) => {
    const frame = img.closest('.media-frame');
    if (!frame) return;

    const fallbackBox = frame.querySelector('.media-fallback');
    if (fallbackBox && !fallbackBox.innerHTML.trim()) {
      fallbackBox.innerHTML = renderFallbackSvg(frame.dataset.fallbackTitle || 'Wisata View Aceh');
    }

    const src = img.getAttribute('src');
    if (!src) {
      frame.classList.add('is-broken');
      return;
    }

    if (img.complete && img.naturalWidth === 0) {
      frame.classList.add('is-broken');
    }

    if (img.dataset.fallbackBound === 'true') return;
    img.dataset.fallbackBound = 'true';

    img.addEventListener('error', () => {
      frame.classList.add('is-broken');
    });
  });
}

let toastTimer = null;
export function showToast(message) {
  const el = $('toast');
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.hidden = true;
  }, 2600);
}

class ModalManager {
  constructor() {
    this.modal = $('appModal');
    this.title = $('modalTitle');
    this.body = $('modalBody');
    this.footer = $('modalFooter');
    this.dialog = this.modal?.querySelector('.modal-dialog');
    this.lastFocus = null;
    this.bound = false;
  }

  init() {
    if (this.bound || !this.modal) return;
    this.bound = true;

    $('closeModal')?.addEventListener('click', () => this.close());
    $('modalBackdrop')?.addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.modal.hidden) {
        this.close();
      }
    });
  }

  open({ title, bodyHtml, footerHtml = '', onMount }) {
    this.init();
    this.lastFocus = document.activeElement;
    this.title.textContent = title;
    this.body.innerHTML = bodyHtml;
    this.footer.innerHTML = footerHtml;
    this.modal.hidden = false;
    document.body.style.overflow = 'hidden';
    bindImageFallbacks(this.body);

    if (typeof onMount === 'function') {
      onMount(this.body, this.footer);
    }

    this.dialog?.focus();
  }

  confirm({ title, message, confirmLabel, cancelLabel, danger = false }) {
    return new Promise((resolve) => {
      let settled = false;
      const finish = (val) => {
        if (settled) return;
        settled = true;
        this.close();
        resolve(val);
      };

      this.open({
        title,
        bodyHtml: `<p style="margin:0;color:var(--text-secondary)">${escapeHtml(message)}</p>`,
        footerHtml: `
          <button type="button" class="btn btn-outline" data-modal-action="cancel">${escapeHtml(cancelLabel)}</button>
          <button type="button" class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-modal-action="confirm">${escapeHtml(confirmLabel)}</button>
        `,
        onMount: (_body, footer) => {
          footer.querySelector('[data-modal-action="cancel"]')?.addEventListener('click', () => finish(false));
          footer.querySelector('[data-modal-action="confirm"]')?.addEventListener('click', () => finish(true));
        },
      });

      const onEscape = (e) => {
        if (e.key === 'Escape') {
          document.removeEventListener('keydown', onEscape);
          finish(false);
        }
      };
      document.addEventListener('keydown', onEscape);
      $('modalBackdrop')?.addEventListener('click', () => finish(false), { once: true });
      $('closeModal')?.addEventListener('click', () => finish(false), { once: true });
    });
  }

  close() {
    if (!this.modal || this.modal.hidden) return;
    this.modal.hidden = true;
    document.body.style.overflow = '';
    this.body.innerHTML = '';
    this.footer.innerHTML = '';
    if (this.lastFocus && typeof this.lastFocus.focus === 'function') {
      this.lastFocus.focus();
    }
  }
}

export const modalManager = new ModalManager();

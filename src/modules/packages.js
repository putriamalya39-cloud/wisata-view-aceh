import { store } from '../state/store.js';
import { $, escapeHtml, formatIdr } from '../utils/dom.js';

export function createPackagesController({ t, onUsePackage }) {
  function render() {
    const grid = $('packageResults');
    if (!grid) return;

    const interest = $('interest')?.value || 'all';
    const maxBudget = Number($('packageBudget')?.value || 5000000);

    const list = store.db.packages.filter((p) => {
      const withinBudget = Number(p.cost || 0) <= maxBudget;
      const matchesInterest =
        interest === 'all' ||
        (Array.isArray(p.interests) &&
          p.interests.some((item) => item.toLowerCase().includes(interest)));
      return withinBudget && matchesInterest;
    });

    if (!list.length) {
      grid.innerHTML = `<div class="empty-state"><p>${escapeHtml(t('emptyPkg'))}</p></div>`;
      return;
    }

    grid.innerHTML = list
      .map(
        (p) => `
          <article class="card">
            <div class="card-body">
              <div class="card-meta-line">
                <span class="tabular-nums">${escapeHtml(p.duration)} ${escapeHtml(t('dayPrefix').toLowerCase())}</span>
                <span aria-hidden="true">·</span>
                <span>${escapeHtml((p.regions || []).join(', '))}</span>
              </div>
              <h3 class="card-title">${escapeHtml(p.name)}</h3>
              <p class="card-desc">${escapeHtml(p.description)}</p>
              <div class="card-footer">
                <span class="price-text tabular-nums">${escapeHtml(formatIdr(p.cost))} ${escapeHtml(t('perPersonStar'))}</span>
                <button
                  type="button"
                  class="btn btn-secondary btn-sm"
                  data-use-pkg="${escapeHtml(p.id)}"
                >${escapeHtml(t('usePackageBtn'))}</button>
              </div>
            </div>
          </article>
        `
      )
      .join('');
  }

  function init() {
    $('recommend')?.addEventListener('click', render);
    $('interest')?.addEventListener('change', render);
    $('packageBudget')?.addEventListener('change', render);

    $('packageResults')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-use-pkg]');
      if (!btn) return;
      const pkg = store.db.packages.find((p) => p.id === btn.dataset.usePkg);
      if (pkg) onUsePackage(pkg);
    });

    render();
  }

  return { init, render };
}

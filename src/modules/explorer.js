import { CATEGORIES, REGIONS } from '../data/sampleData.js';
import { store } from '../state/store.js';
import {
  $,
  bindImageFallbacks,
  buildWhatsappHref,
  escapeHtml,
  formatIdr,
  modalManager,
  sanitizeUrl,
  showToast,
} from '../utils/dom.js';

export function createExplorerController({ t, onAddToPlanner }) {
  let favoritesOnly = false;

  function populateFilterOptions() {
    const regionSelect = $('regionFilter');
    const categorySelect = $('categoryFilter');
    if (!regionSelect || !categorySelect) return;

    const prevRegion = regionSelect.value;
    const prevCategory = categorySelect.value;

    regionSelect.innerHTML = `<option value="">${escapeHtml(t('allRegions'))}</option>${REGIONS.map(
      (r) => `<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`
    ).join('')}`;
    regionSelect.value = prevRegion;

    categorySelect.innerHTML = `<option value="">${escapeHtml(t('allCategories'))}</option>${CATEGORIES.map(
      (c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`
    ).join('')}`;
    categorySelect.value = prevCategory;
  }

  function renderDestinationCard(d) {
    const fav = store.isFavorite(d.id, 'destination');
    const imgUrl = sanitizeUrl(d.imageUrl);
    const priceLabel = d.cost === 0 ? t('freeLabel') : formatIdr(d.cost);

    return `
      <article class="card">
        <div class="card-media media-frame" data-fallback-title="${escapeHtml(d.name)}">
          <img
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
            src="${escapeHtml(imgUrl)}"
            alt="${escapeHtml(d.name)} (${escapeHtml(d.region)})"
          />
          <div class="media-fallback" aria-hidden="true"></div>
          <button
            type="button"
            class="fav-icon-btn ${fav ? 'is-favorited' : ''}"
            data-action="toggle-fav"
            data-id="${escapeHtml(d.id)}"
            aria-label="${fav ? escapeHtml(t('removedFavToast')) : escapeHtml(t('addedFavToast'))}: ${escapeHtml(d.name)}"
            aria-pressed="${fav ? 'true' : 'false'}"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${fav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
        <div class="card-body">
          <div class="card-meta-line">
            <span>${escapeHtml(d.category)}</span>
            <span aria-hidden="true">·</span>
            <span>${escapeHtml(d.region)}</span>
          </div>
          <h3 class="card-title">${escapeHtml(d.name)}</h3>
          <p class="card-desc">${escapeHtml(d.description)}</p>
          <p class="card-detail-line">${escapeHtml(d.prayer)}</p>
          <div class="card-footer">
            <span class="price-text tabular-nums">${escapeHtml(priceLabel)}</span>
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              data-action="open-detail"
              data-id="${escapeHtml(d.id)}"
            >${escapeHtml(t('detailBtn'))}</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderDestinations() {
    const grid = $('destinationGrid');
    if (!grid) return;

    const query = ($('searchDest')?.value || '').trim().toLowerCase();
    const region = $('regionFilter')?.value || '';
    const category = $('categoryFilter')?.value || '';
    const sortBy = $('sortDest')?.value || 'name';

    const list = store.db.destinations.filter((d) => {
      const hay = `${d.name} ${d.description} ${d.region} ${d.category}`.toLowerCase();
      const matchQuery = !query || hay.includes(query);
      const matchRegion = !region || d.region === region;
      const matchCategory = !category || d.category === category;
      const matchFav = !favoritesOnly || store.isFavorite(d.id, 'destination');
      return matchQuery && matchRegion && matchCategory && matchFav;
    });

    list.sort((a, b) => {
      if (sortBy === 'costAsc') return a.cost - b.cost;
      if (sortBy === 'costDesc') return b.cost - a.cost;
      return a.name.localeCompare(b.name);
    });

    const countEl = $('resultCount');
    if (countEl) {
      countEl.textContent =
        store.language === 'en'
          ? `${list.length} destination${list.length === 1 ? '' : 's'} shown`
          : `${list.length} destinasi ditampilkan`;
    }

    if (!list.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <p>${escapeHtml(t('emptyDest'))}</p>
          <button type="button" class="btn btn-outline btn-sm" data-action="reset-filters">${escapeHtml(t('resetFilterBtn'))}</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(renderDestinationCard).join('');
    bindImageFallbacks(grid);
  }

  function renderFoods() {
    const grid = $('foodGrid');
    if (!grid) return;

    if (!store.db.foods.length) {
      grid.innerHTML = `<div class="empty-state"><p>${escapeHtml(t('emptyFood'))}</p></div>`;
      return;
    }

    grid.innerHTML = store.db.foods
      .map((f) => {
        const isVerified = String(f.status || '').toLowerCase().includes('terverifikasi') &&
          !String(f.status || '').toLowerCase().includes('belum');
        return `
          <article class="card">
            <div class="card-media media-frame" data-fallback-title="${escapeHtml(f.name)}">
              <img
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
                src="${escapeHtml(sanitizeUrl(f.imageUrl))}"
                alt="${escapeHtml(f.name)} (${escapeHtml(f.region)})"
              />
              <div class="media-fallback" aria-hidden="true"></div>
            </div>
            <div class="card-body">
              <div class="card-meta-line">
                <span>${escapeHtml(f.category)}</span>
                <span aria-hidden="true">·</span>
                <span>${escapeHtml(f.region)}</span>
              </div>
              <h3 class="card-title">${escapeHtml(f.name)}</h3>
              <p class="verification-note ${isVerified ? 'is-verified' : ''}">
                <span>${isVerified ? '✓' : '!'}</span>
                <span><strong>${escapeHtml(f.status)}</strong> — ${escapeHtml(f.source)}</span>
              </p>
              <div class="card-footer">
                <span class="price-text tabular-nums">${escapeHtml(formatIdr(f.price))}</span>
                <a
                  class="btn btn-secondary btn-sm"
                  href="${escapeHtml(buildWhatsappHref(f.contact, f.name))}"
                  target="_blank"
                  rel="noopener noreferrer"
                >${escapeHtml(t('whatsappInquiry'))}</a>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    bindImageFallbacks(grid);
  }

  function renderStays() {
    const grid = $('stayGrid');
    if (!grid) return;

    if (!store.db.stays.length) {
      grid.innerHTML = `<div class="empty-state"><p>${escapeHtml(t('emptyStay'))}</p></div>`;
      return;
    }

    grid.innerHTML = store.db.stays
      .map(
        (s) => `
          <article class="card">
            <div class="card-media media-frame" data-fallback-title="${escapeHtml(s.name)}">
              <img
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
                src="${escapeHtml(sanitizeUrl(s.imageUrl))}"
                alt="${escapeHtml(s.name)} (${escapeHtml(s.region)})"
              />
              <div class="media-fallback" aria-hidden="true"></div>
            </div>
            <div class="card-body">
              <div class="card-meta-line">
                <span>${escapeHtml(s.region)}</span>
              </div>
              <h3 class="card-title">${escapeHtml(s.name)}</h3>
              <p class="card-desc">${escapeHtml(s.facilities)}</p>
              <p class="card-detail-line">${escapeHtml(s.muslim)}</p>
              <div class="card-footer">
                <span class="price-text tabular-nums">${escapeHtml(formatIdr(s.price))} ${escapeHtml(t('perNight'))}</span>
                <a
                  class="btn btn-secondary btn-sm"
                  href="${escapeHtml(buildWhatsappHref(s.contact, s.name))}"
                  target="_blank"
                  rel="noopener noreferrer"
                >${escapeHtml(t('whatsappInquiry'))}</a>
              </div>
            </div>
          </article>
        `
      )
      .join('');

    bindImageFallbacks(grid);
  }

  function renderFavorites() {
    const grid = $('favoriteGrid');
    const metricFav = $('metricFavoritesCount');
    const list = store.favorites
      .map((f) => (f.type === 'destination' ? store.db.destinations.find((d) => d.id === f.itemId) : null))
      .filter(Boolean);

    if (metricFav) {
      metricFav.textContent = String(list.length);
    }

    if (!grid) return;
    if (!list.length) {
      grid.innerHTML = `<div class="empty-state"><p>${escapeHtml(t('emptyFav'))}</p></div>`;
      return;
    }

    grid.innerHTML = list.map(renderDestinationCard).join('');
    bindImageFallbacks(grid);
  }

  function openDestinationDetail(destId) {
    const d = store.db.destinations.find((item) => item.id === destId);
    if (!d) return;

    const fav = store.isFavorite(d.id, 'destination');
    const mapsHref = sanitizeUrl(
      d.mapsUrl,
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${d.name} Aceh`)}`
    );

    modalManager.open({
      title: d.name,
      bodyHtml: `
        <div class="media-frame modal-detail-media" data-fallback-title="${escapeHtml(d.name)}">
          <img
            referrerpolicy="no-referrer"
            src="${escapeHtml(sanitizeUrl(d.imageUrl))}"
            alt="${escapeHtml(d.name)}"
          />
          <div class="media-fallback" aria-hidden="true"></div>
        </div>
        <p style="margin:0;color:var(--text-secondary)">${escapeHtml(d.description)}</p>
        <div class="detail-kv-grid">
          <div class="detail-kv-item">
            <strong>${escapeHtml(t('regionLabel'))}</strong>
            <span>${escapeHtml(d.region)}</span>
          </div>
          <div class="detail-kv-item">
            <strong>${escapeHtml(t('categoryLabel'))}</strong>
            <span>${escapeHtml(d.category)}</span>
          </div>
          <div class="detail-kv-item">
            <strong>${escapeHtml(t('costActivity'))}</strong>
            <span class="tabular-nums">${d.cost === 0 ? escapeHtml(t('freeLabel')) : escapeHtml(formatIdr(d.cost))}</span>
          </div>
          <div class="detail-kv-item">
            <strong>Fasilitas</strong>
            <span>${escapeHtml(d.facilities)}</span>
          </div>
          <div class="detail-kv-item" style="grid-column:1/-1">
            <strong>${escapeHtml(t('p1Title'))}</strong>
            <span>${escapeHtml(d.prayer)}</span>
          </div>
          <div class="detail-kv-item" style="grid-column:1/-1">
            <strong>Alamat</strong>
            <span>${escapeHtml(d.address)}</span>
          </div>
        </div>
        <p class="notice">${escapeHtml(t('mapNotice'))}</p>
      `,
      footerHtml: `
        <button type="button" class="btn btn-outline" data-detail-fav="${escapeHtml(d.id)}">
          ${fav ? '♥ ' : '♡ '}${escapeHtml(t('favOnlyBtn').replace(' saja', '').replace(' only', ''))}
        </button>
        <button type="button" class="btn btn-secondary" data-detail-plan="${escapeHtml(d.id)}">
          + ${escapeHtml(t('navPlanCta'))}
        </button>
        <a class="btn btn-primary" href="${escapeHtml(mapsHref)}" target="_blank" rel="noopener noreferrer">
          Google Maps ↗
        </a>
      `,
      onMount: (_body, footer) => {
        footer.querySelector('[data-detail-fav]')?.addEventListener('click', (e) => {
          const added = store.toggleFavorite(d.id, 'destination');
          e.currentTarget.textContent = `${added ? '♥ ' : '♡ '}${t('favOnlyBtn').replace(' saja', '').replace(' only', '')}`;
          showToast(added ? t('addedFavToast') : t('removedFavToast'));
        });
        footer.querySelector('[data-detail-plan]')?.addEventListener('click', () => {
          modalManager.close();
          onAddToPlanner(d.id);
        });
      },
    });
  }

  function handleCardGridClick(e) {
    const favBtn = e.target.closest('[data-action="toggle-fav"]');
    if (favBtn) {
      const added = store.toggleFavorite(favBtn.dataset.id, 'destination');
      showToast(added ? t('addedFavToast') : t('removedFavToast'));
      return;
    }

    const detailBtn = e.target.closest('[data-action="open-detail"]');
    if (detailBtn) {
      openDestinationDetail(detailBtn.dataset.id);
      return;
    }

    const resetBtn = e.target.closest('[data-action="reset-filters"]');
    if (resetBtn) {
      if ($('searchDest')) $('searchDest').value = '';
      if ($('regionFilter')) $('regionFilter').value = '';
      if ($('categoryFilter')) $('categoryFilter').value = '';
      if ($('sortDest')) $('sortDest').value = 'name';
      favoritesOnly = false;
      const favToggle = $('favOnlyToggle');
      if (favToggle) {
        favToggle.classList.remove('is-active');
        favToggle.setAttribute('aria-pressed', 'false');
      }
      renderDestinations();
    }
  }

  function init() {
    populateFilterOptions();

    $('searchDest')?.addEventListener('input', renderDestinations);
    ['regionFilter', 'categoryFilter', 'sortDest'].forEach((id) => {
      $(id)?.addEventListener('change', renderDestinations);
    });

    $('favOnlyToggle')?.addEventListener('click', (e) => {
      favoritesOnly = !favoritesOnly;
      e.currentTarget.classList.toggle('is-active', favoritesOnly);
      e.currentTarget.setAttribute('aria-pressed', favoritesOnly ? 'true' : 'false');
      renderDestinations();
    });

    $('destinationGrid')?.addEventListener('click', handleCardGridClick);
    $('favoriteGrid')?.addEventListener('click', handleCardGridClick);
  }

  function render() {
    populateFilterOptions();
    renderDestinations();
    renderFoods();
    renderStays();
    renderFavorites();

    const metricDest = $('metricDestinations');
    if (metricDest) metricDest.textContent = String(store.db.destinations.length);
  }

  return {
    init,
    render,
    openDestinationDetail,
  };
}
